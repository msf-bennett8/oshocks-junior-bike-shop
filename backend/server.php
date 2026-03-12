<?php

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? "");

// API routes should go to index.php
if (str_starts_with($uri, '/api/') || str_starts_with($uri, '/api/v1/')) {
    require_once __DIR__ . '/public/index.php';
    return;
}

// Static files
if ($uri !== "/" && file_exists(__DIR__ . "/public" . $uri)) {
    return false;
}

// Everything else to index.php (React app)
require_once __DIR__ . '/public/index.php';
