<?php
declare(strict_types=1);

// Single entrypoint for all PHP endpoints.
require __DIR__ . '/../vendor/autoload.php';

function cfg(): array {
  static $c = null;
  if ($c === null) {
    $path = dirname(__DIR__, 2) . '/private/config.php';
    if (!file_exists($path)) {
      throw new RuntimeException('private/config.php missing — copy private/config.sample.php and fill in secrets');
    }
    $c = require $path;
  }
  return $c;
}

function json_out($data, int $status = 200): void {
  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');
  header('Access-Control-Allow-Origin: ' . cfg()['site_origin']);
  header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
  header('Access-Control-Allow-Headers: Content-Type');
  echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

function html_out(string $body, int $status = 200): void {
  http_response_code($status);
  header('Content-Type: text/html; charset=utf-8');
  echo '<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Pizza D\'Amico</title>'
    . '<style>body{font-family:system-ui,-apple-system,sans-serif;max-width:42rem;margin:4rem auto;padding:2rem;background:#F0E6D2;color:#14100C;line-height:1.5}'
    . 'h1{font-weight:500;margin:0 0 1rem;font-size:clamp(28px,3vw,40px);letter-spacing:-0.5px}'
    . 'p{margin:0.5rem 0}a{color:inherit}'
    . '.meta{font-family:ui-monospace,monospace;font-size:12px;letter-spacing:2px;text-transform:uppercase;opacity:0.6;margin-top:2rem}'
    . '</style></head><body>'
    . $body
    . '<p class="meta">Pizza D\'Amico</p>'
    . '</body></html>';
  exit;
}

function read_json_body(): array {
  $raw = file_get_contents('php://input');
  $d = json_decode($raw, true);
  if (!is_array($d)) {
    json_out(['ok' => false, 'error' => 'invalid payload'], 400);
  }
  return $d;
}

function client_ip(): string {
  $fwd = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';
  if ($fwd !== '') {
    return trim(explode(',', $fwd)[0]);
  }
  return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

function require_method(string $method): void {
  if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    header('Access-Control-Allow-Origin: ' . cfg()['site_origin']);
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    exit;
  }
  if ($_SERVER['REQUEST_METHOD'] !== $method) {
    json_out(['ok' => false, 'error' => 'method not allowed'], 405);
  }
}
