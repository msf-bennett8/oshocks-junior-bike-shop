<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'seller_id',
        'category_id',
        'name',
        'slug',
        'description',
        'brand_id',
        'type',
        'price',
        'compare_price',
        'tags',
        'cost_price',
        'condition',
        'quantity',
        'sku',
        'barcode',
        'weight',
        'dimensions',
        'brand',
        'condition',
        'warranty_period',
        'year',
        'specifications',
        'meta_title',
        'meta_description',
        'allow_backorder',
        'low_stock_threshold',
        'rating',
        'is_new_arrival',
        'meta_keywords',
        'is_active',
        'is_featured',
        'views_count',
        'rating',
        'sales'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'compare_at_price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'quantity' => 'integer',
        'year' => 'integer',
        'tags' => 'array',
        'specifications' => 'array',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'view_count' => 'integer',
        'dimensions' => 'array',
        'sales_count' => 'integer',
        'is_new_arrival' => 'boolean',
        'allow_backorder' => 'boolean',
        'rating' => 'decimal:1',
        'sales' => 'integer',
        'low_stock_threshold' => 'integer',
    ];

    /**
     * Relationship: Product belongs to a Category
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Relationship: Product belongs to a Brand
     */
   
    //uncomment and work on it when setting brand later

    // public function brand()
    // {
    //     return $this->belongsTo(Brand::class);
    // }

    /**
     * Relationship: Product belongs to a Seller (User)
     */
    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    /**
     * Relationship: Product has many Images
     */
    public function images()
    {
        return $this->hasMany(ProductImage::class)->ordered();
    }

    /**
     * Get primary image
     */
    public function primaryImage()
    {
        return $this->hasOne(ProductImage::class)->where('is_primary', true);
    }

    /**
     * Relationship: Product has many Variants
     */
    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    /**
     * Relationship: Product has many Reviews
     */
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Relationship: Product has many Wishlists
     */
    public function wishlists()
    {
        return $this->hasMany(Wishlist::class);
    }

    /**
     * Relationship: Product has many Cart Items
     */
    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    /**
     * Relationship: Product has many Order Items
     */
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Scope: Only active products
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Only featured products
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope: Filter by type (bike or accessory)
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope: In stock
     */
    public function scopeInStock($query)
    {
        return $query->where('quantity', '>', 0);
    }

    /**
     * Scope: Search by keyword
     */
    public function scopeSearch($query, $keyword)
    {
        return $query->where(function($q) use ($keyword) {
            $q->where('name', 'like', "%{$keyword}%")
              ->orWhere('description', 'like', "%{$keyword}%");
        });
    }

    /**
     * Get average rating
     */
    public function getAverageRatingAttribute()
    {
        return $this->reviews()->avg('rating') ?? 0;
    }

    /**
     * Check if product is in stock
     */
    public function isInStock()
    {
        return $this->quantity > 0;
    }

     /**
     * Check if product is low on stock
     */
    public function isLowStock()
    {
        return $this->quantity > 0 && $this->quantity <= $this->low_stock_threshold;
    }

    /**
     * Get stock status
     */
    public function getStockStatusAttribute()
    {
        if ($this->quantity === 0) {
            return 'out_of_stock';
        } elseif ($this->isLowStock()) {
            return 'low_stock';
        }
        return 'in_stock';
    }

    /**
     * Increment view count
     */
    public function incrementViewCount()
    {
        $this->increment('view_count');
    }

    /**
     * Increment sales count
     */
    public function incrementSalesCount($quantity = 1)
    {
        $this->increment('sales_count', $quantity);
    }

    /**
     * Decrease stock quantity
     */
    public function decreaseStock($quantity)
    {
        if ($this->quantity >= $quantity) {
            $this->decrement('quantity', $quantity);
            return true;
        }
        return false;
    }

    /**
     * Increase stock quantity
     */
    public function increaseStock($quantity)
    {
        $this->increment('quantity', $quantity);
    }

    /**
     * Boot method to handle cascading deletes
     */
    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($product) {
            // Delete all images from Cloudinary
            $cloudinary = app(\App\Services\CloudinaryService::class);
            foreach ($product->images as $image) {
                if ($image->public_id) {
                    $cloudinary->deleteImage($image->public_id);
                }
            }
            
            // Delete database records (cascaded by foreign key)
            $product->images()->delete();
            $product->variants()->delete();
        });
    }
    
}
