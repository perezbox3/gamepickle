<?php
require_once __DIR__ . '/config.php';

$user = get_session_user();
if (!$user) json_out(['error' => 'Not authenticated'], 401);
if (!$user['steam_id']) json_out(['error' => 'no_steam', 'message' => 'Link your Steam account first.'], 400);

// ── COMPARE mode ── ?compare=STEAM_ID ────────────────────────────────────────
if (!empty($_GET['compare'])) {
    $friend_id = trim($_GET['compare']);
    if (!preg_match('/^76561\d{12}$/', $friend_id)) {
        json_out(['error' => 'invalid_id', 'message' => 'Invalid Steam ID. Please use a 17-digit SteamID64.'], 400);
    }

    // User's library from DB
    $stmt = db()->prepare(
        'SELECT app_id, name, playtime_mins, genre, metacritic FROM steam_games WHERE user_id = ?'
    );
    $stmt->execute([$user['id']]);
    $user_games = [];
    foreach ($stmt->fetchAll() as $g) {
        $user_games[(int) $g['app_id']] = $g;
    }

    // Friend's library from Steam API
    $friend_curl = curl_get(steam_url('IPlayerService/GetOwnedGames/v1', [
        'steamid'                   => $friend_id,
        'include_appinfo'           => 1,
        'include_played_free_games' => 1,
    ]));
    if ($friend_curl === false) {
        json_out(['error' => 'steam_down', 'message' => 'Steam API is unavailable. Please try again in a moment.'], 502);
    }

    $friend_raw = json_decode($friend_curl, true)['response']['games'] ?? null;

    if ($friend_raw === null) {
        json_out(['error' => 'private', 'message' => "This friend's library is private — they need to set it to Public in Steam privacy settings."]);
    }
    if (empty($friend_raw)) {
        json_out(['error' => 'empty', 'message' => "This friend doesn't appear to own any games."]);
    }

    $friend_map = [];
    foreach ($friend_raw as $g) {
        $friend_map[(int) $g['appid']] = $g;
    }

    // Intersect + build comparison rows
    $shared = [];
    foreach (array_intersect(array_keys($user_games), array_keys($friend_map)) as $app_id) {
        $ug     = $user_games[$app_id];
        $fg     = $friend_map[$app_id];
        $u_mins = (int) $ug['playtime_mins'];
        $f_mins = (int) ($fg['playtime_forever'] ?? 0);
        $shared[] = [
            'app_id'       => $app_id,
            'name'         => $ug['name'],
            'genre'        => $ug['genre'],
            'metacritic'   => $ug['metacritic'] ? (int) $ug['metacritic'] : null,
            'cover_url'    => 'https://cdn.akamai.steamstatic.com/steam/apps/' . $app_id . '/header.jpg',
            'user_hours'   => round($u_mins / 60, 1),
            'friend_hours' => round($f_mins / 60, 1),
        ];
    }

    // Sort: highest combined playtime first (most contested games at the top)
    usort($shared, fn($a, $b) =>
        ($b['user_hours'] + $b['friend_hours']) <=> ($a['user_hours'] + $a['friend_hours'])
    );

    $u_total = round(array_sum(array_column($shared, 'user_hours')), 1);
    $f_total = round(array_sum(array_column($shared, 'friend_hours')), 1);
    // A game is a "user win" if user has played at least 1 min more
    $u_wins  = count(array_filter($shared, fn($g) => $g['user_hours'] > $g['friend_hours']));
    $f_wins  = count(array_filter($shared, fn($g) => $g['friend_hours'] > $g['user_hours']));
    $ties    = count($shared) - $u_wins - $f_wins;

    json_out([
        'shared_count'   => count($shared),
        'user_total'     => $u_total,
        'friend_total'   => $f_total,
        'user_wins'      => $u_wins,
        'friend_wins'    => $f_wins,
        'ties'           => $ties,
        'overall_winner' => $u_total > $f_total ? 'user' : ($f_total > $u_total ? 'friend' : 'tie'),
        'games'          => $shared,
    ]);
}

// ── LIST mode ── no params ────────────────────────────────────────────────────
set_time_limit(30);

$friends_raw = curl_get(steam_url('ISteamUser/GetFriendList/v1', [
    'steamid'      => $user['steam_id'],
    'relationship' => 'friend',
]));

if ($friends_raw === false) {
    json_out(['error' => 'steam_down', 'message' => 'Steam API is unavailable. Please try again in a moment.'], 502);
}

$friends = json_decode($friends_raw, true)['friendslist']['friends'] ?? null;

if ($friends === null) {
    // Null means the API rejected it — friend list is private
    json_out([
        'error'   => 'private',
        'message' => 'Your Steam friend list is private. Set it to Public in Steam → Edit Profile → Privacy Settings.',
    ]);
}
if (empty($friends)) {
    json_out(['friends' => [], 'total' => 0]);
}

// Batch-fetch profiles in chunks of 100 (Steam API limit)
$steam_ids = array_column($friends, 'steamid');
$since_map = array_column($friends, 'friend_since', 'steamid');
$profiles  = [];

foreach (array_chunk($steam_ids, 100) as $chunk) {
    $pres = json_decode(curl_get(steam_url('ISteamUser/GetPlayerSummaries/v2', [
        'steamids' => implode(',', $chunk),
    ])), true);
    foreach ($pres['response']['players'] ?? [] as $p) {
        $profiles[$p['steamid']] = $p;
    }
}

$result = [];
foreach ($steam_ids as $sid) {
    $p = $profiles[$sid] ?? null;
    if (!$p) continue;
    $result[] = [
        'steam_id'    => $sid,
        'name'        => $p['personaname'],
        'avatar'      => $p['avatarfull'] ?? $p['avatar'] ?? null,
        'profile_url' => $p['profileurl'] ?? null,
        'online'      => (int) ($p['personastate'] ?? 0) > 0,
        'since'       => (int) ($since_map[$sid] ?? 0),
    ];
}

// Online friends first, then alphabetical
usort($result, fn($a, $b) =>
    (int) $b['online'] <=> (int) $a['online'] ?: strcasecmp($a['name'], $b['name'])
);

json_out(['friends' => $result, 'total' => count($result)]);
