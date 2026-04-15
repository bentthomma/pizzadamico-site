// Contact form · AJAX submit with native-submit fallback.
// AJAX to FormSubmit.co /ajax/ endpoint for in-place success overlay.
// If AJAX fails (FormSubmit not yet confirmed, CORS, network), falls back
// to native form POST — which redirects user to FormSubmit confirmation page.

export function initContactForm() {
  const form = document.querySelector('.contact-form');
  const overlay = document.getElementById('contact-success');
  if (!form || !overlay) return;

  const submitBtn = form.querySelector('.contact-submit');
  const originalLabel = submitBtn ? submitBtn.textContent : '';
  let fallbackInProgress = false;

  async function handleSubmit(e) {
    if (fallbackInProgress) return;  // let native submit through
    e.preventDefault();
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sende …';
    }

    const data = new FormData(form);
    const ajaxUrl = form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/');

    try {
      const res = await fetch(ajaxUrl, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const body = await res.json().catch(() => ({}));
      if (body && String(body.success).toLowerCase() === 'false') {
        throw new Error('FORMSUBMIT_NOT_CONFIRMED');
      }
      // AJAX success
      form.reset();
      const kontaktModal = document.getElementById('modal-kontakt');
      if (kontaktModal && kontaktModal.getAttribute('aria-hidden') === 'false') {
        kontaktModal.setAttribute('aria-hidden', 'true');
      }
      open(overlay);
    } catch (err) {
      console.warn('[contact-form] AJAX failed → native submit fallback', err);
      fallbackInProgress = true;
      form.submit();  // native POST → FormSubmit handles redirect
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }
    }
  }

  form.addEventListener('submit', handleSubmit);

  overlay.querySelectorAll('[data-success-close]').forEach(el => {
    el.addEventListener('click', () => close(overlay));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.getAttribute('aria-hidden') === 'false') {
      close(overlay);
    }
  });
}

function open(overlay) {
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  const firstBtn = overlay.querySelector('.success-ok');
  if (firstBtn) firstBtn.focus();
}
function close(overlay) {
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
