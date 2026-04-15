import { getState, patch } from './wizard/state.js';
import { calcPricing } from './wizard/pricing.js';

const CHECK_ENDPOINT  = '/api/reservations/check.php';
const CREATE_ENDPOINT = '/api/reservations/create.php';

export async function checkAvailability() {
  const s = getState();
  if (!s.date || !s.time || !s.duration) {
    return { ok: true, available: null };
  }
  try {
    const res = await fetch(CHECK_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: s.date, time: s.time, duration: s.duration }),
    });
    return await res.json();
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export async function submitReservation() {
  const state = getState();
  const pricing = calcPricing(state);
  const payload = {
    ...state,
    pricing: {
      subtotal: pricing.subtotal.toFixed(2),
      vat: pricing.vat.toFixed(2),
      total: pricing.total.toFixed(2),
    },
    _honey: '',
  };

  try {
    const res = await fetch(CREATE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.error, message: data.message, status: res.status };
    }
    patch({ submitted: true, submittedAt: new Date().toISOString() });
    return { ok: true, ...data };
  } catch (e) {
    return { ok: false, error: 'network-error', message: e.message };
  }
}
