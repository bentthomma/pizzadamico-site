import { calcPricing, formatChf, RATES } from './pricing.js';
import { subscribe } from './state.js';
import { createEl, empty, qs } from '../lib/dom.js';

export function initPricingView() {
  const root = qs('#wizard-pricing');
  if (!root) return;

  subscribe((s) => {
    const p = calcPricing(s);
    empty(root);

    root.appendChild(createEl('div', { class: 'kicker', style: 'color: var(--c-fuoco);' }, ['Aktuelle Schätzung']));
    root.appendChild(createEl('div', { style: 'font-family: var(--ff-display); font-variation-settings: \'wdth\' 82, \'wght\' 700; font-size: 34px; line-height: 1; margin: 4px 0 2px;' }, [`CHF ${formatChf(p.total)}`]));
    root.appendChild(createEl('div', { class: 'meta', style: 'opacity: 0.6; margin-bottom: 14px;' }, [`inkl. ${RATES.vatPercent}% MwSt`]));

    for (const ln of p.lines) {
      const row = createEl('div', { style: `display:flex; justify-content:space-between; padding: 6px 0; border-top: 1px dashed var(--c-line); opacity: ${ln.dim ? '0.4' : '1'};` });
      row.appendChild(createEl('span', {}, [ln.label]));
      row.appendChild(createEl('span', { style: 'font-variant-numeric: tabular-nums;' }, [ln.amount != null ? formatChf(ln.amount) : '—']));
      root.appendChild(row);
    }

    root.appendChild(sep());
    root.appendChild(kv('Zwischensumme', formatChf(p.subtotal)));
    root.appendChild(kv(`MwSt ${RATES.vatPercent}%`, formatChf(p.vat)));
    root.appendChild(sepBold());
    root.appendChild(kv('Total', formatChf(p.total), true));
    root.appendChild(createEl('div', { class: 'meta', style: 'opacity: 0.55; text-align:right; margin-top: 4px;' }, ['Anzahlung folgt nach Rücksprache']));
  });
}

function sep() { return createEl('hr', { style: 'border: 0; border-top: 1px solid var(--c-line); margin: 8px 0 0;' }); }
function sepBold() { return createEl('hr', { style: 'border: 0; border-top: 1px solid var(--c-inchiostro); margin: 10px 0 6px;' }); }
function kv(k, v, bold = false) {
  const row = createEl('div', { style: `display:flex; justify-content:space-between; padding: 4px 0; font-weight: ${bold ? '700' : '400'};` });
  row.appendChild(createEl('span', {}, [k]));
  row.appendChild(createEl('span', { style: 'font-variant-numeric: tabular-nums;' }, [v]));
  return row;
}
