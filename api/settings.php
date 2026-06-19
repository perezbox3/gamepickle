<?php
require_once __DIR__ . '/config.php';

$user = get_session_user();
if (!$user) json_out(['error' => 'Not authenticated'], 401);

$valid_sessions = ['fast', 'mid', 'long', 'chill'];
$valid_genres   = [
    'Action','Adventure','Casual','Indie','RPG','Racing',
    'Simulation','Sports','Strategy','Puzzle','Platformer',
    'Fighting','Shooter','Horror','Roguelike',
];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = db()->prepare(
        'SELECT genre_bans, default_session FROM user_settings WHERE user_id = ?'
    );
    $stmt->execute([$user['id']]);
    $row = $stmt->fetch();

    json_out([
        'genre_bans'      => json_decode($row['genre_bans'] ?? '[]', true) ?: [],
        'default_session' => in_array($row['default_session'] ?? '', $valid_sessions)
                             ? $row['default_session'] : 'mid',
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true) ?? [];

    // Whitelist-validate genre bans
    $raw_bans  = is_array($body['genre_bans'] ?? null) ? $body['genre_bans'] : [];
    $genre_bans = json_encode(array_values(
        array_intersect($raw_bans, $valid_genres)
    ));

    // Whitelist-validate session default
    $default_session = in_array($body['default_session'] ?? '', $valid_sessions)
                       ? $body['default_session'] : 'mid';

    $stmt = db()->prepare('
        INSERT INTO user_settings (user_id, genre_bans, default_session)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
            genre_bans      = VALUES(genre_bans),
            default_session = VALUES(default_session)
    ');
    $stmt->execute([$user['id'], $genre_bans, $default_session]);

    json_out(['ok' => true]);
}

json_out(['error' => 'Method not allowed'], 405);
