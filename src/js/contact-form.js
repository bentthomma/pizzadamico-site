// AJAX submit for the contact form -> FormSubmit.co, shows success overlay
// instead of redirecting the user to a third-party thank-you page.

export function initContactForm() {
  const form = document.querySelector('.contact-form');
  const overlay = document.getElementById('contact-success');
  if (!form || !overlay) return;

  const submitBtn = form.querySelector('.contact-submit');
  const originalLabel = submitBtn ? submitBtn.textContent : '';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sende …';
    }

    try {
      const data = new FormData(form);
      const ajaxUrl = form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/');
      const res = await fetch(ajaxUrl, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const body = await res.json().catch(() => ({}));
      if (body && body.success === 'false') throw new Error(body.message || 'FormSubmit rejected');
      form.reset();
      // Close kontakt modal first (mobile), then show success
      const kontaktModal = document.getElementById('modal-kontakt');
      if (kontaktModal && kontaktModal.getAttribute('aria-hidden') === 'false') {
        kontaktModal.setAttribute('aria-hidden', 'true');
      }
      open(overlay);
    } catch (err) {
      console.error('[contact-form]', err);
      alert('Hmm, das hat nicht geklappt. Bitte nochmal versuchen oder direkt anrufen: 076 331 32 59');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }
    }
  });

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
