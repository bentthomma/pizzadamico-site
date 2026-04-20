<?php
declare(strict_types=1);

function make_token(): string {
  return bin2hex(random_bytes(32));
}

function tokens_equal(string $a, string $b): bool {
  return hash_equals($a, $b);
}

/**
 * SQLite-backed rate-limit with hour-window buckets.
 * Returns true if the request is allowed, false if over the per-hour limit.
 */
function check_rate_limit(string $endpoint, int $perHour): bool {
  $db = db_reservations();
  $ip = client_ip();
  $window = date('Y-m-d\TH:00:00');

  $stmt = $db->prepare(
    'INSERT INTO rate_limits (ip, endpoint, window_start, count)
       VALUES (?, ?, ?, 1)
       ON CONFLICT(ip, endpoint, window_start)
       DO UPDATE SET count = count + 1'
  );
  $stmt->execute([$ip, $endpoint, $window]);

  $stmt = $db->prepare('SELECT count FROM rate_limits WHERE ip = ? AND endpoint = ? AND window_start = ?');
  $stmt->execute([$ip, $endpoint, $window]);
  $row = $stmt->fetch();

  return $row !== false && (int)$row['count'] <= $perHour;
}
