// Reveal on section-settled. Akt 2 fully JS-driven (no CSS transition race).

function measurePanelLines() {
  document.querySelectorAll('.panel-line').forEach((line) => {
    const dx = parseFloat(line.getAttribute('x2') || 0) - parseFloat(line.getAttribute('x1') || 0);
    const dy = parseFloat(line.getAttribute('y2') || 0) - parseFloat(line.getAttribute('y1') || 0);
    const L = Math.sqrt(dx * dx + dy * dy);
    if (L > 0.1) {
      line.setAttribute('stroke-dasharray', L);
      line.setAttribute('stroke-dashoffset', L);
    }
  });
}

function showEl(el, props, dur) {
  // Apply CSS transition + target values in one frame
  const parts = Object.entries(props).map(([k, v]) => `${k} ${dur}ms cubic-bezier(.2,.7,.1,1)`);
  el.style.transition = parts.join(', ');
  requestAnimationFrame(() => {
    Object.entries(props).forEach(([k, v]) => { el.style[k] = v; });
  });
}

function isMobile() {
  return window.matchMedia('(max-width: 899px)').matches;
}

function revealAkt2(section) {
  // Mobile: Linien kürzer (panels stacked, Aspect-Ratio stretched → Linien laufen sonst in Text)
  if (isMobile()) {
    const teigLine = section.querySelector('.akt-2-panel-teig .panel-line');
    const bodenLine = section.querySelector('.akt-2-panel-boden .panel-line');
    if (teigLine) { teigLine.setAttribute('x2', '62'); teigLine.setAttribute('y2', '68'); }
    if (bodenLine) { bodenLine.setAttribute('x2', '50'); bodenLine.setAttribute('y2', '36'); }
  }
  measurePanelLines();

  // Einheitliches Reveal-Tempo zu anderen Akten: ~1200ms total statt 3650ms.
  // Beide Panels zeigen sich parallel (diptych-Natur), nicht sequentiell.
  const panels = [
    { sel: '.akt-2-panel-teig', baseDelay: 0 },
    { sel: '.akt-2-panel-boden', baseDelay: 200 },  // leichter stagger fürs Auge
  ];

  panels.forEach(({ sel, baseDelay }) => {
    const panel = section.querySelector(sel);
    if (!panel) return;
    const dot = panel.querySelector('.panel-dot');
    const line = panel.querySelector('.panel-line');
    const kicker = panel.querySelector('figcaption .kicker');
    const text = panel.querySelector('figcaption .akt-2-panel-text');

    setTimeout(() => {
      if (dot) showEl(dot, { opacity: '1', transform: 'scale(1)' }, 300);
    }, baseDelay);

    setTimeout(() => {
      if (line) {
        line.style.transition = 'stroke-dashoffset 500ms cubic-bezier(.2,.7,.1,1)';
        requestAnimationFrame(() => line.setAttribute('stroke-dashoffset', '0'));
      }
    }, baseDelay + 180);

    setTimeout(() => {
      if (kicker) showEl(kicker, { opacity: '1', transform: 'translateY(0)' }, 500);
    }, baseDelay + 400);
    setTimeout(() => {
      if (text) showEl(text, { opacity: '1', transform: 'translateY(0)' }, 500);
    }, baseDelay + 520);
  });
}

export function initReveal() {
  // Measure after images loaded (correct SVG dimensions)
  if (document.readyState === 'complete') measurePanelLines();
  else window.addEventListener('load', () => measurePanelLines());

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal, .reveal-image').forEach(el => el.classList.add('reveal-in'));
    return;
  }

  window.addEventListener('section-settled', (e) => {
    const section = e.detail && e.detail.section;
    if (!section || !section.classList || !section.classList.contains('akt')) return;
    if (section.id === 'akt-1') return;
    if (section.dataset.revealed === 'true') return;
    section.dataset.revealed = 'true';

    // Akt 2: gleiche Animation, Mobile mit kürzeren Linien
    if (section.id === 'akt-2') {
      revealAkt2(section);
      return;
    }

    // Other sections: CSS class reveal
    const targets = section.querySelectorAll('.reveal, .reveal-image');
    targets.forEach((el, i) => {
      el.style.setProperty('--reveal-delay', `${i * 180}ms`);
      el.classList.add('reveal-in');
    });
  });
}
