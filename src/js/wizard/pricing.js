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
  const travelTotal = km != null ? km * 2 * RATES.kmRate : null;

  const subtotal = adultsTotal + childrenTotal + (travelTotal ?? 0);
  const vat = subtotal * (RATES.vatPercent / 100);
  const total = subtotal + vat;

  return {
    lines: [
      { label: `${adults} Erwachsene × ${RATES.adult}`, amount: adultsTotal, dim: adults === 0 },
      { label: `${children} Kinder × ${RATES.child}`,    amount: childrenTotal, dim: children === 0 },
      { label: km != null ? `Anfahrt ${(km * 2).toFixed(1)} km × ${RATES.kmRate}` : 'Anfahrt (Ort fehlt)', amount: travelTotal, dim: km == null },
    ],
    subtotal,
    vat,
    total,
    deposit: RATES.deposit,
    complete: adults + children > 0 && km != null,
  };
}

export function formatChf(n) {
  if (n == null || !isFinite(n)) return '—';
  return n.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
