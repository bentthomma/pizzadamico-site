import { build } from 'vite';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const VITE_DIST = path.join(DIST, 'vite');
// jsDelivr CDN serves assets committed to github.com/bentthomma/pizzadamico-site@main/dist/static/
// Override via env ASSET_BASE if hosting assets elsewhere (e.g. direct on pizzadamico.ch).
const BASE = process.env.ASSET_BASE || 'https://cdn.jsdelivr.net/gh/bentthomma/pizzadamico-site@main/dist/static';

async function main() {
  // 1. Vite production build into dist/vite/
  await build({ configFile: path.join(ROOT, 'vite.config.js') });

  // 1b. Post-process Vite-chunks: preload-manifest strings ("assets/name.js")
  //     → absolute jsDelivr URLs. Sonst resolvt der Browser sie relativ zu
  //     pizzadamico.ch statt zu mount-*.js Modul-URL → 404.
  const viteAssetsDir = path.join(VITE_DIST, 'assets');
  try {
    const chunkFiles = await fs.readdir(viteAssetsDir);
    for (const f of chunkFiles) {
      if (!/\.(js|css)$/.test(f)) continue;
      const p = path.join(viteAssetsDir, f);
      let content = await fs.readFile(p, 'utf8');
      const original = content;
      // "assets/name-hash.js" oder "assets/name-hash.css" → jsDelivr URL
      content = content.replace(
        /"assets\/([A-Za-z0-9_-]+\.(?:js|css))"/g,
        `"${BASE}/assets/$1"`
      );
      if (content !== original) await fs.writeFile(p, content, 'utf8');
    }
  } catch (err) {
    console.warn('[build] chunk post-process warning:', err.message);
  }

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

  // 5. Rewrite asset URLs inside JS/CSS bundles.
  //    Hashed /assets/* (Vite-bundled) + public/* top-level files → jsdelivr CDN.
  //    Match only root-relative URLs that aren't protocol-relative (//) or anchor (#).
  const assetRewrite = (s) => s.replace(
    /(["'`(])\/(?!\/)(assets|gallery|zutaten|fonts|media|images|api|pietro-hero\.|akt3-bg\.|bg-stone\.|twint-qr\.|og-image\.|favicon\.|favicon-|apple-touch-icon|site\.webmanifest|robots\.txt|sitemap\.xml)([^"'`)]*)/g,
    (_m, pre, first, rest) => `${pre}${BASE}/${first}${rest}`,
  );
  // Dynamic imports + module preload paths are relative (`./name-hash.js`) nach Vite build.
  // Inline-Script in body-inject.html hat kein Module-base, also MUSS absolute URL gesetzt werden.
  const chunkRewrite = (s) => s.replace(
    /(["'`])\.\/([A-Za-z0-9_-]+-[A-Za-z0-9_]{8,}\.(js|css))(["'`])/g,
    (_m, q1, file, _ext, q2) => `${q1}${BASE}/assets/${file}${q2}`
  );
  cssBundle = assetRewrite(cssBundle);
  jsBundle = chunkRewrite(assetRewrite(jsBundle));

  // 6. Extract body markup (main/pill/modal) from built index.html
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!bodyMatch) throw new Error('could not extract <body> from built html');
  let bodyMarkup = bodyMatch[1];
  // Remove the built <script src=...> and <link rel=stylesheet> (we will inline)
  bodyMarkup = bodyMarkup.replace(/<script[^>]*type="module"[^>]*src="\/assets\/[^"]+\.js"[^>]*><\/script>/g, '');
  bodyMarkup = bodyMarkup.replace(/<link[^>]*rel="modulepreload"[^>]*>/g, '');
  // Rewrite asset URLs in markup
  bodyMarkup = assetRewrite(bodyMarkup);

  // 7. Extract head fragments we want to keep — SEO + Social + Icon + Preload.
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  let headFragments = '';
  if (headMatch) {
    const h = headMatch[1];
    const patterns = [
      /<meta name="description"[^>]*>/gi,
      /<meta name="author"[^>]*>/gi,
      /<meta name="theme-color"[^>]*>/gi,
      /<meta name="robots"[^>]*>/gi,
      /<meta property="og:[^"]+"[^>]*>/gi,
      /<meta name="twitter:[^"]+"[^>]*>/gi,
      /<link rel="canonical"[^>]*>/gi,
      /<link rel="icon"[^>]*>/gi,
      /<link rel="apple-touch-icon"[^>]*>/gi,
      /<link rel="manifest"[^>]*>/gi,
      /<link rel="preconnect"[^>]*>/gi,
      /<link rel="preload"[^>]*>/gi,
    ];
    for (const pat of patterns) {
      for (const m of h.matchAll(pat)) {
        headFragments += assetRewrite(m[0]) + '\n';
      }
    }
    // JSON-LD structured data (kann mehrzeilig sein)
    const jsonLd = h.match(/<script type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi);
    if (jsonLd) {
      for (const block of jsonLd) headFragments += block + '\n';
    }
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

  // 12. Prepare dist/static/ for SFTP/CDN (alles was on /)
  const staticDir = path.join(DIST, 'static');
  await fs.rm(staticDir, { recursive: true, force: true });
  await fs.mkdir(staticDir, { recursive: true });
  // Vite-bundled hashed assets
  await copyDir(path.join(VITE_DIST, 'assets'), path.join(staticDir, 'assets'));
  // public/-Inhalte (pietro-hero, akt3-bg, bg-stone, favicon, og-image, gallery/, zutaten/, twint-qr)
  await copyDir(path.join(ROOT, 'public'),      staticDir);
  // Font-Dateien (Vite bundled, aber preload-URLs referenzieren /fonts/ direkt)
  await copyDir(path.join(ROOT, 'src/fonts'),   path.join(staticDir, 'fonts'));
  // NOTE: src/media + src/images werden NICHT mehr kopiert — Vite bundled sie
  // in dist/static/assets/ mit hash. Der duplicate copy verschwendete ~31MB.
  await copyDir(path.join(ROOT, 'api'),          path.join(staticDir, 'api'));

  // 13. Report
  const headSize = (await fs.stat(path.join(DIST, 'head-inject.html'))).size;
  const bodySize = (await fs.stat(path.join(DIST, 'body-inject.html'))).size;
  console.log(`[build] head-inject.html: ${(headSize/1024).toFixed(1)} KB`);
  console.log(`[build] body-inject.html: ${(bodySize/1024).toFixed(1)} KB`);
  console.log(`[build] static assets in ${staticDir}`);
}

// Names to skip in any copyDir recursion. Keeps CDN payload lean.
// _archive / _originals / _ref: source backups, never deployed.
// *.DS_Store / Thumbs.db: OS cruft.
const COPY_SKIP = new Set([
  '_archive', '_originals', '_ref', '_old', '_backup',
  '.DS_Store', 'Thumbs.db', '.gitkeep'
]);

async function copyDir(src, dst) {
  try { await fs.access(src); } catch { return; }
  await fs.mkdir(dst, { recursive: true });
  for (const e of await fs.readdir(src, { withFileTypes: true })) {
    if (COPY_SKIP.has(e.name)) continue;
    const s = path.join(src, e.name);
    const d = path.join(dst, e.name);
    if (e.isDirectory()) await copyDir(s, d);
    else await fs.copyFile(s, d);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
