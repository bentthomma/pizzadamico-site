// Full-page style section-scrolling.
// Wheel/Touch/Keyboard = genau eine Section pro Geste · 900ms cooldown.
// CSS scroll-snap proximity als fallback alignment.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const COOLDOWN_MS = 900;
const WHEEL_THRESHOLD = 15;
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
      || document.querySelector('#contact-success[aria-hidden="false"]') != null;
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

function scrollToSection(idx) {
  if (idx < 0) idx = 0;
  if (idx >= sections.length) idx = sections.length - 1;
  if (idx === currentIdx) return;
  locked = true;
  currentIdx = idx;
  sections[idx].scrollIntoView({ behavior: 'smooth', block: 'start' });
  clearTimeout(lockTimer);
  lockTimer = setTimeout(() => { locked = false; }, COOLDOWN_MS);
}

function onWheel(e) {
  if (isModalOpen()) return;
  // If wheel target is inside a scrollable modal element, allow native
  if (e.target.closest('.site-modal-shell')) return;
  e.preventDefault();
  if (locked) return;
  if (Math.abs(e.deltaY) < WHEEL_THRESHOLD) return;
  if (e.deltaY > 0) scrollToSection(currentIdx + 1);
  else scrollToSection(currentIdx - 1);
}

function onTouchStart(e) {
  touchStartY = e.touches[0].clientY;
}

function onTouchEnd(e) {
  if (isModalOpen()) return;
  if (locked) return;
  const dy = touchStartY - e.changedTouches[0].clientY;
  if (Math.abs(dy) < TOUCH_THRESHOLD) return;
  if (dy > 0) scrollToSection(currentIdx + 1);
  else scrollToSection(currentIdx - 1);
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

function onScroll() {
  // Throttled sync
  const now = performance.now();
  if (now - lastSyncTime < 100) return;
  lastSyncTime = now;
  if (!locked) {
    currentIdx = currentFromScrollY();
  }
}

export function initScroll() {
  collectSections();
  currentIdx = currentFromScrollY();

  // Wheel event — use capture phase + passive false so preventDefault works
  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchend', onTouchEnd, { passive: true });
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    collectSections();
    ScrollTrigger.refresh();
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
  window.removeEventListener('touchend', onTouchEnd);
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('scroll', onScroll);
}
