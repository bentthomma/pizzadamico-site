import { qs, qsa } from '../lib/dom.js';

let isOpen = false;
let lastFocus = null;
let savedScrollY = 0;

function getFocusables(root) {
  return qsa('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', root);
}

export function openModal() {
  if (isOpen) return;
  const modal = qs('#catering-modal');
  if (!modal) return;

  isOpen = true;
  lastFocus = document.activeElement;
  savedScrollY = window.scrollY;

  document.body.style.position = 'fixed';
  document.body.style.top = `-${savedScrollY}px`;
  document.body.style.width = '100%';

  modal.setAttribute('aria-hidden', 'false');

  const first = getFocusables(modal)[0];
  first?.focus();

  document.dispatchEvent(new CustomEvent('modal:opened'));
}

export function closeModal() {
  if (!isOpen) return;
  const modal = qs('#catering-modal');
  if (!modal) return;

  isOpen = false;
  modal.setAttribute('aria-hidden', 'true');

  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  window.scrollTo(0, savedScrollY);

  lastFocus?.focus();
  document.dispatchEvent(new CustomEvent('modal:closed'));
}

export function toggleModal() { isOpen ? closeModal() : openModal(); }
export function isModalOpen() { return isOpen; }

function onKeydown(e) {
  if (!isOpen) return;

  if (e.key === 'Escape') { closeModal(); return; }

  if (e.key === 'Tab') {
    const modal = qs('#catering-modal');
    const focusables = getFocusables(modal);
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
}

export function initModal() {
  document.addEventListener('keydown', onKeydown);
  qsa('[data-modal-close]').forEach((el) => el.addEventListener('click', closeModal));
  document.addEventListener('modal:open', openModal);
  document.addEventListener('modal:close', closeModal);
}
