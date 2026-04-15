# Pizza D'Amico Site

Static one-pager delivered via Hoststar Designer code-inject + SFTP.
See Spec + Plan in vault under `Pizza-Damico-Website/`.

## Dev
- `pnpm install`
- `pnpm dev` — Vite :5173
- `pnpm test` — Vitest
- `pnpm e2e` — Playwright
- `pnpm build` — kompiliert Head/Body-Inject-Blobs in `dist/`
- `pnpm deploy` — SFTP-Upload nach Hoststar

## Deploy-Workflow
1. `pnpm build`
2. `pnpm deploy`
3. Hoststar Designer: `dist/head-inject.html` → Head, `dist/body-inject.html` → Body
4. Publish

## Reservation System · Einmal-Setup

Das Reservations-Backend braucht einen einmaligen Setup-Durchgang (Google OAuth + DB-Init + Cron). Danach läuft es autonom.

### 1 · Secrets generieren

```bash
# admin_secret (für OAuth-Init)
openssl rand -hex 32

# cron_secret (für expire-Endpunkt)
openssl rand -hex 32

# encryption_key (für defuse-Crypto auf Refresh-Token)
# Braucht installierte composer-Deps in api/vendor/ — einmal lokal ausführen:
cd api && composer install --no-dev && cd ..
php -r "require 'api/vendor/autoload.php'; echo Defuse\\Crypto\\Key::createNewRandomKey()->saveToAsciiSafeString(), \"\\n\";"
```

### 2 · Google Cloud Console

- Neues Projekt anlegen (oder bestehendes)
- Google Calendar API aktivieren
- OAuth-Consent-Screen konfigurieren (Typ: External, Testnutzer: Pietros E-Mail)
- Credentials → OAuth 2.0 Client ID → Web application
- Authorized Redirect URIs: `https://pizzadamico.ch/api/oauth/callback.php`
- Client ID + Client Secret notieren

### 3 · Config befüllen

```bash
cp private/config.sample.php private/config.php
# Editor öffnen und alle CHANGE_ME-Werte einsetzen:
#   admin_secret, cron_secret, encryption_key
#   google_client_id, google_client_secret
#   smtp_user, smtp_pass
```

### 4 · Deploy

```bash
pnpm build
pnpm deploy    # uploadet dist/static/ → /httpdocs und private/ → /private (ohne config.php/*.db)
```

Die `private/config.php` wird **nicht** mit-deployt. Lege sie einmalig auf dem Hoststar-Server ab (z.B. via SFTP manuell oder über Hoststar-Dateimanager).

### 5 · DB initialisieren

Auf Hoststar-Server (SSH oder Hoststar-Admin-PHP-Runner):

```bash
php scripts/init-db.php
```

Erzeugt `private/reservations.db` und `private/tokens.db` mit Schema. Idempotent.

### 6 · OAuth-Consent (Pietro einmalig)

Im Browser öffnen:

```
https://pizzadamico.ch/api/oauth/init.php?admin_secret=<der_admin_secret_wert>
```

Google-Consent-Screen durchlaufen (Pietros Account). Callback speichert Refresh-Token encrypted in `tokens.db`. Fertig.

### 7 · Cron einrichten (Hoststar Admin-Panel)

Cronjobs → Neu:

- **Befehl:** `curl -s "https://pizzadamico.ch/api/reservations/expire.php?cron_secret=<der_cron_secret_wert>"`
- **Zeitplan:** `*/30 * * * *` (alle 30 Minuten)

### 8 · Hoststar-Designer-Inject

Aus `dist/head-inject.html` und `dist/body-inject.html` die Inhalte kopieren und in die zwei Felder im Hoststar-Designer einfügen. Publishen.

## Reservation System · Deploy-Workflow (nach Setup)

```bash
pnpm build
pnpm deploy
# Optional: wenn sich Head/Body geändert haben → neu im Hoststar-Designer einfügen
```

Code-Änderungen im Frontend (JS/CSS) landen in den Inject-Blobs. PHP-Änderungen landen direkt in `/httpdocs/api/` via SFTP.
