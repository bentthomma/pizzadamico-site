// Akt 3 · Zutaten-Hero mit animierten Label-Linien.
// Bei Section-Entry zeichnet sich eine Linie von jeder Zutat zu ihrem Label.
// Desktop + Mobile haben eigene Koordinaten (Landscape vs Portrait Bild).

const SVG_NS = 'http://www.w3.org/2000/svg';

// Koordinaten korrigiert via MCP-Agent-Audit (16:9 cover crop berücksichtigt)
const INGREDIENTS_DESKTOP = [
  { name: 'Basilikum',               dot: [37, 20], label: [28, 8] },
  { name: 'Caputo Rossa Type 00',    dot: [44, 22], label: [44, 4] },
  { name: 'Olivenöl extra vergine',  dot: [57, 22], label: [64, 8] },
  { name: 'San Marzano',             dot: [68, 22], label: [78, 10] },
  { name: 'Peperoni',                dot: [70, 18], label: [88, 8] },
  { name: 'Fior di Latte',           dot: [18, 30], label: [6, 22] },
  { name: 'Knoblauch',               dot: [71, 30], label: [78, 22] },
  { name: 'Zwiebeln',                dot: [78, 32], label: [92, 28] },
  { name: 'Zucchetti',               dot: [24, 42], label: [8, 38] },
  { name: 'Champignons',             dot: [26, 38], label: [14, 32] },
  { name: 'Spinat',                  dot: [39, 36], label: [32, 28] },
  { name: 'Aubergine',               dot: [51, 42], label: [52, 30] },
  { name: 'Paprika',                 dot: [58, 49], label: [64, 42] },
  { name: 'Artischocken',            dot: [80, 48], label: [94, 46] },
  { name: 'Oliven',                  dot: [39, 56], label: [28, 54] },
  { name: 'Kapern',                  dot: [46, 56], label: [44, 50] },
  { name: 'Schinken',                dot: [20, 75], label: [8, 82] },
  { name: 'Salami',                  dot: [28, 75], label: [24, 90] },
  { name: 'Speck',                   dot: [37, 76], label: [36, 92] },
  { name: 'Thunfisch',               dot: [47, 75], label: [47, 93] },
  { name: 'Sardellen',               dot: [55, 76], label: [56, 93] },
  { name: 'Rahm',                    dot: [63, 75], label: [68, 90] },
  { name: 'Gorgonzola',              dot: [71, 75], label: [88, 86] },
];

// Portrait (Mobile 9:16 · 941×1672) · korrigiert via MCP-Agent-Audit
const INGREDIENTS_MOBILE = [
  { name: 'Basilikum',           dot: [38, 27], label: [14, 18] },
  { name: 'Caputo Rossa',        dot: [44, 32], label: [78, 16] },
  { name: 'Olivenöl',            dot: [60, 28], label: [92, 20] },
  { name: 'San Marzano',         dot: [80, 27], label: [96, 26] },
  { name: 'Fior di Latte',       dot: [16, 38], label: [4, 32] },
  { name: 'Champignons',         dot: [22, 43], label: [4, 40] },
  { name: 'Spinat',              dot: [36, 41], label: [32, 34] },
  { name: 'Knoblauch',           dot: [66, 39], label: [68, 32] },
  { name: 'Zwiebeln',            dot: [80, 40], label: [96, 36] },
  { name: 'Peperoni',            dot: [78, 33], label: [96, 30] },
  { name: 'Zucchetti',           dot: [18, 47], label: [4, 48] },
  { name: 'Aubergine',           dot: [54, 45], label: [36, 46] },
  { name: 'Paprika',             dot: [60, 49], label: [72, 44] },
  { name: 'Artischocken',        dot: [82, 50], label: [94, 52] },
  { name: 'Oliven',              dot: [34, 56], label: [16, 56] },
  { name: 'Kapern',              dot: [46, 56], label: [56, 52] },
  { name: 'Schinken',            dot: [12, 70], label: [4, 68] },
  { name: 'Salami',              dot: [25, 70], label: [28, 64] },
  { name: 'Speck',               dot: [40, 70], label: [44, 76] },
  { name: 'Thunfisch',           dot: [56, 70], label: [60, 64] },
  { name: 'Sardellen',           dot: [72, 71], label: [88, 66] },
  { name: 'Rahm',                dot: [85, 72], label: [96, 72] },
  { name: 'Gorgonzola',          dot: [60, 82], label: [82, 82] },
];

function isMobile() {
  return window.matchMedia('(max-width: 899px)').matches;
}

function buildLabeledHero(container, ingredients) {
  const svg = container.querySelector('.labels-svg');
  const textLayer = container.querySelector('.labels-text');
  if (!svg || !textLayer) return;

  // Clear previous content (falls umbau)
  svg.replaceChildren();
  textLayer.replaceChildren();

  ingredients.forEach((ing, i) => {
    const g = document.createElementNS(SVG_NS, 'g');
    g.classList.add('ing-group');
    g.dataset.i = String(i);

    const dot = document.createElementNS(SVG_NS, 'circle');
    dot.setAttribute('cx', String(ing.dot[0]));
    dot.setAttribute('cy', String(ing.dot[1]));
    dot.setAttribute('r', '0.55');
    dot.classList.add('ing-dot');

    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', String(ing.dot[0]));
    line.setAttribute('y1', String(ing.dot[1]));
    line.setAttribute('x2', String(ing.label[0]));
    line.setAttribute('y2', String(ing.label[1]));
    line.setAttribute('pathLength', '1');
    line.setAttribute('vector-effect', 'non-scaling-stroke');
    line.classList.add('ing-line');

    g.append(dot, line);
    svg.appendChild(g);

    const txt = document.createElement('span');
    txt.textContent = ing.name;
    txt.classList.add('ing-text');
    txt.dataset.i = String(i);
    txt.style.left = ing.label[0] + '%';
    txt.style.top = ing.label[1] + '%';
    // Edge-align: labels nahe linkem Rand links-bündig, nahe rechtem rechts-bündig
    if (ing.label[0] < 15) txt.dataset.align = 'left';
    else if (ing.label[0] > 85) txt.dataset.align = 'right';
    textLayer.appendChild(txt);
  });
}

function revealIngredients(container) {
  if (container.dataset.revealed === 'true') return;
  container.dataset.revealed = 'true';

  const dots = container.querySelectorAll('.ing-dot');
  const lines = container.querySelectorAll('.ing-line');
  const texts = container.querySelectorAll('.ing-text');

  const STAGGER = 90;  // ms pro ingredient

  dots.forEach((dot, i) => {
    const delay = i * STAGGER;
    setTimeout(() => dot.classList.add('in'), delay);
    setTimeout(() => lines[i].classList.add('in'), delay + 80);
    setTimeout(() => texts[i].classList.add('in'), delay + 400);
  });
}

export function initAkt3Zutaten() {
  const container = document.getElementById('akt-3-labeled');
  if (!container) return;

  const ingredients = isMobile() ? INGREDIENTS_MOBILE : INGREDIENTS_DESKTOP;
  buildLabeledHero(container, ingredients);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Show everything immediately
    container.querySelectorAll('.ing-dot, .ing-line, .ing-text').forEach(el => el.classList.add('in'));
    return;
  }

  const obs = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        revealIngredients(entry.target);
        obs.unobserve(entry.target);
      }
    }
  }, { threshold: 0.25, rootMargin: '0px 0px -10% 0px' });

  // If section already visible on load, reveal immediately
  const rect = container.getBoundingClientRect();
  if (rect.top < window.innerHeight && rect.bottom > 0) {
    revealIngredients(container);
  } else {
    obs.observe(container);
  }

  // Rebuild on viewport-class change (desktop ↔ mobile)
  let wasMobile = isMobile();
  window.addEventListener('resize', () => {
    const nowMobile = isMobile();
    if (nowMobile !== wasMobile) {
      wasMobile = nowMobile;
      container.dataset.revealed = '';
      buildLabeledHero(container, nowMobile ? INGREDIENTS_MOBILE : INGREDIENTS_DESKTOP);
      revealIngredients(container);
    }
  });
}
