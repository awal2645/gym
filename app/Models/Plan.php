<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'price',
        'description',
        'features',
        'active',
        'best_value',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'features' => 'array',
        'active' => 'boolean',
        'best_value' => 'boolean',
    ];

    /**
     * Get all purchases for this plan.
     */
    public function purchases()
    {
        return $this->hasMany(Purchase::class);
    }
}
