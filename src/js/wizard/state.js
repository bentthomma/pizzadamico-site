// Wizard State mit localStorage-Persistence (Draft-Save)
// Auto-restore bei Reload, auto-clear nach Submit

const LS_KEY = 'damico.wizard.v3';

const DEFAULT_STATE = {
  step: 1,
  // Event
  eventType: null,          // 'hochzeit' | 'firma' | 'geburtstag' | 'privat'
  // Datum
  date: null,               // ISO yyyy-mm-dd
  time: null,               // HH:MM
  durationHours: null,      // number (3, 4, 5)
  availabilityChecked: false,
  availabilityResult: null, // { available, conflictOn, alternativesSameDay, nextAvailableDays }
  // Ort
  address: null,            // string (formatted)
  addressCoords: null,      // [lon, lat]
  distanceKm: null,         // number (rounded)
  // Gäste
  adults: 0,
  children: 0,              // 5-10 Jahre
  vegetarian: 0,            // number of vegetarian guests
  // Zutaten
  toppings: [],             // 0–6 aus Pool (optional)
  // Setup
  setup: { power: null, space: null, shelter: null, access: null },
  // Kontakt
  name: null,
  email: null,
  phone: null,
  note: null,
  // Submit
  acceptedTerms: false,
  submitted: false,
  submittedAt: null,
  reference: null,
};

let state = { ...DEFAULT_STATE };
const listeners = new Set();

try {
  const raw = localStorage.getItem(LS_KEY);
  if (raw) {
    const saved = JSON.parse(raw);
    // Nur unsubmitted drafts wiederherstellen
    if (!saved.submitted) state = { ...DEFAULT_STATE, ...saved };
  }
} catch { /* ignore */ }

function persist() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

function notify() {
  const snapshot = getState();
  for (const fn of listeners) fn(snapshot);
}

export function getState() {
  return {
    ...state,
    toppings: [...state.toppings],
    setup: { ...state.setup },
    addressCoords: state.addressCoords ? [...state.addressCoords] : null,
  };
}

export function setField(key, value) {
  if (!(key in DEFAULT_STATE)) throw new Error(`unknown wizard field: ${key}`);
  state[key] = value;
  persist();
  notify();
}

export function patch(fields) {
  for (const [k, v] of Object.entries(fields)) {
    if (!(k in DEFAULT_STATE)) throw new Error(`unknown wizard field: ${k}`);
    state[k] = v;
  }
  persist();
  notify();
}

export function subscribe(fn) {
  listeners.add(fn);
  fn(getState());
  return () => listeners.delete(fn);
}

export function reset() {
  state = { ...DEFAULT_STATE };
  persist();
  notify();
}

export function totalGuests() {
  return (state.adults || 0) + (state.children || 0);
}

// Helper: kombiniere date + time zu ISO mit Zürich-Zeitzone
export function getStartDateTimeISO() {
  if (!state.date || !state.time) return null;
  return `${state.date}T${state.time}:00`;
}

export function getEndDateTimeISO() {
  if (!state.date || !state.time || !state.durationHours) return null;
  const [h, m] = state.time.split(':').map(Number);
  const startMs = new Date(`${state.date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`).getTime();
  if (isNaN(startMs)) return null;
  const endMs = startMs + state.durationHours * 3600 * 1000;
  const d = new Date(endMs);
  const yyyy = d.getFullYear();
  const MM = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}:00`;
}
