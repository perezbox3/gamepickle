<?php
require_once dirname(__DIR__) . '/config.php';

$sid = $_COOKIE['gp_sid'] ?? '';
if (strlen($sid) === 64) {
    db()->prepare('DELETE FROM sessions WHERE id = ?')->execute([$sid]);
}

// Expire the cookie by setting it to the past
setcookie('gp_sid', '', [
    'expires'  => 1,
    'path'     => '/',
    'secure'   => true,
    'httponly' => true,
    'samesite' => 'Lax',
]);

json_out(['ok' => true]);
