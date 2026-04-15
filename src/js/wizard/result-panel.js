import { createEl, empty, qs } from '../lib/dom.js';

export function showResult(result) {
  const stage = qs('#wizard-stage');
  if (!stage) return;
  empty(stage);

  if (result.ok && (result.status === 'pending' || result.id)) {
    renderPending(stage, result);
    return;
  }
  renderError(stage, result);
}

function renderPending(stage, r) {
  stage.appendChild(createEl('div', { class: 'kicker' }, ['Reservierungs-Anfrage erfasst']));
  stage.appendChild(createEl('h3', {
    class: 'display',
    style: 'font-size: clamp(26px, 3.2vw, 44px);'
  }, ['Grazie. Jetzt noch die Anzahlung.']));

  stage.appendChild(createEl('p', { class: 'lede editorial' }, [
    r.message ?? 'Ihre Reservierungsanfrage wurde erfasst. Die Buchung ist erst definitiv bestätigt, sobald die Anzahlung von CHF 250 per Twint eingegangen und manuell geprüft wurde.'
  ]));

  const qrWrap = createEl('div', {
    style: 'margin-top: 24px; display: flex; gap: 24px; flex-wrap: wrap; align-items: center;'
  });

  if (r.twintQrPng) {
    qrWrap.appendChild(createEl('img', {
      src: r.twintQrPng,
      alt: 'TWINT QR-Code für Anzahlung CHF 250',
      width: '200',
      height: '200',
      style: 'width: 200px; height: 200px; border: 1px solid var(--c-line); background: #fff; padding: 12px; border-radius: 4px;',
    }));
  }

  const amountBox = createEl('div', { style: 'display: grid; gap: 10px; min-width: 220px;' });
  amountBox.appendChild(createEl('div', { class: 'meta' }, ['Anzahlung']));
  amountBox.appendChild(createEl('div', {
    style: "font-family: var(--ff-display); font-size: 42px; font-variation-settings: 'wdth' 82, 'wght' 700; line-height: 1;"
  }, [`CHF ${r.depositAmount ?? 250}`]));

  if (r.twintLink) {
    amountBox.appendChild(createEl('div', { class: 'meta', style: 'margin-top: 8px;' }, ['Oder direkt mit TWINT-App:']));
    amountBox.appendChild(createEl('a', {
      href: r.twintLink,
      target: '_blank',
      rel: 'noopener',
      style: 'display:inline-block; padding: 9px 16px; background: var(--c-inchiostro); color: var(--c-farina); border-radius: 999px; text-decoration: none; font-family: var(--ff-mono); font-size: 11px; letter-spacing: 2px; text-transform: uppercase;',
    }, ['TWINT öffnen']));
  }

  qrWrap.appendChild(amountBox);
  stage.appendChild(qrWrap);

  if (r.expiresAt) {
    const expiresTxt = new Date(r.expiresAt).toLocaleString('de-CH', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
    stage.appendChild(createEl('p', {
      class: 'meta',
      style: 'margin-top: 24px; opacity: 0.7;'
    }, [`Reservierung läuft ab am ${expiresTxt}. Ohne Zahlungseingang wird der Termin automatisch freigegeben.`]));
  }
}

function renderError(stage, r) {
  const isConflict = r.error === 'slot-conflict';
  const isRateLimit = r.error === 'rate-limited';

  stage.appendChild(createEl('div', { class: 'kicker' }, [
    isConflict ? 'Termin belegt' : (isRateLimit ? 'Zu viele Anfragen' : 'Es ist etwas schiefgegangen')
  ]));

  stage.appendChild(createEl('h3', {
    class: 'display',
    style: 'font-size: clamp(26px, 3.2vw, 44px);'
  }, [
    isConflict
      ? 'Dieser Slot ist leider vergeben.'
      : (isRateLimit
          ? 'Zu viele Versuche.'
          : 'Anfrage konnte nicht gesendet werden.')
  ]));

  stage.appendChild(createEl('p', { class: 'lede editorial' }, [
    r.message ?? (isConflict
      ? 'Bitte wählen Sie ein anderes Datum oder eine andere Uhrzeit.'
      : (isRateLimit
          ? 'Bitte warten Sie einen Moment und versuchen Sie es erneut. Oder rufen Sie Pietro direkt an.'
          : 'Bitte rufen Sie Pietro direkt an: 076 331 32 59'))
  ]));

  const actions = createEl('div', { style: 'display:flex; gap:10px; margin-top: 18px; flex-wrap: wrap;' });

  if (isConflict) {
    actions.appendChild(createEl('button', {
      type: 'button',
      onclick: () => { document.dispatchEvent(new CustomEvent('wizard:goto-step', { detail: { step: 2 } })); },
      style: 'padding: 10px 18px; background: var(--c-inchiostro); color: var(--c-farina); border: 0; border-radius: 999px; font-family: var(--ff-mono); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; cursor: pointer;',
    }, ['Anderen Termin wählen']));
  }

  actions.appendChild(createEl('a', {
    href: 'tel:+41763313259',
    style: 'display:inline-block; padding: 10px 18px; background: transparent; color: var(--c-inchiostro); border: 1px solid var(--c-inchiostro); border-radius: 999px; text-decoration: none; font-family: var(--ff-mono); font-size: 11px; letter-spacing: 2px; text-transform: uppercase;',
    }, ['076 331 32 59']));

  stage.appendChild(actions);
}
