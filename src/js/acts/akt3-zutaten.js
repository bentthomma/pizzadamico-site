// Akt 3 · Zutaten-Hero mit animierten Label-Linien.
// Bei Section-Entry zeichnet sich eine Linie von jeder Zutat zu ihrem Label.
// Desktop + Mobile haben eigene Koordinaten (Landscape vs Portrait Bild).

const SVG_NS = 'http://www.w3.org/2000/svg';

// Desktop coords · iterative corrections
const INGREDIENTS_DESKTOP = [
  { name: 'Basilikum',               dot: [37, 26], label: [28, 14] },
  { name: 'Caputo Rossa Type 00',    dot: [44, 22], label: [44, 4] },
  { name: 'Olivenöl extra vergine',  dot: [60, 22], label: [66, 8] },
  { name: 'Tomaten San Marzano',     dot: [68, 22], label: [76, 10] },
  { name: 'Peperoni',                dot: [60, 46], label: [48, 50] },
  { name: 'Fior di Latte',           dot: [22, 30], label: [10, 22] },
  { name: 'Knoblauch',               dot: [75, 38], label: [86, 28] },
  { name: 'Zwiebeln',                dot: [74, 40], label: [88, 36] },
  { name: 'Zucchetti',               dot: [24, 52], label: [8, 48] },
  { name: 'Champignons',             dot: [26, 48], label: [14, 42] },
  { name: 'Spinat',                  dot: [39, 46], label: [32, 38] },
  { name: 'Aubergine',               dot: [54, 48], label: [54, 36] },
  { name: 'Paprika',                 dot: [72, 52], label: [88, 46] },
  { name: 'Artischocken',            dot: [82, 54], label: [94, 50] },
  { name: 'Oliven',                  dot: [32, 66], label: [20, 64] },
  { name: 'Kapern',                  dot: [46, 66], label: [42, 60] },
  { name: 'Schinken',                dot: [20, 86], label: [8, 92] },
  { name: 'Salami',                  dot: [28, 86], label: [24, 96] },
  { name: 'Speck',                   dot: [37, 86], label: [37, 97] },
  { name: 'Thunfisch',               dot: [49, 86], label: [50, 97] },
  { name: 'Sardellen',               dot: [58, 86], label: [62, 97] },
  { name: 'Rahm',                    dot: [67, 86], label: [76, 95] },
  { name: 'Gorgonzola',              dot: [76, 86], label: [94, 93] },
];

// Mobile coords · iterative corrections
const INGREDIENTS_MOBILE = [
  { name: 'Basilikum',           dot: [38, 33], label: [14, 22] },
  { name: 'Caputo Rossa',        dot: [44, 32], label: [78, 16] },
  { name: 'Olivenöl',            dot: [63, 28], label: [94, 20] },
  { name: 'Tomaten San Marzano', dot: [80, 27], label: [96, 22] },
  { name: 'Fior di Latte',       dot: [22, 38], label: [6, 32] },
  { name: 'Champignons',         dot: [22, 52], label: [4, 48] },
  { name: 'Spinat',              dot: [36, 50], label: [28, 42] },
  { name: 'Knoblauch',           dot: [72, 48], label: [86, 42] },
  { name: 'Zwiebeln',            dot: [76, 48], label: [92, 46] },
  { name: 'Peperoni',            dot: [50, 58], label: [42, 58] },
  { name: 'Zucchetti',           dot: [18, 56], label: [4, 56] },
  { name: 'Aubergine',           dot: [56, 54], label: [48, 52] },
  { name: 'Paprika',             dot: [68, 58], label: [88, 54] },
  { name: 'Artischocken',        dot: [82, 56], label: [94, 60] },
  { name: 'Oliven',              dot: [30, 66], label: [12, 66] },
  { name: 'Kapern',              dot: [46, 66], label: [60, 62] },
  { name: 'Schinken',            dot: [12, 78], label: [4, 80] },
  { name: 'Salami',              dot: [25, 78], label: [28, 72] },
  { name: 'Speck',               dot: [40, 78], label: [44, 84] },
  { name: 'Thunfisch',           dot: [58, 80], label: [64, 74] },
  { name: 'Sardellen',           dot: [76, 80], label: [94, 76] },
  { name: 'Rahm',                dot: [89, 82], label: [96, 84] },
  { name: 'Gorgonzola',          dot: [66, 90], label: [90, 88] },
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
