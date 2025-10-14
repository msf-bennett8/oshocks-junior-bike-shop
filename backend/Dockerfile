# Use PHP 8.2 with Apache
FROM php:8.2-apache

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
    nano \
    vim

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy composer files first
COPY composer.json composer.lock /var/www/html/

# Install application dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# Copy the rest of the application
COPY . /var/www/html

# Create .env from example if it doesn't exist (environment variables will override)
RUN cp .env.example .env 2>/dev/null || true

# Create all necessary directories
RUN mkdir -p /var/www/html/storage/framework/{sessions,views,cache} \
    /var/www/html/bootstrap/cache \
    /var/www/html/storage/logs \
    /var/www/html/resources/views

# Set proper permissions
RUN chown -R www-data:www-data \
    /var/www/html/storage \
    /var/www/html/bootstrap/cache \
    /var/www/html/resources \
    && chmod -R 775 \
    /var/www/html/storage \
    /var/www/html/bootstrap/cache

# Enable Apache modules
RUN a2enmod rewrite headers

# Configure Apache DocumentRoot to Laravel's public directory
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public

# Update Apache configuration
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Configure Laravel directory in Apache
RUN echo '<Directory /var/www/html/public>\n\
    Options Indexes FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>' > /etc/apache2/conf-available/laravel.conf && \
    a2enconf laravel

# Set ServerName to suppress Apache warning
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Startup script with error handling
CMD set -e && \
    echo "=== Starting Laravel Application ===" && \
    echo "Checking environment..." && \
    php -v && \
    echo "Testing database connection..." && \
    php artisan migrate:status || echo "Warning: Could not connect to database" && \
    echo "Caching configuration..." && \
    php artisan config:cache && \
    echo "Caching routes..." && \
    php artisan route:cache && \
    echo "Caching views (if possible)..." && \
    (php artisan view:cache || echo "View cache skipped - no views found") && \
    echo "Running migrations..." && \
    (php artisan migrate --force || echo "Warning: Migrations failed") && \
    echo "=== Starting Apache ===" && \
    apache2-foreground
