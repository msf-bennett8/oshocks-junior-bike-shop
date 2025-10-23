#!/bin/bash

# ============================================
# BIKE SHOP PRODUCT UPLOAD SCRIPT
# ============================================
# Edit the sections below with your product details
# Then run: bash add_product.sh
# ============================================

# ============================================
# 1. YOUR AUTHENTICATION TOKEN
# ============================================
# Get your token by logging in first, then paste it here
TOKEN="74|LWFgNOJsruu3P9loG9XftJBGm2egwRha7odaEzpx1fd7ecda"

# ============================================
# 2. BASIC PRODUCT INFORMATION
# ============================================
PRODUCT_NAME="Mountain Bike Pro X500"
PRODUCT_DESCRIPTION="High-performance mountain bike with 21-speed gear system, aluminum frame, and hydraulic disc brakes. Perfect for trail riding and cross-country adventures. Features include front suspension fork, ergonomic saddle, and all-terrain tires."

# Product Type: "bike" or "accessory"
PRODUCT_TYPE="bike"

# Category ID (see list below):
# 1 = Mountain Bikes
# 2 = Road Bikes  
# 3 = Kids Bikes
# 4 = Electric Bikes
# 5 = Helmets
# 6 = Lights
# 7 = Locks
# 8 = Spare Parts
# 9 = Tires & Tubes
# 10 = Brakes
CATEGORY_ID="1"

# Brand (optional - leave empty if no brand)
BRAND="Trek"

# ============================================
# 3. PRICING & INVENTORY
# ============================================
PRICE="85000"          # Price in KSh
QUANTITY="10"          # Stock quantity
CONDITION="new"        # Options: new, used, refurbished
YEAR="2024"            # Manufacturing year

# ============================================
# 4. SPECIFICATIONS (Edit values as needed)
# ============================================
# These are key-value pairs describing the product
SPEC_FRAME_MATERIAL="Aluminum Alloy"
SPEC_WHEEL_SIZE="27.5 inches"
SPEC_GEAR_SYSTEM="Shimano 21-speed"
SPEC_BRAKE_TYPE="Hydraulic Disc"
SPEC_WEIGHT="13.5 kg"

# ============================================
# 5. AVAILABLE SIZES
# ============================================
# Edit the size options for your product
# Format: {"id":NUMBER,"name":"DISPLAY_NAME","value":"SHORT_CODE","available":true,"recommended":"HEIGHT_RANGE"}

SIZE_1='{"id":1,"name":"Small (15\")","value":"S","available":true,"recommended":"5.3ft - 5.7ft"}'
SIZE_2='{"id":2,"name":"Medium (17\")","value":"M","available":true,"recommended":"5.7ft - 6.0ft"}'
SIZE_3='{"id":3,"name":"Large (19\")","value":"L","available":true,"recommended":"6.0ft - 6.3ft"}'
SIZE_4='{"id":4,"name":"X-Large (21\")","value":"XL","available":true,"recommended":"6.0ft - 6.5ft"}'

# ============================================
# 6. KEY FEATURES (Bullet Points)
# ============================================
FEATURE_1="Lightweight aluminum frame for easy handling"
FEATURE_2="21-speed Shimano drivetrain for versatile riding"
FEATURE_3="Hydraulic disc brakes for powerful stopping"
FEATURE_4="Front suspension fork absorbs trail impacts"

# ============================================
# 7. COLOR VARIANTS & IMAGES
# ============================================
# You can add multiple colors. Each color needs a name and images.

# COLOR 1
COLOR_1_NAME="Matte Black"
COLOR_1_IMAGE_1="/home/msf_bennett/ctrl.dev/studio.dev/oshocks/backend/product_images/product_1/image1.jpg"
COLOR_1_IMAGE_2="/home/msf_bennett/ctrl.dev/studio.dev/oshocks/backend/product_images/product_1/image2.jpg"
COLOR_1_IMAGE_3="/home/msf_bennett/ctrl.dev/studio.dev/oshocks/backend/product_images/product_1/image3.jpg"

# COLOR 2 (Optional - Comment out if not needed)
# COLOR_2_NAME="Red"
# COLOR_2_IMAGE_1="/path/to/red/image1.jpg"
# COLOR_2_IMAGE_2="/path/to/red/image2.jpg"

# ============================================
# DON'T EDIT BELOW THIS LINE
# ============================================

API_URL="https://oshocks-junior-bike-shop-backend.onrender.com/api/v1"

# Build specifications JSON
SPECIFICATIONS=$(cat <<JSON_SPEC
{
  "frame_material": "$SPEC_FRAME_MATERIAL",
  "wheel_size": "$SPEC_WHEEL_SIZE",
  "gear_system": "$SPEC_GEAR_SYSTEM",
  "brake_type": "$SPEC_BRAKE_TYPE",
  "weight": "$SPEC_WEIGHT"
}
JSON_SPEC
)

# Build sizes JSON
SIZES="[$SIZE_1,$SIZE_2,$SIZE_3,$SIZE_4]"

# Build key features JSON
KEY_FEATURES=$(cat <<JSON_FEAT
[
  {"id":1,"text":"$FEATURE_1"},
  {"id":2,"text":"$FEATURE_2"},
  {"id":3,"text":"$FEATURE_3"},
  {"id":4,"text":"$FEATURE_4"}
]
JSON_FEAT
)

echo "============================================"
echo "UPLOADING PRODUCT: $PRODUCT_NAME"
echo "============================================"
echo ""

# Build the curl command
CURL_CMD=(
  curl -X POST "$API_URL/seller/products"
  -H "Authorization: Bearer $TOKEN"
  -H "Accept: application/json"
  -F "name=$PRODUCT_NAME"
  -F "description=$PRODUCT_DESCRIPTION"
  -F "type=$PRODUCT_TYPE"
  -F "category_id=$CATEGORY_ID"
)

# Add brand if provided
if [ -n "$BRAND" ]; then
  CURL_CMD+=(-F "brand_id=$BRAND")
fi

# Add remaining fields
CURL_CMD+=(
  -F "price=$PRICE"
  -F "quantity=$QUANTITY"
  -F "condition=$CONDITION"
  -F "year=$YEAR"
  -F "specifications=$SPECIFICATIONS"
  -F "sizes=$SIZES"
  -F "keyFeatures=$KEY_FEATURES"
)

# Add Color 1 images
CURL_CMD+=(
  -F "colors[0][name]=$COLOR_1_NAME"
)

if [ -f "$COLOR_1_IMAGE_1" ]; then
  CURL_CMD+=(-F "colors[0][images][]=@$COLOR_1_IMAGE_1")
fi

if [ -f "$COLOR_1_IMAGE_2" ]; then
  CURL_CMD+=(-F "colors[0][images][]=@$COLOR_1_IMAGE_2")
fi

if [ -f "$COLOR_1_IMAGE_3" ]; then
  CURL_CMD+=(-F "colors[0][images][]=@$COLOR_1_IMAGE_3")
fi

# Add Color 2 if defined (uncomment in config section to use)
if [ -n "$COLOR_2_NAME" ]; then
  CURL_CMD+=(-F "colors[1][name]=$COLOR_2_NAME")
  
  if [ -f "$COLOR_2_IMAGE_1" ]; then
    CURL_CMD+=(-F "colors[1][images][]=@$COLOR_2_IMAGE_1")
  fi
  
  if [ -f "$COLOR_2_IMAGE_2" ]; then
    CURL_CMD+=(-F "colors[1][images][]=@$COLOR_2_IMAGE_2")
  fi
fi

# Execute the upload
"${CURL_CMD[@]}"

echo ""
echo ""
echo "============================================"
echo "UPLOAD COMPLETE"
echo "============================================"