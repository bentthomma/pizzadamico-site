const LS_KEY = 'damico.wizard.v1';

const DEFAULT_STATE = {
  step: 1,
  eventType: null,          // 'hochzeit' | 'firma' | 'geburtstag' | 'privat' | 'sonstiges'
  date: null,               // ISO yyyy-mm-dd
  time: null,               // HH:MM
  duration: null,           // '2h' | '3h' | '4h' | 'long'
  address: null,            // string (google places formatted)
  addressPlaceId: null,     // string
  distanceKm: null,         // number
  adults: 0,
  children: 0,              // 5-10 Jahre
  vegPercent: 0,            // 0..100
  toppings: [],             // max 6 aus Pool
  setup: { power: null, space: null, shelter: null }, // tri-state true/false/null
  name: null,
  email: null,
  phone: null,
  note: null,
  submitted: false,
  submittedAt: null,
};

let state = { ...DEFAULT_STATE };
const listeners = new Set();

try {
  const raw = localStorage.getItem(LS_KEY);
  if (raw) state = { ...DEFAULT_STATE, ...JSON.parse(raw) };
} catch { /* ignore */ }

function persist() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

function notify() {
  const snapshot = getState();
  for (const fn of listeners) fn(snapshot);
}

export function getState() { return { ...state, toppings: [...state.toppings], setup: { ...state.setup } }; }

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

export function totalGuests() { return (state.adults || 0) + (state.children || 0); }
