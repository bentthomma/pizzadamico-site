// Akt 3 · Zutaten-Grid · 17 Display-Cards (kein Click-Popup mehr)
// Bilder aus public/zutaten/{id}.png (vorgeladen via main.js preloadZutaten).

// Akt-3-only Zutaten (3 Basis-Grundlagen, NICHT im Wizard-Step-5 verfügbar)
const ZUTATEN = [
  { id: 'caputo-rossa', label: 'Caputo Rossa',    hue: 28 },
  { id: 'fior-di-latte', label: 'Fior di Latte',  hue: 50 },
  { id: 'olio-doliva',  label: 'Olio d\u2019Oliva', hue: 60 },
  { id: 'champignons',  label: 'Champignons',  hue: 36 },
  { id: 'zwiebeln',     label: 'Zwiebeln',     hue: 32 },
  { id: 'zucchetti',    label: 'Zucchetti',    hue: 88 },
  { id: 'spinat',       label: 'Spinat',       hue: 108 },
  { id: 'aubergine',    label: 'Aubergine',    hue: 276 },
  { id: 'peperoni',     label: 'Peperoni',     hue: 8 },
  { id: 'artischocken', label: 'Artischocken', hue: 120 },
  { id: 'oliven',       label: 'Oliven',       hue: 78 },
  { id: 'kapern',       label: 'Kapern',       hue: 140 },
  { id: 'knoblauch',    label: 'Knoblauch',    hue: 42 },
  { id: 'schinken',     label: 'Schinken',     hue: 12 },
  { id: 'salami',       label: 'Salami',       hue: 4 },
  { id: 'speck',        label: 'Speck',        hue: 16 },
  { id: 'thunfisch',    label: 'Thunfisch',    hue: 210 },
  { id: 'sardellen',    label: 'Sardellen',    hue: 200 },
  { id: 'rahm',         label: 'Rahm',         hue: 48 },
  { id: 'gorgonzola',   label: 'Gorgonzola',   hue: 44 },
];

function buildCard(z, idx) {
  const wrap = document.createElement('div');
  wrap.className = 'akt-3-card';
  wrap.setAttribute('role', 'listitem');
  wrap.dataset.zutat = z.id;
  wrap.style.setProperty('--reveal-i', String(idx));

  const imgWrap = document.createElement('span');
  imgWrap.className = 'akt-3-card-img';
  imgWrap.style.setProperty('--akt3-hue', String(z.hue));

  const pic = document.createElement('picture');
  const sAvif = document.createElement('source');
  sAvif.srcset = `/zutaten/${z.id}.avif`;
  sAvif.type = 'image/avif';
  const sWebp = document.createElement('source');
  sWebp.srcset = `/zutaten/${z.id}.webp`;
  sWebp.type = 'image/webp';
  const img = document.createElement('img');
  img.src = `/zutaten/${z.id}.png`;
  img.alt = '';
  img.width = 150;
  img.height = 150;
  img.loading = 'eager';
  img.decoding = 'sync';
  pic.append(sAvif, sWebp, img);
  imgWrap.appendChild(pic);

  const name = document.createElement('span');
  name.className = 'akt-3-card-name';
  name.textContent = z.label;

  wrap.appendChild(imgWrap);
  wrap.appendChild(name);

  return wrap;
}

export function initAkt3Zutaten() {
  const grid = document.getElementById('akt-3-grid');
  if (!grid) return;

  const frag = document.createDocumentFragment();
  ZUTATEN.forEach((z, i) => frag.appendChild(buildCard(z, i)));
  grid.appendChild(frag);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.getElementById('akt-3')?.setAttribute('data-revealed', 'true');
    return;
  }

  window.addEventListener('section-settled', (e) => {
    const section = e.detail?.section;
    if (!section || section.id !== 'akt-3') return;
    section.setAttribute('data-revealed', 'true');
  });
}
