<?php
declare(strict_types=1);
require __DIR__ . '/../shared/bootstrap.php';
require __DIR__ . '/../shared/db.php';
require __DIR__ . '/../shared/encryption.php';
require __DIR__ . '/../shared/tokens.php';
require __DIR__ . '/../shared/calendar.php';
require __DIR__ . '/../shared/reservations.php';
require __DIR__ . '/../shared/mailer.php';

$id  = (string) ($_GET['id']    ?? '');
$tok = (string) ($_GET['token'] ?? '');

if ($id === '' || $tok === '') {
  html_out('<h1>400 · Fehlende Parameter</h1>', 400);
}

$res = res_get($id);
if (!$res) {
  html_out('<h1>404 · Reservierung nicht gefunden</h1>', 404);
}
if (!tokens_equal($tok, (string) $res['confirm_token'])) {
  html_out('<h1>403 · Ungültiger Token</h1>', 403);
}

if ($res['status'] === 'confirmed') {
  html_out('<h1>Bereits bestätigt ✓</h1>'
    . '<p>Diese Reservierung wurde bereits am ' . htmlspecialchars((string)$res['confirmed_at']) . ' auf <strong>CONFIRMED</strong> gesetzt.</p>'
    . '<p>Name: ' . htmlspecialchars((string)$res['name']) . '<br>Termin: ' . htmlspecialchars((string)$res['start_iso']) . '</p>');
}
if ($res['status'] === 'cancelled' || $res['status'] === 'expired') {
  html_out('<h1>Status: ' . htmlspecialchars((string)$res['status']) . '</h1>'
    . '<p>Diese Reservierung ist bereits storniert oder abgelaufen. Keine Änderung möglich.</p>'
    . '<p>Name: ' . htmlspecialchars((string)$res['name']) . '</p>', 409);
}

try {
  if (!empty($res['gcal_event_id'])) {
    gcal_confirm((string) $res['gcal_event_id'], $res);
  }
  res_update_status($id, 'confirmed');
  $updated = res_get($id);
  try {
    mail_customer_confirmed($updated);
  } catch (Throwable $e) {
    error_log('[confirm] mail failed: ' . $e->getMessage());
  }
  html_out('<h1>Bestätigt ✓</h1>'
    . '<p>Reservierung für <strong>' . htmlspecialchars((string)$res['name']) . '</strong> am '
    . htmlspecialchars((string)$res['start_iso']) . ' wurde auf <strong>CONFIRMED</strong> gesetzt.</p>'
    . '<p>Google-Kalender aktualisiert. Bestätigungs-Mail an den Kunden gesendet.</p>');
} catch (Throwable $e) {
  error_log('[confirm] failed: ' . $e->getMessage());
  html_out('<h1>Fehler</h1><p>' . htmlspecialchars($e->getMessage()) . '</p>', 500);
}
