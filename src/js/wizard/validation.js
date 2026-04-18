// Validation module for the catering wizard.
// Each error: { field: string, msg: string } in Deutsch.
//
// Step numbering (9-step wizard):
//   1 = Info/Intro (no validation, always passes)
//   2 = Anlass
//   3 = Datum & Uhrzeit
//   4 = Ort
//   5 = Gäste
//   6 = Zutaten
//   7 = Setup
//   8 = Kontakt
//   9 = Übersicht + AGB

const EVENT_TYPES = new Set(['hochzeit', 'firma', 'geburtstag', 'privat']);
const TIME_RE = /^\d{2}:\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_TOPPINGS = 6;

// Accept any integer between 1 and 12 hours (3/4/5 are canonical, user can also pick custom)
function isValidDuration(h) {
  return Number.isInteger(h) && h >= 1 && h <= 12;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function isFiniteNumber(n) {
  return typeof n === 'number' && Number.isFinite(n);
}

// Step 2: Anlass (was step 1)
function validateStep2(state) {
  const errors = [];
  if (!state.eventType || !EVENT_TYPES.has(state.eventType)) {
    errors.push({ field: 'eventType', msg: 'Bitte Anlass wählen.' });
  }
  return errors;
}

// Step 3: Datum & Uhrzeit (was step 2)
function validateStep3(state) {
  const errors = [];
  if (!state.date) {
    errors.push({ field: 'date', msg: 'Datum wählen.' });
  } else if (state.date < todayISO()) {
    errors.push({ field: 'date', msg: 'Datum darf nicht in der Vergangenheit liegen.' });
  }

  if (!state.time || !TIME_RE.test(state.time)) {
    errors.push({ field: 'time', msg: 'Uhrzeit setzen.' });
  }

  if (!isValidDuration(state.durationHours)) {
    errors.push({ field: 'durationHours', msg: 'Dauer wählen (1-12 Stunden).' });
  }

  if (!state.availabilityChecked) {
    errors.push({ field: 'availabilityChecked', msg: 'Verfügbarkeit prüfen.' });
  } else {
    const result = state.availabilityResult;
    if (!result || result.available !== true) {
      const conflict = result && result.conflictOn ? ` (${result.conflictOn})` : '';
      errors.push({ field: 'availabilityResult', msg: `Termin nicht verfügbar.${conflict}` });
    }
  }

  return errors;
}

// Step 4: Ort (was step 3)
function validateStep4(state) {
  const errors = [];
  if (!state.address || String(state.address).trim().length === 0) {
    errors.push({ field: 'address', msg: 'Event-Ort angeben.' });
  }
  if (!isFiniteNumber(state.distanceKm) || state.distanceKm < 0) {
    errors.push({ field: 'distanceKm', msg: 'Distanz konnte nicht berechnet werden.' });
  }
  return errors;
}

// Step 5: Gäste (was step 4)
function validateStep5(state) {
  const errors = [];
  const adults = Number(state.adults) || 0;
  const children = Number(state.children) || 0;
  const vegetarian = Number(state.vegetarian) || 0;
  const total = adults + children;

  if (total < 1) {
    errors.push({ field: 'adults', msg: 'Mindestens ein Gast.' });
  }
  // total < 30 is a soft warning handled in the UI, NOT an error here.

  if (vegetarian > total) {
    errors.push({ field: 'vegetarian', msg: 'Vegetarisch kann Gäste-Anzahl nicht überschreiten.' });
  }
  return errors;
}

// Step 6: Zutaten (was exactly 6, now max 6, 0 is OK)
function validateStep6(state) {
  const errors = [];
  const n = Array.isArray(state.toppings) ? state.toppings.length : 0;
  if (n > MAX_TOPPINGS) {
    errors.push({ field: 'toppings', msg: 'Maximal 6 Zutaten.' });
  }
  return errors;
}

// Step 7: Setup (was step 6)
function validateStep7(state) {
  const errors = [];
  const setup = state.setup || {};
  const checks = [
    ['power', 'Strom'],
    ['space', 'Platz'],
    ['shelter', 'Überdachung'],
  ];
  for (const [key, label] of checks) {
    if (setup[key] == null) {
      errors.push({ field: `setup.${key}`, msg: `Frage beantworten: ${label}.` });
    }
  }
  return errors;
}

// Step 8: Kontakt (was step 7)
function validateStep8(state) {
  const errors = [];
  const name = typeof state.name === 'string' ? state.name.trim() : '';
  if (name.length < 2) {
    errors.push({ field: 'name', msg: 'Name angeben.' });
  }

  if (!state.email || !EMAIL_RE.test(state.email)) {
    errors.push({ field: 'email', msg: 'Gültige E-Mail.' });
  }

  const digits = typeof state.phone === 'string' ? state.phone.replace(/\D/g, '') : '';
  if (digits.length < 8) {
    errors.push({ field: 'phone', msg: 'Telefonnummer angeben.' });
  }
  return errors;
}

// Step 9: Übersicht + AGB (was step 8)
function validateStep9(state) {
  const errors = [];
  if (!state.acceptedTerms) {
    errors.push({ field: 'acceptedTerms', msg: 'AGB bestätigen.' });
  }
  for (let s = 2; s <= 8; s++) {
    errors.push(...validateStep(s, state));
  }
  return errors;
}

export function validateStep(step, state) {
  switch (step) {
    case 1: return []; // Info/Intro — always valid
    case 2: return validateStep2(state);
    case 3: return validateStep3(state);
    case 4: return validateStep4(state);
    case 5: return validateStep5(state);
    case 6: return validateStep6(state);
    case 7: return validateStep7(state);
    case 8: return validateStep8(state);
    case 9: return validateStep9(state);
    default: return [];
  }
}

export function canAdvance(step, state) {
  switch (step) {
    case 1:
      return true; // Info — no validation
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
      return validateStep(step, state).length === 0;
    case 9:
      return state.acceptedTerms === true;
    default:
      return false;
  }
}
