// Step 1 · Willkommen-Intro · knapp, cinematic, passt in ein Fenster
// Reiner Lese-Step. Kein State-Read, kein Write.

import { empty, createEl } from '../../lib/dom.js';

export function renderStep1Intro(stage) {
  empty(stage);

  const root = createEl('section', { class: 'wizard-step is-mounting step1-intro' }, [
    createEl('div', { class: 'wizard-step-head step1-intro-head' }, [
      createEl('div', { class: 'wizard-step-kicker' }, ['Willkommen · Schritt 1 von 9']),
      createEl('h2', { class: 'wizard-step-title step1-intro-title' }, [
        'Euer Fest.',
        createEl('br', {}),
        'Unser Handwerk.',
      ]),
      createEl('p', { class: 'wizard-step-lede step1-intro-lede' }, [
        'In 3 Minuten seid ihr durch. Pietro meldet sich persönlich. Verbindlich wird die Reservation nach CHF 250.– Anzahlung per TWINT.',
      ]),
    ]),
    createEl('div', { class: 'step1-intro-preview' }, [
      createEl('div', { class: 'step1-intro-row' }, [
        createEl('span', { class: 'step1-intro-num' }, ['01']),
        createEl('span', { class: 'step1-intro-label' }, ['Anlass']),
      ]),
      createEl('div', { class: 'step1-intro-row' }, [
        createEl('span', { class: 'step1-intro-num' }, ['02']),
        createEl('span', { class: 'step1-intro-label' }, ['Datum & Zeit']),
      ]),
      createEl('div', { class: 'step1-intro-row' }, [
        createEl('span', { class: 'step1-intro-num' }, ['03']),
        createEl('span', { class: 'step1-intro-label' }, ['Ort']),
      ]),
      createEl('div', { class: 'step1-intro-row' }, [
        createEl('span', { class: 'step1-intro-num' }, ['04']),
        createEl('span', { class: 'step1-intro-label' }, ['Gäste']),
      ]),
      createEl('div', { class: 'step1-intro-row' }, [
        createEl('span', { class: 'step1-intro-num' }, ['05']),
        createEl('span', { class: 'step1-intro-label' }, ['Zutaten']),
      ]),
      createEl('div', { class: 'step1-intro-row' }, [
        createEl('span', { class: 'step1-intro-num' }, ['06']),
        createEl('span', { class: 'step1-intro-label' }, ['Setup']),
      ]),
      createEl('div', { class: 'step1-intro-row' }, [
        createEl('span', { class: 'step1-intro-num' }, ['07']),
        createEl('span', { class: 'step1-intro-label' }, ['Kontakt']),
      ]),
      createEl('div', { class: 'step1-intro-row' }, [
        createEl('span', { class: 'step1-intro-num' }, ['08']),
        createEl('span', { class: 'step1-intro-label' }, ['Übersicht']),
      ]),
    ]),
    createEl('div', { class: 'step1-intro-pricing' }, [
      createEl('div', { class: 'step1-intro-pricing-head' }, ['So rechnen wir']),
      createEl('div', { class: 'step1-intro-pricing-row' }, [
        createEl('span', { class: 'step1-intro-pricing-label' }, [
          'Erwachsene',
          createEl('small', {}, ['Pizza à discrétion']),
        ]),
        createEl('span', { class: 'step1-intro-pricing-amount' }, ['CHF 25.–']),
      ]),
      createEl('div', { class: 'step1-intro-pricing-row' }, [
        createEl('span', { class: 'step1-intro-pricing-label' }, [
          'Kinder',
          createEl('small', {}, ['5–10 Jahre']),
        ]),
        createEl('span', { class: 'step1-intro-pricing-amount' }, ['CHF 12.–']),
      ]),
      createEl('div', { class: 'step1-intro-pricing-row' }, [
        createEl('span', { class: 'step1-intro-pricing-label' }, [
          'Anfahrt',
          createEl('small', {}, ['hin & zurück, pro km']),
        ]),
        createEl('span', { class: 'step1-intro-pricing-amount' }, ['CHF 1.50']),
      ]),
      createEl('div', { class: 'step1-intro-pricing-row' }, [
        createEl('span', { class: 'step1-intro-pricing-label' }, [
          'Reservation',
          createEl('small', {}, ['Anzahlung via TWINT']),
        ]),
        createEl('span', { class: 'step1-intro-pricing-amount' }, ['CHF 250.–']),
      ]),
      createEl('p', { class: 'step1-intro-pricing-vat' }, ['+ 8.1 % MwSt auf den Gesamtbetrag']),
    ]),
  ]);

  stage.appendChild(root);
}
