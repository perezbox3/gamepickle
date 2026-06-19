<?php
require_once __DIR__ . '/config.php';

// All requests require a valid session — prevents anonymous abuse of our Steam API key.
$user = get_session_user();
if (!$user) json_out(['error' => 'Not authenticated'], 401);

$param_steam_id = trim($_GET['steam_id'] ?? '');

// If a specific steam_id is requested, proxy it from Steam API for the authenticated user.
if ($param_steam_id) {
    $steam_id = resolve_steam_id($param_steam_id);
    if (!$steam_id) {
        json_out(['error' => 'Could not find that Steam account. Check the ID or make sure your profile is public.'], 404);
    }

    // Fetch profile for display name + avatar
    $profile_raw = curl_get(steam_url('ISteamUser/GetPlayerSummaries/v2', ['steamids' => $steam_id]));
    $player      = $profile_raw !== false
        ? (json_decode($profile_raw, true)['response']['players'][0] ?? null)
        : null;

    // Fetch owned games
    $games_raw = curl_get(steam_url('IPlayerService/GetOwnedGames/v1', [
        'steamid'                   => $steam_id,
        'include_appinfo'           => 1,
        'include_played_free_games' => 1,
    ]));
    if ($games_raw === false) {
        json_out(['error' => 'Steam API is unavailable. Please try again in a moment.'], 502);
    }
    $raw = json_decode($games_raw, true)['response']['games'] ?? [];

    $games = array_map(fn($g) => [
        'id'             => (string) $g['appid'],
        'app_id'         => (int)    $g['appid'],
        'name'           => $g['name'],
        'hours'          => round(($g['playtime_forever'] ?? 0) / 60, 1),
        'cover_url'      => 'https://cdn.akamai.steamstatic.com/steam/apps/' . $g['appid'] . '/header.jpg',
        'genre'          => null,
        'metacritic'     => null,
        'is_multiplayer' => false,
        'recent'         => ($g['playtime_2weeks'] ?? 0) > 0,
        'installed'      => false,
    ], $raw);

    usort($games, fn($a, $b) => $b['hours'] <=> $a['hours']);

    json_out([
        'profile' => [
            'steam_id' => $steam_id,
            'name'     => $player['personaname'] ?? $steam_id,
            'avatar'   => $player['avatarfull']  ?? null,
        ],
        'games' => $games,
    ]);
}

// No steam_id param — serve own library from DB
$stmt = db()->prepare(
    'SELECT app_id, name, playtime_mins, playtime_2weeks, genre, metacritic, is_multiplayer
     FROM steam_games
     WHERE user_id = ? AND (app_type IS NULL OR app_type = \'game\')
     ORDER BY playtime_mins DESC'
);
$stmt->execute([$user['id']]);

$games = array_map(fn($g) => [
    'id'             => (string) $g['app_id'],
    'app_id'         => (int)    $g['app_id'],
    'name'           => $g['name'],
    'hours'          => round($g['playtime_mins'] / 60, 1),
    'cover_url'      => 'https://cdn.akamai.steamstatic.com/steam/apps/' . $g['app_id'] . '/header.jpg',
    'genre'          => $g['genre'],
    'metacritic'     => $g['metacritic'] ? (int) $g['metacritic'] : null,
    'is_multiplayer' => (bool) $g['is_multiplayer'],
    'recent'         => (int) $g['playtime_2weeks'] > 0,
    'installed'      => false,
], $stmt->fetchAll());

json_out($games);
