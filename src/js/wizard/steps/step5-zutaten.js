import { createEl, empty } from '../../lib/dom.js';
import { getState, setField, subscribe } from '../state.js';

// 17 toppings · round image placeholders (gradient circles) + name below.
// Each topping has a stable id (used in state.toppings[]), label, emoji, and hue
// which drives the radial-gradient color of its circular placeholder.
const TOPPINGS = [
  { id: 'champignons',  label: 'Champignons',   emoji: '🍄',  hue: 36 },
  { id: 'zwiebeln',     label: 'Zwiebeln',      emoji: '🧅',  hue: 32 },
  { id: 'zucchetti',    label: 'Zucchetti',     emoji: '🥒',  hue: 88 },
  { id: 'spinat',       label: 'Spinat',        emoji: '🥬',  hue: 108 },
  { id: 'aubergine',    label: 'Aubergine',     emoji: '🍆',  hue: 276 },
  { id: 'peperoni',     label: 'Peperoni',      emoji: '🌶️', hue: 8 },
  { id: 'artischocken', label: 'Artischocken',  emoji: '🌱',  hue: 120 },
  { id: 'oliven',       label: 'Oliven',        emoji: '🫒',  hue: 78 },
  { id: 'kapern',       label: 'Kapern',        emoji: '🫐',  hue: 140 },
  { id: 'knoblauch',    label: 'Knoblauch',     emoji: '🧄',  hue: 42 },
  { id: 'schinken',     label: 'Schinken',      emoji: '🍖',  hue: 12 },
  { id: 'salami',       label: 'Salami',        emoji: '🍕',  hue: 4 },
  { id: 'speck',        label: 'Speck',         emoji: '🥓',  hue: 16 },
  { id: 'thunfisch',    label: 'Thunfisch',     emoji: '🐟',  hue: 210 },
  { id: 'sardellen',    label: 'Sardellen',     emoji: '🐠',  hue: 200 },
  { id: 'rahm',         label: 'Rahm',          emoji: '🥛',  hue: 48 },
  { id: 'gorgonzola',   label: 'Gorgonzola',    emoji: '🧀',  hue: 44 },
];

const MAX = 6;

const STYLE_FLAG = 'step5-style-injected';
const STYLE_CSS = `
.step5-counter {
  display: flex;
  gap: 12px;
  align-items: baseline;
  padding: 12px 18px;
  border-radius: 10px;
  border: 1px solid var(--wz-line);
  background: color-mix(in srgb, var(--wz-fg) 3%, transparent);
  width: fit-content;
}
.step5-counter-value {
  font-family: var(--ff-display);
  font-size: 22px;
  font-weight: 540;
  font-variant-numeric: tabular-nums;
  color: var(--wz-fg);
}
.step5-counter-label {
  color: var(--wz-fg-dim);
  font-size: 14px;
}
.step5-counter-check {
  color: var(--wz-accent);
  font-size: 18px;
  margin-left: auto;
}
.step5-counter[data-state="complete"] .step5-counter-value { color: var(--wz-accent); }
.step5-counter.shake { animation: step5-shake 360ms; }
@keyframes step5-shake {
  0%, 100% { transform: translateX(0); }
  20%  { transform: translateX(-4px); }
  40%  { transform: translateX(4px); }
  60%  { transform: translateX(-3px); }
  80%  { transform: translateX(3px); }
}

.step5-helper-inline {
  color: var(--c-fuoco);
  font-size: 13px;
  margin: 8px 0 0 2px;
  font-style: italic;
  min-height: 16px;
}

.step5-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(112px, 1fr));
  gap: clamp(10px, 1.5vw, 18px);
  margin-top: 14px;
  max-width: 1000px;
}

.wz-topping {
  appearance: none;
  background: transparent;
  border: none;
  color: var(--wz-fg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 8px;
  cursor: pointer;
  transition: transform 200ms var(--wz-e-soft);
  font-family: inherit;
}
.wz-topping:focus-visible {
  outline: 2px solid var(--wz-accent);
  outline-offset: 4px;
  border-radius: 12px;
}
.wz-topping-image {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: radial-gradient(circle at 30% 30%,
    hsl(var(--wz-topping-hue) 70% 68%),
    hsl(var(--wz-topping-hue) 60% 28%));
  border: 2px solid transparent;
  box-shadow: 0 4px 12px -4px rgba(0,0,0,0.4);
  transition: transform 220ms var(--wz-e-premium),
              border-color 180ms,
              box-shadow 220ms;
  position: relative;
  overflow: hidden;
}
.wz-topping-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
  position: absolute;
  inset: 0;
}
/* When image fails, JS sets data-img-failed on the image wrapper → show emoji */
.wz-topping-image[data-img-failed="true"] .wz-topping-photo { display: none; }
.wz-topping-image:not([data-img-failed="true"]) .wz-topping-emoji { display: none; }
.wz-topping-emoji {
  font-size: 36px;
  line-height: 1;
  filter: drop-shadow(0 2px 3px rgba(0,0,0,0.35));
}
.wz-topping-name {
  font-size: 13px;
  text-align: center;
  color: var(--wz-fg-soft);
  font-family: var(--ff-display);
  letter-spacing: 0.005em;
  line-height: 1.3;
}
.wz-topping:hover .wz-topping-image { transform: scale(1.06); }
.wz-topping[aria-pressed="true"] .wz-topping-image {
  border-color: var(--wz-accent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--wz-accent) 25%, transparent),
              0 8px 20px -6px color-mix(in srgb, var(--wz-accent) 50%, transparent);
  transform: scale(1.06);
}
.wz-topping[aria-pressed="true"] .wz-topping-name {
  color: var(--wz-fg);
  font-weight: 600;
}
.wz-topping[aria-pressed="true"] .wz-topping-image::after {
  content: "✓";
  position: absolute;
  top: 2px;
  right: 2px;
  background: var(--wz-accent);
  color: var(--wz-bg);
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 700;
  animation: wz-topping-check 220ms var(--wz-e-premium);
}
@keyframes wz-topping-check {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}

.step5-always-note {
  font-family: var(--ff-editorial);
  font-style: italic;
  font-size: 13px;
  color: var(--wz-fg-dim);
  margin: 14px 0 0 2px;
  letter-spacing: 0.02em;
}

@media (max-width: 640px) {
  .step5-grid {
    grid-template-columns: repeat(auto-fit, minmax(88px, 1fr));
    gap: 12px;
  }
  .wz-topping-image { width: 64px; height: 64px; }
  .wz-topping-emoji { font-size: 30px; }
  .wz-topping-name { font-size: 12px; }
}

@media (prefers-reduced-motion: reduce) {
  .wz-topping,
  .wz-topping-image,
  .step5-counter {
    transition: none !important;
    animation: none !important;
  }
}
`;

function injectStyle() {
  if (document.getElementById(STYLE_FLAG)) return;
  const el = document.createElement('style');
  el.id = STYLE_FLAG;
  el.textContent = STYLE_CSS;
  document.head.appendChild(el);
}

export function renderStep5(stage) {
  injectStyle();
  empty(stage);

  const root = createEl('div', { class: 'step5' });
  stage.appendChild(root);

  // Title + lede
  root.appendChild(createEl('div', { class: 'kicker' }, ['Schritt 6 / 9']));
  root.appendChild(createEl('h3', {
    class: 'display',
    style: 'font-size: clamp(26px, 3.2vw, 44px); margin: 4px 0 10px;',
  }, ['Welche Zutaten?']));
  root.appendChild(createEl('p', { class: 'lede editorial', style: 'margin: 0 0 14px;' }, [
    'Tomatensauce, Fior di Latte und frische handgemachte Pizzabasen sind immer dabei. Wählt bis zu 6 zusätzliche Zutaten — oder keine, wenn ihr\'s klassisch mögt.',
  ]));

  // Counter
  const counterValue = createEl('span', { class: 'step5-counter-value' }, ['0']);
  const counterSuffix = createEl('span', { class: 'step5-counter-label' }, [` von max. ${MAX}`]);
  const counterCheck = createEl('span', { class: 'step5-counter-check' }, ['✓']);
  counterCheck.style.display = 'none';
  const counter = createEl('div', {
    class: 'step5-counter',
    role: 'status',
    'aria-live': 'polite',
  }, [counterValue, counterSuffix, counterCheck]);
  root.appendChild(counter);

  // Inline helper (hidden by default)
  const helper = createEl('p', { class: 'step5-helper-inline' }, ['Max 6 — erst eine entfernen.']);
  helper.style.visibility = 'hidden';
  root.appendChild(helper);

  // Grid
  const grid = createEl('div', {
    class: 'step5-grid',
    role: 'group',
    'aria-label': 'Bis zu 6 Zutaten auswählen',
  });
  root.appendChild(grid);

  const cardRefs = new Map(); // id -> button element

  function showHelper() {
    helper.style.visibility = 'visible';
    clearTimeout(showHelper._t);
    showHelper._t = setTimeout(() => { helper.style.visibility = 'hidden'; }, 2600);
  }

  function triggerShake() {
    counter.classList.remove('shake');
    // force reflow for re-trigger
    // eslint-disable-next-line no-unused-expressions
    void counter.offsetWidth;
    counter.classList.add('shake');
  }

  function toggle(id) {
    const current = getState().toppings;
    const has = current.includes(id);
    if (has) {
      setField('toppings', current.filter(x => x !== id));
      helper.style.visibility = 'hidden';
    } else if (current.length < MAX) {
      setField('toppings', [...current, id]);
      helper.style.visibility = 'hidden';
    } else {
      // max reached
      showHelper();
      triggerShake();
    }
  }

  for (const t of TOPPINGS) {
    const imageEl = createEl('span', {
      class: 'wz-topping-image',
      style: `--wz-topping-hue: ${t.hue}`,
      'aria-hidden': 'true',
    });

    const photoEl = createEl('img', {
      class: 'wz-topping-photo',
      src: `/zutaten/${t.id}.png`,
      alt: '',
      width: '72',
      height: '72',
      loading: 'eager',
      decoding: 'sync',
      fetchpriority: 'high',
    });
    photoEl.onerror = () => imageEl.setAttribute('data-img-failed', 'true');
    imageEl.appendChild(photoEl);
    imageEl.appendChild(createEl('span', { class: 'wz-topping-emoji', 'aria-hidden': 'true' }, [t.emoji]));

    const nameEl = createEl('span', { class: 'wz-topping-name' }, [t.label]);

    const btn = createEl('button', {
      type: 'button',
      class: 'wz-topping',
      'aria-pressed': 'false',
      'aria-label': t.label,
      'data-topping-id': t.id,
      onclick: () => toggle(t.id),
    }, [imageEl, nameEl]);

    grid.appendChild(btn);
    cardRefs.set(t.id, btn);
  }

  // Sync function
  function sync(state) {
    const count = state.toppings.length;
    counterValue.textContent = String(count);
    counterSuffix.textContent = ` von max. ${MAX}`;
    counterCheck.style.display = count === MAX ? '' : 'none';
    counter.dataset.state = count === MAX ? 'complete' : '';

    for (const [id, btn] of cardRefs) {
      const on = state.toppings.includes(id);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  }

  // initial
  sync(getState());

  // subscribe + cleanup when stage is replaced
  const unsub = subscribe((s) => {
    if (!root.isConnected) { unsub(); return; }
    sync(s);
  });
}
