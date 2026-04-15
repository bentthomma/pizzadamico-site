<?php
declare(strict_types=1);

function db_reservations(): PDO {
  static $db = null;
  if ($db === null) {
    $path = dirname(__DIR__, 2) . '/private/reservations.db';
    $db = new PDO('sqlite:' . $path);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $db->exec('PRAGMA foreign_keys = ON');
    $db->exec('PRAGMA journal_mode = WAL');
  }
  return $db;
}

function db_tokens(): PDO {
  static $db = null;
  if ($db === null) {
    $path = dirname(__DIR__, 2) . '/private/tokens.db';
    $db = new PDO('sqlite:' . $path);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $db->exec('PRAGMA journal_mode = WAL');
  }
  return $db;
}
