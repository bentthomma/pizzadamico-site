// Live-Price sidebar for the catering wizard.
// Builds a stable DOM once and updates the same element references on every
// state snapshot. Numeric amounts tween via animateCounter() which relies on
// dataset.currentValue — so element identity must be preserved.

import { calcPricing, formatChf, animateCounter } from './pricing.js';
import { subscribe } from './state.js';
import { createEl, qs, setText } from '../lib/dom.js';

export function initPricingView() {
  const sidebar = qs('#wizard-sidebar');
  if (!sidebar) return;

  // Build static structure once.
  const head = createEl('div', { class: 'wizard-sidebar-head' }, [
    createEl('div', { class: 'wizard-sidebar-kicker' }, ['Live-Preis']),
    createEl('div', { class: 'wizard-sidebar-title' }, [
      'CHF ',
      createEl('span', { class: 'live-total', 'data-total': 'true' }, ['0.00']),
    ]),
  ]);

  const list = createEl('ul', { class: 'wizard-price-list' });

  const rule = createEl('hr', { class: 'wizard-price-rule' });

  const sub = createEl('div', { class: 'wizard-price-sub' }, [
    createEl('div', { class: 'wizard-price-line' }, [
      createEl('span', { class: 'wizard-price-label' }, ['Netto']),
      createEl('span', { class: 'wizard-price-amount', 'data-netto': 'true' }, ['0.00']),
    ]),
    createEl('div', { class: 'wizard-price-line' }, [
      createEl('span', { class: 'wizard-price-label' }, ['8.1 % MwSt']),
      createEl('span', { class: 'wizard-price-amount', 'data-vat': 'true' }, ['0.00']),
    ]),
  ]);

  const total = createEl('div', { class: 'wizard-price-total' }, [
    createEl('span', { class: 'wizard-price-total-label' }, ['Total CHF']),
    createEl('span', { class: 'wizard-price-total-amount', 'data-grand': 'true' }, ['0.00']),
  ]);

  const note = createEl('p', { class: 'wizard-price-note' }, [
    'Verbindlich nach CHF 250.– Anzahlung per TWINT.',
  ]);

  // Clear any prior content (e.g. from a previous mount) and append.
  while (sidebar.firstChild) sidebar.removeChild(sidebar.firstChild);
  sidebar.appendChild(head);
  sidebar.appendChild(list);
  sidebar.appendChild(rule);
  sidebar.appendChild(sub);
  sidebar.appendChild(total);
  sidebar.appendChild(note);

  // Stable element references for animated updates.
  const totalEl = head.querySelector('[data-total]');
  const nettoEl = sub.querySelector('[data-netto]');
  const vatEl = sub.querySelector('[data-vat]');
  const grandEl = total.querySelector('[data-grand]');

  // Mobile visibility badge (lives outside the sidebar).
  const toggleAmount = qs('#wizard-sidebar-toggle-amount');

  // Build a single line <li> with stable label + amount spans.
  function buildLine(line) {
    const labelEl = createEl('span', { class: 'wizard-price-label' }, [line.label]);
    const amountEl = createEl('span', { class: 'wizard-price-amount' }, ['0.00']);
    const li = createEl('li', {
      class: 'wizard-price-line',
      'data-dim': line.dim ? 'true' : 'false',
    }, [labelEl, amountEl]);
    return { li, labelEl, amountEl };
  }

  // Cache of line element refs, index-aligned with lines[].
  let lineRefs = [];

  function renderLines(lines) {
    // Recreate if length mismatches (defensive — pricing.js currently emits 4).
    if (lineRefs.length !== lines.length) {
      while (list.firstChild) list.removeChild(list.firstChild);
      lineRefs = lines.map((ln) => {
        const refs = buildLine(ln);
        list.appendChild(refs.li);
        return refs;
      });
      return;
    }
    // Otherwise just update labels + dim state in place; amounts tween below.
    for (let i = 0; i < lines.length; i++) {
      const ln = lines[i];
      const ref = lineRefs[i];
      setText(ref.labelEl, ln.label);
      const dim = ln.dim ? 'true' : 'false';
      if (ref.li.getAttribute('data-dim') !== dim) {
        ref.li.setAttribute('data-dim', dim);
      }
    }
  }

  subscribe((s) => {
    const p = calcPricing(s);

    renderLines(p.lines);

    // Animate per-line amounts (null → 0 for counter purposes).
    for (let i = 0; i < p.lines.length; i++) {
      const target = p.lines[i].amount != null ? p.lines[i].amount : 0;
      animateCounter(lineRefs[i].amountEl, target, 500);
    }

    // Animate aggregate amounts.
    animateCounter(nettoEl, p.netto, 500);
    animateCounter(vatEl, p.vat, 500);
    animateCounter(grandEl, p.total, 500);
    animateCounter(totalEl, p.total, 500);

    // Mobile badge (static label — no animation needed).
    if (toggleAmount) setText(toggleAmount, formatChf(p.total));
  });
}
