import { describe, it, expect } from 'vitest';
import fs from 'node:fs';

describe('tokens', () => {
  const css = fs.readFileSync('src/css/tokens.css', 'utf8');
  it('has palette tokens', () => {
    for (const n of ['--c-farina', '--c-inchiostro', '--c-brace', '--c-fuoco', '--c-pane', '--c-semola']) {
      expect(css).toMatch(new RegExp(`${n}\\s*:`));
    }
  });
  it('has exact hex values', () => {
    expect(css).toContain('#F0E6D2');
    expect(css).toContain('#14100C');
    expect(css).toContain('#1A0F08');
    expect(css).toContain('#D24A1A');
  });
  it('caps display at 80px', () => {
    expect(css).toMatch(/--fs-statement:\s*clamp\(44px,\s*5\.5vw,\s*80px\)/);
  });
});
