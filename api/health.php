<?php
require_once __DIR__ . '/config.php';

try {
    db()->query('SELECT 1');
    json_out(['ok' => true, 'db' => 'up']);
} catch (\Throwable $e) {
    json_out(['ok' => false, 'db' => 'down'], 503);
}
