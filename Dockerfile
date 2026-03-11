FROM php:8.4-cli

RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev zip unzip libzip-dev libpq-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql mbstring exif pcntl bcmath gd zip

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY backend/composer.json backend/composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

COPY backend/ .

# Create storage directories
RUN mkdir -p storage/framework/{sessions,views,cache} \
    bootstrap/cache storage/logs \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Create .env file with defaults (Railway env vars will override at runtime)
RUN echo "APP_NAME=Oshocks" > .env && \
    echo "APP_ENV=production" >> .env && \
    echo "APP_KEY=base64:8x5Y+zZtY0RPXcaWykebUxtRIuEjolXlr/BOCMtJjyc=" >> .env && \
    echo "APP_DEBUG=false" >> .env && \
    echo "APP_URL=https://oshocks-backend-production.up.railway.app" >> .env && \
    echo "DB_CONNECTION=mysql" >> .env

# Use server.php from backend folder
ENV PORT=8080

WORKDIR /var/www/html/public
CMD ["php", "-S", "0.0.0.0:8080", "../server.php"]
