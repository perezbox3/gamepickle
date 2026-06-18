<?php
// Load .env from project root (one level above api/)
$_envFile = dirname(__DIR__) . '/.env';
if (file_exists($_envFile)) {
    foreach (file($_envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $_line) {
        if ($_line[0] === '#' || !str_contains($_line, '=')) continue;
        [$_k, $_v] = explode('=', $_line, 2);
        putenv(trim($_k) . '=' . trim($_v));
    }
}
unset($_envFile, $_line, $_k, $_v);

define('DB_DSN',                'mysql:host=' . (getenv('DB_HOST') ?: 'localhost') . ';dbname=' . (getenv('DB_NAME') ?: 'gamepickle') . ';charset=utf8mb4');
define('DB_USER',               getenv('DB_USER') ?: '');
define('DB_PASS',               getenv('DB_PASS') ?: '');
define('GOOGLE_CLIENT_ID',      getenv('GOOGLE_CLIENT_ID') ?: '');
define('GOOGLE_CLIENT_SECRET',  getenv('GOOGLE_CLIENT_SECRET') ?: '');
define('APP_URL',               rtrim(getenv('APP_URL') ?: 'https://gamepickle.perezbox3.com', '/'));
define('STEAM_API_KEY',         getenv('STEAM_API_KEY') ?: '');
define('SESSION_LIFETIME',      30 * 24 * 60 * 60); // 30 days

function db(): PDO {
    static $pdo;
    return $pdo ??= new PDO(DB_DSN, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
}

function json_out(mixed $data, int $code = 200): never {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// Returns user row from DB if session cookie is valid, or null.
function get_session_user(): ?array {
    $sid = $_COOKIE['gp_sid'] ?? '';
    if (strlen($sid) !== 64) return null;
    $stmt = db()->prepare(
        'SELECT u.id, u.email, u.name, u.avatar, u.steam_id, u.steam_name, u.steam_avatar
         FROM sessions s
         JOIN users u ON u.id = s.user_id
         WHERE s.id = ? AND s.expires_at > NOW()'
    );
    $stmt->execute([$sid]);
    return $stmt->fetch() ?: null;
}

function set_session_cookie(string $sid): void {
    setcookie('gp_sid', $sid, [
        'expires'  => time() + SESSION_LIFETIME,
        'path'     => '/',
        'secure'   => true,
        'httponly' => true,
        'samesite' => 'Lax', // Lax required — Strict breaks OAuth redirects
    ]);
}

// Minimal HTTP helpers (no Composer dependency needed)
function http_post(string $url, array $data): string {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST             => true,
        CURLOPT_POSTFIELDS       => http_build_query($data),
        CURLOPT_RETURNTRANSFER   => true,
        CURLOPT_HTTPHEADER       => ['Content-Type: application/x-www-form-urlencoded'],
        CURLOPT_TIMEOUT          => 10,
        CURLOPT_CONNECTTIMEOUT   => 5,
    ]);
    $res = curl_exec($ch);
    curl_close($ch);
    return (string) $res;
}

function http_get(string $url, string $bearer): string {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER   => true,
        CURLOPT_HTTPHEADER       => ['Authorization: Bearer ' . $bearer],
        CURLOPT_TIMEOUT          => 10,
        CURLOPT_CONNECTTIMEOUT   => 5,
    ]);
    $res = curl_exec($ch);
    curl_close($ch);
    return (string) $res;
}

// Plain GET with no auth header — used for Steam/SteamSpy APIs (key is in query params).
// Returns false on network error or HTTP 5xx so callers can distinguish "down" from "no data".
function curl_get(string $url): string|false {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 10,
        CURLOPT_CONNECTTIMEOUT => 5,
    ]);
    $res  = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($res === false || $code >= 500) return false;
    return $res;
}

// Build a Steam API URL with the key baked in
function steam_url(string $endpoint, array $params = []): string {
    $params['key'] = STEAM_API_KEY;
    $params['format'] = 'json';
    return 'https://api.steampowered.com/' . $endpoint . '?' . http_build_query($params);
}

// Resolve any Steam input to a SteamID64 string, or return null on failure.
// Accepts: 17-digit SteamID64, steamcommunity.com/profiles/ID, steamcommunity.com/id/vanity, plain vanity name.
function resolve_steam_id(string $input): ?string {
    $input = trim($input);

    // Direct SteamID64
    if (preg_match('/^76561\d{12}$/', $input)) return $input;

    // steamcommunity.com/profiles/76561... — ID is in the URL itself
    if (preg_match('|steamcommunity\.com/profiles/(\d{17})|', $input, $m)) return $m[1];

    // steamcommunity.com/id/vanityname — need API lookup
    if (preg_match('|steamcommunity\.com/id/([^/?#]+)|', $input, $m)) {
        $vanity = $m[1];
    } else {
        // Treat plain text as a vanity name
        $vanity = rtrim($input, '/');
    }

    $res = json_decode(curl_get(steam_url('ISteamUser/ResolveVanityURL/v1', ['vanityurl' => $vanity])), true);
    return ($res['response']['success'] ?? 0) === 1 ? $res['response']['steamid'] : null;
}
