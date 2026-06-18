<?php
require_once dirname(__DIR__) . '/config.php';

set_time_limit(180);

$user = get_session_user();
if (!$user) json_out(['error' => 'Unauthenticated'], 401);

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
    $url  = 'https://store.steampowered.com/api/appdetails?appids=' . $g['app_id'] . '&filters=basic,genres,metacritic,categories';
    $resp = json_decode(curl_get($url), true);
    $data = $resp[(string) $g['app_id']]['data'] ?? null;

    if ($data) {
        $genre       = $data['genres'][0]['description'] ?? null;
        $metacritic  = $data['metacritic']['score'] ?? null;
        // Category 1 = Multi-player, 9 = Co-op, 27 = Cross-Platform Multiplayer
        $cats        = array_column($data['categories'] ?? [], 'id');
        $multiplayer = (int) (array_intersect([1, 9, 27], $cats) !== []);
        $app_type    = $data['type'] ?? 'game'; // game | dlc | application | tool | demo | music
        $upd->execute([$genre, $metacritic, $multiplayer, $app_type, $g['id']]);
        $enriched++;
    } else {
        $skip->execute([$g['id']]);
    }

    usleep(800000); // 800ms between requests to stay within Steam rate limits
}

json_out(['ok' => true, 'enriched' => $enriched]);
