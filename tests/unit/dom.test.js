import { describe, it, expect } from 'vitest';
import { createEl, setText, empty, qs, qsa } from '@/js/lib/dom.js';

describe('dom helpers', () => {
  it('createEl builds elements with attrs and children', () => {
    const el = createEl('div', { class: 'x', 'data-y': '1' }, ['hello']);
    expect(el.tagName).toBe('DIV');
    expect(el.className).toBe('x');
    expect(el.getAttribute('data-y')).toBe('1');
    expect(el.textContent).toBe('hello');
  });

  it('createEl supports dataset shorthand', () => {
    const el = createEl('div', { dataset: { foo: 'bar' } });
    expect(el.dataset.foo).toBe('bar');
  });

  it('createEl supports aria shorthand', () => {
    const el = createEl('button', { aria: { label: 'close', hidden: true } });
    expect(el.getAttribute('aria-label')).toBe('close');
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });

  it('createEl treats child strings as text nodes (no HTML injection)', () => {
    const el = createEl('p', {}, ['<script>x</script>']);
    expect(el.textContent).toBe('<script>x</script>');
    expect(el.querySelector('script')).toBeNull();
  });

  it('setText replaces text', () => {
    const el = document.createElement('span');
    el.textContent = 'old';
    setText(el, 'new');
    expect(el.textContent).toBe('new');
  });

  it('empty removes all children', () => {
    const el = document.createElement('div');
    el.appendChild(document.createElement('span'));
    el.appendChild(document.createElement('span'));
    empty(el);
    expect(el.children.length).toBe(0);
  });

  it('qs/qsa wrap selectors', () => {
    document.body.innerHTML = '<div><span class="a"></span><span class="a"></span></div>';
    expect(qs('.a')).toBeTruthy();
    expect(qsa('.a')).toHaveLength(2);
  });
});
