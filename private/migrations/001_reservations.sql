CREATE TABLE IF NOT EXISTS reservations (
  id               TEXT PRIMARY KEY,
  status           TEXT NOT NULL CHECK (status IN ('pending','confirmed','cancelled','expired')),
  gcal_event_id    TEXT,
  start_iso        TEXT NOT NULL,
  end_iso          TEXT NOT NULL,
  event_type       TEXT,
  adults           INTEGER NOT NULL,
  children         INTEGER NOT NULL,
  veg_percent      INTEGER NOT NULL,
  toppings_json    TEXT NOT NULL,
  setup_json       TEXT NOT NULL,
  address          TEXT,
  distance_km      REAL,
  name             TEXT NOT NULL,
  email            TEXT NOT NULL,
  phone            TEXT NOT NULL,
  note             TEXT,
  pricing_total    REAL,
  deposit_amount   REAL NOT NULL DEFAULT 250.00,
  confirm_token    TEXT NOT NULL,
  cancel_token     TEXT NOT NULL,
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL,
  expires_at       TEXT NOT NULL,
  confirmed_at     TEXT,
  cancelled_at     TEXT
);
CREATE INDEX IF NOT EXISTS idx_res_status  ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_res_expires ON reservations(expires_at);

CREATE TABLE IF NOT EXISTS rate_limits (
  ip           TEXT NOT NULL,
  endpoint     TEXT NOT NULL,
  window_start TEXT NOT NULL,
  count        INTEGER NOT NULL,
  PRIMARY KEY (ip, endpoint, window_start)
);
