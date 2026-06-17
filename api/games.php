<?php
require_once __DIR__ . '/config.php';

$user = get_session_user();
if (!$user) json_out(['error' => 'Unauthenticated'], 401);

$stmt = db()->prepare(
    'SELECT app_id, name, playtime_mins, playtime_2weeks
     FROM steam_games
     WHERE user_id = ?
     ORDER BY playtime_mins DESC'
);
$stmt->execute([$user['id']]);

$games = array_map(fn($g) => [
    'id'        => (string) $g['app_id'],
    'app_id'    => (int)    $g['app_id'],
    'name'      => $g['name'],
    'hours'     => round($g['playtime_mins'] / 60, 1),
    'cover_url' => 'https://cdn.akamai.steamstatic.com/steam/apps/' . $g['app_id'] . '/header.jpg',
    'recent'    => (int) $g['playtime_2weeks'] > 0,
    'genre'     => null,   // populated in Phase 3
    'installed' => false,  // unknown from Web API; Phase 3
], $stmt->fetchAll());

json_out($games);
