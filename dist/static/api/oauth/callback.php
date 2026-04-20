<?php
declare(strict_types=1);
require __DIR__ . '/../shared/bootstrap.php';
require __DIR__ . '/../shared/db.php';
require __DIR__ . '/../shared/encryption.php';

if (!isset($_GET['code']) || $_GET['code'] === '') {
  html_out('<h1>400 · Missing code</h1><p>OAuth-Callback ohne <code>?code=...</code>.</p>', 400);
}

$client = new Google\Client();
$client->setClientId(cfg()['google_client_id']);
$client->setClientSecret(cfg()['google_client_secret']);
$client->setRedirectUri(cfg()['google_redirect_uri']);
$client->setAccessType('offline');

$token = $client->fetchAccessTokenWithAuthCode($_GET['code']);
if (isset($token['error'])) {
  html_out('<h1>OAuth-Fehler</h1><p>' . htmlspecialchars((string)$token['error']) . '</p>', 400);
}
if (empty($token['refresh_token'])) {
  html_out('<h1>OAuth unvollständig</h1><p>Kein <code>refresh_token</code> erhalten. Bitte sicherstellen, dass <code>prompt=consent</code> und <code>access_type=offline</code> gesetzt sind und der Consent-Screen neu durchlaufen wurde.</p>', 400);
}

$db = db_tokens();
$expiresAt = date('c', time() + (int)($token['expires_in'] ?? 3600));
$stmt = $db->prepare(
  'INSERT OR REPLACE INTO oauth_tokens
    (id, access_token_enc, refresh_token_enc, expires_at, scope, updated_at)
    VALUES (1, :at, :rt, :exp, :scope, :updated)'
);
$stmt->bindValue(':at',      encrypt_str($token['access_token']));
$stmt->bindValue(':rt',      encrypt_str($token['refresh_token']));
$stmt->bindValue(':exp',     $expiresAt);
$stmt->bindValue(':scope',   $token['scope'] ?? 'calendar');
$stmt->bindValue(':updated', date('c'));
$stmt->execute();

html_out(
  '<h1>OAuth verbunden ✓</h1>'
  . '<p>Refresh-Token wurde verschlüsselt gespeichert. Pietros Kalender ist jetzt für Reservierungen verbunden.</p>'
  . '<p>Keine weiteren Logins nötig — das Backend nutzt ab sofort diesen Token automatisch für alle Free/Busy-Checks und Event-Operationen.</p>'
);
