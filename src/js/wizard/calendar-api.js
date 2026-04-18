// Apps Script Wrapper für Kalender-Verfügbarkeit + Reservation
// Mit Retry-Logic bei Netzwerkfehlern

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwrsZ9WQb8moAyeXvj1KyvqIqrm2x0D3DncnoMwAncHagtpBH-hR1bNjUF0jSLvKg6RhA/exec';

async function callWithRetry(url, opts = {}, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(url, opts);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt === maxRetries - 1) throw err;
      // Exponential backoff: 500ms, 1000ms, 2000ms
      await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt)));
    }
  }
}

export async function checkAvailability(startISO, endISO) {
  const params = new URLSearchParams({
    action: 'check',
    start: startISO,
    end: endISO,
  });
  return callWithRetry(`${APPS_SCRIPT_URL}?${params}`);
}

export async function reserveSlot(data) {
  const params = new URLSearchParams({
    action: 'reserve',
    data: JSON.stringify(data),
  });
  return callWithRetry(`${APPS_SCRIPT_URL}?${params}`);
}

// Holt eine Vorschau aller belegten Tage in einem Zeitraum
// (Debug-Action erweitern oder einen eigenen 'busyDays'-Endpoint bauen)
// Vorerst: Für jeden Tag checkAvailability sequenziell — langsam, besser batched Endpoint später
export async function getBusyDaysInRange(fromISO, toISO) {
  // Für einen Monat: 30 Calls mit 500ms Retry = könnte bis 15s dauern
  // Besser: Apps Script um "getEventsInRange" Endpoint erweitern
  // TODO: Endpoint 'events' in Apps Script hinzufügen
  return [];
}
