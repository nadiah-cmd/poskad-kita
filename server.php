<?php
$path = parse_url($_SERVER["REQUEST_URI"] ?? "/", PHP_URL_PATH) ?: "/";
$ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
$types = [
    "woff2" => "font/woff2",
    "js" => "text/javascript; charset=utf-8",
    "css" => "text/css; charset=utf-8",
    "svg" => "image/svg+xml",
    "html" => "text/html; charset=utf-8",
    "png" => "image/png",
];

if (isset($types[$ext])) {
    $file = __DIR__ . str_replace("/", DIRECTORY_SEPARATOR, rawurldecode($path));
    if (is_file($file)) {
        header("Content-Type: " . $types[$ext]);
        header("Cache-Control: no-store");
        readfile($file);
        return true;
    }
}

return false;
