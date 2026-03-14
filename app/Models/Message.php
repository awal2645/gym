<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\URL;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'from_user_id',
        'to_user_id',
        'body',
        'read_at',
        'file_path',
        'file_name',
        'file_type',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    protected $appends = [
        'file_url',
        'file_embed_url',
    ];

    /**
     * Get the user who sent the message.
     */
    public function fromUser()
    {
        return $this->belongsTo(User::class, 'from_user_id');
    }

    /**
     * Get the user who received the message.
     */
    public function toUser()
    {
        return $this->belongsTo(User::class, 'to_user_id');
    }

    /**
     * Get the file URL if file exists (local storage, Google Drive link, or signed stream for google disk path).
     */
    public function getFileUrlAttribute()
    {
        if (!$this->file_path) {
            return null;
        }
        // Full URL (e.g. Drive view link or adapter getUrl result)
        if (str_starts_with($this->file_path, 'http://') || str_starts_with($this->file_path, 'https://')) {
            return $this->file_path;
        }
        // Path on google disk (chat-videos/...) – stream via signed URL
        if (str_starts_with($this->file_path, 'chat-videos/')) {
            return URL::temporarySignedRoute('chat.file', now()->addHours(24), ['message' => $this->id]);
        }
        return asset('storage/' . $this->file_path);
    }

    /**
     * Get embed URL for Google Drive videos (for iframe preview); null for non-Drive or non-video.
     */
    public function getFileEmbedUrlAttribute()
    {
        if (!$this->file_path || !$this->isVideo()) {
            return null;
        }
        if (str_contains($this->file_path, 'drive.google.com/file/d/')) {
            // Extract file ID and return preview URL
            if (preg_match('#/file/d/([a-zA-Z0-9_-]+)#', $this->file_path, $m)) {
                return 'https://drive.google.com/file/d/' . $m[1] . '/preview';
            }
        }
        return null;
    }

    /**
     * Check if file is a video.
     */
    public function isVideo()
    {
        if (!$this->file_type) {
            return false;
        }
        return str_starts_with($this->file_type, 'video/');
    }

    /**
     * Check if message has a file.
     */
    public function hasFile()
    {
        return !empty($this->file_path);
    }

    /**
     * Check if file is an image.
     */
    public function isImage()
    {
        if (!$this->file_type) {
            return false;
        }

        return str_starts_with($this->file_type, 'image/');
    }
}
