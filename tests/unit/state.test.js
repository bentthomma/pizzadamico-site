import { describe, it, expect, beforeEach } from 'vitest';
import { getState, setField, patch, reset, subscribe, totalGuests } from '@/js/wizard/state.js';

describe('wizard state', () => {
  beforeEach(() => { localStorage.clear(); reset(); });

  it('has sensible defaults', () => {
    const s = getState();
    expect(s.step).toBe(1);
    expect(s.adults).toBe(0);
    expect(s.toppings).toEqual([]);
    expect(s.submitted).toBe(false);
  });

  it('setField updates and notifies', () => {
    let seen = null;
    subscribe((s) => { seen = s; });
    setField('adults', 40);
    expect(getState().adults).toBe(40);
    expect(seen.adults).toBe(40);
  });

  it('patch updates multiple fields', () => {
    patch({ adults: 30, children: 5 });
    expect(totalGuests()).toBe(35);
  });

  it('rejects unknown fields', () => {
    expect(() => setField('foo', 1)).toThrow();
  });

  it('persists to localStorage', () => {
    setField('adults', 50);
    const raw = localStorage.getItem('damico.wizard.v1');
    expect(raw).toContain('"adults":50');
  });
});
