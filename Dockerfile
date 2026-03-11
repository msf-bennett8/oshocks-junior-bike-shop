FROM php:8.2-cli

# Install dependencies
RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev zip unzip libzip-dev libpq-dev \
    default-mysql-client \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql mbstring exif pcntl bcmath gd zip

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy and install dependencies
COPY backend/composer.json backend/composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# Copy application
COPY backend/ .

# Create storage directories
RUN mkdir -p storage/framework/{sessions,views,cache}/data \
    bootstrap/cache storage/logs \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Create server.php for built-in server
RUN echo '<?php \
$uri = urldecode(parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH) ?? ""); \
if ($uri !== "/" && file_exists(__DIR__."/public".$uri)) return false; \
require_once __DIR__."/public/index.php"; \
' > server.php

ENV PORT=8080

# Start script with migrations
CMD echo "=== Running Migrations ===" && \
    php artisan migrate --force && \
    echo "=== Running Seeders ===" && \
    php artisan db:seed --force && \
    echo "=== Starting Server ===" && \
    cd /var/www/html/public && \
    php -S 0.0.0.0:${PORT} ../server.php
