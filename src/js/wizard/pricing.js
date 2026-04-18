// Preis-Kalkulation für Catering
// Formel: 250 (Reservation) + 25×Erw + 12×Kinder + 1.50×km×2 = netto
//         netto + 8.1% MwSt = total

export const RATES = Object.freeze({
  adult: 25,
  child: 12,
  kmRate: 1.50,
  deposit: 250,
  vatPercent: 8.1,
});

export function calcPricing(state) {
  const adults = state.adults || 0;
  const children = state.children || 0;
  const km = typeof state.distanceKm === 'number' ? state.distanceKm : null;

  const adultsTotal = adults * RATES.adult;
  const childrenTotal = children * RATES.child;
  const travelTotal = km != null ? km * 2 * RATES.kmRate : 0;
  const deposit = RATES.deposit;

  const netto = deposit + adultsTotal + childrenTotal + travelTotal;
  const vat = netto * (RATES.vatPercent / 100);
  const total = netto + vat;

  return {
    lines: [
      { label: 'Reservation (Infrastruktur)', amount: deposit, fixed: true },
      { label: `${adults} Erwachsene × ${RATES.adult}.–`, amount: adultsTotal, dim: adults === 0 },
      { label: `${children} Kinder × ${RATES.child}.–`, amount: childrenTotal, dim: children === 0 },
      { label: km != null ? `Anfahrt ${(km * 2).toFixed(1)} km × ${RATES.kmRate}` : 'Anfahrt (Ort fehlt)', amount: travelTotal, dim: km == null },
    ],
    netto,
    vat,
    total,
    deposit,
    complete: adults + children > 0 && km != null,
  };
}

export function formatChf(n) {
  if (n == null || !isFinite(n)) return '—';
  return n.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Animated counter: tween from current display value to target
export function animateCounter(element, targetValue, duration = 500) {
  if (!element) return;
  const startValue = parseFloat(element.dataset.currentValue || '0');
  const diff = targetValue - startValue;
  if (Math.abs(diff) < 0.01) {
    element.textContent = formatChf(targetValue);
    element.dataset.currentValue = String(targetValue);
    return;
  }
  const startTime = performance.now();
  const ease = (t) => 1 - Math.pow(1 - t, 3);  // easeOutCubic

  function frame(now) {
    const t = Math.min(1, (now - startTime) / duration);
    const current = startValue + diff * ease(t);
    element.textContent = formatChf(current);
    if (t < 1) requestAnimationFrame(frame);
    else element.dataset.currentValue = String(targetValue);
  }
  requestAnimationFrame(frame);
}
