<?php
require_once __DIR__ . '/config.php';

$app_id = (int) ($_GET['app_id'] ?? 0);
if (!$app_id) json_out(['error' => 'Missing app_id'], 400);

// Fetch extended store data from Steam Store API (public, no key needed)
$url  = 'https://store.steampowered.com/api/appdetails?appids=' . $app_id . '&l=en&filters=basic,genres,categories,metacritic,developers,publishers,release_date,short_description,screenshots';
$resp = json_decode(curl_get($url), true);
$data = $resp[(string) $app_id]['data'] ?? null;

if (!$data) {
    json_out(['error' => 'Game not found or store page unavailable.'], 404);
}

$genres      = array_column($data['genres']     ?? [], 'description');
$categories  = array_column($data['categories'] ?? [], 'description');
$developers  = $data['developers'] ?? [];
$publishers  = $data['publishers'] ?? [];
$release     = $data['release_date']['date'] ?? null;
$description = strip_tags($data['short_description'] ?? '');
$metacritic  = $data['metacritic']['score'] ?? null;
$screenshots = array_map(
    fn($s) => $s['path_thumbnail'],
    array_slice($data['screenshots'] ?? [], 0, 4)
);

json_out([
    'app_id'      => $app_id,
    'name'        => $data['name'],
    'cover_url'   => 'https://cdn.akamai.steamstatic.com/steam/apps/' . $app_id . '/header.jpg',
    'description' => $description,
    'genres'      => $genres,
    'categories'  => $categories,
    'developers'  => $developers,
    'publishers'  => $publishers,
    'release_date'=> $release,
    'metacritic'  => $metacritic ? (int) $metacritic : null,
    'screenshots' => $screenshots,
    'steam_url'   => 'https://store.steampowered.com/app/' . $app_id,
]);
