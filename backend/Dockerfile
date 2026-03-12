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

# Create .env file from example if it doesn't exist, or create minimal one
RUN if [ ! -f .env ]; then \
    echo "APP_NAME=Oshocks" > .env && \
    echo "APP_ENV=production" >> .env && \
    echo "APP_DEBUG=false" >> .env && \
    echo "APP_URL=\${RAILWAY_STATIC_URL:-http://localhost}" >> .env && \
    echo "APP_KEY=" >> .env && \
    echo "LOG_CHANNEL=stderr" >> .env && \
    echo "LOG_LEVEL=debug" >> .env && \
    echo "DB_CONNECTION=mysql" >> .env && \
    echo "DB_HOST=\${MYSQLHOST}" >> .env && \
    echo "DB_PORT=\${MYSQLPORT:-3306}" >> .env && \
    echo "DB_DATABASE=\${MYSQLDATABASE}" >> .env && \
    echo "DB_USERNAME=\${MYSQLUSER}" >> .env && \
    echo "DB_PASSWORD=\${MYSQLPASSWORD}" >> .env && \
    echo "CACHE_DRIVER=array" >> .env && \
    echo "SESSION_DRIVER=array" >> .env; \
    fi

# Generate APP_KEY and optimize
RUN php artisan key:generate --force 2>/dev/null || true

# Create server.php for PHP built-in server
RUN printf '<?php\n\
$uri = urldecode(parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH) ?? "");\n\
if ($uri !== "/" && file_exists(__DIR__."/public".$uri)) return false;\n\
require_once __DIR__."/public/index.php";\n\
' > server.php

# Expose port
ENV PORT=8080
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/api/health || exit 1

# Start command with proper setup
CMD echo "=== Setting up Storage ===" && \
    mkdir -p /tmp/storage/framework/sessions /tmp/storage/framework/views /tmp/storage/framework/cache/data /tmp/storage/logs /tmp/storage/app/public && \
    chmod -R 775 /tmp/storage && \
    echo "=== Checking Environment ===" && \
    if [ -z "$MYSQLHOST" ] || [ -z "$MYSQLDATABASE" ]; then \
        echo "WARNING: Database environment variables not set. Skipping migrations."; \
    else \
        echo "=== Generating APP_KEY if needed ===" && \
        php artisan key:generate --force 2>/dev/null || true && \
        echo "=== Clearing Cached Config ===" && \
        rm -f bootstrap/cache/*.php 2>/dev/null || true && \
        echo "=== Running Migrations ===" && \
        php artisan migrate --force --no-interaction 2>/dev/null || echo "Migration failed or skipped" && \
        echo "=== Running Seeders ===" && \
        php artisan db:seed --force --no-interaction 2>/dev/null || echo "Seeding skipped"; \
    fi && \
    echo "=== Starting Server ===" && \
    php -S 0.0.0.0:${PORT} server.php
