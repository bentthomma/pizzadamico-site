// Akt 3 · Zutaten-Hero mit animierten Label-Linien.
// Bei Section-Entry zeichnet sich eine Linie von jeder Zutat zu ihrem Label.
// Desktop + Mobile haben eigene Koordinaten (Landscape vs Portrait Bild).

const SVG_NS = 'http://www.w3.org/2000/svg';

// Desktop coords · Ben's iterative corrections: rows moved down, outer ones adjusted
const INGREDIENTS_DESKTOP = [
  { name: 'Basilikum',               dot: [37, 26], label: [28, 14] },
  { name: 'Caputo Rossa Type 00',    dot: [44, 22], label: [44, 4] },
  { name: 'Olivenöl extra vergine',  dot: [60, 22], label: [66, 8] },
  { name: 'San Marzano',             dot: [68, 22], label: [78, 10] },
  { name: 'Peperoni',                dot: [70, 18], label: [88, 8] },
  { name: 'Fior di Latte',           dot: [22, 30], label: [10, 22] },
  { name: 'Knoblauch',               dot: [73, 34], label: [82, 26] },
  { name: 'Zwiebeln',                dot: [74, 36], label: [88, 32] },
  { name: 'Zucchetti',               dot: [24, 48], label: [8, 44] },
  { name: 'Champignons',             dot: [26, 44], label: [14, 38] },
  { name: 'Spinat',                  dot: [39, 42], label: [32, 34] },
  { name: 'Aubergine',               dot: [54, 48], label: [54, 36] },
  { name: 'Paprika',                 dot: [62, 52], label: [68, 44] },
  { name: 'Artischocken',            dot: [80, 54], label: [94, 50] },
  { name: 'Oliven',                  dot: [35, 62], label: [24, 60] },
  { name: 'Kapern',                  dot: [46, 62], label: [44, 56] },
  { name: 'Schinken',                dot: [20, 82], label: [8, 88] },
  { name: 'Salami',                  dot: [28, 82], label: [24, 94] },
  { name: 'Speck',                   dot: [37, 82], label: [37, 95] },
  { name: 'Thunfisch',               dot: [49, 82], label: [50, 95] },
  { name: 'Sardellen',               dot: [57, 82], label: [60, 95] },
  { name: 'Rahm',                    dot: [65, 82], label: [72, 93] },
  { name: 'Gorgonzola',              dot: [73, 82], label: [90, 90] },
];

// Mobile coords · Ben's iterative corrections
const INGREDIENTS_MOBILE = [
  { name: 'Basilikum',           dot: [38, 33], label: [14, 22] },
  { name: 'Caputo Rossa',        dot: [44, 32], label: [78, 16] },
  { name: 'Olivenöl',            dot: [63, 28], label: [94, 20] },
  { name: 'San Marzano',         dot: [80, 27], label: [96, 26] },
  { name: 'Fior di Latte',       dot: [20, 38], label: [6, 32] },
  { name: 'Champignons',         dot: [22, 48], label: [4, 44] },
  { name: 'Spinat',              dot: [36, 46], label: [30, 38] },
  { name: 'Knoblauch',           dot: [68, 43], label: [74, 36] },
  { name: 'Zwiebeln',            dot: [76, 44], label: [92, 40] },
  { name: 'Peperoni',            dot: [78, 33], label: [96, 30] },
  { name: 'Zucchetti',           dot: [18, 52], label: [4, 52] },
  { name: 'Aubergine',           dot: [56, 50], label: [48, 50] },
  { name: 'Paprika',             dot: [64, 52], label: [88, 48] },
  { name: 'Artischocken',        dot: [82, 54], label: [94, 58] },
  { name: 'Oliven',              dot: [30, 62], label: [12, 62] },
  { name: 'Kapern',              dot: [46, 62], label: [60, 58] },
  { name: 'Schinken',            dot: [12, 76], label: [4, 78] },
  { name: 'Salami',              dot: [25, 76], label: [28, 70] },
  { name: 'Speck',               dot: [40, 76], label: [44, 82] },
  { name: 'Thunfisch',           dot: [58, 76], label: [64, 70] },
  { name: 'Sardellen',           dot: [74, 77], label: [92, 72] },
  { name: 'Rahm',                dot: [87, 78], label: [96, 82] },
  { name: 'Gorgonzola',          dot: [62, 88], label: [84, 86] },
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
