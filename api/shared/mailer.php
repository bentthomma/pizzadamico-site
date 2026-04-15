<?php
declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;

function make_mailer(): PHPMailer {
  $c = cfg();
  $m = new PHPMailer(true);
  $m->isSMTP();
  $m->Host       = $c['smtp_host'];
  $m->SMTPAuth   = true;
  $m->Username   = $c['smtp_user'];
  $m->Password   = $c['smtp_pass'];
  $m->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
  $m->Port       = (int) $c['smtp_port'];
  $m->CharSet    = 'UTF-8';
  $m->setFrom($c['mail_from_addr'], $c['mail_from_name']);
  $m->isHTML(false);
  return $m;
}

function mail_pietro_new_pending(array $res): void {
  $c = cfg();
  $m = make_mailer();
  $m->addAddress($c['mail_pietro'], 'Pietro D\'Amico');
  $m->addReplyTo($res['email'], $res['name']);
  $m->Subject = "[PENDING] Catering · {$res['name']} · {$res['start_iso']}";

  $confirmUrl = $c['site_origin'] . "/api/reservations/confirm.php?id={$res['id']}&token={$res['confirm_token']}";
  $cancelUrl  = $c['site_origin'] . "/api/reservations/cancel.php?id={$res['id']}&token={$res['cancel_token']}";

  $distance = $res['distance_km'] ? number_format(((float)$res['distance_km']) * 2, 1) . ' km' : '—';

  $body = "Neue Catering-Anfrage · PENDING\n"
    . str_repeat('=', 56) . "\n\n"
    . "Name:      {$res['name']}\n"
    . "Telefon:   {$res['phone']}\n"
    . "E-Mail:    {$res['email']}\n\n"
    . "Start:     {$res['start_iso']}\n"
    . "Ende:      {$res['end_iso']}\n"
    . "Anlass:    " . ($res['event_type'] ?? '—') . "\n"
    . "Gäste:     {$res['adults']} Erw · {$res['children']} Kinder\n"
    . "Adresse:   " . ($res['address'] ?? '—') . "\n"
    . "Anfahrt:   {$distance}\n"
    . "Anzahlung: CHF " . number_format((float)$res['deposit_amount'], 2) . "\n\n"
    . "Notiz: " . ($res['note'] ?? '') . "\n\n"
    . str_repeat('-', 56) . "\n\n"
    . "Sobald TWINT-Zahlung eingegangen:\n\n"
    . "  ✓ ZAHLUNG BESTÄTIGT (Event → CONFIRMED)\n"
    . "  {$confirmUrl}\n\n"
    . "Falls stornieren:\n\n"
    . "  ✗ STORNIEREN\n"
    . "  {$cancelUrl}\n\n"
    . "Läuft automatisch ab am: {$res['expires_at']}\n";

  $m->Body = $body;
  $m->send();
}

function mail_customer_pending(array $res): void {
  $c = cfg();
  $m = make_mailer();
  $m->addAddress($res['email'], $res['name']);
  $m->Subject = "Reservierungsanfrage erfasst · Pizza & Pasta D'Amico";

  $deposit = number_format((float)$res['deposit_amount'], 2);
  $twintLink = 'https://go.twint.ch/1/e/tw?tw=acq.erLxqXuzQa2zND3B2wKBNM3KxDVpHFhbX6N8FjLRvWMv8epCovCoo1PWmZRIX7c0';

  $body = "Hallo {$res['name']},\n\n"
    . "wir haben Ihre Reservierungsanfrage für den {$res['start_iso']} erhalten.\n\n"
    . "Die Buchung ist erst definitiv bestätigt, sobald die Anzahlung von\n"
    . "CHF {$deposit} per TWINT eingegangen und manuell geprüft wurde.\n\n"
    . "TWINT-Zahlung:\n{$twintLink}\n\n"
    . "Betrag:            CHF {$deposit}\n"
    . "Verwendungszweck:  {$res['name']} · {$res['start_iso']}\n\n"
    . "Nach Zahlungseingang erhalten Sie eine separate Bestätigungs-E-Mail.\n"
    . "Ohne Eingang innerhalb von 48 Stunden wird die Anfrage automatisch aufgelöst.\n\n"
    . "Bei Fragen: 076 331 32 59 · damicopietro69@hotmail.it\n\n"
    . "— Pizza & Pasta D'Amico\n";

  $m->Body = $body;
  $m->send();
}

function mail_customer_confirmed(array $res): void {
  $m = make_mailer();
  $m->addAddress($res['email'], $res['name']);
  $m->Subject = "Reservierung bestätigt · Pizza & Pasta D'Amico";
  $deposit = number_format((float)$res['deposit_amount'], 2);
  $m->Body = "Hallo {$res['name']},\n\n"
    . "Ihre Reservierung für den {$res['start_iso']} ist jetzt definitiv bestätigt.\n"
    . "Anzahlung CHF {$deposit} verbucht.\n\n"
    . "Wir freuen uns auf Ihr Fest.\n\n— Pietro D'Amico · 076 331 32 59\n";
  $m->send();
}

function mail_customer_cancelled(array $res, string $reason = 'cancelled'): void {
  $m = make_mailer();
  $m->addAddress($res['email'], $res['name']);
  $m->Subject = $reason === 'expired'
    ? 'Reservierungsanfrage abgelaufen · Pizza & Pasta D\'Amico'
    : 'Reservierung storniert · Pizza & Pasta D\'Amico';
  $intro = $reason === 'expired'
    ? "Ihre Reservierungsanfrage vom {$res['created_at']} ist leider abgelaufen, da kein TWINT-Zahlungseingang innerhalb von 48 Stunden erfolgte. Der Termin ist wieder freigegeben — Sie können jederzeit eine neue Anfrage stellen."
    : "Ihre Reservierung für den {$res['start_iso']} wurde storniert.";
  $m->Body = "Hallo {$res['name']},\n\n{$intro}\n\nBei Rückfragen: 076 331 32 59.\n\n— Pizza & Pasta D'Amico\n";
  $m->send();
}
