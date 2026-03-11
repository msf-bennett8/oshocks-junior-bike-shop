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

# Install PHP extensions (separate commands to avoid build conflicts)
RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql mbstring exif pcntl bcmath gd
RUN docker-php-ext-install zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy composer files first for better caching
COPY composer.json composer.lock ./

# Install PHP dependencies
RUN composer install --optimize-autoloader --no-interaction --no-scripts

# Copy the rest of the application
COPY . .

# Create storage directories and set permissions
RUN mkdir -p storage/framework/{sessions,views,cache}/data \
    bootstrap/cache \
    storage/logs \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Create server.php for PHP built-in server
RUN printf '<?php\n\
$uri = urldecode(parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH) ?? "");\n\
if ($uri !== "/" && file_exists(__DIR__."/public".$uri)) return false;\n\
require_once __DIR__."/public/index.php";\n\
' > server.php

# Expose port
ENV PORT=8080
EXPOSE 8080

# Start command with migrations and seeders
CMD echo "=== Clearing Cached Config ===" && \
    rm -f bootstrap/cache/*.php && \
    echo "=== Running Migrations ===" && \
    php artisan migrate --force && \
    echo "=== Running Seeders ===" && \
    php artisan db:seed --force && \
    echo "=== Starting Server ===" && \
    php -S 0.0.0.0:${PORT} server.php
