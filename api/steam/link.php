<?php
require_once dirname(__DIR__) . '/config.php';

$user = get_session_user();
if (!$user) json_out(['error' => 'Unauthenticated'], 401);

$input = trim($_POST['steam_id'] ?? '');
if (!$input) json_out(['error' => 'Please enter a Steam ID or username.'], 400);

// Resolve to SteamID64 — accept the 17-digit ID directly, a vanity username,
// or a full steamcommunity.com profile URL
if (preg_match('/^76561\d{12}$/', $input)) {
    $steamId = $input;
} else {
    // Strip full URL to just the vanity part
    $vanity = preg_replace('|https?://steamcommunity\.com/id/([^/?#]+).*|', '$1', $input);
    $vanity = trim($vanity, '/');

    $res = json_decode(curl_get(steam_url('ISteamUser/ResolveVanityURL/v1', ['vanityurl' => $vanity])), true);
    if (($res['response']['success'] ?? 0) !== 1) {
        json_out(['error' => 'Could not find that Steam account. Paste your 17-digit Steam ID (find it at steamid.io).'], 400);
    }
    $steamId = $res['response']['steamid'];
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
