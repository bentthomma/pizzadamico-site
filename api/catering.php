<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://pizzadamico.ch');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['error' => 'method not allowed']); exit; }

require __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$smtpHost = getenv('SMTP_HOST') ?: 'lx42.hoststar.hosting';
$smtpPort = (int)(getenv('SMTP_PORT') ?: 465);
$smtpUser = getenv('SMTP_USER') ?: '';
$smtpPass = getenv('SMTP_PASS') ?: '';
$mailTo   = getenv('MAIL_TO')   ?: 'damicopietro69@hotmail.it';

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) { http_response_code(400); echo json_encode(['error' => 'invalid payload']); exit; }

foreach (['name', 'email', 'phone'] as $k) {
  if (empty($data[$k])) { http_response_code(422); echo json_encode(['error' => "missing field: $k"]); exit; }
}
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) { http_response_code(422); echo json_encode(['error' => 'invalid email']); exit; }

if (!empty($data['_honey'])) { http_response_code(204); exit; }

$mail = new PHPMailer(true);
try {
  $mail->isSMTP();
  $mail->Host       = $smtpHost;
  $mail->SMTPAuth   = true;
  $mail->Username   = $smtpUser;
  $mail->Password   = $smtpPass;
  $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
  $mail->Port       = $smtpPort;
  $mail->CharSet    = 'UTF-8';

  $mail->setFrom($smtpUser, "Pizza D'Amico Website");
  $mail->addAddress($mailTo, 'Pietro D\'Amico');
  $mail->addReplyTo($data['email'], $data['name']);

  $mail->isHTML(false);
  $mail->Subject = sprintf('Catering-Anfrage · %s · %s', $data['eventType'] ?? 'Anlass', $data['date'] ?? '');
  $mail->Body    = renderBody($data);

  $mail->send();
  echo json_encode(['ok' => true]);
} catch (Exception $e) {
  http_response_code(502);
  error_log('[catering] mail failed: ' . $mail->ErrorInfo);
  echo json_encode(['error' => 'mail send failed']);
}

function renderBody(array $d): string {
  $b  = "Neue Catering-Anfrage\n";
  $b .= str_repeat('=', 60) . "\n\n";
  $b .= sprintf("Anlass:     %s\n", $d['eventType'] ?? '—');
  $b .= sprintf("Datum:      %s · %s · %s\n", $d['date'] ?? '—', $d['time'] ?? '—', $d['duration'] ?? '—');
  $b .= sprintf("Ort:        %s\n", $d['address'] ?? '—');
  $b .= sprintf("Anfahrt:    %s km (hin+zurück)\n", isset($d['distanceKm']) ? number_format(((float)$d['distanceKm']) * 2, 1) : '—');
  $b .= sprintf("Gäste:      %s Erw · %s Kinder · %s%% veggi/vegan\n", $d['adults'] ?? 0, $d['children'] ?? 0, $d['vegPercent'] ?? 0);
  $b .= sprintf("Zutaten:    %s\n", isset($d['toppings']) ? implode(', ', (array)$d['toppings']) : '—');
  $setup = $d['setup'] ?? [];
  $b .= sprintf("Strom:      %s\n", fmtBool($setup['power'] ?? null));
  $b .= sprintf("Platz:      %s\n", fmtBool($setup['space'] ?? null));
  $b .= sprintf("Dach:       %s\n", fmtBool($setup['shelter'] ?? null));
  $b .= "\n";
  $b .= sprintf("Name:       %s\n", $d['name'] ?? '');
  $b .= sprintf("E-Mail:     %s\n", $d['email'] ?? '');
  $b .= sprintf("Telefon:    %s\n", $d['phone'] ?? '');
  if (!empty($d['note'])) {
    $b .= "\nNotiz:\n" . $d['note'] . "\n";
  }
  $b .= "\n" . str_repeat('=', 60) . "\n";
  if (isset($d['pricing'])) {
    $p = $d['pricing'];
    $b .= sprintf("Kalkulation (Schätzung, vom Client):\n  Subtotal: %s · MwSt: %s · Total: %s\n",
      $p['subtotal'] ?? '—', $p['vat'] ?? '—', $p['total'] ?? '—');
  }
  return $b;
}

function fmtBool($v) { return $v === true ? 'Ja' : ($v === false ? 'Nein' : '—'); }
