import { createEl, empty, qs } from '../lib/dom.js';

export function showResult(ok, message) {
  const stage = qs('#wizard-stage');
  if (!stage) return;
  empty(stage);
  const kicker = createEl('div', { class: 'kicker' }, [ok ? 'Anfrage gesendet' : 'Es ist etwas schiefgegangen']);
  const heading = createEl('h3', { class: 'display', style: 'font-size: clamp(26px, 3.2vw, 44px);' },
    [ok ? 'Grazie. Pietro meldet sich.' : 'Anfrage konnte nicht gesendet werden.']);
  const body = createEl('p', { class: 'lede editorial' },
    [ok ? 'Du bekommst innerhalb von 48 Stunden eine Rückmeldung per E-Mail oder Telefon.' : (message ?? 'Bitte rufe Pietro direkt an: 076 331 32 59')]);
  stage.append(kicker, heading, body);

  if (!ok) {
    const btn = createEl('a', { href: 'tel:+41763313259', class: 'meta', style: 'display:inline-block; margin-top: 16px; padding: 10px 18px; background: var(--c-inchiostro); color: var(--c-farina); border-radius: 999px; text-decoration: none;' }, ['076 331 32 59 anrufen']);
    stage.append(btn);
  }
}
