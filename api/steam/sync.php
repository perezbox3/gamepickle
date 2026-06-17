<?php
require_once dirname(__DIR__) . '/config.php';

$user = get_session_user();
if (!$user) json_out(['error' => 'Unauthenticated'], 401);

// Fetch fresh steam_id from DB (get_session_user may have been cached before linking)
$row = db()->prepare('SELECT steam_id FROM users WHERE id=?');
$row->execute([$user['id']]);
$steamId = $row->fetchColumn();

if (!$steamId) json_out(['error' => 'No Steam account linked. Link one first in Settings.'], 400);

// Fetch full game list from Steam
$res = json_decode(curl_get(steam_url('IPlayerService/GetOwnedGames/v1', [
    'steamid'                  => $steamId,
    'include_appinfo'          => 1,
    'include_played_free_games'=> 1,
])), true);

$games = $res['response']['games'] ?? [];

if (empty($games)) {
    json_out(['error' => 'No games found. Your Steam profile or game details may be set to private.'], 400);
}

// Upsert into steam_games — INSERT ... ON DUPLICATE KEY UPDATE so re-syncs update playtime
$stmt = db()->prepare(
    'INSERT INTO steam_games (user_id, app_id, name, playtime_mins, playtime_2weeks, img_icon_url)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       name=VALUES(name),
       playtime_mins=VALUES(playtime_mins),
       playtime_2weeks=VALUES(playtime_2weeks),
       img_icon_url=VALUES(img_icon_url)'
);

$db = db();
$db->beginTransaction();
foreach ($games as $g) {
    $stmt->execute([
        $user['id'],
        $g['appid'],
        $g['name'],
        $g['playtime_forever'] ?? 0,
        $g['playtime_2weeks']  ?? 0,
        $g['img_icon_url']     ?? null,
    ]);
}
$db->commit();

json_out(['ok' => true, 'synced' => count($games)]);
