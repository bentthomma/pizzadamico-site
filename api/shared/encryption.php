<?php
declare(strict_types=1);

use Defuse\Crypto\Crypto;
use Defuse\Crypto\Key;

function enc_key(): Key {
  static $k = null;
  if ($k === null) {
    $k = Key::loadFromAsciiSafeString(cfg()['encryption_key']);
  }
  return $k;
}

function encrypt_str(string $plain): string {
  return Crypto::encrypt($plain, enc_key());
}

function decrypt_str(string $cipher): string {
  return Crypto::decrypt($cipher, enc_key());
}
