import { describe, it, expect } from 'vitest';
import { reduceMotion } from '@/js/reduced-motion.js';

describe('reduceMotion', () => {
  it('exposes a boolean value getter', () => {
    expect(typeof reduceMotion.value).toBe('boolean');
  });

  it('subscribe delivers current state synchronously', () => {
    let called = false;
    reduceMotion.subscribe(() => { called = true; });
    expect(called).toBe(true);
  });
});
