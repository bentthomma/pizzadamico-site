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
