<?php
require_once __DIR__ . '/config.php';

$user = get_session_user();

if (!$user) {
    // Anonymous mode — accept steam_id query param, fetch live from Steam, no DB
    $steam_id = trim($_GET['steam_id'] ?? '');
    if (!$steam_id) json_out(['error' => 'Not authenticated'], 401);

    $steam_id = resolve_steam_id($steam_id);
    if (!$steam_id) {
        json_out(['error' => 'Could not find that Steam account. Check the ID or make sure your profile is public.'], 404);
    }

    $url  = steam_url('IPlayerService/GetOwnedGames/v1', [
        'steamid'                => $steam_id,
        'include_appinfo'        => 1,
        'include_played_free_games' => 1,
    ]);
    $data = json_decode(curl_get($url), true);
    $raw  = $data['response']['games'] ?? [];

    $games = array_map(fn($g) => [
        'id'           => (string) $g['appid'],
        'app_id'       => (int)    $g['appid'],
        'name'         => $g['name'],
        'hours'        => round(($g['playtime_forever'] ?? 0) / 60, 1),
        'cover_url'    => 'https://cdn.akamai.steamstatic.com/steam/apps/' . $g['appid'] . '/header.jpg',
        'genre'        => null,
        'metacritic'   => null,
        'is_multiplayer' => false,
        'recent'       => ($g['playtime_2weeks'] ?? 0) > 0,
        'installed'    => false,
    ], $raw);

    usort($games, fn($a, $b) => $b['hours'] <=> $a['hours']);
    json_out($games);
}

// Authenticated mode — serve from DB with enriched genre data
$stmt = db()->prepare(
    'SELECT app_id, name, playtime_mins, playtime_2weeks, genre, metacritic, is_multiplayer
     FROM steam_games WHERE user_id = ? ORDER BY playtime_mins DESC'
);
$stmt->execute([$user['id']]);

$games = array_map(fn($g) => [
    'id'           => (string) $g['app_id'],
    'app_id'       => (int)    $g['app_id'],
    'name'         => $g['name'],
    'hours'        => round($g['playtime_mins'] / 60, 1),
    'cover_url'    => 'https://cdn.akamai.steamstatic.com/steam/apps/' . $g['app_id'] . '/header.jpg',
    'genre'        => $g['genre'],
    'metacritic'   => $g['metacritic'] ? (int) $g['metacritic'] : null,
    'is_multiplayer' => (bool) $g['is_multiplayer'],
    'recent'       => (int) $g['playtime_2weeks'] > 0,
    'installed'    => false,
], $stmt->fetchAll());

json_out($games);
