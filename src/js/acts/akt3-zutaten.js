// Akt 3 · Zutaten-Hero mit animierten Label-Linien.
// Bei Section-Entry zeichnet sich eine Linie von jeder Zutat zu ihrem Label.
// Desktop + Mobile haben eigene Koordinaten (Landscape vs Portrait Bild).

const SVG_NS = 'http://www.w3.org/2000/svg';

// Koordinaten: [x%, y%] auf dem Bild (0-100)
// Für das 16:9 Desktop-Bild (1672×941) — Zutaten zentral konzentriert, ränder dunkel
const INGREDIENTS_DESKTOP = [
  { name: 'Basilikum',               dot: [32, 16], label: [24, 6] },
  { name: 'Caputo Rossa Type 00',    dot: [47, 22], label: [47, 4] },
  { name: 'Olivenöl extra vergine',  dot: [55, 16], label: [66, 6] },
  { name: 'San Marzano',             dot: [63, 20], label: [76, 9] },
  { name: 'Peperoni',                dot: [66, 13], label: [88, 6] },
  { name: 'Fior di Latte',           dot: [22, 24], label: [8, 18] },
  { name: 'Knoblauch',               dot: [60, 28], label: [70, 22] },
  { name: 'Zwiebeln',                dot: [69, 31], label: [88, 26] },
  { name: 'Zucchetti',               dot: [24, 39], label: [8, 32] },
  { name: 'Champignons',             dot: [28, 30], label: [14, 26] },
  { name: 'Spinat',                  dot: [38, 30], label: [30, 24] },
  { name: 'Aubergine',               dot: [47, 36], label: [48, 24] },
  { name: 'Paprika',                 dot: [54, 40], label: [59, 32] },
  { name: 'Artischocken',            dot: [72, 40], label: [92, 38] },
  { name: 'Oliven',                  dot: [38, 52], label: [26, 48] },
  { name: 'Kapern',                  dot: [45, 52], label: [44, 44] },
  { name: 'Schinken',                dot: [22, 68], label: [8, 76] },
  { name: 'Salami',                  dot: [29, 70], label: [22, 84] },
  { name: 'Speck',                   dot: [37, 70], label: [36, 86] },
  { name: 'Thunfisch',               dot: [47, 70], label: [47, 87] },
  { name: 'Sardellen',               dot: [55, 72], label: [56, 87] },
  { name: 'Rahm',                    dot: [61, 72], label: [68, 85] },
  { name: 'Gorgonzola',              dot: [69, 72], label: [88, 82] },
];

// Portrait-Layout (Mobile 9:16 · 941×1672)
const INGREDIENTS_MOBILE = [
  { name: 'Basilikum',           dot: [34, 17], label: [14, 10] },
  { name: 'Caputo Rossa',        dot: [46, 22], label: [78, 10] },
  { name: 'Olivenöl',            dot: [60, 18], label: [92, 14] },
  { name: 'San Marzano',         dot: [74, 20], label: [96, 20] },
  { name: 'Fior di Latte',       dot: [18, 24], label: [4, 22] },
  { name: 'Champignons',         dot: [22, 32], label: [4, 32] },
  { name: 'Spinat',              dot: [36, 30], label: [32, 26] },
  { name: 'Knoblauch',           dot: [62, 28], label: [68, 24] },
  { name: 'Zwiebeln',            dot: [72, 30], label: [96, 28] },
  { name: 'Peperoni',            dot: [68, 26], label: [96, 24] },
  { name: 'Zucchetti',           dot: [16, 38], label: [4, 40] },
  { name: 'Aubergine',           dot: [46, 36], label: [36, 40] },
  { name: 'Paprika',             dot: [60, 38], label: [72, 34] },
  { name: 'Artischocken',        dot: [78, 38], label: [94, 40] },
  { name: 'Oliven',              dot: [32, 48], label: [16, 48] },
  { name: 'Kapern',              dot: [46, 48], label: [56, 44] },
  { name: 'Schinken',            dot: [14, 60], label: [4, 62] },
  { name: 'Salami',              dot: [28, 60], label: [30, 56] },
  { name: 'Speck',               dot: [44, 60], label: [46, 66] },
  { name: 'Thunfisch',           dot: [60, 62], label: [66, 56] },
  { name: 'Sardellen',           dot: [76, 64], label: [92, 62] },
  { name: 'Rahm',                dot: [80, 68], label: [96, 70] },
  { name: 'Gorgonzola',          dot: [50, 80], label: [82, 80] },
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
