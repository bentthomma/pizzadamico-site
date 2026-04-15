<?php
// Run once on Hoststar after composer install:
//   php scripts/gen-encryption-key.php
// Output is the `encryption_key` value for private/config.php.
declare(strict_types=1);

$autoload = __DIR__ . '/../api/vendor/autoload.php';
if (!file_exists($autoload)) {
  fwrite(STDERR, "composer install erst laufen lassen: cd api && composer install --no-dev\n");
  exit(1);
}
require $autoload;

echo Defuse\Crypto\Key::createNewRandomKey()->saveToAsciiSafeString() . "\n";
