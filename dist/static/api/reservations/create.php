<?php
declare(strict_types=1);
require __DIR__ . '/../shared/bootstrap.php';
require __DIR__ . '/../shared/db.php';
require __DIR__ . '/../shared/encryption.php';
require __DIR__ . '/../shared/tokens.php';
require __DIR__ . '/../shared/calendar.php';
require __DIR__ . '/../shared/reservations.php';
require __DIR__ . '/../shared/mailer.php';

require_method('POST');

if (!check_rate_limit('create', (int) cfg()['rate_limit_create_per_hour'])) {
  json_out(['ok' => false, 'error' => 'rate-limited', 'message' => 'Zu viele Anfragen in kurzer Zeit. Bitte später erneut versuchen oder direkt Pietro anrufen.'], 429);
}

$b = read_json_body();

// Honeypot: silent 204 for bots
if (!empty($b['_honey'])) {
  http_response_code(204);
  exit;
}

// Required string fields
foreach (['name', 'email', 'phone', 'date', 'time', 'duration', 'eventType'] as $f) {
  if (empty($b[$f])) {
    json_out(['ok' => false, 'error' => 'missing-field', 'message' => "Feld fehlt: {$f}"], 422);
  }
}
if (!filter_var($b['email'], FILTER_VALIDATE_EMAIL)) {
  json_out(['ok' => false, 'error' => 'bad-email', 'message' => 'Bitte gültige E-Mail-Adresse angeben.'], 422);
}

$adults   = (int) ($b['adults']   ?? 0);
$children = (int) ($b['children'] ?? 0);
if ($adults + $children < 30) {
  json_out(['ok' => false, 'error' => 'min-30-guests', 'message' => 'Für Anlässe unter 30 Personen bitte direkt anrufen: 076 331 32 59.'], 422);
}

$hours = match ((string) $b['duration']) {
  '2h'   => 2,
  '3h'   => 3,
  '4h'   => 4,
  'long' => (int) cfg()['long_duration_hours'],
  default => 3,
};

$tz = new DateTimeZone(cfg()['tz']);
try {
  $start = new DateTime("{$b['date']} {$b['time']}", $tz);
} catch (Exception $e) {
  json_out(['ok' => false, 'error' => 'bad-datetime', 'message' => 'Datum/Zeit ungültig.'], 422);
}
if ($start < new DateTime('now', $tz)) {
  json_out(['ok' => false, 'error' => 'past-datetime', 'message' => 'Bitte wählen Sie ein Datum in der Zukunft.'], 422);
}
$end = (clone $start)->modify("+{$hours} hours");

// Re-check availability (race-safety between /check and /create)
try {
  $free = gcal_is_slot_free($start->format('c'), $end->format('c'), (int) cfg()['buffer_minutes']);
} catch (Throwable $e) {
  error_log('[create] calendar check failed: ' . $e->getMessage());
  json_out(['ok' => false, 'error' => 'calendar-unreachable', 'message' => 'Kalender aktuell nicht erreichbar. Bitte später erneut versuchen.'], 502);
}
if (!$free) {
  json_out([
    'ok' => false,
    'error' => 'slot-conflict',
    'message' => 'Der gewünschte Termin ist leider nicht verfügbar. Bitte wählen Sie ein anderes Datum oder eine andere Uhrzeit.',
  ], 409);
}

// Build row
$id      = bin2hex(random_bytes(16));
$now     = date('c');
$expires = (new DateTimeImmutable('now', new DateTimeZone('UTC')))
  ->modify('+' . (int) cfg()['expire_hours'] . ' hours')
  ->format('c');

$pricing = $b['pricing'] ?? null;

$data = [
  'id'              => $id,
  'status'          => 'pending',
  'gcal_event_id'   => null,
  'start_iso'       => $start->format('c'),
  'end_iso'         => $end->format('c'),
  'event_type'      => (string) $b['eventType'],
  'adults'          => $adults,
  'children'        => $children,
  'veg_percent'     => (int) ($b['vegPercent'] ?? 0),
  'toppings_json'   => json_encode($b['toppings'] ?? [], JSON_UNESCAPED_UNICODE),
  'setup_json'      => json_encode($b['setup']    ?? [], JSON_UNESCAPED_UNICODE),
  'address'         => $b['address']     ?? null,
  'distance_km'     => isset($b['distanceKm']) ? (float) $b['distanceKm'] : null,
  'name'            => (string) $b['name'],
  'email'           => (string) $b['email'],
  'phone'           => (string) $b['phone'],
  'note'            => $b['note'] ?? null,
  'pricing_total'   => $pricing && isset($pricing['total']) ? (float) $pricing['total'] : null,
  'deposit_amount'  => 250.00,
  'confirm_token'   => make_token(),
  'cancel_token'    => make_token(),
  'created_at'      => $now,
  'updated_at'      => $now,
  'expires_at'      => $expires,
];

// Transaction: insert row, create Google event, update row with event ID
$db = db_reservations();
$eventId = null;
$db->beginTransaction();
try {
  res_insert($data);
  $eventId = gcal_create_pending($data);
  res_update_status($id, 'pending', $eventId);
  $db->commit();
  $data['gcal_event_id'] = $eventId;
} catch (Throwable $e) {
  if ($db->inTransaction()) $db->rollBack();
  error_log('[create] transaction failed: ' . $e->getMessage());
  if ($eventId !== null) { try { gcal_delete($eventId); } catch (Throwable $__) {} }
  json_out(['ok' => false, 'error' => 'create-failed', 'message' => 'Reservierung konnte nicht erstellt werden. Bitte rufen Sie Pietro direkt an: 076 331 32 59'], 500);
}

// Send emails — failures logged but do not fail the reservation (row exists, event exists)
try { mail_customer_pending($data); } catch (Throwable $e) { error_log('[create] mail customer failed: ' . $e->getMessage()); }
try { mail_pietro_new_pending($data); } catch (Throwable $e) { error_log('[create] mail pietro failed: ' . $e->getMessage()); }

json_out([
  'ok'            => true,
  'id'            => $id,
  'status'        => 'pending',
  'expiresAt'     => $expires,
  'twintLink'     => 'https://go.twint.ch/1/e/tw?tw=acq.erLxqXuzQa2zND3B2wKBNM3KxDVpHFhbX6N8FjLRvWMv8epCovCoo1PWmZRIX7c0',
  'twintQrPng'    => cfg()['site_origin'] . '/images/twint-qr.png',
  'depositAmount' => 250,
  'message'       => 'Ihre Reservierungsanfrage wurde erfasst. Die Buchung ist erst definitiv bestätigt, sobald die Anzahlung von CHF 250 per Twint eingegangen und manuell geprüft wurde.',
], 201);
