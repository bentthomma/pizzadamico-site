import { getState, patch } from './wizard/state.js';
import { calcPricing } from './wizard/pricing.js';

const ENDPOINT = '/api/catering.php';

export async function submitWizard() {
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
    submittedAt: new Date().toISOString(),
  };

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await safeJson(res);
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    patch({ submitted: true, submittedAt: payload.submittedAt });
    return { ok: true };
  } catch (err) {
    if (import.meta.env.VITE_EMAILJS_SERVICE_ID) {
      try {
        await sendViaEmailJS(payload);
        patch({ submitted: true, submittedAt: payload.submittedAt });
        return { ok: true, via: 'emailjs' };
      } catch (e2) {
        return { ok: false, error: e2.message };
      }
    }
    return { ok: false, error: err.message };
  }
}

async function safeJson(res) { try { return await res.json(); } catch { return {}; } }

async function sendViaEmailJS(payload) {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const userId = import.meta.env.VITE_EMAILJS_USER_ID;
  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ service_id: serviceId, template_id: templateId, user_id: userId, template_params: payload }),
  });
  if (!res.ok) throw new Error(`emailjs ${res.status}`);
}
