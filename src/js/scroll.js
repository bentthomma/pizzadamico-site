// Section-snap scrolling · via native CSS scroll-snap.
// html has scroll-snap-type: y mandatory, each .akt + footer has scroll-snap-align: start.
// scroll-snap-stop: always forces exactly one snap per gesture.
// Lenis entfernt — CSS-native ist zuverlässiger + butter-smooth mit browser scroll-behavior: smooth.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initScroll() {
  // Keep ScrollTrigger in sync with native scroll
  window.addEventListener('resize', () => ScrollTrigger.refresh());

  // Keyboard navigation: Arrow keys, Page keys, Home/End
  window.addEventListener('keydown', (e) => {
    if (isModalOpen() || isInputTarget(e.target)) return;
    const sections = [...document.querySelectorAll('.akt'), document.querySelector('.site-footer')].filter(Boolean);
    const current = currentSectionIndex(sections);

    if (['ArrowDown', 'PageDown'].includes(e.key)) {
      e.preventDefault();
      snapTo(sections, Math.min(current + 1, sections.length - 1));
    } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
      e.preventDefault();
      snapTo(sections, Math.max(current - 1, 0));
    } else if (e.key === 'Home') {
      e.preventDefault();
      snapTo(sections, 0);
    } else if (e.key === 'End') {
      e.preventDefault();
      snapTo(sections, sections.length - 1);
    }
  });
}

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

function currentSectionIndex(sections) {
  const y = window.scrollY + 60;
  for (let i = 0; i < sections.length; i++) {
    const el = sections[i];
    if (y >= el.offsetTop && y < el.offsetTop + el.offsetHeight) return i;
  }
  return 0;
}

function snapTo(sections, idx) {
  const el = sections[idx];
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function scrollTo(target) {
  const sections = [...document.querySelectorAll('.akt'), document.querySelector('.site-footer')].filter(Boolean);
  let el = null;
  if (typeof target === 'string') el = document.querySelector(target);
  else if (target instanceof HTMLElement) el = target;
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function destroyScroll() { /* no-op */ }
