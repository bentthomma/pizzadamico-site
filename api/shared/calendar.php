<?php
declare(strict_types=1);

function gcal_client(): Google\Client {
  static $client = null;
  if ($client === null) {
    $client = new Google\Client();
    $client->setClientId(cfg()['google_client_id']);
    $client->setClientSecret(cfg()['google_client_secret']);
    $client->setAccessType('offline');

    $stmt = db_tokens()->query('SELECT access_token_enc, refresh_token_enc, expires_at FROM oauth_tokens WHERE id = 1');
    $row = $stmt->fetch();
    if (!$row) {
      throw new RuntimeException('OAuth not initialized — run /api/oauth/init.php?admin_secret=...');
    }

    $expiresIn = max(0, strtotime($row['expires_at']) - time());
    $client->setAccessToken([
      'access_token'  => decrypt_str($row['access_token_enc']),
      'refresh_token' => decrypt_str($row['refresh_token_enc']),
      'expires_in'    => $expiresIn,
      'created'       => time() - (3600 - $expiresIn),
    ]);

    if ($client->isAccessTokenExpired()) {
      $new = $client->fetchAccessTokenWithRefreshToken($client->getRefreshToken());
      if (!isset($new['access_token'])) {
        throw new RuntimeException('Failed to refresh access token: ' . json_encode($new));
      }
      $updateStmt = db_tokens()->prepare(
        'UPDATE oauth_tokens SET access_token_enc = ?, expires_at = ?, updated_at = ? WHERE id = 1'
      );
      $updateStmt->execute([
        encrypt_str($new['access_token']),
        date('c', time() + (int)($new['expires_in'] ?? 3600)),
        date('c'),
      ]);
    }
  }
  return $client;
}

function gcal_is_slot_free(string $startIso, string $endIso, int $bufferMin): bool {
  $svc = new Google\Service\Calendar(gcal_client());
  $cal = cfg()['google_calendar_id'];

  $start = new DateTime($startIso);
  $end   = new DateTime($endIso);
  $start->modify("-{$bufferMin} minutes");
  $end->modify("+{$bufferMin} minutes");

  $req = new Google\Service\Calendar\FreeBusyRequest([
    'timeMin' => $start->format('c'),
    'timeMax' => $end->format('c'),
    'items'   => [['id' => $cal]],
  ]);
  $res = $svc->freebusy->query($req);
  $calendars = $res->getCalendars();
  $busy = isset($calendars[$cal]) ? $calendars[$cal]->getBusy() : [];
  return count($busy) === 0;
}

function gcal_create_pending(array $data): string {
  $svc = new Google\Service\Calendar(gcal_client());
  $cal = cfg()['google_calendar_id'];

  $event = new Google\Service\Calendar\Event([
    'summary'     => "[PENDING] Catering Anfrage · {$data['name']}",
    'description' => gcal_render_description($data),
    'start'       => ['dateTime' => $data['start_iso'], 'timeZone' => cfg()['tz']],
    'end'         => ['dateTime' => $data['end_iso'],   'timeZone' => cfg()['tz']],
    'extendedProperties' => [
      'private' => [
        'reservationId'     => $data['id'],
        'reservationStatus' => 'pending',
        'paymentStatus'     => 'awaiting',
        'twintAmount'       => (string) $data['deposit_amount'],
        'createdAt'         => $data['created_at'],
      ],
    ],
  ]);
  $created = $svc->events->insert($cal, $event);
  return $created->getId();
}

function gcal_confirm(string $eventId, array $data): void {
  $svc = new Google\Service\Calendar(gcal_client());
  $cal = cfg()['google_calendar_id'];
  $event = $svc->events->get($cal, $eventId);

  $event->setSummary("[CONFIRMED] Catering · {$data['name']}");

  $desc = $event->getDescription() ?? '';
  $desc = preg_replace('/Reservierungs-Status:.*$/m', 'Reservierungs-Status: confirmed', $desc, 1);
  $desc = preg_replace('/Zahlungsstatus:.*$/m',       'Zahlungsstatus: bezahlt · CHF ' . $data['deposit_amount'] . ' TWINT', $desc, 1);
  $event->setDescription($desc);

  $props = $event->getExtendedProperties();
  if ($props === null) {
    $props = new Google\Service\Calendar\EventExtendedProperties();
  }
  $private = $props->getPrivate() ?? [];
  $private['reservationStatus'] = 'confirmed';
  $private['paymentStatus']     = 'paid';
  $props->setPrivate($private);
  $event->setExtendedProperties($props);

  $svc->events->update($cal, $eventId, $event);
}

function gcal_delete(string $eventId): void {
  $svc = new Google\Service\Calendar(gcal_client());
  try {
    $svc->events->delete(cfg()['google_calendar_id'], $eventId);
  } catch (Exception $e) {
    error_log('[gcal] delete failed: ' . $e->getMessage());
  }
}

function gcal_render_description(array $d): string {
  $toppings = implode(', ', json_decode($d['toppings_json'] ?? '[]', true) ?? []);
  $setup = json_decode($d['setup_json'] ?? '{}', true) ?? [];
  $fmtBool = static fn($v) => $v === true ? 'Ja' : ($v === false ? 'Nein' : '—');
  $distance = $d['distance_km'] ? number_format(((float)$d['distance_km']) * 2, 1) . ' km' : '—';
  $total = $d['pricing_total'] !== null ? number_format((float)$d['pricing_total'], 2) : '—';

  $lines = [
    "Reservierungs-Status: pending",
    "Zahlungsstatus: offen · CHF {$d['deposit_amount']} TWINT erwartet",
    "",
    "— Kunde —",
    "Name:     {$d['name']}",
    "Telefon:  {$d['phone']}",
    "E-Mail:   {$d['email']}",
    "",
    "— Event —",
    "Anlass:   " . ($d['event_type'] ?? '—'),
    "Start:    {$d['start_iso']}",
    "Ende:     {$d['end_iso']}",
    "Adresse:  " . ($d['address'] ?? '—'),
    "Anfahrt:  {$distance}",
    "Gäste:    {$d['adults']} Erw · {$d['children']} Kinder · {$d['veg_percent']}% veggi/vegan",
    "",
    "— Zutaten —",
    $toppings !== '' ? $toppings : '—',
    "",
    "— Setup —",
    "Strom:  " . $fmtBool($setup['power']   ?? null),
    "Platz:  " . $fmtBool($setup['space']   ?? null),
    "Dach:   " . $fmtBool($setup['shelter'] ?? null),
    "",
    "— Kalkulation —",
    "Total (inkl. 8.1% MwSt): CHF {$total}",
    "Anzahlung:               CHF {$d['deposit_amount']}",
    "",
    "— Bemerkungen —",
    $d['note'] ?? '',
    "",
    "— System —",
    "Reservation-ID: {$d['id']}",
    "Erstellt:       {$d['created_at']}",
    "Läuft ab:       {$d['expires_at']}",
  ];
  return implode("\n", $lines);
}
