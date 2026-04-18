// Success panel + error toast for the catering wizard.
// Listens for 'wizard:submitted' and 'wizard:error' CustomEvents on document.

import { createEl, empty, qs } from '../lib/dom.js';
import { reset } from './state.js';

const TWINT_APPLINK = 'https://go.twint.ch/1/e/tw?tw=acq.erLxqXuzQa2zND3B2wKBNM3KxDVpHFhbX6N8FjLRvWMv8epCovCoo1PWmZRIX7c0';
const TWINT_QR_SRC = '/src/images/twint-qr-cropped.png';

const CSS = `
.wizard-success-inner{max-width:560px;margin:0 auto;display:flex;flex-direction:column;gap:10px;align-items:center;text-align:center;position:relative;z-index:1;}
.wizard-success-kicker{font-family:var(--ff-mono,monospace);font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#f0e6d2;}
.wizard-success-title{font-family:var(--ff-display,'Bricolage Grotesque',serif);font-size:clamp(36px,5vw,56px);font-variation-settings:'wght' 800;line-height:0.98;margin:0;}
.wizard-success-lede{font-size:14px;line-height:1.4;margin:0;max-width:500px;}
.wizard-success-twint{width:100%;max-width:340px;border:1px solid var(--c-line,rgba(0,0,0,0.15));padding:14px;border-radius:12px;margin:6px 0;display:flex;flex-direction:column;align-items:center;gap:6px;background:var(--c-surface,transparent);}
.wizard-success-twint-kicker{font-family:var(--ff-mono,monospace);font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:var(--c-accent,currentColor);}
.wizard-success-twint-qr{display:block;margin:4px auto;}
.wizard-success-twint-qr img{max-width:170px;width:100%;height:auto;display:block;}
.wizard-success-twint-note{font-size:12px;margin:0;opacity:0.75;}
.wizard-success-twint-applink{display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border:1px solid var(--c-accent,currentColor);color:var(--c-fg,inherit);text-decoration:none;border-radius:999px;font-family:var(--ff-mono,monospace);font-size:11px;letter-spacing:0.12em;text-transform:uppercase;transition:opacity 180ms ease;margin-top:2px;}
.wizard-success-twint-applink:hover{opacity:0.7;}
.wizard-success-direct{font-size:12px;margin:4px 0 0;opacity:0.8;}
.wizard-success-direct a{color:inherit;}
.wizard-success-email-hint{font-size:12px;opacity:0.7;margin:0;max-width:480px;}
.wizard-success-confetti{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:0;}
.wizard-success-confetti span{position:absolute;width:10px;height:10px;border-radius:2px;top:-20vh;animation:wz-confetti-fall 5s linear forwards;}
@keyframes wz-confetti-fall{0%{transform:translateY(-20vh) rotate(0deg);opacity:1;}100%{transform:translateY(120vh) rotate(720deg);opacity:0;}}
@media (prefers-reduced-motion: reduce){.wizard-success-confetti{display:none;}}
.wz-error{position:relative;margin:0 0 14px;padding:12px 16px;border:1px solid #d33;background:rgba(211,51,51,0.08);color:#a11;border-radius:8px;font-size:14px;font-family:var(--ff-mono,monospace);animation:wz-error-in 200ms ease-out;}
@keyframes wz-error-in{from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:translateY(0);}}
`;

let stylesInjected = false;
let initialized = false;

function injectStyles() {
  if (stylesInjected) return;
  stylesInjected = true;
  const style = createEl('style', { 'data-wizard-result': '1' });
  style.textContent = CSS;
  document.head.appendChild(style);
}

function prefersReducedMotion() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

function buildConfetti() {
  const layer = createEl('div', { class: 'wizard-success-confetti', 'aria-hidden': 'true' });
  if (prefersReducedMotion()) return layer;

  const colors = ['var(--c-accent, #e3b23c)', 'var(--c-fg, #111)', 'var(--c-accent-2, #c44)', 'var(--c-accent, #e3b23c)'];
  for (let i = 0; i < 30; i++) {
    const left = Math.random() * 100;
    const delay = Math.random() * 1.5;
    const duration = 4 + Math.random() * 2;
    const rotation = Math.random() * 360;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const dot = createEl('span', {
      style: `left:${left}%;background:${color};animation-delay:${delay.toFixed(2)}s;animation-duration:${duration.toFixed(2)}s;transform:rotate(${rotation.toFixed(0)}deg);`,
    });
    layer.appendChild(dot);
  }
  return layer;
}

function buildSuccessContent({ reference, email }) {
  const inner = createEl('div', { class: 'wizard-success-inner' });

  inner.appendChild(createEl('div', { class: 'wizard-success-kicker' }, ['Anfrage eingegangen']));
  inner.appendChild(createEl('h2', { class: 'wizard-success-title' }, ['Grazie!']));

  const lede = createEl('p', { class: 'wizard-success-lede' });
  lede.appendChild(document.createTextNode('Ihre Reservation ist eingegangen — Referenz '));
  lede.appendChild(createEl('strong', {}, [String(reference ?? '—')]));
  lede.appendChild(document.createTextNode('.'));
  lede.appendChild(createEl('br'));
  lede.appendChild(document.createTextNode('Pietro prüft den Termin und bestätigt definitiv nach Eingang der TWINT-Anzahlung.'));
  inner.appendChild(lede);

  // TWINT block
  const twint = createEl('div', { class: 'wizard-success-twint' });
  twint.appendChild(createEl('div', { class: 'wizard-success-twint-kicker' }, ['CHF 250.– Anzahlung per TWINT']));

  const picture = createEl('picture', { class: 'wizard-success-twint-qr' });
  picture.appendChild(createEl('img', {
    src: TWINT_QR_SRC,
    alt: "TWINT QR · Anzahlung Pizza D'Amico",
    width: '280',
    height: '356',
  }));
  twint.appendChild(picture);

  twint.appendChild(createEl('p', { class: 'wizard-success-twint-note' }, ['Scannen · Betrag eingeben · bestätigen.']));

  const applink = createEl('a', {
    class: 'wizard-success-twint-applink',
    href: TWINT_APPLINK,
    target: '_blank',
    rel: 'noopener',
  });
  applink.appendChild(createEl('span', {}, ['Mit TWINT-App bezahlen']));
  applink.appendChild(createEl('span', { 'aria-hidden': 'true' }, ['→']));
  twint.appendChild(applink);

  const direct = createEl('p', { class: 'wizard-success-direct' });
  direct.appendChild(document.createTextNode('Oder direkt: '));
  direct.appendChild(createEl('a', { href: 'tel:+41763313259' }, ['076 331 32 59']));
  twint.appendChild(direct);

  inner.appendChild(twint);

  // Email hint
  const emailHint = createEl('p', { class: 'wizard-success-email-hint' });
  emailHint.appendChild(document.createTextNode('Eine Bestätigung geht an '));
  emailHint.appendChild(createEl('strong', {}, [String(email ?? '—')]));
  emailHint.appendChild(document.createTextNode('. Checken Sie den Spam-Ordner.'));
  inner.appendChild(emailHint);

  // Close button
  const closeBtn = createEl('button', {
    class: 'wizard-btn wizard-btn-primary',
    type: 'button',
    'data-wizard-close': '1',
  }, ['Schliessen']);
  inner.appendChild(closeBtn);

  return { inner, closeBtn };
}

function renderSuccess(detail) {
  const panel = qs('#wizard-success');
  if (!panel) return;

  injectStyles();
  empty(panel);

  const { inner, closeBtn } = buildSuccessContent(detail || {});
  panel.appendChild(inner);
  panel.appendChild(buildConfetti());

  panel.setAttribute('aria-hidden', 'false');

  // Also reset state after the user clicks Schliessen.
  // mount.js handles the actual visual close; we just schedule a state reset
  // once the panel has had time to animate away.
  closeBtn.addEventListener('click', () => {
    setTimeout(() => {
      try { reset(); } catch { /* ignore */ }
    }, 400);
  }, { once: true });
}

function renderErrorToast(msg) {
  injectStyles();
  const stage = qs('#wizard-stage');
  if (!stage) return;

  // Remove any previous toast so we don't stack them.
  const prev = stage.querySelector('.wz-error');
  if (prev) prev.remove();

  const toast = createEl('div', {
    class: 'wz-error',
    role: 'alert',
    'aria-live': 'assertive',
  }, [String(msg ?? 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.')]);

  stage.insertBefore(toast, stage.firstChild);

  setTimeout(() => {
    if (toast.isConnected) toast.remove();
  }, 5000);
}

export function initResultPanel() {
  if (initialized) return;
  initialized = true;

  document.addEventListener('wizard:submitted', (ev) => {
    renderSuccess(ev.detail || {});
  });

  document.addEventListener('wizard:error', (ev) => {
    const msg = (ev.detail && ev.detail.msg) || 'Es ist ein Fehler aufgetreten.';
    renderErrorToast(msg);
  });
}
