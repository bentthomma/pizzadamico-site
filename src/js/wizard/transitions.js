// CSS-only step transitions for the wizard.
// No GSAP. Pure classList + data-attributes flipped across frames, so the
// CSS in src/css/wizard.css drives the actual motion. Respects
// prefers-reduced-motion by skipping all timing.

const LEAVE_MS = 260;
const MOUNT_MS = 700;

export function respectsReducedMotion() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

/**
 * Transition the wizard stage from the current step to the next one.
 * @param {HTMLElement} stage  The #wizard-stage element.
 * @param {(stage: HTMLElement) => void} renderNextFn  Renders the new step
 *        into `stage`. It must empty the stage and append a
 *        <section class="wizard-step is-mounting">.
 * @param {'forward'|'backward'|'initial'} direction
 */
export async function animateStepChange(stage, renderNextFn, direction) {
  if (!stage || typeof renderNextFn !== 'function') return;

  // Initial mount — no leave animation, no enter offset, just render.
  if (direction === 'initial') {
    renderNextFn(stage);
    stage.scrollTop = 0;
    const fresh = stage.querySelector('.wizard-step');
    if (fresh) {
      fresh.classList.add('active');
      // Strip is-mounting after a tick so children can settle first.
      if (respectsReducedMotion()) {
        fresh.classList.remove('is-mounting');
      } else {
        setTimeout(() => fresh.classList.remove('is-mounting'), MOUNT_MS);
      }
    }
    return;
  }

  const reduced = respectsReducedMotion();

  // 1) Leave current step.
  const current = stage.querySelector('.wizard-step');
  if (!current) {
    // Nothing to leave, fall through to initial path.
    return animateStepChange(stage, renderNextFn, 'initial');
  }

  const leaveDir = direction === 'forward' ? 'to-left' : 'to-right';
  current.dataset.leave = leaveDir;
  current.classList.remove('active');

  if (!reduced) {
    await wait(LEAVE_MS);
  }

  // 2) Render next step (renderer empties stage + appends .wizard-step.is-mounting).
  renderNextFn(stage);

  // 3) Reset scroll inside stage.
  stage.scrollTop = 0;

  const next = stage.querySelector('.wizard-step');
  if (!next) return;

  // 4) Set initial enter offset, then flip to active on next frames so the
  //    CSS transition has a from-state to animate away from.
  const enterDir = direction === 'forward' ? 'from-right' : 'from-left';
  next.dataset.enter = enterDir;

  if (reduced) {
    // Skip framing: jump straight to final state.
    delete next.dataset.enter;
    next.classList.add('active');
    next.classList.remove('is-mounting');
    return;
  }

  // Two rAFs: first applies the from-state, second kicks the transition.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      delete next.dataset.enter;
      next.classList.add('active');
    });
  });

  setTimeout(() => next.classList.remove('is-mounting'), MOUNT_MS);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
