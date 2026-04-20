// Contact form · sends via Apps Script action=message (v14+).
// Replaces the old FormSubmit.co flow. Inline success/error state.

import { sendContactMessage } from './wizard/calendar-api.js';

export function initContactForm() {
  const form = document.getElementById('contact-form');
  const successEl = document.getElementById('contact-success-inline');
  const feedbackEl = document.getElementById('contact-feedback');
  if (!form || !successEl || !feedbackEl) return;

  const submitBtn = form.querySelector('.contact-submit');
  const originalLabel = submitBtn ? submitBtn.textContent : '';
  const modalEl = document.getElementById('modal-kontakt');

  function setFeedback(msg, kind) {
    feedbackEl.textContent = msg || '';
    feedbackEl.dataset.kind = kind || '';
  }

  function showSuccess() {
    form.setAttribute('aria-hidden', 'true');
    form.style.display = 'none';
    successEl.setAttribute('aria-hidden', 'false');
    successEl.style.display = '';
  }

  function resetForm() {
    form.reset();
    setFeedback('', '');
    form.style.display = '';
    form.removeAttribute('aria-hidden');
    successEl.setAttribute('aria-hidden', 'true');
    successEl.style.display = 'none';
  }

  // Reset when modal is closed so next open starts fresh
  if (modalEl) {
    const observer = new MutationObserver(() => {
      if (modalEl.getAttribute('aria-hidden') === 'true') {
        // delay to avoid mid-transition flash
        setTimeout(resetForm, 250);
      }
    });
    observer.observe(modalEl, { attributes: true, attributeFilter: ['aria-hidden'] });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Native HTML validation first
    if (!form.checkValidity()) {
      setFeedback('Bitte fülle Name, E-Mail und Nachricht aus und akzeptiere die Bedingungen.', 'error');
      form.reportValidity();
      return;
    }

    const fd = new FormData(form);
    const payload = {
      name: String(fd.get('name') || '').trim(),
      email: String(fd.get('email') || '').trim(),
      phone: String(fd.get('phone') || '').trim(),
      message: String(fd.get('message') || '').trim(),
      website: String(fd.get('website') || ''), // honeypot
    };

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sende …';
    }
    setFeedback('', '');

    try {
      const res = await sendContactMessage(payload);
      if (res && res.success) {
        showSuccess();
      } else {
        const errMsg = (res && res.error)
          ? res.error
          : 'Die Nachricht konnte nicht gesendet werden. Bitte ruf Pietro direkt an: 076 331 32 59.';
        setFeedback(errMsg, 'error');
      }
    } catch (err) {
      console.warn('[contact-form] send failed:', err);
      setFeedback('Keine Verbindung. Bitte ruf Pietro direkt an: 076 331 32 59.', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }
    }
  }

  form.addEventListener('submit', handleSubmit);
}
