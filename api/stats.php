<?php
require_once __DIR__ . '/config.php';

$user = get_session_user();
if (!$user) json_out(['error' => 'Not authenticated'], 401);

$db = db();

// Library overview
$stmt = $db->prepare(
    'SELECT COUNT(*) as total,
            SUM(playtime_mins) as total_mins,
            COUNT(CASE WHEN playtime_mins > 0 THEN 1 END) as played,
            COUNT(CASE WHEN playtime_2weeks > 0 THEN 1 END) as recent_count,
            SUM(playtime_2weeks) as recent_mins
     FROM steam_games WHERE user_id = ?'
);
$stmt->execute([$user['id']]);
$overview = $stmt->fetch();

// Multiplayer hours
$stmt = $db->prepare('SELECT SUM(playtime_mins) as mins FROM steam_games WHERE user_id=? AND is_multiplayer=1');
$stmt->execute([$user['id']]);
$multi_row = $stmt->fetch();

// Genre breakdown (hours + count per genre)
$stmt = $db->prepare(
    'SELECT genre, COUNT(*) as count, SUM(playtime_mins) as mins
     FROM steam_games WHERE user_id=? AND genre IS NOT NULL
     GROUP BY genre ORDER BY mins DESC LIMIT 12'
);
$stmt->execute([$user['id']]);
$genres = $stmt->fetchAll();

// Top 10 most played
$stmt = $db->prepare(
    'SELECT app_id, name, playtime_mins, playtime_2weeks, genre, metacritic
     FROM steam_games WHERE user_id=? AND playtime_mins > 0
     ORDER BY playtime_mins DESC LIMIT 10'
);
$stmt->execute([$user['id']]);
$top_games = $stmt->fetchAll();

// Biggest unplayed games (by metacritic — highest rated you haven't touched)
$stmt = $db->prepare(
    'SELECT app_id, name, metacritic, genre
     FROM steam_games WHERE user_id=? AND playtime_mins=0 AND metacritic IS NOT NULL
     ORDER BY metacritic DESC LIMIT 5'
);
$stmt->execute([$user['id']]);
$shame_list = $stmt->fetchAll();

// Playtime tier buckets
$stmt = $db->prepare(
    "SELECT
       SUM(playtime_mins = 0)                                         AS never,
       SUM(playtime_mins > 0   AND playtime_mins <  300)             AS dabbled,
       SUM(playtime_mins >= 300  AND playtime_mins < 1200)           AS played,
       SUM(playtime_mins >= 1200 AND playtime_mins < 6000)           AS into_it,
       SUM(playtime_mins >= 6000)                                     AS obsessed
     FROM steam_games WHERE user_id = ?"
);
$stmt->execute([$user['id']]);
$tiers = $stmt->fetch();

// Metacritic vs hours scatter (games with both values, limit 80 for chart perf)
$stmt = $db->prepare(
    'SELECT name, app_id, metacritic, playtime_mins, genre
     FROM steam_games
     WHERE user_id=? AND metacritic IS NOT NULL AND playtime_mins > 0
     ORDER BY playtime_mins DESC LIMIT 80'
);
$stmt->execute([$user['id']]);
$scatter_raw = $stmt->fetchAll();

// Steam profile for account card
$steam_profile = null;
if ($user['steam_id']) {
    $res    = json_decode(curl_get(steam_url('ISteamUser/GetPlayerSummaries/v2', ['steamids' => $user['steam_id']])), true);
    $player = $res['response']['players'][0] ?? null;
    if ($player) {
        $steam_profile = [
            'name'        => $player['personaname'],
            'avatar'      => $player['avatarfull'],
            'profile_url' => $player['profileurl'],
            'created'     => $player['timecreated'] ?? null,
            'country'     => $player['loccountrycode'] ?? null,
        ];
    }
}

$total        = (int)  ($overview['total']       ?? 0);
$played       = (int)  ($overview['played']       ?? 0);
$total_mins   = (int)  ($overview['total_mins']   ?? 0);
$recent_mins  = (int)  ($overview['recent_mins']  ?? 0);
$multi_mins   = (int)  ($multi_row['mins']        ?? 0);
$total_hours  = round($total_mins  / 60, 1);
$recent_hours = round($recent_mins / 60, 1);
$multi_hours  = round($multi_mins  / 60, 1);
$multi_pct    = $total_hours > 0 ? round($multi_hours / $total_hours * 100) : 0;

json_out([
    'total_games'  => $total,
    'played_games' => $played,
    'unplayed'     => $total - $played,
    'total_hours'  => $total_hours,
    'recent_games' => (int) ($overview['recent_count'] ?? 0),
    'recent_hours' => $recent_hours,
    'avg_hours'    => $played > 0 ? round($total_hours / $played, 1) : 0,
    'multi_pct'    => $multi_pct,
    'genres'       => array_map(fn($g) => [
        'genre' => $g['genre'],
        'count' => (int) $g['count'],
        'hours' => round($g['mins'] / 60, 1),
    ], $genres),
    'top_games'   => array_map(fn($g) => [
        'app_id'    => (int) $g['app_id'],
        'name'      => $g['name'],
        'hours'     => round($g['playtime_mins'] / 60, 1),
        'hours_2w'  => round($g['playtime_2weeks'] / 60, 1),
        'genre'     => $g['genre'],
        'metacritic'=> $g['metacritic'] ? (int) $g['metacritic'] : null,
        'cover_url' => 'https://cdn.akamai.steamstatic.com/steam/apps/' . $g['app_id'] . '/header.jpg',
    ], $top_games),
    'shame_list'   => array_map(fn($g) => [
        'app_id'    => (int) $g['app_id'],
        'name'      => $g['name'],
        'metacritic'=> (int) $g['metacritic'],
        'genre'     => $g['genre'],
        'cover_url' => 'https://cdn.akamai.steamstatic.com/steam/apps/' . $g['app_id'] . '/header.jpg',
    ], $shame_list),
    'steam_profile'=> $steam_profile,
    'tiers'        => [
        ['label' => 'Never played',  'emoji' => '📦', 'count' => (int)$tiers['never']],
        ['label' => 'Dabbled',       'emoji' => '👀', 'count' => (int)$tiers['dabbled']],
        ['label' => 'Played it',     'emoji' => '🎮', 'count' => (int)$tiers['played']],
        ['label' => 'Into it',       'emoji' => '🔥', 'count' => (int)$tiers['into_it']],
        ['label' => 'Obsessed',      'emoji' => '💀', 'count' => (int)$tiers['obsessed']],
    ],
    'scatter'      => array_map(fn($g) => [
        'name'      => $g['name'],
        'app_id'    => (int)$g['app_id'],
        'score'     => (int)$g['metacritic'],
        'hours'     => round($g['playtime_mins'] / 60, 1),
        'genre'     => $g['genre'],
    ], $scatter_raw),
]);
