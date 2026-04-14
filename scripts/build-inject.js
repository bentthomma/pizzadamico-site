import { build } from 'vite';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const VITE_DIST = path.join(DIST, 'vite');
const BASE = process.env.ASSET_BASE || 'https://pizzadamico.ch';

async function main() {
  // 1. Vite production build into dist/vite/
  await build({ configFile: path.join(ROOT, 'vite.config.js') });

  // 2. Read built index.html
  const html = await fs.readFile(path.join(VITE_DIST, 'index.html'), 'utf8');

  // 3. Collect all bundled CSS files referenced in <link rel="stylesheet">
  const cssLinkRe = /<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/g;
  const cssPaths = [...html.matchAll(cssLinkRe)].map((m) => m[1]);
  let cssBundle = '';
  for (const p of cssPaths) {
    const abs = path.join(VITE_DIST, p.replace(/^\//, ''));
    cssBundle += await fs.readFile(abs, 'utf8') + '\n';
  }

  // 4. Collect all bundled JS (entry + any chunks referenced as type=module or modulepreload)
  const jsRe = /<(?:script[^>]*src|link[^>]*(?:rel="modulepreload"[^>]*href|href[^>]*rel="modulepreload"))="(\/assets\/[^"]+\.js)"[^>]*>/g;
  const jsPaths = [...html.matchAll(jsRe)].map((m) => m[1]);
  const uniqueJsPaths = Array.from(new Set(jsPaths));
  // Load order matters: modulepreload chunks first, entry last. Vite emits entry last in HTML, but we ensure entry is last by putting the script-src match at the end.
  // Easier: prefer entry (the one in <script type="module" src="...">) at the end.
  const entryMatch = [...html.matchAll(/<script[^>]*type="module"[^>]*src="(\/assets\/[^"]+\.js)"[^>]*>/g)].map((m) => m[1]);
  const entryJs = entryMatch[entryMatch.length - 1] || null;
  const orderedJs = [...uniqueJsPaths.filter((p) => p !== entryJs), ...(entryJs ? [entryJs] : [])];

  let jsBundle = '';
  for (const p of orderedJs) {
    const abs = path.join(VITE_DIST, p.replace(/^\//, ''));
    jsBundle += await fs.readFile(abs, 'utf8') + '\n';
  }

  // 5. Rewrite asset URLs inside JS/CSS bundles (references to fonts/images/videos from our src/)
  //    During vite build, these got hashed into /assets/foo.<hash>.<ext>. We keep those and upload them via SFTP to /assets/.
  //    For *source-relative* paths the build emits — they already live under /assets/, so prefix with BASE.
  const assetRewrite = (s) => s.replace(/(["'(])\/assets\//g, `$1${BASE}/assets/`);
  cssBundle = assetRewrite(cssBundle);
  jsBundle = assetRewrite(jsBundle);

  // 6. Extract body markup (main/pill/modal) from built index.html
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!bodyMatch) throw new Error('could not extract <body> from built html');
  let bodyMarkup = bodyMatch[1];
  // Remove the built <script src=...> and <link rel=stylesheet> (we will inline)
  bodyMarkup = bodyMarkup.replace(/<script[^>]*type="module"[^>]*src="\/assets\/[^"]+\.js"[^>]*><\/script>/g, '');
  bodyMarkup = bodyMarkup.replace(/<link[^>]*rel="modulepreload"[^>]*>/g, '');
  // Rewrite asset URLs in markup
  bodyMarkup = assetRewrite(bodyMarkup);

  // 7. Extract head fragments we want to keep: <meta name="description">, preloads for fonts (convert to absolute URLs)
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  let headFragments = '';
  if (headMatch) {
    const h = headMatch[1];
    const keep = h.match(/<meta name="description"[^>]*>/i);
    if (keep) headFragments += keep[0] + '\n';
    const preloads = [...h.matchAll(/<link rel="preload"[^>]*>/g)].map((m) => m[0]);
    for (const p of preloads) headFragments += assetRewrite(p) + '\n';
  }

  // 8. Hoststar-Reset inline (FIRST in head — must load before our styles)
  const resetCss = await fs.readFile(path.join(ROOT, 'src/css/hoststar-reset.css'), 'utf8');

  // 9. Build head-inject.html (CSS inlined, no external code references)
  const headInject =
    `<!-- Hoststar-Reset: hide builder wrappers -->\n` +
    `<style data-hoststar-reset>\n${resetCss}\n</style>\n` +
    `${headFragments}` +
    `<style data-damico-styles>\n${cssBundle}\n</style>\n`;

  // 10. Build body-inject.html (JS inlined)
  const bodyInject =
    `${bodyMarkup.trim()}\n` +
    `<script type="module" data-damico-app>\n${jsBundle}\n</script>\n`;

  // 11. Write outputs
  await fs.mkdir(DIST, { recursive: true });
  await fs.writeFile(path.join(DIST, 'head-inject.html'), headInject, 'utf8');
  await fs.writeFile(path.join(DIST, 'body-inject.html'), bodyInject, 'utf8');

  // 12. Prepare dist/static/ for SFTP (fonts, media, images, api, vite-emitted assets)
  const staticDir = path.join(DIST, 'static');
  await fs.rm(staticDir, { recursive: true, force: true });
  await fs.mkdir(staticDir, { recursive: true });
  await copyDir(path.join(VITE_DIST, 'assets'), path.join(staticDir, 'assets'));
  await copyDir(path.join(ROOT, 'src/fonts'),   path.join(staticDir, 'fonts'));
  await copyDir(path.join(ROOT, 'src/media'),   path.join(staticDir, 'media'));
  await copyDir(path.join(ROOT, 'src/images'),  path.join(staticDir, 'images'));
  await copyDir(path.join(ROOT, 'api'),          path.join(staticDir, 'api'));

  // 13. Report
  const headSize = (await fs.stat(path.join(DIST, 'head-inject.html'))).size;
  const bodySize = (await fs.stat(path.join(DIST, 'body-inject.html'))).size;
  console.log(`[build] head-inject.html: ${(headSize/1024).toFixed(1)} KB`);
  console.log(`[build] body-inject.html: ${(bodySize/1024).toFixed(1)} KB`);
  console.log(`[build] static assets in ${staticDir}`);
}

async function copyDir(src, dst) {
  try { await fs.access(src); } catch { return; }
  await fs.mkdir(dst, { recursive: true });
  for (const e of await fs.readdir(src, { withFileTypes: true })) {
    const s = path.join(src, e.name);
    const d = path.join(dst, e.name);
    if (e.isDirectory()) await copyDir(s, d);
    else await fs.copyFile(s, d);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
