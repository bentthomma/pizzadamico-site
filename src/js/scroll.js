// Full-page style section-scrolling.
// Wheel/Touch/Keyboard = genau eine Section pro Geste.
// Dispatches 'section-settled' ONLY after intentional scrollToSection completes.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Eine Section pro Scroll-Geste. COOLDOWN länger als smooth-scroll-Dauer (~700-900ms)
// damit rapid-fire Wheel-Events nicht 2+ Sections auf einmal skippen.
const COOLDOWN_MS = 900;
const WHEEL_THRESHOLD = 20;
const TOUCH_THRESHOLD = 40;

let sections = [];
let currentIdx = 0;
let locked = false;
let lockTimer = null;
let touchStartY = 0;
let lastSyncTime = 0;

function isModalOpen() {
  return document.querySelector('.site-modal[aria-hidden="false"]') != null
      || document.querySelector('.site-mobile-menu[aria-hidden="false"]') != null
      || document.querySelector('.wizard-modal[aria-hidden="false"]') != null
      || document.querySelector('.wizard-modal.is-open') != null;
}

function isInputTarget(el) {
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

function collectSections() {
  sections = [...document.querySelectorAll('.akt'), document.querySelector('.site-footer')].filter(Boolean);
}

function currentFromScrollY() {
  const y = window.scrollY + 60;
  for (let i = 0; i < sections.length; i++) {
    const el = sections[i];
    if (y >= el.offsetTop && y < el.offsetTop + el.offsetHeight) return i;
  }
  return 0;
}

function dispatchSettled(idx) {
  window.dispatchEvent(new CustomEvent('section-settled', {
    detail: { idx, section: sections[idx] },
  }));
}

function scrollToSection(idx) {
  if (idx < 0) idx = 0;
  if (idx >= sections.length) idx = sections.length - 1;
  if (idx === currentIdx) return;
  locked = true;
  currentIdx = idx;
  // Sofort-Dispatch fuer Header-Highlight (keine Verzoegerung bis settled)
  if (idx !== lastActiveIdx) {
    lastActiveIdx = idx;
    dispatchActive(idx);
  }
  sections[idx].scrollIntoView({ behavior: 'smooth', block: 'start' });
  clearTimeout(lockTimer);
  lockTimer = setTimeout(() => {
    locked = false;
    dispatchSettled(idx);
  }, COOLDOWN_MS);
}

function isMobile() {
  return window.matchMedia('(max-width: 899px)').matches;
}

function onWheel(e) {
  if (isMobile()) return;  // Mobile: touch-events statt wheel
  if (isModalOpen()) return;
  if (e.target.closest('.site-modal-shell')) return;
  e.preventDefault();
  if (locked) return;  // während Cooldown: Wheel komplett stumm. 1 Section pro Geste.
  const absY = Math.abs(e.deltaY);
  if (absY < WHEEL_THRESHOLD) return;
  if (e.deltaY > 0) scrollToSection(currentIdx + 1);
  else scrollToSection(currentIdx - 1);
}

// Mobile Touch-Handler: 1 Section pro Swipe (wie Desktop-Wheel)
let touchStartTime = 0;
let touchSwipeFired = false;

function onTouchStart(e) {
  touchStartY = e.touches[0].clientY;
  touchStartTime = performance.now();
  touchSwipeFired = false;
}

function onTouchMove(e) {
  if (touchSwipeFired) return;
  if (isModalOpen()) return;
  // Scroll innerhalb Modal/Wizard-Shell/Lightbox unberührt lassen
  if (e.target.closest('.site-modal-shell, .wizard-shell, .gallery-lightbox, .gallery-grid')) return;
  if (locked) return;

  const dy = touchStartY - e.touches[0].clientY;  // pos = swipe up = scroll down
  if (Math.abs(dy) < TOUCH_THRESHOLD) return;

  touchSwipeFired = true;
  // preventDefault stoppt native scroll — wir übernehmen
  if (e.cancelable) e.preventDefault();
  if (dy > 0) scrollToSection(currentIdx + 1);
  else scrollToSection(currentIdx - 1);
}

function onTouchEnd() {
  // Reset — falls touchmove nie gefired hat (kurzer tap)
  touchSwipeFired = false;
}

function onKeyDown(e) {
  if (isModalOpen() || isInputTarget(e.target)) return;
  if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
    e.preventDefault();
    if (!locked) scrollToSection(currentIdx + 1);
  } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
    e.preventDefault();
    if (!locked) scrollToSection(currentIdx - 1);
  } else if (e.key === 'Home') {
    e.preventDefault();
    if (!locked) scrollToSection(0);
  } else if (e.key === 'End') {
    e.preventDefault();
    if (!locked) scrollToSection(sections.length - 1);
  }
}

let idleTimer = null;
let lastSettledIdx = -1;

let lastActiveIdx = -1;

function dispatchActive(idx) {
  window.dispatchEvent(new CustomEvent('section-active', {
    detail: { idx, section: sections[idx] },
  }));
}

function onScroll() {
  const now = performance.now();
  if (now - lastSyncTime < 100) return;
  lastSyncTime = now;
  if (!locked) {
    const newIdx = currentFromScrollY();
    if (newIdx !== currentIdx) {
      currentIdx = newIdx;
    }
    if (newIdx !== lastActiveIdx) {
      lastActiveIdx = newIdx;
      dispatchActive(newIdx);
    }
  }

  // Scroll idle → dispatch section-settled (Desktop + Mobile)
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    const idx = currentFromScrollY();
    if (idx !== lastSettledIdx) {
      lastSettledIdx = idx;
      dispatchSettled(idx);
    }
  }, 300);
}

export function initScroll() {
  collectSections();
  currentIdx = currentFromScrollY();

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false });  // non-passive für preventDefault
  window.addEventListener('touchend', onTouchEnd, { passive: true });
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    collectSections();
    ScrollTrigger.refresh();
  });

  // Initial: announce Akt 1 (for header state only, reveal skips akt-1)
  requestAnimationFrame(() => {
    dispatchSettled(currentFromScrollY());
  });
}

export function scrollTo(target) {
  collectSections();
  let idx = -1;
  if (typeof target === 'string') {
    const el = document.querySelector(target);
    if (el) idx = sections.indexOf(el);
  } else if (target instanceof HTMLElement) {
    idx = sections.indexOf(target);
  }
  if (idx >= 0) scrollToSection(idx);
}

export function destroyScroll() {
  window.removeEventListener('wheel', onWheel);
  window.removeEventListener('touchstart', onTouchStart);
  window.removeEventListener('touchmove', onTouchMove);
  window.removeEventListener('touchend', onTouchEnd);
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('scroll', onScroll);
}
