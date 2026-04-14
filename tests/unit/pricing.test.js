import { describe, it, expect } from 'vitest';
import { calcPricing, RATES, formatChf } from '@/js/wizard/pricing.js';

describe('pricing', () => {
  it('adults only', () => {
    const p = calcPricing({ adults: 30, children: 0, distanceKm: null });
    expect(p.lines[0].amount).toBe(750);
    expect(p.subtotal).toBe(750);
    expect(p.vat).toBeCloseTo(60.75, 2);
    expect(p.total).toBeCloseTo(810.75, 2);
    expect(p.complete).toBe(false);
  });

  it('adults + kids + km', () => {
    const p = calcPricing({ adults: 40, children: 10, distanceKm: 20 });
    expect(p.subtotal).toBe(1180);
    expect(p.vat).toBeCloseTo(1180 * 0.081, 2);
    expect(p.complete).toBe(true);
  });

  it('marks missing lines as dim', () => {
    const p = calcPricing({ adults: 0, children: 0, distanceKm: null });
    expect(p.lines.every(l => l.dim)).toBe(true);
  });

  it('formatChf produces "1<sep>234.50" with a thousands-separator', () => {
    const formatted = formatChf(1234.5);
    // Accept either typographic apostrophe (’), straight apostrophe ('), or narrow NBSP (\u202F)
    // depending on Node ICU version. Just check the shape.
    expect(formatted).toMatch(/^1['’\u202F\u00A0]?234\.50$/);
  });

  it('RATES is frozen', () => {
    expect(() => { RATES.adult = 99; }).toThrow();
  });
});
