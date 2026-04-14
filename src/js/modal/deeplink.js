import { openModal } from './modal.js';

export function initDeepLink() {
  const url = new URL(window.location.href);
  if (url.searchParams.get('catering') === '1' || window.location.hash === '#catering') {
    requestAnimationFrame(() => openModal());
  }
}
