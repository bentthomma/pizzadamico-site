// Akt 3 · Zutaten-Hero mit animierten Label-Linien.
// Bei Section-Entry zeichnet sich eine Linie von jeder Zutat zu ihrem Label.
// Desktop + Mobile haben eigene Koordinaten (Landscape vs Portrait Bild).

const SVG_NS = 'http://www.w3.org/2000/svg';

// Koordinaten: [x%, y%] auf dem Bild (0-100)
// dot = Zutat-Position im Bild · label = Text-Position
const INGREDIENTS_DESKTOP = [
  { name: 'Basilikum',               dot: [30, 28], label: [28, 12] },
  { name: 'Caputo Rossa Type 00',    dot: [44, 33], label: [44, 8] },
  { name: 'Olivenöl extra vergine',  dot: [55, 27], label: [60, 10] },
  { name: 'San Marzano',             dot: [66, 32], label: [70, 15] },
  { name: 'Peperoni',                dot: [72, 26], label: [88, 14] },
  { name: 'Fior di Latte',           dot: [14, 38], label: [6, 28] },
  { name: 'Knoblauch',               dot: [64, 39], label: [72, 32] },
  { name: 'Zwiebeln',                dot: [75, 43], label: [90, 34] },
  { name: 'Zucchetti',               dot: [10, 52], label: [4, 44] },
  { name: 'Champignons',             dot: [22, 46], label: [12, 39] },
  { name: 'Spinat',                  dot: [34, 46], label: [28, 40] },
  { name: 'Aubergine',               dot: [48, 52], label: [50, 40] },
  { name: 'Paprika',                 dot: [56, 49], label: [61, 42] },
  { name: 'Artischocken',            dot: [80, 50], label: [92, 46] },
  { name: 'Oliven',                  dot: [33, 60], label: [24, 56] },
  { name: 'Kapern',                  dot: [43, 62], label: [42, 55] },
  { name: 'Schinken',                dot: [10, 73], label: [4, 80] },
  { name: 'Salami',                  dot: [22, 74], label: [17, 84] },
  { name: 'Speck',                   dot: [35, 74], label: [35, 86] },
  { name: 'Thunfisch',               dot: [51, 74], label: [52, 86] },
  { name: 'Sardellen',               dot: [62, 76], label: [66, 88] },
  { name: 'Rahm',                    dot: [70, 74], label: [78, 84] },
  { name: 'Gorgonzola',              dot: [79, 74], label: [90, 82] },
];

// Portrait-Layout (Mobile) — Zutaten neu arrangiert auf schmalerem Bild
const INGREDIENTS_MOBILE = [
  { name: 'Caputo Rossa',        dot: [46, 12], label: [78, 7] },
  { name: 'Olivenöl',            dot: [62, 10], label: [92, 12] },
  { name: 'Basilikum',           dot: [36, 15], label: [8, 8] },
  { name: 'San Marzano',         dot: [72, 16], label: [92, 20] },
  { name: 'Fior di Latte',       dot: [16, 18], label: [4, 18] },
  { name: 'Champignons',         dot: [22, 25], label: [4, 28] },
  { name: 'Spinat',              dot: [38, 23], label: [32, 30] },
  { name: 'Knoblauch',           dot: [58, 22], label: [66, 28] },
  { name: 'Zwiebeln',            dot: [68, 25], label: [92, 30] },
  { name: 'Zucchetti',           dot: [14, 35], label: [4, 38] },
  { name: 'Aubergine',           dot: [36, 36], label: [46, 40] },
  { name: 'Paprika',             dot: [54, 34], label: [68, 38] },
  { name: 'Artischocken',        dot: [70, 40], label: [88, 44] },
  { name: 'Oliven',              dot: [22, 50], label: [4, 50] },
  { name: 'Kapern',              dot: [36, 51], label: [48, 48] },
  { name: 'Schinken',            dot: [22, 62], label: [4, 64] },
  { name: 'Salami',              dot: [42, 62], label: [44, 58] },
  { name: 'Speck',               dot: [62, 62], label: [84, 60] },
  { name: 'Thunfisch',           dot: [24, 74], label: [4, 78] },
  { name: 'Sardellen',           dot: [42, 75], label: [44, 70] },
  { name: 'Rahm',                dot: [60, 74], label: [84, 78] },
  { name: 'Gorgonzola',          dot: [42, 88], label: [48, 94] },
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
