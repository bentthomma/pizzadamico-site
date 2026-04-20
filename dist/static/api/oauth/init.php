<?php
declare(strict_types=1);
require __DIR__ . '/../shared/bootstrap.php';
require __DIR__ . '/../shared/tokens.php';

$secret = $_GET['admin_secret'] ?? '';
if ($secret === '' || !tokens_equal($secret, cfg()['admin_secret'])) {
  html_out('<h1>403 · Forbidden</h1><p>Falscher oder fehlender <code>admin_secret</code>.</p>', 403);
}

$client = new Google\Client();
$client->setClientId(cfg()['google_client_id']);
$client->setClientSecret(cfg()['google_client_secret']);
$client->setRedirectUri(cfg()['google_redirect_uri']);
$client->setAccessType('offline');
$client->setPrompt('consent');
$client->addScope(Google\Service\Calendar::CALENDAR);

header('Location: ' . $client->createAuthUrl());
exit;
