<?php
require_once dirname(__DIR__) . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_out(['error' => 'Method not allowed'], 405);
}

$user = get_session_user();
if (!$user) json_out(['error' => 'Not authenticated'], 401);

// Delete the user row — all related rows (sessions, steam_games, user_settings)
// cascade via FK ON DELETE CASCADE defined in the schema.
$db = db();
$db->prepare('DELETE FROM users WHERE id = ?')->execute([$user['id']]);

// Clear the session cookie
setcookie('gp_sid', '', [
    'expires'  => time() - 3600,
    'path'     => '/',
    'secure'   => true,
    'httponly' => true,
    'samesite' => 'Lax',
]);

json_out(['ok' => true]);
