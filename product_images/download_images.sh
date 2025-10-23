#!/bin/bash

# Create directories for each product
mkdir -p product_{1..12}

echo "Downloading cycling product images..."

# Product 1: Mountain Bike
wget -O product_1/image1.jpg "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800" 2>/dev/null
wget -O product_1/image2.jpg "https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=800" 2>/dev/null
wget -O product_1/image3.jpg "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800" 2>/dev/null

# Product 2: Road Bike
wget -O product_2/image1.jpg "https://images.unsplash.com/photo-1511994477422-b69e44bd4ea9?w=800" 2>/dev/null
wget -O product_2/image2.jpg "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800" 2>/dev/null
wget -O product_2/image3.jpg "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=800" 2>/dev/null

# Product 3: Helmet
wget -O product_3/image1.jpg "https://images.unsplash.com/photo-1589118949245-7d38baf380d6?w=800" 2>/dev/null
wget -O product_3/image2.jpg "https://images.unsplash.com/photo-1607619662634-3ac55ec0e216?w=800" 2>/dev/null
wget -O product_3/image3.jpg "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800" 2>/dev/null

# Product 4: Bike Lock
wget -O product_4/image1.jpg "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800" 2>/dev/null
wget -O product_4/image2.jpg "https://images.unsplash.com/photo-1617870132371-440bb2a8f336?w=800" 2>/dev/null
wget -O product_4/image3.jpg "https://images.unsplash.com/photo-1617870132311-e840e5abbb56?w=800" 2>/dev/null

# Product 5: Water Bottle
wget -O product_5/image1.jpg "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800" 2>/dev/null
wget -O product_5/image2.jpg "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800" 2>/dev/null
wget -O product_5/image3.jpg "https://images.unsplash.com/photo-1550828520-4cb496926fc9?w=800" 2>/dev/null

# Product 6: Bike Light
wget -O product_6/image1.jpg "https://images.unsplash.com/photo-1617791160588-241658c0f566?w=800" 2>/dev/null
wget -O product_6/image2.jpg "https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=800" 2>/dev/null
wget -O product_6/image3.jpg "https://images.unsplash.com/photo-1614959876640-a57e4eb04e1f?w=800" 2>/dev/null

# Product 7: Cycling Jersey
wget -O product_7/image1.jpg "https://images.unsplash.com/photo-1559223607-a43c990c02f5?w=800" 2>/dev/null
wget -O product_7/image2.jpg "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800" 2>/dev/null
wget -O product_7/image3.jpg "https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=800" 2>/dev/null

# Product 8: Bike Pump
wget -O product_8/image1.jpg "https://images.unsplash.com/photo-1617791160588-241658c0f566?w=800" 2>/dev/null
wget -O product_8/image2.jpg "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800" 2>/dev/null
wget -O product_8/image3.jpg "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800" 2>/dev/null

# Product 9: Cycling Gloves
wget -O product_9/image1.jpg "https://images.unsplash.com/photo-1607619662634-3ac55ec0e216?w=800" 2>/dev/null
wget -O product_9/image2.jpg "https://images.unsplash.com/photo-1614959876640-a57e4eb04e1f?w=800" 2>/dev/null
wget -O product_9/image3.jpg "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800" 2>/dev/null

# Product 10: Bike Saddle
wget -O product_10/image1.jpg "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800" 2>/dev/null
wget -O product_10/image2.jpg "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=800" 2>/dev/null
wget -O product_10/image3.jpg "https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=800" 2>/dev/null

# Product 11: Bike Pedals
wget -O product_11/image1.jpg "https://images.unsplash.com/photo-1511994477422-b69e44bd4ea9?w=800" 2>/dev/null
wget -O product_11/image2.jpg "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800" 2>/dev/null
wget -O product_11/image3.jpg "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800" 2>/dev/null

# Product 12: Bike Chain
wget -O product_12/image1.jpg "https://images.unsplash.com/photo-1617870132371-440bb2a8f336?w=800" 2>/dev/null
wget -O product_12/image2.jpg "https://images.unsplash.com/photo-1617791160588-241658c0f566?w=800" 2>/dev/null
wget -O product_12/image3.jpg "https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=800" 2>/dev/null

echo "Download complete! Check product_images directory."
