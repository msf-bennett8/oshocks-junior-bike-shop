#!/bin/bash

# Oshocks Migration Filler Script
# This script automatically fills all migration files with their schemas

echo "🚀 Starting Oshocks Migration Filler..."
echo ""

# Get the migrations directory
MIGRATIONS_DIR="database/migrations"

# Find migration files
CATEGORIES_FILE=$(ls $MIGRATIONS_DIR/*_create_categories_table.php 2>/dev/null)
SELLER_PROFILES_FILE=$(ls $MIGRATIONS_DIR/*_create_seller_profiles_table.php 2>/dev/null)
PRODUCTS_FILE=$(ls $MIGRATIONS_DIR/*_create_products_table.php 2>/dev/null)
PRODUCT_VARIANTS_FILE=$(ls $MIGRATIONS_DIR/*_create_product_variants_table.php 2>/dev/null)
PRODUCT_IMAGES_FILE=$(ls $MIGRATIONS_DIR/*_create_product_images_table.php 2>/dev/null)
CARTS_FILE=$(ls $MIGRATIONS_DIR/*_create_carts_table.php 2>/dev/null)
CART_ITEMS_FILE=$(ls $MIGRATIONS_DIR/*_create_cart_items_table.php 2>/dev/null)
WISHLISTS_FILE=$(ls $MIGRATIONS_DIR/*_create_wishlists_table.php 2>/dev/null)
ADDRESSES_FILE=$(ls $MIGRATIONS_DIR/*_create_addresses_table.php 2>/dev/null)
ORDERS_FILE=$(ls $MIGRATIONS_DIR/*_create_orders_table.php 2>/dev/null)
ORDER_ITEMS_FILE=$(ls $MIGRATIONS_DIR/*_create_order_items_table.php 2>/dev/null)
PAYMENTS_FILE=$(ls $MIGRATIONS_DIR/*_create_payments_table.php 2>/dev/null)
REVIEWS_FILE=$(ls $MIGRATIONS_DIR/*_create_reviews_table.php 2>/dev/null)
SELLER_REVIEWS_FILE=$(ls $MIGRATIONS_DIR/*_create_seller_reviews_table.php 2>/dev/null)
COUPONS_FILE=$(ls $MIGRATIONS_DIR/*_create_coupons_table.php 2>/dev/null)
COUPON_USAGES_FILE=$(ls $MIGRATIONS_DIR/*_create_coupon_usages_table.php 2>/dev/null)
NOTIFICATIONS_FILE=$(ls $MIGRATIONS_DIR/*_create_notifications_table.php 2>/dev/null)
ACTIVITY_LOGS_FILE=$(ls $MIGRATIONS_DIR/*_create_activity_logs_table.php 2>/dev/null)
SETTINGS_FILE=$(ls $MIGRATIONS_DIR/*_create_settings_table.php 2>/dev/null)

# Function to write migration content
write_migration() {
    local file=$1
    local content=$2
    echo "$content" > "$file"
    echo "✓ Updated: $(basename $file)"
}

# 1. Categories Migration
echo "📝 Filling migrations..."
write_migration "$CATEGORIES_FILE" '<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('\''categories'\'', function (Blueprint $table) {
            $table->id();
            $table->foreignId('\''parent_id'\'')->nullable()->constrained('\''categories'\'')->onDelete('\''cascade'\'');
            $table->string('\''name'\'');
            $table->string('\''slug'\'')->unique();
            $table->text('\''description'\'')->nullable();
            $table->string('\''image_url'\'')->nullable();
            $table->boolean('\''is_active'\'')->default(true);
            $table->integer('\''display_order'\'')->default(0);
            $table->timestamps();
            
            $table->index(['\''parent_id'\'', '\''is_active'\'']);
            $table->index('\''slug'\'');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('\''categories'\'');
    }
};'

# 2. Seller Profiles Migration
write_migration "$SELLER_PROFILES_FILE" '<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('\''seller_profiles'\'', function (Blueprint $table) {
            $table->id();
            $table->foreignId('\''user_id'\'')->constrained()->onDelete('\''cascade'\'');
            $table->string('\''business_name'\'');
            $table->text('\''business_description'\'')->nullable();
            $table->string('\''business_address'\'')->nullable();
            $table->string('\''business_phone'\'')->nullable();
            $table->string('\''business_email'\'')->nullable();
            $table->string('\''business_logo'\'')->nullable();
            $table->string('\''business_banner'\'')->nullable();
            $table->enum('\''status'\'', ['\''pending'\'', '\''approved'\'', '\''rejected'\'', '\''suspended'\''])->default('\''pending'\'');
            $table->decimal('\''commission_rate'\'', 5, 2)->default(10.00);
            $table->boolean('\''is_verified'\'')->default(false);
            $table->decimal('\''rating'\'', 3, 2)->default(0);
            $table->integer('\''total_sales'\'')->default(0);
            $table->timestamps();
            
            $table->index('\''user_id'\'');
            $table->index('\''status'\'');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('\''seller_profiles'\'');
    }
};'

# 3. Products Migration
write_migration "$PRODUCTS_FILE" '<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('\''products'\'', function (Blueprint $table) {
            $table->id();
            $table->foreignId('\''seller_id'\'')->constrained('\''seller_profiles'\'')->onDelete('\''cascade'\'');
            $table->foreignId('\''category_id'\'')->constrained()->onDelete('\''cascade'\'');
            $table->string('\''name'\'');
            $table->string('\''slug'\'')->unique();
            $table->text('\''description'\'');
            $table->decimal('\''price'\'', 10, 2);
            $table->decimal('\''compare_price'\'', 10, 2)->nullable();
            $table->decimal('\''cost_price'\'', 10, 2)->nullable();
            $table->string('\''sku'\'')->unique();
            $table->string('\''barcode'\'')->nullable();
            $table->integer('\''quantity'\'')->default(0);
            $table->string('\''weight'\'')->nullable();
            $table->string('\''dimensions'\'')->nullable();
            $table->string('\''brand'\'')->nullable();
            $table->enum('\''condition'\'', ['\''new'\'', '\''used'\'', '\''refurbished'\''])->default('\''new'\'');
            $table->integer('\''warranty_period'\'')->nullable()->comment('\''in months'\'');
            $table->string('\''meta_title'\'')->nullable();
            $table->text('\''meta_description'\'')->nullable();
            $table->json('\''meta_keywords'\'')->nullable();
            $table->boolean('\''is_active'\'')->default(true);
            $table->boolean('\''is_featured'\'')->default(false);
            $table->integer('\''views_count'\'')->default(0);
            $table->decimal('\''rating'\'', 3, 2)->default(0);
            $table->integer('\''reviews_count'\'')->default(0);
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['\''seller_id'\'', '\''is_active'\'']);
            $table->index(['\''category_id'\'', '\''is_active'\'']);
            $table->index('\''slug'\'');
            $table->index('\''sku'\'');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('\''products'\'');
    }
};'

# 4. Product Variants Migration
write_migration "$PRODUCT_VARIANTS_FILE" '<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('\''product_variants'\'', function (Blueprint $table) {
            $table->id();
            $table->foreignId('\''product_id'\'')->constrained()->onDelete('\''cascade'\'');
            $table->string('\''sku'\'')->unique();
            $table->string('\''name'\'');
            $table->decimal('\''price'\'', 10, 2);
            $table->integer('\''quantity'\'')->default(0);
            $table->json('\''attributes'\'')->nullable();
            $table->timestamps();
            
            $table->index('\''product_id'\'');
            $table->index('\''sku'\'');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('\''product_variants'\'');
    }
};'

# 5. Product Images Migration
write_migration "$PRODUCT_IMAGES_FILE" '<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('\''product_images'\'', function (Blueprint $table) {
            $table->id();
            $table->foreignId('\''product_id'\'')->constrained()->onDelete('\''cascade'\'');
            $table->string('\''image_url'\'');
            $table->string('\''alt_text'\'')->nullable();
            $table->boolean('\''is_primary'\'')->default(false);
            $table->integer('\''display_order'\'')->default(0);
            $table->timestamps();
            
            $table->index('\''product_id'\'');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('\''product_images'\'');
    }
};'

# 6. Carts Migration
write_migration "$CARTS_FILE" '<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('\''carts'\'', function (Blueprint $table) {
            $table->id();
            $table->foreignId('\''user_id'\'')->constrained()->onDelete('\''cascade'\'');
            $table->timestamps();
            
            $table->index('\''user_id'\'');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('\''carts'\'');
    }
};'

# 7. Cart Items Migration
write_migration "$CART_ITEMS_FILE" '<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('\''cart_items'\'', function (Blueprint $table) {
            $table->id();
            $table->foreignId('\''cart_id'\'')->constrained()->onDelete('\''cascade'\'');
            $table->foreignId('\''product_id'\'')->constrained()->onDelete('\''cascade'\'');
            $table->foreignId('\''variant_id'\'')->nullable()->constrained('\''product_variants'\'')->onDelete('\''cascade'\'');
            $table->integer('\''quantity'\'')->default(1);
            $table->decimal('\''price'\'', 10, 2);
            $table->timestamps();
            
            $table->index('\''cart_id'\'');
            $table->index('\''product_id'\'');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('\''cart_items'\'');
    }
};'

# 8. Wishlists Migration
write_migration "$WISHLISTS_FILE" '<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('\''wishlists'\'', function (Blueprint $table) {
            $table->id();
            $table->foreignId('\''user_id'\'')->constrained()->onDelete('\''cascade'\'');
            $table->foreignId('\''product_id'\'')->constrained()->onDelete('\''cascade'\'');
            $table->timestamps();
            
            $table->unique(['\''user_id'\'', '\''product_id'\'']);
            $table->index('\''user_id'\'');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('\''wishlists'\'');
    }
};'

# 9. Addresses Migration
write_migration "$ADDRESSES_FILE" '<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('\''addresses'\'', function (Blueprint $table) {
            $table->id();
            $table->foreignId('\''user_id'\'')->constrained()->onDelete('\''cascade'\'');
            $table->string('\''full_name'\'');
            $table->string('\''phone'\'');
            $table->string('\''address_line1'\'');
            $table->string('\''address_line2'\'')->nullable();
            $table->string('\''city'\'');
            $table->string('\''county'\'');
            $table->string('\''postal_code'\'')->nullable();
            $table->string('\''country'\'')->default('\''Kenya'\'');
            $table->enum('\''type'\'', ['\''home'\'', '\''work'\'', '\''other'\''])->default('\''home'\'');
            $table->boolean('\''is_default'\'')->default(false);
            $table->timestamps();
            
            $table->index('\''user_id'\'');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('\''addresses'\'');
    }
};'

# 10. Orders Migration
write_migration "$ORDERS_FILE" '<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('\''orders'\'', function (Blueprint $table) {
            $table->id();
            $table->string('\''order_number'\'')->unique();
            $table->foreignId('\''user_id'\'')->constrained()->onDelete('\''cascade'\'');
            $table->foreignId('\''address_id'\'')->constrained();
            $table->decimal('\''subtotal'\'', 10, 2);
            $table->decimal('\''shipping_fee'\'', 10, 2)->default(0);
            $table->decimal('\''tax'\'', 10, 2)->default(0);
            $table->decimal('\''discount'\'', 10, 2)->default(0);
            $table->decimal('\''total'\'', 10, 2);
            $table->enum('\''status'\'', ['\''pending'\'', '\''processing'\'', '\''shipped'\'', '\''delivered'\'', '\''cancelled'\'', '\''refunded'\''])->default('\''pending'\'');
            $table->enum('\''payment_status'\'', ['\''pending'\'', '\''paid'\'', '\''failed'\'', '\''refunded'\''])->default('\''pending'\'');
            $table->text('\''notes'\'')->nullable();
            $table->timestamp('\''paid_at'\'')->nullable();
            $table->timestamp('\''shipped_at'\'')->nullable();
            $table->timestamp('\''delivered_at'\'')->nullable();
            $table->timestamps();
            
            $table->index('\''order_number'\'');
            $table->index(['\''user_id'\'', '\''status'\'']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('\''orders'\'');
    }
};'

# 11. Order Items Migration
write_migration "$ORDER_ITEMS_FILE" '<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('\''order_items'\'', function (Blueprint $table) {
            $table->id();
            $table->foreignId('\''order_id'\'')->constrained()->onDelete('\''cascade'\'');
            $table->foreignId('\''product_id'\'')->constrained();
            $table->foreignId('\''variant_id'\'')->nullable()->constrained('\''product_variants'\'');
            $table->foreignId('\''seller_id'\'')->constrained('\''seller_profiles'\'');
            $table->string('\''product_name'\'');
            $table->string('\''variant_name'\'')->nullable();
            $table->integer('\''quantity'\'');
            $table->decimal('\''price'\'', 10, 2);
            $table->decimal('\''total'\'', 10, 2);
            $table->timestamps();
            
            $table->index('\''order_id'\'');
            $table->index('\''seller_id'\'');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('\''order_items'\'');
    }
};'

# 12. Payments Migration
write_migration "$PAYMENTS_FILE" '<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('\''payments'\'', function (Blueprint $table) {
            $table->id();
            $table->foreignId('\''order_id'\'')->constrained()->onDelete('\''cascade'\'');
            $table->string('\''payment_method'\'');
            $table->string('\''transaction_id'\'')->unique();
            $table->decimal('\''amount'\'', 10, 2);
            $table->enum('\''status'\'', ['\''pending'\'', '\''completed'\'', '\''failed'\'', '\''refunded'\''])->default('\''pending'\'');
            $table->string('\''phone_number'\'')->nullable();
            $table->text('\''payment_details'\'')->nullable();
            $table->text('\''error_message'\'')->nullable();
            $table->timestamp('\''completed_at'\'')->nullable();
            $table->timestamps();
            
            $table->index('\''order_id'\'');
            $table->index('\''transaction_id'\'');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('\''payments'\'');
    }
};'

# 13. Reviews Migration
write_migration "$REVIEWS_FILE" '<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('\''reviews'\'', function (Blueprint $table) {
            $table->id();
            $table->foreignId('\''user_id'\'')->constrained()->onDelete('\''cascade'\'');
            $table->foreignId('\''product_id'\'')->constrained()->onDelete('\''cascade'\'');
            $table->foreignId('\''order_id'\'')->nullable()->constrained()->onDelete('\''set null'\'');
            $table->integer('\''rating'\'');
            $table->string('\''title'\'')->nullable();
            $table->text('\''comment'\'');
            $table->boolean('\''is_verified_purchase'\'')->default(false);
            $table->boolean('\''is_approved'\'')->default(true);
            $table->timestamps();
            
            $table->index(['\''product_id'\'', '\''is_approved'\'']);
            $table->index('\''user_id'\'');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('\''reviews'\'');
    }
};'

# 14. Seller Reviews Migration
write_migration "$SELLER_REVIEWS_FILE" '<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('\''seller_reviews'\'', function (Blueprint $table) {
            $table->id();
            $table->foreignId('\''user_id'\'')->constrained()->onDelete('\''cascade'\'');
            $table->foreignId('\''seller_id'\'')->constrained('\''seller_profiles'\'')->onDelete('\''cascade'\'');
            $table->foreignId('\''order_id'\'')->nullable()->constrained()->onDelete('\''set null'\'');
            $table->integer('\''rating'\'');
            $table->text('\''comment'\'');
            $table->timestamps();
            
            $table->index('\''seller_id'\'');
            $table->index('\''user_id'\'');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('\''seller_reviews'\'');
    }
};'

# 15. Coupons Migration
write_migration "$COUPONS_FILE" '<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('\''coupons'\'', function (Blueprint $table) {
            $table->id();
            $table->string('\''code'\'')->unique();
            $table->text('\''description'\'')->nullable();
            $table->enum('\''type'\'', ['\''percentage'\'', '\''fixed'\''])->default('\''percentage'\'');
            $table->decimal('\''value'\'', 10, 2);
            $table->decimal('\''min_purchase'\'', 10, 2)->nullable();
            $table->decimal('\''max_discount'\'', 10, 2)->nullable();
            $table->integer('\''usage_limit'\'')->nullable();
            $table->integer('\''used_count'\'')->default(0);
            $table->timestamp('\''starts_at'\'')->nullable();
            $table->timestamp('\''expires_at'\'')->nullable();
            $table->boolean('\''is_active'\'')->default(true);
            $table->timestamps();
            
            $table->index('\''code'\'');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('\''coupons'\'');
    }
};'

# 16. Coupon Usages Migration
write_migration "$COUPON_USAGES_FILE" '<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('\''coupon_usages'\'', function (Blueprint $table) {
            $table->id();
            $table->foreignId('\''coupon_id'\'')->constrained()->onDelete('\''cascade'\'');
            $table->foreignId('\''user_id'\'')->constrained()->onDelete('\''cascade'\'');
            $table->foreignId('\''order_id'\'')->constrained()->onDelete('\''cascade'\'');
            $table->decimal('\''discount_amount'\'', 10, 2);
            $table->timestamps();
            
            $table->index(['\''coupon_id'\'', '\''user_id'\'']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('\''coupon_usages'\'');
    }
};'

# 17. Notifications Migration
write_migration "$NOTIFICATIONS_FILE" '<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('\''notifications'\'', function (Blueprint $table) {
            $table->id();
            $table->foreignId('\''user_id'\'')->constrained()->onDelete('\''cascade'\'');
            $table->string('\''type'\'');
            $table->string('\''title'\'');
            $table->text('\''message'\'');
            $table->json('\''data'\'')->nullable();
            $table->boolean('\''is_read'\'')->default(false);
            $table->timestamp('\''read_at'\'')->nullable();
            $table->timestamps();
            
            $table->index(['\''user_id'\'', '\''is_read'\'']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('\''notifications'\'');
    }
};'

# 18. Activity Logs Migration
write_migration "$ACTIVITY_LOGS_FILE" '<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('\''activity_logs'\'', function (Blueprint $table) {
            $table->id();
            $table->foreignId('\''user_id'\'')->nullable()->constrained()->onDelete('\''cascade'\'');
            $table->string('\''action'\'');
            $table->string('\''model_type'\'')->nullable();
            $table->unsignedBigInteger('\''model_id'\'')->nullable();
            $table->text('\''description'\'')->nullable();
            $table->json('\''properties'\'')->nullable();
            $table->string('\''ip_address'\'')->nullable();
            $table->string('\''user_agent'\'')->nullable();
            $table->timestamps();
            
            $table->index(['\''user_id'\'', '\''created_at'\'']);
            $table->index(['\''model_type'\'', '\''model_id'\'']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('\''activity_logs'\'');
    }
};'

# 19. Settings Migration
write_migration "$SETTINGS_FILE" '<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('\''settings'\'', function (Blueprint $table) {
            $table->id();
            $table->string('\''key'\'')->unique();
            $table->text('\''value'\'')->nullable();
            $table->string('\''type'\'')->default('\''string'\'');
            $table->text('\''description'\'')->nullable();
            $table->timestamps();
            
            $table->index('\''key'\'');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('\''settings'\'');
    }
};'

echo ""
echo "✅ All 19 migrations filled successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Run: chmod +x fill_migrations.sh"
echo "   2. Run: php artisan migrate:fresh"
echo "   3. Run: php artisan db:seed --class=ProductSeeder"
echo ""
