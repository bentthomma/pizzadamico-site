import { describe, it, expect, beforeEach } from 'vitest';
import { splitWords, revertSplit } from '@/js/lib/split-text.js';

describe('splitWords', () => {
  let el;
  beforeEach(() => { el = document.createElement('div'); });

  it('wraps each word in a span', () => {
    el.textContent = 'Ich backe seit dreissig Jahren.';
    const words = splitWords(el);
    expect(words).toHaveLength(5);
    expect(words[0].textContent).toBe('Ich');
    expect(words[4].textContent).toBe('Jahren.');
  });

  it('preserves nested inline elements', () => {
    el.appendChild(document.createTextNode('nur '));
    const em = document.createElement('em');
    em.textContent = 'besser.';
    el.appendChild(em);
    splitWords(el);
    expect(el.querySelector('em')).toBeTruthy();
    expect(el.querySelectorAll('span.word')).toHaveLength(2);
  });

  it('is idempotent', () => {
    el.textContent = 'Hallo Welt';
    splitWords(el);
    splitWords(el);
    expect(el.querySelectorAll('span.word')).toHaveLength(2);
  });

  it('revertSplit restores original text', () => {
    el.textContent = 'Hallo Welt';
    splitWords(el);
    revertSplit(el);
    expect(el.textContent).toBe('Hallo Welt');
    expect(el.querySelectorAll('span.word')).toHaveLength(0);
  });
});
