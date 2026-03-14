<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ChunkedUploadService
{
    /** Session TTL (seconds). */
    protected const SESSION_TTL = 7200; // 2 hours

    /** Max file size (bytes). 1.5 GB. */
    public const MAX_FILE_SIZE = 1536 * 1024 * 1024;

    /** Chunk uploads directory (local disk). */
    protected const CHUNK_DIR = 'chunk-uploads';

    /**
     * Initialize a chunked upload session. Returns session_id.
     *
     * @param array $meta [filename, filetype, filesize, total_chunks, body (optional), from_user_id, to_user_id]
     */
    public function init(array $meta): string
    {
        $filesize = (int) ($meta['filesize'] ?? 0);
        if ($filesize <= 0 || $filesize > self::MAX_FILE_SIZE) {
            throw new \InvalidArgumentException('Invalid or too large file size.');
        }

        $sessionId = Str::random(64);
        $tempDir = storage_path('app/' . self::CHUNK_DIR);
        if (!is_dir($tempDir)) {
            mkdir($tempDir, 0755, true);
        }
        $tempPath = $tempDir . '/' . $sessionId;

        $data = [
            'filename' => $meta['filename'] ?? 'file',
            'filetype' => $meta['filetype'] ?? 'application/octet-stream',
            'filesize' => $filesize,
            'total_chunks' => (int) ($meta['total_chunks'] ?? 1),
            'body' => $meta['body'] ?? '',
            'from_user_id' => (int) ($meta['from_user_id'] ?? 0),
            'to_user_id' => (int) ($meta['to_user_id'] ?? 0),
            'temp_path' => $tempPath,
            'received_chunks' => [],
        ];

        Cache::put($this->cacheKey($sessionId), $data, self::SESSION_TTL);
        return $sessionId;
    }

    /**
     * Append a chunk. Throws if session invalid or chunk already received.
     */
    public function appendChunk(string $sessionId, int $chunkIndex, UploadedFile $chunk): void
    {
        $data = Cache::get($this->cacheKey($sessionId));
        if (!$data) {
            throw new \RuntimeException('Upload session expired or invalid.');
        }
        if (in_array($chunkIndex, $data['received_chunks'], true)) {
            return; // idempotent
        }

        $path = $data['temp_path'];
        $mode = $chunkIndex === 0 ? 'wb' : 'ab';
        $stream = fopen($chunk->getRealPath(), 'rb');
        if ($stream === false) {
            throw new \RuntimeException('Could not read chunk.');
        }
        $dest = fopen($path, $mode);
        if ($dest === false) {
            fclose($stream);
            throw new \RuntimeException('Could not write chunk.');
        }
        stream_copy_to_stream($stream, $dest);
        fclose($stream);
        fclose($dest);

        $data['received_chunks'][] = $chunkIndex;
        sort($data['received_chunks']);
        Cache::put($this->cacheKey($sessionId), $data, self::SESSION_TTL);
    }

    /**
     * Get session and validate all chunks received. Returns session data; temp file path is in 'temp_path'.
     */
    public function finalize(string $sessionId): array
    {
        $data = Cache::get($this->cacheKey($sessionId));
        if (!$data) {
            throw new \RuntimeException('Upload session expired or invalid.');
        }

        $expected = $data['total_chunks'];
        $received = $data['received_chunks'];
        $expectedIndices = range(0, $expected - 1);
        if ($received !== $expectedIndices) {
            $this->cleanup($sessionId);
            throw new \RuntimeException('Not all chunks received.');
        }

        $path = $data['temp_path'];
        if (!is_file($path) || filesize($path) !== (int) $data['filesize']) {
            $this->cleanup($sessionId);
            throw new \RuntimeException('File incomplete or corrupted.');
        }

        Cache::forget($this->cacheKey($sessionId));
        return $data;
    }

    /**
     * Remove temp file and cache for session.
     */
    public function cleanup(string $sessionId): void
    {
        $data = Cache::get($this->cacheKey($sessionId));
        if ($data && !empty($data['temp_path']) && is_file($data['temp_path'])) {
            @unlink($data['temp_path']);
        }
        Cache::forget($this->cacheKey($sessionId));
    }

    protected function cacheKey(string $sessionId): string
    {
        return 'chunk_upload:' . $sessionId;
    }

    /**
     * Infer MIME type from filename when current type is generic (e.g. application/octet-stream).
     * Ensures large files (often sent without file.type) get correct video/image handling and preview.
     */
    public static function inferMimeFromFilename(string $filename, string $currentType): string
    {
        $generic = ['application/octet-stream', 'application/x-unknown-content-type', ''];
        if (!in_array(strtolower(trim($currentType)), $generic, true)) {
            return $currentType;
        }
        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION) ?: '');
        $video = [
            'mp4' => 'video/mp4',
            'webm' => 'video/webm',
            'mkv' => 'video/x-matroska',
            'mov' => 'video/quicktime',
            'avi' => 'video/x-msvideo',
            'm4v' => 'video/x-m4v',
            'ogv' => 'video/ogg',
            '3gp' => 'video/3gpp',
        ];
        $image = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            'bmp' => 'image/bmp',
            'svg' => 'image/svg+xml',
        ];
        if (isset($video[$ext])) {
            return $video[$ext];
        }
        if (isset($image[$ext])) {
            return $image[$ext];
        }
        return $currentType ?: 'application/octet-stream';
    }
}
