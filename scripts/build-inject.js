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
  // 1. Vite production build into dist/vite/ with base='./' (relative).
  await build({
    configFile: path.join(ROOT, 'vite.config.js'),
    base: './',
  });

  // 2. Read built index.html
  const html = await fs.readFile(path.join(VITE_DIST, 'index.html'), 'utf8');

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

  // 5. Rewrite ALL asset URLs to jsDelivr absolute.
  const EXT = 'js|mjs|css|jpg|jpeg|png|webp|avif|gif|svg|woff2|woff|mp4|webm|ogg|ico';
  const PUBLIC_NAMES = 'gallery\\/[^"\'`)\\s]+|zutaten\\/[^"\'`)\\s]+|fonts\\/[^"\'`)\\s]+|api\\/[^"\'`)\\s]+|pietro-hero[^"\'`)\\s]*|akt3-bg[^"\'`)\\s]*|bg-stone[^"\'`)\\s]*|twint-qr[^"\'`)\\s]*|og-image[^"\'`)\\s]*|favicon[-.][^"\'`)\\s]*|apple-touch-icon[^"\'`)\\s]*|site\\.webmanifest|robots\\.txt|sitemap\\.xml';

  const assetRewrite = (s) => {
    let out = s;
    out = out.replace(
      new RegExp(`(["'\`(])(?:\\.{1,2}\\/|\\/(?!\\/))?(assets\\/[A-Za-z0-9_.-]+\\.(?:${EXT}))`, 'g'),
      (_m, pre, file) => `${pre}${BASE}/${file}`
    );
    out = out.replace(
      new RegExp(`(["'\`(])(?:\\.{1,2}\\/|\\/(?!\\/))?([A-Za-z0-9_-]+-[A-Za-z0-9_-]{8,}\\.(?:${EXT}))`, 'g'),
      (_m, pre, file) => `${pre}${BASE}/assets/${file}`
    );
    out = out.replace(
      new RegExp(`(["'\`(])(?:\\.{1,2}\\/|\\/(?!\\/))?(${PUBLIC_NAMES})`, 'g'),
      (_m, pre, rest) => `${pre}${BASE}/${rest}`
    );
    out = out.replace(
      /(["'`])\/(gallery|zutaten|fonts|api|media|images)\//g,
      (_m, q, folder) => `${q}${BASE}/${folder}/`
    );
    return out;
  };
  cssBundle = assetRewrite(cssBundle);
  jsBundle = assetRewrite(jsBundle);

  // 5b. Post-process Vite-chunks auf disk
  const viteAssetsDir = path.join(VITE_DIST, 'assets');
  try {
    const chunkFiles = await fs.readdir(viteAssetsDir);
    for (const f of chunkFiles) {
      if (!/\.(js|css)$/.test(f)) continue;
      const p = path.join(viteAssetsDir, f);
      let content = await fs.readFile(p, 'utf8');
      const original = content;
      const CHUNK_EXT = 'js|mjs|css|jpg|jpeg|png|webp|avif|gif|svg|woff2|woff|mp4|webm|ogg|ico';
      content = content.replace(
        new RegExp(`(["'\`])(?:\\.{1,2}\\/|\\/(?!\\/))?(assets\\/[A-Za-z0-9_.-]+\\.(?:${CHUNK_EXT}))`, 'g'),
        (_m, pre, file) => `${pre}${BASE}/${file}`
      );
      content = content.replace(
        new RegExp(`"\\.\\/([A-Za-z0-9_-]+-[A-Za-z0-9_]{6,}\\.(?:js|mjs|css))"`, 'g'),
        `"${BASE}/assets/$1"`
      );
      content = content.replace(
        new RegExp(`url\\((['"]?)((?:\\.{1,2}\\/|\\/)?(?:assets\\/)?[A-Za-z0-9_.-]+\\.(?:${CHUNK_EXT}))(['"]?)\\)`, 'g'),
        (_m, q1, urlPart, q2) => {
          const clean = urlPart.replace(/^\.{1,2}\//, '').replace(/^\//, '');
          const isHashed = /[A-Za-z0-9_-]+-[A-Za-z0-9_-]{8,}\.[a-z0-9]+$/.test(clean);
          let final;
          if (clean.startsWith('assets/')) final = clean;
          else if (isHashed) final = 'assets/' + clean;
          else final = clean;
          return `url(${q1}${BASE}/${final}${q2})`;
        }
      );
      content = content.replace(
        /(["'`])\/(gallery|zutaten|fonts|api|media|images)\//g,
        (_m, q, folder) => `${q}${BASE}/${folder}/`
      );
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

  // 6. Extract body markup from built index.html
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!bodyMatch) throw new Error('could not extract <body> from built html');
  let bodyMarkup = bodyMatch[1];
  bodyMarkup = bodyMarkup.replace(/<script[^>]*type="module"[^>]*src="\.?\/?assets\/[^"]+\.js"[^>]*><\/script>/g, '');
  bodyMarkup = bodyMarkup.replace(/<link[^>]*rel="modulepreload"[^>]*>/g, '');
  bodyMarkup = assetRewrite(bodyMarkup);

  // 7. Extract head fragments
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
    const jsonLd = h.match(/<script type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi);
    if (jsonLd) {
      for (const block of jsonLd) headFragments += block + '\n';
    }
  }

  // 8. Hoststar-Reset inline
  const resetCss = await fs.readFile(path.join(ROOT, 'src/css/hoststar-reset.css'), 'utf8');

  // 9. Build head-inject.html
  const headInject =
    `<!-- Hoststar-Reset: hide builder wrappers -->\n` +
    `<style data-hoststar-reset>\n${resetCss}\n</style>\n` +
    `${headFragments}` +
    `<style data-damico-styles>\n${cssBundle}\n</style>\n`;

  // 10. Build body-inject.html
  const bodyInject =
    `${bodyMarkup.trim()}\n` +
    `<script type="module" data-damico-app>\n${jsBundle}\n</script>\n`;

  // 11. ASCII-safe encoding: Hoststar inject-fields survive egal welche
  //     Encoding-Interpretation (Windows-1252, Latin-1, UTF-8).
  //     - Script-Inhalte:   \uXXXX
  //     - Style-Inhalte:    \HHHH<space>
  //     - HTML (Rest):      &#xHHHH;
  const headSafe = asciiSafe(headInject);
  const bodySafe = asciiSafe(bodyInject);

  await fs.mkdir(DIST, { recursive: true });
  await fs.writeFile(path.join(DIST, 'head-inject.html'), headSafe, 'utf8');
  await fs.writeFile(path.join(DIST, 'body-inject.html'), bodySafe, 'utf8');

  // 12. Prepare dist/static/ for SFTP/CDN
  const staticDir = path.join(DIST, 'static');
  await fs.rm(staticDir, { recursive: true, force: true });
  await fs.mkdir(staticDir, { recursive: true });
  await copyDir(path.join(VITE_DIST, 'assets'), path.join(staticDir, 'assets'));
  await copyDir(path.join(ROOT, 'public'),      staticDir);
  await copyDir(path.join(ROOT, 'src/fonts'),   path.join(staticDir, 'fonts'));
  await copyDir(path.join(ROOT, 'api'),          path.join(staticDir, 'api'));

  // 13. Report
  const headSize = (await fs.stat(path.join(DIST, 'head-inject.html'))).size;
  const bodySize = (await fs.stat(path.join(DIST, 'body-inject.html'))).size;
  console.log(`[build] head-inject.html: ${(headSize/1024).toFixed(1)} KB`);
  console.log(`[build] body-inject.html: ${(bodySize/1024).toFixed(1)} KB`);
  console.log(`[build] static assets in ${staticDir}`);
}

const COPY_SKIP = new Set([
  '_archive', '_originals', '_ref', '_old', '_backup',
  '.DS_Store', 'Thumbs.db', '.gitkeep'
]);

// Codepoint-aware iteration via for-of handles surrogate pairs.
function asciiHtml(s) {
  let out = '';
  for (const ch of s) {
    const cp = ch.codePointAt(0);
    out += cp < 0x80 ? ch : '&#x' + cp.toString(16) + ';';
  }
  return out;
}
function asciiJs(s) {
  const BS = String.fromCharCode(92); // backslash
  let out = '';
  for (const ch of s) {
    const cp = ch.codePointAt(0);
    if (cp < 0x80) out += ch;
    else if (cp <= 0xffff) out += BS + 'u' + cp.toString(16).padStart(4, '0');
    else out += BS + 'u{' + cp.toString(16) + '}';
  }
  return out;
}
function asciiCss(s) {
  const BS = String.fromCharCode(92);
  let out = '';
  for (const ch of s) {
    const cp = ch.codePointAt(0);
    out += cp < 0x80 ? ch : BS + cp.toString(16) + ' ';
  }
  return out;
}
function asciiSafe(html) {
  const placeholders = [];
  const mark = (block) => {
    placeholders.push(block);
    return '<!--AS_' + (placeholders.length - 1) + '-->';
  };
  html = html.replace(/(<script[^>]*>)([\s\S]*?)(<\/script>)/gi,
    (_m, o, i, cl) => mark(o + asciiJs(i) + cl));
  html = html.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/gi,
    (_m, o, i, cl) => mark(o + asciiCss(i) + cl));
  html = asciiHtml(html);
  html = html.replace(/<!--AS_(\d+)-->/g, (_m, idx) => placeholders[parseInt(idx, 10)]);
  return html;
}

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
