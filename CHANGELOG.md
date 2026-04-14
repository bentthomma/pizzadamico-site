# Changelog

## v0.1 · ready for deploy (2026-04-15)
- 7-Akte One-Pager mit Scroll-Choreografie (GSAP + Lenis)
- Fullscreen Catering-Wizard mit 8 Steps, Live-Preiskalkulation
- PHP-Endpoint für Anfragen (PHPMailer + Hoststar-SMTP)
- Google-Maps-Ready (API-Key setzen in `.env.local`)
- Placeholder-Fonts (Bricolage/Newsreader/JBMono) und Placeholder-Videos

## Deploy-Workflow
1. `pnpm build` → `dist/head-inject.html` + `dist/body-inject.html` + `dist/static/`
2. Ensure `api/vendor/` exists (run `composer install --no-dev` in api/ from a machine with composer)
3. `pnpm deploy` → uploads `dist/static/` to Hoststar via SFTP (credentials in `.env.local`)
4. Hoststar Designer · Seiten-Einstellungen · Code-Inject:
   - Head: paste content of `dist/head-inject.html`
   - Body: paste content of `dist/body-inject.html`
5. Publish.
