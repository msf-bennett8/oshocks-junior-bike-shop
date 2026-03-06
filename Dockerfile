# Use the backend's existing Dockerfile
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
    libpq-dev \
    nano \
    vim

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions (added pdo_pgsql for Railway PostgreSQL)
RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql mbstring exif pcntl bcmath gd zip

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy composer files first from backend
COPY backend/composer.json backend/composer.lock /var/www/html/

# Install application dependencies (no scripts to avoid APP_KEY issue)
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# Copy the rest of the application
COPY backend/ /var/www/html/

# Create .env with APP_KEY from environment variable
RUN echo "APP_KEY=${APP_KEY:-base64:8x5Y+zZtY0RPXcaWykebUxtRIuEjolXlr/BOCMtJjyc=}" > .env

# Create all necessary directories
RUN mkdir -p /var/www/html/storage/framework/{sessions,views,cache} \
    /var/www/html/bootstrap/cache \
    /var/www/html/storage/logs

# Set proper permissions
RUN chown -R www-data:www-data \
    /var/www/html/storage \
    /var/www/html/bootstrap/cache \
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

# Expose port 80 (Railway will map this)
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]
