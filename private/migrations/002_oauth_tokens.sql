CREATE TABLE IF NOT EXISTS oauth_tokens (
  id                INTEGER PRIMARY KEY CHECK (id = 1),
  access_token_enc  TEXT NOT NULL,
  refresh_token_enc TEXT NOT NULL,
  expires_at        TEXT NOT NULL,
  scope             TEXT NOT NULL,
  updated_at        TEXT NOT NULL
);
