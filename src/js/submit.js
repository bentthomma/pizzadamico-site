// Submit-Handler für den Catering-Wizard
// Hört auf CustomEvent 'wizard:submit' am document
// Ruft reserveSlot() auf (Apps Script = Source of Truth)
// Parallel: FormSubmit-Mailbenachrichtigung an benedikt@thomma.ch
//
// Events dispatched on document:
//   'wizard:submitting' → UI should show loading state
//   'wizard:submitted'  → success, detail: { reference, email, datetime }
//   'wizard:error'      → failure, detail: { msg }

import { getState, patch, getStartDateTimeISO, getEndDateTimeISO } from './wizard/state.js';
import { reserveSlot } from './wizard/calendar-api.js';
import { calcPricing, formatChf } from './wizard/pricing.js';

const FORMSUBMIT_URL = 'https://formsubmit.co/ajax/benedikt@thomma.ch';
const ERR_GENERIC = 'Reservation konnte nicht gespeichert werden. Bitte noch einmal versuchen.';
const ERR_OFFLINE = 'Keine Internetverbindung. Versuchen Sie es gleich nochmal.';
const ERR_TIMEOUT = 'Zeitüberschreitung — bitte nochmal versuchen.';
const SUBMIT_TIMEOUT_MS = 30000;

let inFlight = false;

function dispatchError(msg) {
  document.dispatchEvent(new CustomEvent('wizard:error', { detail: { msg } }));
}

function withTimeout(promise, ms, timeoutMsg) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(timeoutMsg)), ms);
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); },
    );
  });
}

async function sendFormSubmitNotification(state, pricing, reference) {
  try {
    const formData = new FormData();
    formData.append('_subject', `Pizza D'Amico · Catering-Anfrage ${reference} · ${state.date}`);
    formData.append('_template', 'table');
    formData.append('_captcha', 'false');
    // Customer confirmation is sent by Apps Script (beautiful HTML email).
    // FormSubmit stays as owner-internal backup notification only.
    formData.append('Anlass', state.eventType);
    formData.append('Datum', state.date);
    formData.append('Uhrzeit', state.time);
    formData.append('Dauer', `${state.durationHours} h`);
    formData.append('Ort', state.address);
    formData.append('Distanz km', String(state.distanceKm));
    formData.append('Erwachsene', String(state.adults));
    formData.append('Kinder', String(state.children));
    formData.append('Vegi', String(state.vegetarian));
    formData.append('Zutaten', state.toppings.join(', '));
    formData.append('Setup Strom', state.setup.power);
    formData.append('Setup Platz', state.setup.space);
    formData.append('Setup Dach', state.setup.shelter);
    formData.append('Setup Zugang', state.setup.access);
    formData.append('Name', state.name);
    formData.append('Email', state.email);
    formData.append('Telefon', state.phone);
    formData.append('Notiz', state.note || '—');
    formData.append('Total CHF', formatChf(pricing.total));
    formData.append('Referenz', reference);

    await fetch(FORMSUBMIT_URL, { method: 'POST', body: formData });
  } catch (err) {
    console.warn('[submit] FormSubmit notification failed:', err);
  }
}

async function handleSubmit() {
  if (inFlight) return;
  inFlight = true;

  // Flag so we know in finally whether the loading UI was actually shown.
  let submittingDispatched = false;

  try {
    // Offline-Check
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      dispatchError(ERR_OFFLINE);
      return;
    }

    const state = getState();
    const startISO = getStartDateTimeISO();
    const endISO = getEndDateTimeISO();
    const pricing = calcPricing(state);

    const reservationData = {
      startISO,
      endISO,
      eventType: state.eventType,
      address: state.address,
      distanceKm: state.distanceKm,
      adults: state.adults,
      children: state.children,
      vegetarian: state.vegetarian,
      toppings: state.toppings,
      setup: state.setup,
      name: state.name,
      email: state.email,
      phone: state.phone,
      note: state.note,
      total: pricing.total,
      netto: pricing.netto,
      vat: pricing.vat,
    };

    // 1. Signal loading state BEFORE any network call.
    document.dispatchEvent(new CustomEvent('wizard:submitting'));
    submittingDispatched = true;

    // 2. Apps Script Reservation = Source of Truth, wrapped in 30s timeout.
    let result;
    try {
      result = await withTimeout(
        reserveSlot(reservationData),
        SUBMIT_TIMEOUT_MS,
        ERR_TIMEOUT,
      );
    } catch (err) {
      console.error('[submit] reserveSlot failed:', err);
      const msg = err && err.message === ERR_TIMEOUT ? ERR_TIMEOUT : ERR_GENERIC;
      dispatchError(msg);
      return;
    }

    // Apps Script returns { success: true, eventId, reference }. Accept both shapes.
    const okFlag = result && (result.ok === true || result.success === true);
    if (!okFlag) {
      console.error('[submit] reserveSlot returned not-ok:', result);
      dispatchError(ERR_GENERIC);
      return;
    }

    const reference =
      result.reference ||
      result.ref ||
      ('PZ-' + Date.now().toString(36).toUpperCase());

    // 3. Mail-Benachrichtigung (darf die Flow nicht blockieren).
    await sendFormSubmitNotification(state, pricing, reference);

    // 4. Persist success flag.
    patch({
      submitted: true,
      submittedAt: new Date().toISOString(),
      reference,
    });

    // 5. Hand off to the result panel.
    document.dispatchEvent(new CustomEvent('wizard:submitted', {
      detail: {
        reference,
        email: state.email,
        datetime: `${state.date} ${state.time}`,
      },
    }));
  } catch (err) {
    // Final safety net — anything unexpected must not leave the button stuck.
    console.error('[submit] unexpected error:', err);
    if (submittingDispatched) dispatchError(ERR_GENERIC);
  } finally {
    inFlight = false;
  }
}

export function initSubmit() {
  document.addEventListener('wizard:submit', handleSubmit);
}
