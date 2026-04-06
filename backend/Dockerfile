FROM php:8.4-cli

# Install system dependencies + wget/tar for MaxMind
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    tar \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    libpq-dev \
    default-mysql-client \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql mbstring exif pcntl bcmath gd zip \
    && pecl install redis \
    && docker-php-ext-enable redis

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy composer files first for better caching
COPY backend/composer.json backend/composer.lock ./

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# Copy the rest of the application
COPY backend/ .

# Build argument for MaxMind license key (for build-time download)
ARG MAXMIND_LICENSE_KEY

# Try to download MaxMind during build (optional - won't fail if key missing)
RUN if [ -n "$MAXMIND_LICENSE_KEY" ]; then \
        echo "Downloading MaxMind database during build..." && \
        wget -qO /tmp/maxmind.tar.gz "https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-City&license_key=${MAXMIND_LICENSE_KEY}&suffix=tar.gz" && \
        tar -xzf /tmp/maxmind.tar.gz -C /tmp/ && \
        mv /tmp/GeoLite2-City_*/GeoLite2-City.mmdb /tmp/GeoLite2-City.mmdb && \
        rm -rf /tmp/maxmind.tar.gz /tmp/GeoLite2-City_* && \
        echo "✓ MaxMind database ready at build time ($(ls -lh /tmp/GeoLite2-City.mmdb | awk '{print $5}'))"; \
    else \
        echo "⚠ No MAXMIND_LICENSE_KEY at build - will download at runtime if needed"; \
    fi

# Create storage directories in /tmp (writable in Railway)
RUN mkdir -p /tmp/storage/framework/sessions \
    /tmp/storage/framework/views \
    /tmp/storage/framework/cache/data \
    /tmp/storage/logs \
    /tmp/storage/app/public \
    bootstrap/cache \
    && ln -sf /tmp/storage storage \
    && chown -R www-data:www-data /tmp/storage bootstrap/cache \
    && chmod -R 775 /tmp/storage bootstrap/cache

# Create .env file template (APP_KEY will be overwritten at runtime)
RUN echo "APP_NAME=Oshocks" > .env && \
    echo "APP_ENV=production" >> .env && \
    echo "APP_DEBUG=false" >> .env && \
    echo "APP_URL=https://oshocks-backend-production.up.railway.app" >> .env && \
    echo "APP_KEY=" >> .env && \
    echo "LOG_CHANNEL=stderr" >> .env && \
    echo "LOG_LEVEL=debug" >> .env && \
    echo "DB_CONNECTION=mysql" >> .env

# Create server.php for PHP built-in server
RUN printf '<?php\n\
$uri = urldecode(parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH) ?? "");\n\
if ($uri !== "/" && file_exists(__DIR__."/public".$uri)) return false;\n\
require_once __DIR__."/public/index.php";\n\
' > server.php

# Create startup script with MaxMind runtime fallback
RUN printf '#!/bin/bash\n\
set -e\n\
\n\
echo "=== Setup ==="\n\
\n\
# Create .env file with APP_KEY from environment variable\n\
if [ -n "$APP_KEY" ]; then\n\
    echo "Creating .env file with APP_KEY from environment..."\n\
    if [[ "$APP_KEY" == base64:* ]]; then\n\
        echo "APP_KEY=${APP_KEY}" > .env\n\
    else\n\
        echo "APP_KEY=base64:${APP_KEY}" > .env\n\
    fi\n\
else\n\
    echo "WARNING: APP_KEY not set! Generating temporary key..."\n\
    echo "APP_KEY=base64:$(openssl rand -base64 32)" > .env\n\
fi\n\
\n\
# Add other essential environment variables to .env\n\
printenv | grep -E '\''^(APP_|DB_|CACHE_|SESSION_|QUEUE_|REDIS_|MAIL_|AWS_|PUSHER_|VITE_|RAILWAY_|FRONTEND_|CORS_|MPESA_|PAYSTACK_|FLW_|GOOGLE_|STRAVA_|CLOUDINARY_|DATABASE_URL|FORCE_HTTPS|AUDIT_|MAXMIND_)'\'' >> .env\n\
\n\
# Create storage directories\n\
mkdir -p /tmp/storage/framework/cache/data /tmp/storage/framework/sessions /tmp/storage/framework/views /tmp/storage/logs /tmp/storage/app/public\n\
chmod -R 775 /tmp/storage\n\
\n\
# Link to storage\n\
php artisan storage:link --force 2>/dev/null || true\n\
\n\
echo "=== MaxMind Geolocation Setup ==="\n\
# Runtime fallback: Download MaxMind DB if not present (for Railway ephemeral containers)\n\
if [ ! -f /tmp/GeoLite2-City.mmdb ] && [ -n "$MAXMIND_LICENSE_KEY" ]; then\n\
    echo "MaxMind DB not found at runtime, downloading..."\n\
    wget -qO /tmp/maxmind.tar.gz "https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-City&license_key=${MAXMIND_LICENSE_KEY}&suffix=tar.gz" && \\\n\
    tar -xzf /tmp/maxmind.tar.gz -C /tmp/ && \\\n\
    mv /tmp/GeoLite2-City_*/GeoLite2-City.mmdb /tmp/GeoLite2-City.mmdb && \\\n\
    rm -rf /tmp/maxmind.tar.gz /tmp/GeoLite2-City_* && \\\n\
    echo "✓ MaxMind database ready at runtime ($(ls -lh /tmp/GeoLite2-City.mmdb | awk '\''{print $5}'\'')" || \\\n\
    echo "⚠ WARNING: MaxMind download failed, geolocation will be disabled"\n\
elif [ -f /tmp/GeoLite2-City.mmdb ]; then\n\
    echo "✓ MaxMind database already present ($(ls -lh /tmp/GeoLite2-City.mmdb | awk '\''{print $5}'\''))"\n\
else\n\
    echo "⚠ No MAXMIND_LICENSE_KEY set - geolocation will be disabled"\n\
fi\n\
\n\
echo "=== Generating Key ==="\n\
php artisan key:generate --force 2>/dev/null || echo "Using existing APP_KEY"\n\
\n\
echo "=== Running Migrations ==="\n\
php artisan migrate --force --no-interaction || echo "Migrations completed with warnings"\n\
\n\
echo "=== Starting Server ==="\n\
exec php -S 0.0.0.0:${PORT:-8080} server.php\n\
' > /start.sh && chmod +x /start.sh

# Expose port
ENV PORT=8080
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
CMD curl -f http://localhost:8080/api/health || exit 1

# Use the startup script
CMD ["/start.sh"]