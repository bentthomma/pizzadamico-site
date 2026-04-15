<?php
// Template for private/config.php (NEVER commit config.php).
// Copy to private/config.php on each environment and fill in secrets.

return [
  // Generate via: openssl rand -hex 32
  'admin_secret'     => 'CHANGE_ME_64_HEX',
  'cron_secret'      => 'CHANGE_ME_64_HEX',

  // Generate via defuse/php-encryption:
  //   php -r "require 'api/vendor/autoload.php'; echo Defuse\\Crypto\\Key::createNewRandomKey()->saveToAsciiSafeString();"
  'encryption_key'   => 'CHANGE_ME_defuse_key',

  // Google Cloud Console → OAuth 2.0 Client IDs → Web application
  'google_client_id'     => '',
  'google_client_secret' => '',
  'google_redirect_uri'  => 'https://pizzadamico.ch/api/oauth/callback.php',
  'google_calendar_id'   => 'primary',

  // Hoststar SMTP (see technik.md)
  'smtp_host' => 'lx42.hoststar.hosting',
  'smtp_port' => 465,
  'smtp_user' => '',
  'smtp_pass' => '',

  'mail_from_addr'  => 'no-reply@pizzadamico.ch',
  'mail_from_name'  => "Pizza & Pasta D'Amico",
  'mail_pietro'     => 'damicopietro69@hotmail.it',

  'buffer_minutes'  => 30,
  'expire_hours'    => 48,
  'tz'              => 'Europe/Zurich',
  'long_duration_hours' => 6,

  'rate_limit_create_per_hour' => 10,
  'rate_limit_check_per_hour'  => 30,

  'site_origin'     => 'https://pizzadamico.ch',
  'site_name'       => "Pizza & Pasta D'Amico",
];
