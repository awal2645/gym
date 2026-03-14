<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
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

class AdminChatController extends Controller
{
    protected function isGoogleDiskConfigured(): bool
    {
        $clientId = config('filesystems.disks.google.clientId');
        $refreshToken = config('filesystems.disks.google.refreshToken');
        return !empty($clientId) && !empty($refreshToken);
    }
    /**
     * Get all users with conversations (admin).
     */
    public function getUsers(Request $request)
    {
        $admin = $request->user();
        $users = User::where('role', 'user')
            ->withCount([
                'receivedMessages as unread_count' => function ($query) use ($admin) {
                    $query->where('from_user_id', '!=', $admin->id)
                        ->whereNull('read_at');
                },
            ])
            ->get()
            ->map(function ($user) use ($admin) {
                $lastMessage = Message::where(function ($query) use ($user, $admin) {
                    $query->where('from_user_id', $user->id)
                        ->where('to_user_id', $admin->id);
                })->orWhere(function ($query) use ($user, $admin) {
                    $query->where('from_user_id', $admin->id)
                        ->where('to_user_id', $user->id);
                })->orderBy('created_at', 'desc')->first();

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'profile_picture' => $user->profile_picture,
                    'profile_picture_url' => $user->profile_picture_url,
                    'unread_count' => $user->unread_count ?? 0,
                    'last_message' => $lastMessage,
                ];
            })
            ->sortByDesc(function ($user) {
                return $user['last_message'] ? $user['last_message']->created_at : null;
            })
            ->values();

        return response()->json(['users' => $users]);
    }

    /**
     * Get messages with a specific user (admin). Paginated: 10 per request.
     * ?limit=10&before_id=123 for older messages.
     */
    public function getMessages(Request $request, $userId)
    {
        $admin = $request->user();
        $user = User::findOrFail($userId);

        if ($user->role === 'admin') {
            return response()->json(['message' => 'Cannot chat with admin'], 403);
        }

        $limit = (int) $request->get('limit', 10);
        $limit = min(max($limit, 1), 50);
        $beforeId = $request->get('before_id');

        $query = Message::where(function ($q) use ($user, $admin) {
            $q->where('from_user_id', $user->id)->where('to_user_id', $admin->id);
        })->orWhere(function ($q) use ($user, $admin) {
            $q->where('from_user_id', $admin->id)->where('to_user_id', $user->id);
        });

        if ($beforeId) {
            $beforeMessage = Message::find($beforeId);
            if ($beforeMessage) {
                $query->where('created_at', '<', $beforeMessage->created_at);
            }
        }

        $messages = $query->with(['fromUser', 'toUser'])
            ->orderBy('created_at', 'desc')
            ->limit($limit + 1)
            ->get();

        $hasMore = $messages->count() > $limit;
        if ($hasMore) {
            $messages->pop(); // Remove the extra one
        }
        $messages = $messages->reverse()->values();

        // Mark messages as read
        Message::where('from_user_id', $user->id)
            ->where('to_user_id', $admin->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'messages' => $messages,
            'has_more' => $hasMore,
        ]);
    }

    /**
     * Send a message to a user (admin).
     */
    public function sendMessage(Request $request, $userId)
    {
        if ($request->hasFile('file')) {
            set_time_limit(600); // 10 min for large uploads / Google Drive
        }
        $request->validate([
            'body' => 'nullable|string|max:5000',
            'file' => 'nullable|file', // No size limit
        ]);

        $admin = $request->user();
        $user = User::findOrFail($userId);

        if ($user->role === 'admin') {
            return response()->json(['message' => 'Cannot chat with admin'], 403);
        }

        // If no body and no file, return error
        if (empty($request->body) && !$request->hasFile('file')) {
            return response()->json(['message' => 'Message body or file is required'], 422);
        }

        $filePath = null;
        $fileName = null;
        $fileType = null;

        // Handle file upload: videos use google disk when configured, others local
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
            'from_user_id' => $admin->id,
            'to_user_id' => $user->id,
            'body' => $request->body ?? '',
            'file_path' => $filePath,
            'file_name' => $fileName,
            'file_type' => $fileType,
        ]);

        $message->load(['fromUser', 'toUser']);

        // Broadcast the message
        broadcast(new MessageSent($message))->toOthers();

        SendNoReplyReminderJob::dispatch($message)->delay(now()->addMinutes(1));

        return response()->json($message, 201);
    }

    /**
     * Trigger no-reply reminder email (frontend calls after 1 min).
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
     * Initialize chunked upload (admin → user). Returns session_id.
     */
    public function uploadInit(Request $request, $userId)
    {
        $request->validate([
            'filename' => 'required|string|max:255',
            'filetype' => 'nullable|string|max:255',
            'filesize' => 'required|integer|min:1|max:' . ChunkedUploadService::MAX_FILE_SIZE,
            'total_chunks' => 'required|integer|min:1|max:2000',
            'body' => 'nullable|string|max:5000',
        ]);

        $admin = $request->user();
        $user = User::findOrFail($userId);
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Cannot chat with admin'], 403);
        }

        $service = app(ChunkedUploadService::class);
        $sessionId = $service->init([
            'filename' => $request->filename,
            'filetype' => $request->filled('filetype') ? $request->filetype : 'application/octet-stream',
            'filesize' => $request->filesize,
            'total_chunks' => $request->total_chunks,
            'body' => $request->body ?? '',
            'from_user_id' => $admin->id,
            'to_user_id' => $user->id,
        ]);

        return response()->json(['session_id' => $sessionId]);
    }

    /**
     * Upload one chunk (admin).
     */
    public function uploadChunk(Request $request, $userId)
    {
        set_time_limit(120); // 2 min per chunk
        $request->validate([
            'chunk' => 'required|file|max:10240',
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
     * Finalize chunked upload (admin).
     */
    public function uploadFinalize(Request $request, $userId)
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
     * Upload temp file to Google (stream) or local.
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
}
