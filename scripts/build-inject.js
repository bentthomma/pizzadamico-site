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
  // 1. Vite production build into dist/vite/ — mit base='./' (relative).
  //    Vite's Preload-Helper nutzt dann import.meta.url als base → resolved
  //    relativ zur Chunk-URL (jsDelivr wenn chunk von dort kommt). Keine "/" prefixes,
  //    keine Pfad-Sprünge. Funktioniert sowohl auf Vercel als auch auf Hoststar.
  await build({
    configFile: path.join(ROOT, 'vite.config.js'),
    base: './',
  });

  // 2. Read built index.html
  const html = await fs.readFile(path.join(VITE_DIST, 'index.html'), 'utf8');

  // Mit base='./' nutzt Vite Pfade wie "./assets/name.js" (relativ zur HTML-Location).
  // Wir konvertieren via regex zu local paths für den inline-Read.

  // 3. Collect all bundled CSS files referenced in <link rel="stylesheet">
  const cssLinkRe = /<link rel="stylesheet"[^>]*href="\.?\/?(assets\/[^"]+\.css)"[^>]*>/g;
  const cssPaths = [...html.matchAll(cssLinkRe)].map((m) => m[1]);
  let cssBundle = '';
  for (const p of cssPaths) {
    cssBundle += await fs.readFile(path.join(VITE_DIST, p), 'utf8') + '\n';
  }

  // 4. Collect all bundled JS (entry + any chunks referenced as type=module or modulepreload)
  const jsRe = /<(?:script[^>]*src|link[^>]*(?:rel="modulepreload"[^>]*href|href[^>]*rel="modulepreload"))="\.?\/?(assets\/[^"]+\.js)"[^>]*>/g;
  const jsPaths = [...html.matchAll(jsRe)].map((m) => m[1]);
  const uniqueJsPaths = Array.from(new Set(jsPaths));
  const entryMatch = [...html.matchAll(/<script[^>]*type="module"[^>]*src="\.?\/?(assets\/[^"]+\.js)"[^>]*>/g)].map((m) => m[1]);
  const entryJs = entryMatch[entryMatch.length - 1] || null;
  const orderedJs = [...uniqueJsPaths.filter((p) => p !== entryJs), ...(entryJs ? [entryJs] : [])];

  let jsBundle = '';
  for (const p of orderedJs) {
    jsBundle += await fs.readFile(path.join(VITE_DIST, p), 'utf8') + '\n';
  }

  // 5. Rewrite ALLE asset URLs → jsDelivr absolute.
  //    Handhabt ALLE Prefix-Varianten: "./", "../", "/", keinen prefix.
  //    Handhabt ALLE Asset-Types (js/css/bilder/fonts/video).
  const EXT = 'js|mjs|css|jpg|jpeg|png|webp|avif|gif|svg|woff2|woff|mp4|webm|ogg|ico';
  const PUBLIC_NAMES = 'gallery\\/[^"\'`)\\s]+|zutaten\\/[^"\'`)\\s]+|fonts\\/[^"\'`)\\s]+|api\\/[^"\'`)\\s]+|pietro-hero[^"\'`)\\s]*|akt3-bg[^"\'`)\\s]*|bg-stone[^"\'`)\\s]*|twint-qr[^"\'`)\\s]*|og-image[^"\'`)\\s]*|favicon[-.][^"\'`)\\s]*|apple-touch-icon[^"\'`)\\s]*|site\\.webmanifest|robots\\.txt|sitemap\\.xml';

  const assetRewrite = (s) => {
    let out = s;
    // 1. assets/name.ext — mit optionalem prefix "./", "../", "/", oder ohne
    out = out.replace(
      new RegExp(`(["'\`(])(?:\\.{1,2}\\/|\\/(?!\\/))?(assets\\/[A-Za-z0-9_.-]+\\.(?:${EXT}))`, 'g'),
      (_m, pre, file) => `${pre}${BASE}/${file}`
    );
    // 2. Hashed chunks ohne assets/-prefix: "./name-HASH.ext" oder "url(./name-HASH.ext)"
    //    Hash required (min 8 chars incl. hyphen — Vite hashes können "-" enthalten).
    //    Vor PUBLIC_NAMES ausgeführt damit favicon-32.png (kein echter hash) nicht gematcht wird.
    out = out.replace(
      new RegExp(`(["'\`(])(?:\\.{1,2}\\/|\\/(?!\\/))?([A-Za-z0-9_-]+-[A-Za-z0-9_-]{8,}\\.(?:${EXT}))`, 'g'),
      (_m, pre, file) => `${pre}${BASE}/assets/${file}`
    );
    // 3. Public assets — mit prefix "./", "../", "/", oder ohne
    out = out.replace(
      new RegExp(`(["'\`(])(?:\\.{1,2}\\/|\\/(?!\\/))?(${PUBLIC_NAMES})`, 'g'),
      (_m, pre, rest) => `${pre}${BASE}/${rest}`
    );
    // 4. Partial path prefixes für template-literals: "/gallery/", "/zutaten/" etc.
    //    Vite splittet template-literals (`/zutaten/${id}.avif`) in string-parts.
    //    Match "/folder/" als partial string — wird zu "https://cdn.../folder/" rewritten,
    //    dann setzt JS-concat die id + extension dran.
    out = out.replace(
      /(["'`])\/(gallery|zutaten|fonts|api|media|images)\//g,
      (_m, q, folder) => `${q}${BASE}/${folder}/`
    );
    return out;
  };
  cssBundle = assetRewrite(cssBundle);
  jsBundle = assetRewrite(jsBundle);

  // 5b. Post-process Vite-chunks auf disk: preload-manifest + dynamic-imports
  //     müssen innerhalb der chunk-files auch absolute URLs sein (weil chunks
  //     von jsDelivr laufen und ihre eigenen preload() helpers ausführen).
  const viteAssetsDir = path.join(VITE_DIST, 'assets');
  try {
    const chunkFiles = await fs.readdir(viteAssetsDir);
    for (const f of chunkFiles) {
      if (!/\.(js|css)$/.test(f)) continue;
      const p = path.join(viteAssetsDir, f);
      let content = await fs.readFile(p, 'utf8');
      const original = content;
      // Alle ext + alle prefix-varianten via assetRewrite-ähnliche logic
      const CHUNK_EXT = 'js|mjs|css|jpg|jpeg|png|webp|avif|gif|svg|woff2|woff|mp4|webm|ogg|ico';
      // "assets/name.ext" mit optionalem ./ ../ / prefix
      content = content.replace(
        new RegExp(`(["'\`])(?:\\.{1,2}\\/|\\/(?!\\/))?(assets\\/[A-Za-z0-9_.-]+\\.(?:${CHUNK_EXT}))`, 'g'),
        (_m, pre, file) => `${pre}${BASE}/${file}`
      );
      // Hashed chunk imports OHNE assets/ prefix: "./name-HASH.ext"
      content = content.replace(
        new RegExp(`"\\.\\/([A-Za-z0-9_-]+-[A-Za-z0-9_]{6,}\\.(?:js|mjs|css))"`, 'g'),
        `"${BASE}/assets/$1"`
      );
      // CSS url() — alle prefix-varianten, file in assets/ oder root (public)
      content = content.replace(
        new RegExp(`url\\((['"]?)((?:\\.{1,2}\\/|\\/)?(?:assets\\/)?[A-Za-z0-9_.-]+\\.(?:${CHUNK_EXT}))(['"]?)\\)`, 'g'),
        (_m, q1, urlPart, q2) => {
          // Strip prefix (./, ../, /)
          const clean = urlPart.replace(/^\.{1,2}\//, '').replace(/^\//, '');
          // Hashed file? (Vite: name-HASH.ext with 8+ char hash)
          const isHashed = /[A-Za-z0-9_-]+-[A-Za-z0-9_-]{8,}\.[a-z0-9]+$/.test(clean);
          // Bereits assets/ prefix? → leave. Hashed ohne prefix? → prepend assets/. Public plain name? → keep at root.
          let final;
          if (clean.startsWith('assets/')) final = clean;
          else if (isHashed) final = 'assets/' + clean;
          else final = clean;
          return `url(${q1}${BASE}/${final}${q2})`;
        }
      );
      // PARTIAL public-folder paths: template-literals `/zutaten/${id}.avif`, `/gallery/...` etc.
      // Matches "/folder/" OR `/folder/` (inkl. backtick für template-literals).
      // Wird zu "https://cdn.jsdelivr.net/.../folder/" → string-concat tail funktioniert.
      content = content.replace(
        /(["'`])\/(gallery|zutaten|fonts|api|media|images)\//g,
        (_m, q, folder) => `${q}${BASE}/${folder}/`
      );
      // Partial public single-file paths: `/twint-qr.png`, `/favicon.svg` in template-literals
      const PUBLIC_FILES = 'twint-qr\\.[a-z]+|pietro-hero\\.[a-z]+|bg-stone\\.[a-z]+|akt3-bg\\.[a-z]+|og-image\\.[a-z]+|favicon(?:-\\d+)?\\.[a-z]+|apple-touch-icon\\.[a-z]+|site\\.webmanifest|robots\\.txt|sitemap\\.xml';
      content = content.replace(
        new RegExp(`(["'\`])\\/(${PUBLIC_FILES})`, 'g'),
        (_m, q, file) => `${q}${BASE}/${file}`
      );
      if (content !== original) await fs.writeFile(p, content, 'utf8');
    }
  } catch (err) {
    console.warn('[build] chunk post-process warning:', err.message);
  }

  // 6. Extract body markup (main/pill/modal) from built index.html
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!bodyMatch) throw new Error('could not extract <body> from built html');
  let bodyMarkup = bodyMatch[1];
  bodyMarkup = bodyMarkup.replace(/<script[^>]*type="module"[^>]*src="\.?\/?assets\/[^"]+\.js"[^>]*><\/script>/g, '');
  bodyMarkup = bodyMarkup.replace(/<link[^>]*rel="modulepreload"[^>]*>/g, '');
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
