// Akt 3 · Zutaten-Grid · 17 Cards mit Click-to-Detail-Modal
// Bilder aus public/zutaten/{id}.png (vorgeladen via main.js preloadZutaten).

const ZUTATEN = [
  { id: 'champignons',  label: 'Champignons',  hue: 36,  description: 'Weisse Champignons, kurz angebraten mit Knoblauch und Olivenöl. Erdiges Aroma, fleischige Textur — funktioniert klassisch zu Salami oder puristisch mit Mozzarella und Thymian.' },
  { id: 'zwiebeln',     label: 'Zwiebeln',     hue: 32,  description: 'Rote Zwiebeln dünn geschnitten. Beim Backen verlieren sie die Schärfe und werden süss — die stille Basis unter allem was gut wird.' },
  { id: 'zucchetti',    label: 'Zucchetti',    hue: 88,  description: 'Feine Scheiben, al dente, mit etwas Salz. Sommerlich, leicht, hält die Pizza im Gleichgewicht wenn alles andere kräftig ist.' },
  { id: 'spinat',       label: 'Spinat',       hue: 108, description: 'Frischer Baby-Spinat, auf die heisse Pizza gelegt. Verdichtet leicht, mineralische Note — besonders gut mit Fior di Latte und Speck.' },
  { id: 'aubergine',    label: 'Aubergine',    hue: 276, description: 'In Olivenöl angebraten. Seidig, mediterran. Mein Klassiker: Aubergine, Tomate, Basilikum — ein Sommer in drei Zutaten.' },
  { id: 'peperoni',     label: 'Peperoni',     hue: 8,   description: 'Rote und grüne Streifen, leicht rauchig vom Ofen. Süss-würzig — die Peperoni bringt Farbe und Tiefe ohne zu dominieren.' },
  { id: 'artischocken', label: 'Artischocken', hue: 120, description: 'Eingelegte Herzen aus Süditalien. Leicht bitter, kräftig aromatisch. Für Leute die wissen was sie wollen.' },
  { id: 'oliven',       label: 'Oliven',       hue: 78,  description: 'Schwarze Taggiasca aus Ligurien. Fruchtig, weniger salzig als die grossen grünen. Perfekt entkernt — keine Überraschung beim Beissen.' },
  { id: 'kapern',       label: 'Kapern',       hue: 140, description: 'Kleine Pantelleria-Kapern in Salz. Scharf-pointierte Säure — ein paar reichen. Klassiker auf Pizza alla Napoletana.' },
  { id: 'knoblauch',    label: 'Knoblauch',    hue: 42,  description: 'Hauchdünne Scheiben, geröstet im Holzofen. Karamellisiert statt scharf. Italiener nennen es aglio a specchio — gespiegelter Knoblauch.' },
  { id: 'schinken',     label: 'Schinken',     hue: 12,  description: 'Prosciutto cotto aus Parma. Mild, rosa. Kommt nach dem Backen auf die heisse Pizza — so bleibt er saftig und zart.' },
  { id: 'salami',       label: 'Salami',       hue: 4,   description: 'Milanese, fein geschnitten. Fleischig-würzig, nicht zu scharf. Backt leicht knusprig — Fett läuft in den Käse, macht alles besser.' },
  { id: 'speck',        label: 'Speck',        hue: 16,  description: 'Südtiroler Räucherspeck. Knusprig, rauchig, intensiv. Funktioniert auf Pizza Bianca mit Zwiebeln oder auf der klassischen mit Pilzen.' },
  { id: 'thunfisch',    label: 'Thunfisch',    hue: 210, description: 'Thunfisch in Olivenöl, grob zerpflückt. Pizza Napoletana Classic: Tomate, Thunfisch, Zwiebeln — einfach und zeitlos.' },
  { id: 'sardellen',    label: 'Sardellen',    hue: 200, description: 'Acciughe del Cantabrico. Salzig, tief, umami. Polarisierend — liebst du sie, oder gar nicht. Wer sie mag, will sie immer.' },
  { id: 'rahm',         label: 'Rahm',         hue: 48,  description: 'Fior di Latte leicht mit Rahm verrührt. Cremige Basis statt klassischer Tomate — geht besonders zu Spinat, Speck oder Pilzen.' },
  { id: 'gorgonzola',   label: 'Gorgonzola',   hue: 44,  description: 'Blauschimmel aus der Lombardei, süss-dolce Variante. Schmilzt cremig — Kombi mit Birne und Walnüssen ist ein Experiment das aufgeht.' },
];

function buildCard(z, idx) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'akt-3-card';
  btn.dataset.zutat = z.id;
  btn.setAttribute('aria-label', `${z.label} — Details öffnen`);
  btn.style.setProperty('--reveal-i', String(idx));

  const imgWrap = document.createElement('span');
  imgWrap.className = 'akt-3-card-img';
  imgWrap.style.setProperty('--akt3-hue', String(z.hue));

  const img = document.createElement('img');
  img.src = `/zutaten/${z.id}.png`;
  img.alt = '';
  img.width = 150;
  img.height = 150;
  img.loading = 'eager';
  img.decoding = 'sync';
  imgWrap.appendChild(img);

  const name = document.createElement('span');
  name.className = 'akt-3-card-name';
  name.textContent = z.label;

  btn.appendChild(imgWrap);
  btn.appendChild(name);

  btn.addEventListener('click', () => openZutatModal(z));

  return btn;
}

function openZutatModal(z) {
  const modal = document.getElementById('modal-zutat');
  const titleEl = document.getElementById('modal-zutat-title');
  const imgWrap = document.getElementById('zutat-modal-img');
  const descEl = document.getElementById('zutat-modal-desc');
  if (!modal || !titleEl || !imgWrap || !descEl) return;

  titleEl.textContent = z.label;
  imgWrap.style.setProperty('--zutat-hue', String(z.hue));

  // Clear + build image safely (no innerHTML)
  while (imgWrap.firstChild) imgWrap.removeChild(imgWrap.firstChild);
  const img = document.createElement('img');
  img.src = `/zutaten/${z.id}.png`;
  img.alt = z.label;
  img.width = 200;
  img.height = 200;
  img.loading = 'eager';
  img.decoding = 'sync';
  imgWrap.appendChild(img);

  descEl.textContent = z.description;

  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => {
    modal.querySelector('.site-modal-close')?.focus();
  });
}

export function initAkt3Zutaten() {
  const grid = document.getElementById('akt-3-grid');
  if (!grid) return;

  // Render cards once
  const frag = document.createDocumentFragment();
  ZUTATEN.forEach((z, i) => frag.appendChild(buildCard(z, i)));
  grid.appendChild(frag);

  // Reveal-Trigger: section-settled (bleibend gesetzt via data-revealed)
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
