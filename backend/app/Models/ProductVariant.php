<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductVariant extends Model
{
    protected $fillable = [
        'product_id',
        'sku',
        'name',        // This stores the color name
        'price',
        'quantity',
        'attributes',  // JSON field for additional attributes
    ];

    protected $casts = [
        'attributes' => 'array',
        'price' => 'decimal:2',
        'quantity' => 'integer',
    ];

    /**
     * Relationship: Variant belongs to Product
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Relationship: Variant has many Images
     */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class, 'variant_id');
    }
}