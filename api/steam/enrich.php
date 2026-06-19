<?php
require_once dirname(__DIR__) . '/config.php';

set_time_limit(180);

$user = get_session_user();
if (!$user) json_out(['error' => 'Unauthenticated'], 401);

// Rate limit: 10 minutes between enrichment runs (each run can take up to 3 minutes)
$tsRow = db()->prepare('SELECT last_enrich_at FROM users WHERE id = ?');
$tsRow->execute([$user['id']]);
$lastEnrich = $tsRow->fetchColumn();
if ($lastEnrich && (time() - strtotime($lastEnrich)) < 600) {
    $wait = 600 - (time() - strtotime($lastEnrich));
    json_out(['error' => "Please wait {$wait} seconds before enriching again."], 429);
}

// Mark start time before the long operation so concurrent requests are also blocked
db()->prepare('UPDATE users SET last_enrich_at = NOW() WHERE id = ?')->execute([$user['id']]);

// Fetch top 50 un-enriched games by playtime
$stmt = db()->prepare(
    'SELECT id, app_id FROM steam_games
     WHERE user_id = ? AND store_fetched = 0
     ORDER BY playtime_mins DESC LIMIT 50'
);
$stmt->execute([$user['id']]);
$games = $stmt->fetchAll();

if (empty($games)) {
    json_out(['ok' => true, 'enriched' => 0]);
}

$upd = db()->prepare(
    'UPDATE steam_games SET genre=?, metacritic=?, is_multiplayer=?, app_type=?, store_fetched=1 WHERE id=?'
);
$skip = db()->prepare('UPDATE steam_games SET store_fetched=1 WHERE id=?');

$enriched = 0;
foreach ($games as $g) {
    $url = 'https://store.steampowered.com/api/appdetails?appids=' . $g['app_id'] . '&filters=basic,genres,metacritic,categories';
    $raw = curl_get($url);

    // curl_get returns false on network error / HTTP 5xx — do not mark as fetched so we retry next time
    if ($raw === false) {
        usleep(800000);
        continue;
    }

    $resp = json_decode($raw, true);
    $item = $resp[(string) $g['app_id']] ?? null;
    $data = $item['data'] ?? null;

    if ($data) {
        $genre       = $data['genres'][0]['description'] ?? null;
        $metacritic  = $data['metacritic']['score'] ?? null;
        // Category 1 = Multi-player, 9 = Co-op, 27 = Cross-Platform Multiplayer
        $cats        = array_column($data['categories'] ?? [], 'id');
        $multiplayer = (int) (array_intersect([1, 9, 27], $cats) !== []);
        $app_type    = $data['type'] ?? 'game'; // game | dlc | application | tool | demo | music
        $upd->execute([$genre, $metacritic, $multiplayer, $app_type, $g['id']]);
        $enriched++;
    } elseif (isset($item['success']) && $item['success'] === false) {
        // Steam confirmed this app has no store page — safe to mark as permanently fetched
        $skip->execute([$g['id']]);
    }
    // If neither: unexpected response shape — leave store_fetched=0 and retry next time

    usleep(800000); // 800ms between requests to stay within Steam rate limits
}

json_out(['ok' => true, 'enriched' => $enriched]);
