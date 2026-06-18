<?php
require_once dirname(__DIR__) . '/config.php';

set_time_limit(30);

// Cache SteamSpy top-1000 list for 1 hour to avoid hammering their API
$cache_file = sys_get_temp_dir() . '/gp_steamspy_top1000.json';
$cache_ttl  = 3600;

if (!file_exists($cache_file) || (time() - filemtime($cache_file)) > $cache_ttl) {
    $raw = curl_get('https://steamspy.com/api.php?request=all&page=0');
    if ($raw && strlen($raw) > 1000) {
        file_put_contents($cache_file, $raw);
    }
}

if (!file_exists($cache_file)) {
    json_out(['error' => 'Could not reach SteamSpy. Try again in a moment.'], 502);
}

$spy_data = json_decode(file_get_contents($cache_file), true);
if (!$spy_data || count($spy_data) < 10) {
    json_out(['error' => 'SteamSpy data unavailable. Try again in a moment.'], 502);
}

// Get user's owned app_ids so we can exclude them (optional — works anon too)
$owned = [];
$user  = get_session_user();
if ($user) {
    $stmt = db()->prepare('SELECT app_id FROM steam_games WHERE user_id = ?');
    $stmt->execute([$user['id']]);
    $owned = array_column($stmt->fetchAll(PDO::FETCH_COLUMN, 0), null);
    $owned = array_map('intval', $owned);
}

// Filter pool:
// - exclude games the user owns
// - require a genre string (DLC / tools rarely have one)
// - require some average playtime (weeds out dead content)
$pool = array_values(array_filter($spy_data, fn($g) =>
    !empty($g['genre']) &&
    !in_array((int) $g['appid'], $owned, true) &&
    (int) ($g['average_forever'] ?? 0) > 30
));

if (empty($pool)) {
    json_out(['error' => 'No games available in the pool.'], 404);
}

// Pick a random game and verify it is actually a game via Steam Store API.
// Retry up to 4 times if we land on DLC / tools / soundtracks.
$pick_data = null;
$pick_app  = null;
$attempts  = 0;
$tried     = [];

while ($pick_data === null && $attempts < 4) {
    $attempts++;
    // Pick a random entry we haven't tried yet this request
    $available = array_filter($pool, fn($g) => !in_array((int) $g['appid'], $tried));
    if (empty($available)) break;
    $available = array_values($available);
    $entry     = $available[array_rand($available)];
    $app_id    = (int) $entry['appid'];
    $tried[]   = $app_id;

    $url  = 'https://store.steampowered.com/api/appdetails?appids=' . $app_id
          . '&l=en&filters=basic,genres,categories,metacritic,short_description,screenshots';
    $resp = json_decode(curl_get($url), true);
    $data = $resp[(string) $app_id]['data'] ?? null;

    if ($data && ($data['type'] ?? '') === 'game') {
        $pick_data = $data;
        $pick_app  = $app_id;
    }
}

if (!$pick_data) {
    json_out(['error' => 'Could not find a valid game to suggest. Roll again!'], 502);
}

$genres      = array_column($pick_data['genres'] ?? [], 'description');
$metacritic  = $pick_data['metacritic']['score'] ?? null;
$description = strip_tags($pick_data['short_description'] ?? '');
$screenshots = array_map(
    fn($s) => $s['path_thumbnail'],
    array_slice($pick_data['screenshots'] ?? [], 0, 2)
);

// Find the matching spy entry for owner/CCU context
$spy_entry = $spy_data[(string) $pick_app] ?? [];

json_out([
    'app_id'      => $pick_app,
    'name'        => $pick_data['name'],
    'cover_url'   => 'https://cdn.akamai.steamstatic.com/steam/apps/' . $pick_app . '/header.jpg',
    'description' => $description,
    'genres'      => $genres,
    'metacritic'  => $metacritic ? (int) $metacritic : null,
    'screenshots' => $screenshots,
    'steam_url'   => 'https://store.steampowered.com/app/' . $pick_app,
    'owners'      => $spy_entry['owners'] ?? null,
    'ccu'         => (int) ($spy_entry['ccu'] ?? 0),
]);
