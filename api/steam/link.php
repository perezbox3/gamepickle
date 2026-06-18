<?php
require_once dirname(__DIR__) . '/config.php';

$user = get_session_user();
if (!$user) json_out(['error' => 'Unauthenticated'], 401);

$input = trim($_POST['steam_id'] ?? '');
if (!$input) json_out(['error' => 'Please enter a Steam ID or username.'], 400);

$steamId = resolve_steam_id($input);
if (!$steamId) {
    json_out(['error' => 'Could not find that Steam account. Try your 17-digit Steam ID, username, or profile URL.'], 400);
}

// Fetch public profile to confirm account exists and get display name/avatar
$profile = json_decode(curl_get(steam_url('ISteamUser/GetPlayerSummaries/v2', ['steamids' => $steamId])), true);
$player  = $profile['response']['players'][0] ?? null;

if (!$player) {
    json_out(['error' => 'Steam account not found or profile is set to private.'], 400);
}

// Save new Steam account to user record first, then remove old game data.
// Order matters: if the UPDATE succeeds but the DELETE fails (or vice-versa),
// rolling back keeps the user in a consistent state rather than losing their library.
$db = db();
$db->beginTransaction();
try {
    $db->prepare(
        'UPDATE users SET steam_id=?, steam_name=?, steam_avatar=? WHERE id=?'
    )->execute([$steamId, $player['personaname'], $player['avatarfull'] ?? null, $user['id']]);
    $db->prepare('DELETE FROM steam_games WHERE user_id = ?')->execute([$user['id']]);
    $db->commit();
} catch (\Throwable $e) {
    $db->rollBack();
    json_out(['error' => 'Could not link Steam account. Please try again.'], 500);
}

json_out([
    'ok'     => true,
    'steam_id'     => $steamId,
    'steam_name'   => $player['personaname'],
    'steam_avatar' => $player['avatarfull'] ?? null,
]);
