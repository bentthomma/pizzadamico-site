import { describe, it, expect, beforeEach } from 'vitest';
import { initModal, openModal, closeModal, isModalOpen } from '@/js/modal/modal.js';

describe('modal', () => {
  beforeEach(() => {
    // Test fixture: set up DOM for jsdom environment (safe in tests only)
    const body = document.body;
    body.textContent = '';
    const opener = document.createElement('button');
    opener.id = 'opener';
    opener.textContent = 'Open';
    const modal = document.createElement('aside');
    modal.className = 'modal';
    modal.id = 'catering-modal';
    modal.setAttribute('aria-hidden', 'true');
    const closeBtn = document.createElement('button');
    closeBtn.setAttribute('data-modal-close', '');
    closeBtn.textContent = '\u00d7';
    const insideBtn = document.createElement('button');
    insideBtn.id = 'inside';
    insideBtn.textContent = 'Inside';
    modal.appendChild(closeBtn);
    modal.appendChild(insideBtn);
    body.appendChild(opener);
    body.appendChild(modal);
    initModal();
  });

  it('opens and closes', () => {
    openModal();
    expect(isModalOpen()).toBe(true);
    expect(document.querySelector('.modal').getAttribute('aria-hidden')).toBe('false');
    closeModal();
    expect(isModalOpen()).toBe(false);
    expect(document.querySelector('.modal').getAttribute('aria-hidden')).toBe('true');
  });

  it('closes on ESC', () => {
    openModal();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(isModalOpen()).toBe(false);
  });

  it('closes on data-modal-close click', () => {
    openModal();
    document.querySelector('[data-modal-close]').click();
    expect(isModalOpen()).toBe(false);
  });
});
