<?php
require_once dirname(__DIR__) . '/config.php';

$user = get_session_user();
if (!$user) json_out(['error' => 'Unauthenticated'], 401);

$db = db();
$db->prepare('DELETE FROM steam_games WHERE user_id=?')->execute([$user['id']]);
$db->prepare('UPDATE users SET steam_id=NULL, steam_name=NULL, steam_avatar=NULL WHERE id=?')->execute([$user['id']]);

json_out(['ok' => true]);
