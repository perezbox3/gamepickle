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

// Clear any existing game data for this user so old and new libraries don't mix
db()->prepare('DELETE FROM steam_games WHERE user_id = ?')->execute([$user['id']]);

// Save new Steam account to user record
db()->prepare(
    'UPDATE users SET steam_id=?, steam_name=?, steam_avatar=? WHERE id=?'
)->execute([$steamId, $player['personaname'], $player['avatarfull'] ?? null, $user['id']]);

json_out([
    'ok'     => true,
    'steam_id'     => $steamId,
    'steam_name'   => $player['personaname'],
    'steam_avatar' => $player['avatarfull'] ?? null,
]);
