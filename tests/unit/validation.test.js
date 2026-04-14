import { describe, it, expect } from 'vitest';
import { validateStep, canAdvance } from '@/js/wizard/validation.js';

const base = {
  eventType: null, date: null, time: null, duration: null,
  address: null, adults: 0, children: 0, vegPercent: 0, toppings: [],
  setup: {}, name: null, email: null, phone: null,
};

describe('validation', () => {
  it('step 1 requires eventType', () => {
    expect(validateStep(1, base)).toHaveLength(1);
    expect(validateStep(1, { ...base, eventType: 'hochzeit' })).toHaveLength(0);
  });

  it('step 2 flags past date', () => {
    const past = { ...base, date: '2020-01-01', time: '18:00', duration: '3h' };
    expect(validateStep(2, past).some(e => e.field === 'date')).toBe(true);
  });

  it('step 5 requires 1..6 toppings', () => {
    expect(validateStep(5, { ...base, toppings: [] })[0].field).toBe('toppings');
    expect(validateStep(5, { ...base, toppings: ['a','b','c','d','e','f','g'] })[0].msg).toMatch(/sechs/);
    expect(validateStep(5, { ...base, toppings: ['a','b'] })).toHaveLength(0);
  });

  it('step 7 validates email format', () => {
    const ok = { ...base, name: 'Ben', email: 'b@x.ch', phone: '0123456789' };
    expect(validateStep(7, ok)).toHaveLength(0);
    expect(validateStep(7, { ...ok, email: 'bogus' }).some(e => e.field === 'email')).toBe(true);
  });

  it('canAdvance is permissive except step 7', () => {
    expect(canAdvance(3, base)).toBe(true);
    expect(canAdvance(7, base)).toBe(false);
  });
});
