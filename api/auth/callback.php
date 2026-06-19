<?php
require_once dirname(__DIR__) . '/config.php';

session_set_cookie_params(['secure' => true, 'httponly' => true, 'samesite' => 'Lax', 'path' => '/']);
session_start();

// Check for Google error response first — state may be absent on denied consent (RFC 6749 §4.1.2.1)
if (isset($_GET['error'])) {
    unset($_SESSION['oauth_state']);
    header('Location: ' . APP_URL . '/?error=access_denied');
    exit;
}

// CSRF: verify state matches what we stored in login.php
$expectedState = $_SESSION['oauth_state'] ?? '';
unset($_SESSION['oauth_state']);

if (empty($_GET['state']) || !hash_equals($expectedState, $_GET['state'])) {
    header('Location: ' . APP_URL . '/?error=invalid_state');
    exit;
}

$code = $_GET['code'] ?? '';
if (!$code) {
    header('Location: ' . APP_URL . '/?error=missing_code');
    exit;
}

// Exchange auth code for access token
$tokenRes = json_decode(http_post('https://oauth2.googleapis.com/token', [
    'code'          => $code,
    'client_id'     => GOOGLE_CLIENT_ID,
    'client_secret' => GOOGLE_CLIENT_SECRET,
    'redirect_uri'  => APP_URL . '/api/auth/callback.php',
    'grant_type'    => 'authorization_code',
]), true);

if (empty($tokenRes['access_token'])) {
    header('Location: ' . APP_URL . '/?error=token_failed');
    exit;
}

// Fetch user profile from Google
$profile = json_decode(http_get('https://www.googleapis.com/oauth2/v2/userinfo', $tokenRes['access_token']), true);

if (empty($profile['id'])) {
    header('Location: ' . APP_URL . '/?error=profile_failed');
    exit;
}

// Upsert user — update name/avatar on each login in case they changed
$db = db();
$db->prepare(
    'INSERT INTO users (google_id, email, name, avatar)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE email=VALUES(email), name=VALUES(name), avatar=VALUES(avatar)'
)->execute([$profile['id'], $profile['email'], $profile['name'] ?? null, $profile['picture'] ?? null]);

$userStmt = $db->prepare('SELECT id FROM users WHERE google_id = ?');
$userStmt->execute([$profile['id']]);
$userId = $userStmt->fetchColumn();

if (!$userId) {
    header('Location: ' . APP_URL . '/?error=login_failed');
    exit;
}

// Create session (64-char hex = 32 random bytes)
$sid = bin2hex(random_bytes(32));
$db->prepare(
    'INSERT INTO sessions (id, user_id, expires_at)
     VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))'
)->execute([$sid, $userId]);

set_session_cookie($sid);
header('Location: ' . APP_URL . '/library');
exit;
