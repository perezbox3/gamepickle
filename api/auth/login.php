<?php
require_once dirname(__DIR__) . '/config.php';

// PHP native session just to carry the state token across the Google redirect
session_set_cookie_params(['secure' => true, 'httponly' => true, 'samesite' => 'Lax', 'path' => '/']);
session_start();
$state = bin2hex(random_bytes(16));
$_SESSION['oauth_state'] = $state;

$params = http_build_query([
    'client_id'     => GOOGLE_CLIENT_ID,
    'redirect_uri'  => APP_URL . '/api/auth/callback.php',
    'response_type' => 'code',
    'scope'         => 'openid email profile',
    'state'         => $state,
    'access_type'   => 'online',
]);

header('Location: https://accounts.google.com/o/oauth2/v2/auth?' . $params);
exit;
