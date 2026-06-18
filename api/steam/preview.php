<?php
// Non-destructive Steam account lookup — returns name + avatar without writing to DB.
// Used by the Settings confirm-before-link flow.
require_once dirname(__DIR__) . '/config.php';

$user = get_session_user();
if (!$user) json_out(['error' => 'Unauthenticated'], 401);

$input = trim($_GET['steam_id'] ?? '');
if (!$input) json_out(['error' => 'No Steam ID provided'], 400);

$steam_id = resolve_steam_id($input);
if (!$steam_id) {
    json_out(['error' => 'Could not find that Steam account. Check the ID or make sure your profile is public.'], 404);
}

$res    = json_decode(curl_get(steam_url('ISteamUser/GetPlayerSummaries/v2', ['steamids' => $steam_id])), true);
$player = $res['response']['players'][0] ?? null;
if (!$player) {
    json_out(['error' => 'Steam account found but profile is set to private.'], 404);
}

json_out([
    'steam_id'     => $steam_id,
    'steam_name'   => $player['personaname'],
    'steam_avatar' => $player['avatarfull'] ?? null,
]);
