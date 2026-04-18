// Safe DOM builders — avoid innerHTML for dynamic content.

export function createEl(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'aria') for (const [ak, av] of Object.entries(v)) el.setAttribute(`aria-${ak}`, String(av));
    else el.setAttribute(k, String(v));
  }
  for (const child of [].concat(children)) {
    if (child == null || child === false) continue;
    if (typeof child === 'string' || typeof child === 'number') el.appendChild(document.createTextNode(String(child)));
    else el.appendChild(child);
  }
  return el;
}

export function setText(el, text) {
  if (!el) return;
  el.textContent = String(text ?? '');
}

export function empty(el) {
  if (!el) return;
  while (el.firstChild) el.removeChild(el.firstChild);
}

export function qs(sel, root = document) { return root.querySelector(sel); }
export function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }
