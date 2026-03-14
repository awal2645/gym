<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use App\Services\ChunkedUploadService;
use App\Services\GoogleDriveService;
use Illuminate\Http\Request;
use App\Events\MessageSent;
use App\Jobs\SendNoReplyReminderJob;
use App\Services\NoReplyReminderService;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ChatController extends Controller
{
    /** Chunk size threshold (bytes): above this use chunked upload. 5MB */
    public const CHUNK_THRESHOLD = 5 * 1024 * 1024;

    protected function isGoogleDiskConfigured(): bool
    {
        $clientId = config('filesystems.disks.google.clientId');
        $refreshToken = config('filesystems.disks.google.refreshToken');
        return !empty($clientId) && !empty($refreshToken);
    }
    /**
     * Get user's conversations (for regular users, conversation with admin).
     */
    public function getConversations(Request $request)
    {
        $user = $request->user();
        $admin = User::where('role', 'admin')->first();

        if (!$admin) {
            return response()->json(['conversations' => []]);
        }

        // Get last message with admin
        $lastMessage = Message::where(function ($query) use ($user, $admin) {
            $query->where('from_user_id', $user->id)
                ->where('to_user_id', $admin->id);
        })->orWhere(function ($query) use ($user, $admin) {
            $query->where('from_user_id', $admin->id)
                ->where('to_user_id', $user->id);
        })->orderBy('created_at', 'desc')->first();

        return response()->json([
            'conversations' => [
                [
                    'user' => $admin,
                    'last_message' => $lastMessage,
                    'unread_count' => Message::where('from_user_id', $admin->id)
                        ->where('to_user_id', $user->id)
                        ->whereNull('read_at')
                        ->count(),
                ],
            ],
        ]);
    }

    /**
     * Get messages for user (conversation with admin).
     */
    public function getMessages(Request $request)
    {
        $user = $request->user();
        $admin = User::where('role', 'admin')->first();

        if (!$admin) {
            return response()->json(['messages' => []]);
        }

        $messages = Message::where(function ($query) use ($user, $admin) {
            $query->where('from_user_id', $user->id)
                ->where('to_user_id', $admin->id);
        })->orWhere(function ($query) use ($user, $admin) {
            $query->where('from_user_id', $admin->id)
                ->where('to_user_id', $user->id);
        })
            ->with(['fromUser', 'toUser'])
            ->orderBy('created_at', 'asc')
            ->get();

        // Mark messages as read
        Message::where('from_user_id', $admin->id)
            ->where('to_user_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['messages' => $messages]);
    }

    /**
     * Send a message.
     */
    public function sendMessage(Request $request)
    {
        if ($request->hasFile('file')) {
            set_time_limit(600); // 10 min for large uploads / Google Drive
        }
        $request->validate([
            'body' => 'nullable|string|max:5000',
            'file' => 'nullable|file', // No size limit
        ]);

        $user = $request->user();
        $admin = User::where('role', 'admin')->first();

        if (!$admin) {
            return response()->json(['message' => 'Admin not found'], 404);
        }

        // If no body and no file, return error
        if (empty($request->body) && !$request->hasFile('file')) {
            return response()->json(['message' => 'Message body or file is required'], 422);
        }

        $filePath = null;
        $fileName = null;
        $fileType = null;

        // Handle file upload: videos use google disk when FILESYSTEM_CLOUD=google, others local
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $fileName = $file->getClientOriginalName();
            $fileType = $file->getMimeType();

            if (str_starts_with($fileType, 'video/') && $this->isGoogleDiskConfigured()) {
                try {
                    $disk = Storage::disk('google');
                    $path = 'chat-videos/' . Str::random(40) . '.' . $file->getClientOriginalExtension();
                    $stream = fopen($file->getRealPath(), 'rb');
                    if ($stream !== false) {
                        $disk->writeStream($path, $stream);
                        if (is_resource($stream)) {
                            fclose($stream);
                        }
                    } else {
                        $disk->put($path, $file->get());
                    }
                    $filePath = $path;
                    try {
                        $flysystem = $disk->getAdapter();
                        $inner = method_exists($flysystem, 'getAdapter') ? $flysystem->getAdapter() : null;
                        if ($inner !== null && method_exists($inner, 'getUrl')) {
                            $url = $inner->getUrl($path);
                            if ($url !== '') {
                                $filePath = $url;
                            }
                        }
                    } catch (\Throwable $e) {
                        // Keep path; file_url will use signed stream
                    }
                } catch (\Throwable $e) {
                    report($e);
                    \Illuminate\Support\Facades\Log::warning('Google disk upload failed, storing video locally.', ['error' => $e->getMessage()]);
                    $filePath = $file->store('chat-files', 'public');
                }
            } elseif (str_starts_with($fileType, 'video/')) {
                try {
                    $drive = app(GoogleDriveService::class);
                    if ($drive->isConfigured()) {
                        $result = $drive->uploadVideo($file);
                        $filePath = $result['view_url'];
                    } else {
                        $filePath = $file->store('chat-files', 'public');
                    }
                } catch (\Throwable $e) {
                    report($e);
                    $filePath = $file->store('chat-files', 'public');
                }
            } else {
                $filePath = $file->store('chat-files', 'public');
            }
        }

        $message = Message::create([
            'from_user_id' => $user->id,
            'to_user_id' => $admin->id,
            'body' => $request->body ?? '',
            'file_path' => $filePath,
            'file_name' => $fileName,
            'file_type' => $fileType,
        ]);

        $message->load(['fromUser', 'toUser']);

        // Broadcast the message
        broadcast(new MessageSent($message))->toOthers();

        // Queue fallback: send reminder after 1 min if no reply
        SendNoReplyReminderJob::dispatch($message)->delay(now()->addMinutes(1));

        return response()->json($message, 201);
    }

    /**
     * Initialize chunked upload (large files). Returns session_id.
     */
    public function uploadInit(Request $request)
    {
        $request->validate([
            'filename' => 'required|string|max:255',
            'filetype' => 'nullable|string|max:100',
            'filesize' => 'required|integer|min:1|max:' . ChunkedUploadService::MAX_FILE_SIZE,
            'total_chunks' => 'required|integer|min:1|max:2000',
            'body' => 'nullable|string|max:5000',
        ]);

        $user = $request->user();
        $admin = User::where('role', 'admin')->first();
        if (!$admin) {
            return response()->json(['message' => 'Admin not found'], 404);
        }

        $service = app(ChunkedUploadService::class);
        $sessionId = $service->init([
            'filename' => $request->filename,
            'filetype' => $request->filled('filetype') ? $request->filetype : 'application/octet-stream',
            'filesize' => $request->filesize,
            'total_chunks' => $request->total_chunks,
            'body' => $request->body ?? '',
            'from_user_id' => $user->id,
            'to_user_id' => $admin->id,
        ]);

        return response()->json(['session_id' => $sessionId]);
    }

    /**
     * Upload one chunk.
     */
    public function uploadChunk(Request $request)
    {
        set_time_limit(120); // 2 min per chunk
        $request->validate([
            'chunk' => 'required|file|max:10240', // 10MB max per chunk
            'session_id' => 'required|string|size:64',
            'chunk_index' => 'required|integer|min:0',
            'total_chunks' => 'required|integer|min:1',
        ]);

        $service = app(ChunkedUploadService::class);
        try {
            $service->appendChunk(
                $request->session_id,
                (int) $request->chunk_index,
                $request->file('chunk')
            );
        } catch (\InvalidArgumentException|\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }

        return response()->json(['ok' => true]);
    }

    /**
     * Finalize chunked upload: upload temp file to storage and create message.
     */
    public function uploadFinalize(Request $request)
    {
        set_time_limit(600); // 10 min for streaming large file to Google Drive
        $request->validate(['session_id' => 'required|string|size:64']);

        $service = app(ChunkedUploadService::class);
        try {
            $data = $service->finalize($request->session_id);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }

        $tempPath = $data['temp_path'];
        $fileName = $data['filename'];
        $fileType = ChunkedUploadService::inferMimeFromFilename($data['filename'], $data['filetype'] ?? 'application/octet-stream');
        $body = $data['body'] ?? '';
        $fromUserId = (int) $data['from_user_id'];
        $toUserId = (int) $data['to_user_id'];

        [$filePath, ,] = $this->uploadTempFileToStorage($tempPath, $fileName, $fileType);
        @unlink($tempPath);

        $message = Message::create([
            'from_user_id' => $fromUserId,
            'to_user_id' => $toUserId,
            'body' => $body,
            'file_path' => $filePath,
            'file_name' => $fileName,
            'file_type' => $fileType,
        ]);

        $message->load(['fromUser', 'toUser']);
        broadcast(new MessageSent($message))->toOthers();

        SendNoReplyReminderJob::dispatch($message)->delay(now()->addMinutes(1));

        return response()->json($message, 201);
    }

    /**
     * Trigger no-reply reminder email (frontend calls after 1 min).
     * Only the message sender can trigger; prevents duplicate via reminder_sent_at.
     */
    public function triggerReminder(Request $request, Message $message)
    {
        if ($message->from_user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $sent = NoReplyReminderService::sendIfNeeded($message);
        return response()->json(['sent' => $sent]);
    }

    /**
     * Upload temp file to Google (stream) or local. Returns [file_path, file_name, file_type].
     */
    protected function uploadTempFileToStorage(string $tempPath, string $fileName, string $fileType): array
    {
        $ext = pathinfo($fileName, PATHINFO_EXTENSION) ?: 'bin';
        $isVideo = str_starts_with($fileType, 'video/');

        if ($isVideo && $this->isGoogleDiskConfigured()) {
            try {
                $disk = Storage::disk('google');
                $path = 'chat-videos/' . Str::random(40) . '.' . $ext;
                $stream = fopen($tempPath, 'rb');
                if ($stream !== false) {
                    $disk->writeStream($path, $stream);
                    if (is_resource($stream)) {
                        fclose($stream);
                    }
                } else {
                    $disk->put($path, file_get_contents($tempPath));
                }
                $filePath = $path;
                try {
                    $flysystem = $disk->getAdapter();
                    $inner = method_exists($flysystem, 'getAdapter') ? $flysystem->getAdapter() : null;
                    if ($inner !== null && method_exists($inner, 'getUrl') && ($url = $inner->getUrl($path)) !== '') {
                        $filePath = $url;
                    }
                } catch (\Throwable $e) {
                    // keep path
                }
                return [$filePath, $fileName, $fileType];
            } catch (\Throwable $e) {
                report($e);
            }
        }

        $stored = Storage::disk('public')->putFileAs(
            'chat-files',
            new \Illuminate\Http\File($tempPath),
            Str::random(40) . '_' . $fileName,
            'public'
        );
        return [$stored, $fileName, $fileType];
    }

    /**
     * Stream a chat file (for videos on google disk). Route is signed; no auth.
     */
    public function streamFile(Request $request, $messageId)
    {
        $message = Message::findOrFail($messageId);
        $path = $message->file_path;
        if (!$path || str_starts_with($path, 'http')) {
            abort(404);
        }
        if (!str_starts_with($path, 'chat-videos/')) {
            abort(404);
        }
        $disk = Storage::disk('google');
        if (!$disk->exists($path)) {
            abort(404);
        }
        $mimeType = $message->file_type ?: 'video/mp4';
        $stream = $disk->readStream($path);
        return response()->stream(function () use ($stream) {
            fpassthru($stream);
            fclose($stream);
        }, 200, [
            'Content-Type' => $mimeType,
            'Accept-Ranges' => 'bytes',
        ]);
    }
}
