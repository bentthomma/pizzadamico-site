<?php
declare(strict_types=1);
require __DIR__ . '/../shared/bootstrap.php';
require __DIR__ . '/../shared/db.php';
require __DIR__ . '/../shared/encryption.php';
require __DIR__ . '/../shared/tokens.php';
require __DIR__ . '/../shared/calendar.php';

require_method('POST');

if (!check_rate_limit('check', cfg()['rate_limit_check_per_hour'])) {
  json_out(['ok' => false, 'error' => 'rate-limited'], 429);
}

$body = read_json_body();
$date     = $body['date']     ?? null;
$time     = $body['time']     ?? null;
$duration = $body['duration'] ?? null;

if (!$date || !$time || !$duration) {
  json_out(['ok' => false, 'error' => 'missing fields'], 422);
}
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', (string)$date)) {
  json_out(['ok' => false, 'error' => 'bad date'], 422);
}
if (!preg_match('/^\d{2}:\d{2}$/', (string)$time)) {
  json_out(['ok' => false, 'error' => 'bad time'], 422);
}

$hours = match ((string)$duration) {
  '2h'   => 2,
  '3h'   => 3,
  '4h'   => 4,
  'long' => (int) cfg()['long_duration_hours'],
  default => 3,
};

$tz = new DateTimeZone(cfg()['tz']);
try {
  $start = new DateTime("{$date} {$time}", $tz);
} catch (Exception $e) {
  json_out(['ok' => false, 'error' => 'bad datetime'], 422);
}
if ($start < new DateTime('now', $tz)) {
  json_out([
    'ok'      => false,
    'error'   => 'past-datetime',
    'message' => 'Bitte wählen Sie ein Datum in der Zukunft.'
  ], 422);
}
$end = (clone $start)->modify("+{$hours} hours");

try {
  $free = gcal_is_slot_free($start->format('c'), $end->format('c'), (int) cfg()['buffer_minutes']);
} catch (Throwable $e) {
  error_log('[check] calendar: ' . $e->getMessage());
  json_out(['ok' => false, 'error' => 'calendar-unreachable'], 502);
}

if (!$free) {
  json_out([
    'ok'        => true,
    'available' => false,
    'reason'    => 'slot-conflict',
    'message'   => 'Der gewünschte Termin ist leider nicht verfügbar. Bitte wählen Sie ein anderes Datum oder eine andere Uhrzeit.',
  ]);
}

json_out([
  'ok'        => true,
  'available' => true,
  'start'     => $start->format('c'),
  'end'       => $end->format('c'),
]);
