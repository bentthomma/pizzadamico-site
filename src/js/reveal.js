// Subtle stagger-reveal for Akt content on scroll-into-view.
// One-shot: once revealed, observer releases the Akt.
// Respects prefers-reduced-motion: reveals all content immediately.

export function initReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal, .reveal-image').forEach(el => el.classList.add('reveal-in'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const targets = entry.target.querySelectorAll('.reveal, .reveal-image');
      targets.forEach((el, i) => {
        el.style.setProperty('--reveal-delay', `${i * 80}ms`);
        el.classList.add('reveal-in');
      });
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });

  document.querySelectorAll('.akt').forEach(akt => {
    // Skip Hero (Akt 1) — handles its own animation
    if (akt.id === 'akt-1') return;
    // Reveal immediately if already in viewport on load
    const rect = akt.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      akt.querySelectorAll('.reveal, .reveal-image').forEach(el => el.classList.add('reveal-in'));
      return;
    }
    observer.observe(akt);
  });
}
