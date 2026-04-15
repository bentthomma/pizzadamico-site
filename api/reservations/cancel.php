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
if (!tokens_equal($tok, (string) $res['cancel_token'])) {
  html_out('<h1>403 · Ungültiger Token</h1>', 403);
}

if ($res['status'] === 'cancelled' || $res['status'] === 'expired') {
  html_out('<h1>Bereits ' . htmlspecialchars((string)$res['status']) . '</h1>'
    . '<p>Keine Änderung.</p>');
}

try {
  if (!empty($res['gcal_event_id'])) {
    gcal_delete((string) $res['gcal_event_id']);
  }
  res_update_status($id, 'cancelled');
  try {
    mail_customer_cancelled(res_get($id), 'cancelled');
  } catch (Throwable $e) {
    error_log('[cancel] mail failed: ' . $e->getMessage());
  }
  html_out('<h1>Storniert ✓</h1>'
    . '<p>Reservierung für <strong>' . htmlspecialchars((string)$res['name']) . '</strong> wurde gelöscht.</p>'
    . '<p>Google-Event entfernt. Storno-Mail an den Kunden gesendet.</p>');
} catch (Throwable $e) {
  error_log('[cancel] failed: ' . $e->getMessage());
  html_out('<h1>Fehler</h1><p>' . htmlspecialchars($e->getMessage()) . '</p>', 500);
}
