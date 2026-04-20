<?php
declare(strict_types=1);
require __DIR__ . '/../shared/bootstrap.php';
require __DIR__ . '/../shared/db.php';
require __DIR__ . '/../shared/encryption.php';
require __DIR__ . '/../shared/tokens.php';
require __DIR__ . '/../shared/calendar.php';
require __DIR__ . '/../shared/reservations.php';
require __DIR__ . '/../shared/mailer.php';

// Accept secret via GET ?cron_secret= or HTTP header X-Cron-Secret
$secret = (string) ($_GET['cron_secret'] ?? ($_SERVER['HTTP_X_CRON_SECRET'] ?? ''));
if ($secret === '' || !tokens_equal($secret, (string) cfg()['cron_secret'])) {
  json_out(['ok' => false, 'error' => 'forbidden'], 403);
}

$expired = res_pending_expired();
$success = 0;
$failed  = 0;
$errors  = [];

foreach ($expired as $r) {
  try {
    if (!empty($r['gcal_event_id'])) {
      try { gcal_delete((string) $r['gcal_event_id']); } catch (Throwable $e) {
        error_log('[expire] gcal_delete ' . $r['id'] . ': ' . $e->getMessage());
      }
    }
    res_update_status((string) $r['id'], 'expired');
    try {
      $updated = res_get((string) $r['id']);
      if ($updated) mail_customer_cancelled($updated, 'expired');
    } catch (Throwable $e) {
      error_log('[expire] mail ' . $r['id'] . ': ' . $e->getMessage());
    }
    $success++;
  } catch (Throwable $e) {
    $failed++;
    $errors[] = $r['id'] . ': ' . $e->getMessage();
    error_log('[expire] full failure ' . $r['id'] . ': ' . $e->getMessage());
  }
}

json_out([
  'ok'      => true,
  'expired' => $success,
  'failed'  => $failed,
  'errors'  => $errors,
  'checked_at' => date('c'),
]);
