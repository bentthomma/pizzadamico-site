const mq = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)')
  : { matches: false, addEventListener() {}, removeEventListener() {} };

const listeners = new Set();

export const reduceMotion = {
  get value() { return mq.matches; },
  subscribe(fn) {
    listeners.add(fn);
    fn(mq.matches);
    return () => listeners.delete(fn);
  },
};

mq.addEventListener?.('change', (e) => {
  for (const fn of listeners) fn(e.matches);
});
