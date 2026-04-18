// Akt 3 · Zutaten · Art-directed landscape + portrait images
// Both use preserveAspectRatio="xMidYMid meet" (contain) + blur-extension backgrounds.
// Matching image aspect to viewport orientation → minimal letterbox, maximal image size.
const SVG_NS = 'http://www.w3.org/2000/svg';

const DESKTOP_W = 1672, DESKTOP_H = 941;
// Fields: dot [x%,y%] · label [x%,y%] · textOffset [dx%,dy%] verschiebt nur Text
// Optional: lineAngle (0=rechts, 90=unten, 180=links, 270=oben) + lineLength (% of imgW)
const INGREDIENTS_DESKTOP = [
  { name: 'Basilikum',               dot: [37, 28], label: [30, 18], textOffset: [0, -1] },
  { name: 'Caputo Rossa 00',         dot: [45, 25], label: [35, 10], textOffset: [0, -1] },
  { name: 'Olivenöl extra vergine',  dot: [60, 22], label: [75, 10], textOffset: [0, -1] },
  { name: 'Tomaten San Marzano',     dot: [80, 28], label: [90, 18], textOffset: [9, -1] },
  { name: 'Peperoni',                dot: [66, 62], label: [56, 72], textOffset: [0, 1] },
  { name: 'Fior di Latte',           dot: [24, 32], label: [12, 20], textOffset: [-5, -1] },
  { name: 'Knoblauch',               dot: [84, 38], label: [93, 30], textOffset: [4, -1] },
  { name: 'Zwiebeln',                dot: [78, 44], label: [90, 44], textOffset: [7.5, 0.5] },
  { name: 'Zucchetti',               dot: [28, 60], label: [5, 54], textOffset: [-3, -1] },
  { name: 'Champignons',             dot: [26, 49], label: [6, 40],  textOffset: [-3, -1] },
  { name: 'Spinat',                  dot: [43, 52], label: [34, 44], textOffset: [0, -1] },
  { name: 'Aubergine',               dot: [56, 52], label: [61, 48], textOffset: [0, -1] },
  { name: 'Paprika',                 dot: [72, 52], label: [90, 52], textOffset: [7.5, 0.5] },
  { name: 'Artischocken',            dot: [87, 70], label: [96, 70], textOffset: [2, -1.5] },
  { name: 'Oliven',                  dot: [32, 69], label: [23, 70], textOffset: [0, 1.5] },
  { name: 'Kapern',                  dot: [44, 69], label: [36, 63], textOffset: [0, -1] },
  { name: 'Schinken',                dot: [14, 86], label: [6, 90],  textOffset: [-3, 2] },
  { name: 'Salami',                  dot: [25, 86], label: [20, 94], textOffset: [0, 1.5] },
  { name: 'Speck',                   dot: [37, 86], label: [43, 94], textOffset: [0, 1.5] },
  { name: 'Thunfisch',               dot: [51, 82], label: [53, 94], textOffset: [0, 1.5] },
  { name: 'Sardellen',               dot: [64, 86], label: [66, 95], textOffset: [0, 1.5] },
  { name: 'Rahm',                    dot: [75, 86], label: [80, 95], textOffset: [0, 1.5] },
  { name: 'Gorgonzola',              dot: [87, 85], label: [96, 95], textOffset: [3, 1.5] },
];

const MOBILE_W = 941, MOBILE_H = 1672;
const INGREDIENTS_MOBILE = [
  { name: 'Basilikum',           dot: [31, 30.5], label: [31, 15], textOffset: [0, -1] },
  { name: 'Caputo Rossa',        dot: [44, 22], label: [44, 7], textOffset: [0, .1] },
  { name: 'Olivenöl',            dot: [62, 28], label: [62, 12], textOffset: [0, -1] },
  { name: 'Tomaten San Marzano', dot: [84, 31], label: [84, 3], textOffset: [-10, -1] },
  { name: 'Fior di Latte',       dot: [16, 33], label: [16, 3],  textOffset: [1, -1] },
  { name: 'Champignons',         dot: [19, 41], label: [19, 45],  textOffset: [-1, 1] },
  { name: 'Spinat',              dot: [43, 45], label: [43, 50], textOffset: [0, 1] },
  { name: 'Knoblauch',           dot: [62, 35], label: [73, 16], textOffset: [0, -1] },
  { name: 'Zwiebeln',            dot: [74, 40], label: [99, 40], textOffset: [0, -1] },
  { name: 'Peperoni',            dot: [77, 60], label: [90, 64], textOffset: [10, 1] },
  { name: 'Zucchetti',           dot: [16, 54], label: [16, 58.5],  textOffset: [0, 1] },
  { name: 'Aubergine',           dot: [62, 45], label: [62, 42], textOffset: [0, -1] },
  { name: 'Paprika',             dot: [77, 47], label: [92, 43], textOffset: [7, -1] },
  { name: 'Artischocken',        dot: [86, 55], label: [86, 55], textOffset: [12, -1] },
  { name: 'Oliven',              dot: [35, 55.5], label: [35, 59],  textOffset: [0, 1] },
  { name: 'Kapern',              dot: [52, 55.5], label: [52, 59], textOffset: [0, 1] },
  { name: 'Schinken',            dot: [15, 65], label: [15, 70],  textOffset: [-10, 1.5] },
  { name: 'Salami',              dot: [34, 63], label: [34, 70], textOffset: [0, 1.5] },
  { name: 'Speck',               dot: [53, 65], label: [53, 69.5], textOffset: [0, 1.5] },
  { name: 'Thunfisch',           dot: [73.5, 66], label: [73.5, 69.5], textOffset: [0, 1.5] },
  { name: 'Sardellen',           dot: [28.5, 76], label: [28.5, 80], textOffset: [0, 1.5] },
  { name: 'Rahm',                dot: [48.5, 76], label: [48.5, 80], textOffset: [0, 1.5] },
  { name: 'Gorgonzola',          dot: [67.5, 75.5], label: [67.5, 80], textOffset: [0, 1.5] },
];

function isMobile() {
  // Mehrere Checks · wenn EINER true ist → mobile
  if (window.innerWidth < 1200) return true;
  if (window.innerHeight > window.innerWidth) return true;           // portrait
  if (window.matchMedia('(pointer: coarse)').matches) return true;   // touch device
  if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) return true;
  return false;
}

function buildIngredients(g, ingredients, imgW, imgH) {
  g.replaceChildren();
  // Mobile (portrait, kleineres Bild) braucht relativ grössere Schrift für Lesbarkeit
  const isPortrait = imgH > imgW;
  const dotR = imgW * (isPortrait ? 0.008 : 0.004);
  const lineW = imgW * (isPortrait ? 0.0025 : 0.001);
  const fontSize = imgW * (isPortrait ? 0.032 : 0.012);

  ingredients.forEach((ing) => {
    const dx = ing.dot[0] / 100 * imgW;
    const dy = ing.dot[1] / 100 * imgH;

    // Line endpoint: default = label position, OR lineAngle+lineLength (polar vom Dot aus)
    // Angle: 0°=rechts, 90°=unten, 180°=links, 270°=oben (SVG y-down)
    let lineEndX, lineEndY;
    if (ing.lineAngle !== undefined && ing.lineLength !== undefined) {
      const rad = ing.lineAngle * Math.PI / 180;
      lineEndX = dx + Math.cos(rad) * (ing.lineLength / 100 * imgW);
      lineEndY = dy + Math.sin(rad) * (ing.lineLength / 100 * imgW);
    } else {
      lineEndX = ing.label[0] / 100 * imgW;
      lineEndY = ing.label[1] / 100 * imgH;
    }

    const dot = document.createElementNS(SVG_NS, 'circle');
    dot.setAttribute('cx', dx);
    dot.setAttribute('cy', dy);
    dot.setAttribute('r', dotR);
    dot.classList.add('ing-dot');

    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', dx);
    line.setAttribute('y1', dy);
    line.setAttribute('x2', lineEndX);
    line.setAttribute('y2', lineEndY);
    line.setAttribute('stroke-width', lineW);
    line.classList.add('ing-line');
    const len = Math.sqrt((lineEndX - dx) ** 2 + (lineEndY - dy) ** 2);
    line.setAttribute('stroke-dasharray', len);
    line.setAttribute('stroke-dashoffset', len);

    // Text position: label ist Text-Anker, optional textOffset [dx%, dy%]
    const tOff = ing.textOffset || [0, 0];
    const lx = ing.label[0] / 100 * imgW;
    const ly = ing.label[1] / 100 * imgH;
    const tx = lx + (tOff[0] / 100) * imgW;
    const ty = ly + (tOff[1] / 100) * imgH;
    const textAnchorX = ing.label[0] + tOff[0];

    const text = document.createElementNS(SVG_NS, 'text');
    text.setAttribute('x', tx);
    text.setAttribute('y', ty);
    text.setAttribute('font-size', fontSize);
    text.setAttribute('dominant-baseline', 'middle');
    if (textAnchorX < 15) text.setAttribute('text-anchor', 'start');
    else if (textAnchorX > 85) text.setAttribute('text-anchor', 'end');
    else text.setAttribute('text-anchor', 'middle');
    text.textContent = ing.name.toUpperCase();
    text.classList.add('ing-label');

    g.append(dot, line, text);
  });
}

function revealIngredients(g) {
  if (g.dataset.revealed === 'true') return;
  g.dataset.revealed = 'true';

  const dots = g.querySelectorAll('.ing-dot');
  const lines = g.querySelectorAll('.ing-line');
  const labels = g.querySelectorAll('.ing-label');

  // Each ingredient gets its own mini-sequence with random base delay → organisches Auftauchen
  dots.forEach((dot, i) => {
    const base = Math.random() * 900;  // 0–900ms base stagger per ingredient

    // Dot
    dot.style.transitionDelay = `${base}ms`;
    dot.classList.add('in');

    // Line · starts shortly after dot, duration varies
    const line = lines[i];
    if (line) {
      const lineDuration = 2.0 + Math.random() * 1.5;  // 2.0–3.5s
      const lineDelay = (base + 250 + Math.random() * 350) / 1000;  // base+250–600ms
      line.style.transition = `stroke-dashoffset ${lineDuration}s cubic-bezier(.2,.7,.1,1) ${lineDelay}s`;
      line.setAttribute('stroke-dashoffset', '0');
    }

    // Label · nach der Linie, auch mit jitter
    const label = labels[i];
    if (label) {
      const labelDelay = base + 1500 + Math.random() * 1200;  // base+1.5–2.7s
      setTimeout(() => label.classList.add('in'), labelDelay);
    }
  });
}

// Auf Tablets (900-1199px) das Desktop-SVG komplett zeigen statt croppen.
// >=1200px: slice (cinematic full-bleed). <900px: mobile-SVG (portrait).
function applyTabletFit() {
  const desktopSvg = document.getElementById('akt-3-map-desktop');
  if (!desktopSvg) return;
  const image = desktopSvg.querySelector('image');
  const isTablet = window.innerWidth >= 900 && window.innerWidth < 1200;
  const par = isTablet ? 'xMidYMid meet' : 'xMidYMid slice';
  desktopSvg.setAttribute('preserveAspectRatio', par);
  if (image) image.setAttribute('preserveAspectRatio', par);
}

export function initAkt3Zutaten() {
  const section = document.getElementById('akt-3');
  if (!section) return;
  const desktopG = document.querySelector('#akt-3-map-desktop .akt-3-ingredients');
  const mobileG = document.querySelector('#akt-3-map-mobile .akt-3-ingredients');

  if (desktopG) buildIngredients(desktopG, INGREDIENTS_DESKTOP, DESKTOP_W, DESKTOP_H);
  if (mobileG) buildIngredients(mobileG, INGREDIENTS_MOBILE, MOBILE_W, MOBILE_H);

  applyTabletFit();
  window.addEventListener('resize', applyTabletFit);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    [desktopG, mobileG].forEach(g => {
      if (!g) return;
      g.querySelectorAll('.ing-dot, .ing-label').forEach(el => el.classList.add('in'));
      g.querySelectorAll('.ing-line').forEach(l => l.setAttribute('stroke-dashoffset', '0'));
    });
    return;
  }

  window.addEventListener('section-settled', (e) => {
    if (!e.detail || e.detail.section !== section) return;
    const visibleG = isMobile() ? mobileG : desktopG;
    if (visibleG) revealIngredients(visibleG);
  });
}
