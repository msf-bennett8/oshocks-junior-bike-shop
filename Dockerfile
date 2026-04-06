FROM php:8.4-cli

RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev zip unzip libzip-dev libpq-dev default-mysql-client \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql mbstring exif pcntl bcmath gd zip \
    && pecl install redis \
    && docker-php-ext-enable redis

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy composer files from backend folder (KEY DIFFERENCE)
COPY backend/composer.json backend/composer.lock ./

RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# Copy rest of backend folder (KEY DIFFERENCE)
COPY backend/ .

# Storage setup
RUN mkdir -p /tmp/storage/framework/sessions \
    /tmp/storage/framework/views \
    /tmp/storage/framework/cache/data \
    /tmp/storage/logs \
    /tmp/storage/app/public \
    bootstrap/cache \
    && ln -sf /tmp/storage storage \
    && chown -R www-data:www-data /tmp/storage bootstrap/cache \
    && chmod -R 775 /tmp/storage bootstrap/cache

# Create .env
RUN echo "APP_NAME=Oshocks" > .env && \
    echo "APP_ENV=production" >> .env && \
    echo "APP_DEBUG=false" >> .env && \
    echo "APP_URL=https://oshocks-backend-production.up.railway.app" >> .env && \
    echo "APP_KEY=" >> .env && \
    echo "LOG_CHANNEL=stderr" >> .env && \
    echo "LOG_LEVEL=debug" >> .env && \
    echo "DB_CONNECTION=mysql" >> .env

# Create server.php
RUN printf '<?php\n\
$uri = urldecode(parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH) ?? "");\n\
if ($uri !== "/" && file_exists(__DIR__."/public".$uri)) return false;\n\
require_once __DIR__."/public/index.php";\n\
' > server.php

ENV PORT=8080
EXPOSE 8080

# Start with migrations (THIS IS THE FIX)
CMD echo "=== Setup ===" && \
    mkdir -p /tmp/storage/framework/sessions /tmp/storage/framework/views /tmp/storage/framework/cache/data /tmp/storage/logs /tmp/storage/app/public && \
    chmod -R 775 /tmp/storage && \
    echo "=== Generating Key ===" && \
    php artisan key:generate --force 2>/dev/null || true && \
    echo "=== Running Migrations ===" && \
    (php artisan migrate --force --no-interaction 2>/dev/null && echo "Migrations completed") || echo "Migrations skipped" && \
    echo "=== Starting Server ===" && \
    php -S 0.0.0.0:${PORT} server.php