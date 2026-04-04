FROM php:8.2-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
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
RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql mbstring exif pcntl bcmath gd zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy composer files first for better caching
COPY composer.json composer.lock ./

# Install PHP dependencies (no scripts to avoid artisan errors during build)
RUN composer install --optimize-autoloader --no-interaction --no-scripts --no-dev

# Copy the rest of the application
COPY . .

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

# Create .env file template with placeholder
RUN echo "APP_NAME=Oshocks" > .env && \
    echo "APP_ENV=production" >> .env && \
    echo "APP_DEBUG=false" >> .env && \
    echo "APP_URL=http://localhost" >> .env && \
    echo "APP_KEY=" >> .env && \
    echo "LOG_CHANNEL=stderr" >> .env && \
    echo "LOG_LEVEL=debug" >> .env && \
    echo "DB_CONNECTION=mysql" >> .env && \
    echo "CACHE_DRIVER=array" >> .env && \
    echo "SESSION_DRIVER=array" >> .env

# Create server.php for PHP built-in server
RUN printf '<?php\n\
$uri = urldecode(parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH) ?? "");\n\
if ($uri !== "/" && file_exists(__DIR__."/public".$uri)) return false;\n\
require_once __DIR__."/public/index.php";\n\
' > server.php

# Create startup script - THIS IS THE KEY FIX
RUN printf '#!/bin/bash\n\
set -e\n\
\n\
echo "=== Setup ==="\n\
\n\
# CRITICAL: Create .env with APP_KEY immediately\n\
if [ -n "$APP_KEY" ]; then\n\
    echo "Writing APP_KEY to .env..."\n\
    echo "APP_KEY=${APP_KEY}" > .env.tmp\n\
    # Copy rest of .env except APP_KEY line\n\
    grep -v "^APP_KEY=" .env >> .env.tmp 2>/dev/null || true\n\
    mv .env.tmp .env\n\
else\n\
    echo "WARNING: APP_KEY not set!"\n\
fi\n\
\n\
# Ensure storage directories exist\n\
mkdir -p /tmp/storage/framework/sessions /tmp/storage/framework/views /tmp/storage/framework/cache/data /tmp/storage/logs /tmp/storage/app/public\n\
chmod -R 775 /tmp/storage\n\
\n\
# Create storage link\n\
php artisan storage:link --force 2>/dev/null || true\n\
\n\
echo "=== Running Migrations ==="\n\
php artisan migrate --force --no-interaction 2>/dev/null || echo "Migrations skipped or failed"\n\
\n\
echo "=== Starting Server ==="\n\
exec php -S 0.0.0.0:${PORT:-8080} server.php\n\
' > /start.sh && chmod +x /start.sh

# Expose port
ENV PORT=8080
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/api/health || exit 1

# Use the startup script
CMD ["/start.sh"]