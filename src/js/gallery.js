// Fotogalerie · Grid + Lightbox fuer #modal-gallery
// Bilder liegen in public/gallery/ → URLs sind /gallery/<id>.{avif,webp,jpg}

const GALLERY_IMAGES = [
  'pd-01','pd-02','pd-03','pd-04','pd-05','pd-06','pd-07','pd-08','pd-09','pd-10',
  'pd-11','pd-12','pd-13','pd-14','pd-15','pd-16','pd-17','pd-18','pd-19',
  '0db7f606-2b81-454e-a2db-4ea42960685c',
  '14ba48d7-be65-471c-ad8b-98d00f4100db',
  '1b0078c7-0129-4ff5-9f67-30bb34cee20c',
  '21b41d96-9c38-4708-85a7-f5668cdbfe39',
  '2c8981e0-76ee-4492-9d47-3c1613b5e2b4',
  '407a9b94-858e-4f77-9219-18b278db6479',
  '524be0ec-1116-4f4a-8ebd-5b800d67dc33',
  '6fdf38c1-55d6-49ee-a85e-db14f21c376a',
  '99a7b5cb-d7ae-4a57-adf8-c287f975d204',
  '9aa03871-2500-41dd-9839-c13044cb221e',
  'a3a7ea0e-68ac-4268-b0f4-c77684f2973b',
  'a760e7a9-b395-4468-ae4a-5af2e6c1fc8a',
  'a864851c-b064-4e9b-a6bf-0f760d440a75',
  'c0a74682-967b-418c-b5c7-de08193d5134',
  'c5a73681-0283-4ebf-8d57-e26b988cd381',
  'd3b80b88-a275-464c-b44f-ef62cc6c13a1',
  'd83ffc8f-32ee-4b0b-9ae7-27665a909b44',
  'dd029010-cf76-4922-ab15-3bf24c8a5189',
  'f82bba34-ece5-4120-8e8a-0de3bb1949ea',
  'f9b69ab4-ff4e-44c2-9ca5-390a86bfa6cd',
];

// Galerie-Bilder im idle-callback preloaden damit das erste Modal-Open
// ohne pop-in ist. 24 Bilder x ~300KB = ~7MB background — non-blocking.
function preloadGalleryImages() {
  const schedule = window.requestIdleCallback || ((cb) => setTimeout(cb, 1800));
  schedule(() => {
    GALLERY_IMAGES.forEach((id) => {
      const img = new Image();
      img.src = `/gallery/${id}.jpg`;
      img.decode().catch(() => { /* fallback later */ });
    });
  }, { timeout: 6000 });
}

export function initGallery() {
  preloadGalleryImages();
  const grid = document.getElementById('gallery-grid');
  const modal = document.getElementById('modal-gallery');
  const lightbox = document.getElementById('gallery-lightbox');
  const lbImg = document.getElementById('gallery-lightbox-img');
  const lbAvif = document.getElementById('gallery-lightbox-src-avif');
  const lbWebp = document.getElementById('gallery-lightbox-src-webp');
  const lbCounter = document.getElementById('gallery-lightbox-counter');
  if (!grid || !modal || !lightbox) return;

  let rendered = false;
  let currentIdx = 0;

  // Lazy render grid on first modal-open (observe aria-hidden change)
  function renderGrid() {
    if (rendered) return;
    rendered = true;
    const frag = document.createDocumentFragment();
    GALLERY_IMAGES.forEach((id, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gallery-thumb';
      btn.setAttribute('aria-label', `Bild ${idx + 1} von ${GALLERY_IMAGES.length} vergroessern`);
      btn.dataset.idx = String(idx);

      const pic = document.createElement('picture');
      const sAvif = document.createElement('source');
      sAvif.srcset = `/gallery/${id}.avif`;
      sAvif.type = 'image/avif';
      const sWebp = document.createElement('source');
      sWebp.srcset = `/gallery/${id}.webp`;
      sWebp.type = 'image/webp';
      const img = document.createElement('img');
      img.src = `/gallery/${id}.jpg`;
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      pic.append(sAvif, sWebp, img);

      btn.appendChild(pic);
      btn.addEventListener('click', () => openLightbox(idx));
      frag.appendChild(btn);
    });
    grid.appendChild(frag);
  }

  function openLightbox(idx) {
    currentIdx = idx;
    updateLightbox();
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.setAttribute('aria-hidden', 'true');
    // nur overflow zuruecksetzen wenn kein anderer modal offen
    const anyModalOpen = document.querySelector('.site-modal[aria-hidden="false"]');
    if (!anyModalOpen) document.body.style.overflow = '';
  }

  function updateLightbox() {
    const id = GALLERY_IMAGES[currentIdx];
    lbAvif.srcset = `/gallery/${id}.avif`;
    lbWebp.srcset = `/gallery/${id}.webp`;
    lbImg.src = `/gallery/${id}.jpg`;
    lbCounter.textContent = `${currentIdx + 1} / ${GALLERY_IMAGES.length}`;
  }

  function navigate(dir) {
    currentIdx = (currentIdx + dir + GALLERY_IMAGES.length) % GALLERY_IMAGES.length;
    updateLightbox();
  }

  // Grid render bei erstem Modal-Open — MutationObserver auf aria-hidden
  const observer = new MutationObserver(() => {
    if (modal.getAttribute('aria-hidden') === 'false') renderGrid();
  });
  observer.observe(modal, { attributes: true, attributeFilter: ['aria-hidden'] });

  // Lightbox close
  lightbox.querySelector('.gallery-lightbox-close')?.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    // click on backdrop (nicht auf inner img/buttons)
    if (e.target === lightbox) closeLightbox();
  });

  // Nav
  lightbox.querySelector('.gallery-lightbox-prev')?.addEventListener('click', () => navigate(-1));
  lightbox.querySelector('.gallery-lightbox-next')?.addEventListener('click', () => navigate(1));

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (lightbox.getAttribute('aria-hidden') === 'true') return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') navigate(-1);
    else if (e.key === 'ArrowRight') navigate(1);
  });
}
