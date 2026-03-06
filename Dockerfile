FROM php:8.2-apache

# Install dependencies
RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev zip unzip libzip-dev libpq-dev

RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql mbstring exif pcntl bcmath gd zip

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy and install dependencies
COPY backend/composer.json backend/composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# Copy app
COPY backend/ .

# Create .env
RUN echo "APP_KEY=base64:8x5Y+zZtY0RPXcaWykebUxtRIuEjolXlr/BOCMtJjyc=" > .env

# Permissions
RUN mkdir -p storage/framework/{sessions,views,cache} bootstrap/cache storage/logs \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Apache config
RUN a2enmod rewrite headers

# Use Railway's PORT env var (default 8080)
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
ENV PORT=8080

# Configure Apache to listen on $PORT
RUN sed -i "s/Listen 80/Listen \${PORT}/g" /etc/apache2/ports.conf \
    && sed -i "s/:80>/:\${PORT}>/g" /etc/apache2/sites-available/*.conf \
    && sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
    && sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf

# Laravel directory permissions
RUN echo "<Directory /var/www/html/public>\nOptions Indexes FollowSymLinks\nAllowOverride All\nRequire all granted\n</Directory>" > /etc/apache2/conf-available/laravel.conf \
    && a2enconf laravel

RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

EXPOSE 8080

CMD ["apache2-foreground"]
