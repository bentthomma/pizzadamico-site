<?php
// Run once after SFTP-upload on Hoststar:  php scripts/init-db.php
// Idempotent - safe to re-run (migrations use IF NOT EXISTS).
declare(strict_types=1);

$root = dirname(__DIR__);
$privateDir = $root . '/private';

if (!is_dir($privateDir)) {
  mkdir($privateDir, 0700, true);
}

$migrations = [
  ['file' => $privateDir . '/reservations.db', 'sql' => $privateDir . '/migrations/001_reservations.sql'],
  ['file' => $privateDir . '/tokens.db',       'sql' => $privateDir . '/migrations/002_oauth_tokens.sql'],
];

foreach ($migrations as $m) {
  if (!file_exists($m['sql'])) {
    fwrite(STDERR, "[init-db] missing migration: {$m['sql']}\n");
    exit(1);
  }
  $db = new PDO('sqlite:' . $m['file']);
  $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $sql = file_get_contents($m['sql']);
  $db->exec($sql);
  if (file_exists($m['file'])) {
    chmod($m['file'], 0600);
  }
  echo "[init-db] {$m['file']} ready\n";
}

echo "[init-db] done\n";
