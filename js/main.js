/* ════════════════════════════════════════════════
   AFI POETRY — MAIN JS
   Smooth scroll, parallax, gallery lightbox,
   3D tilt, booking modals with animations.
════════════════════════════════════════════════ */

// ── Footer year ─────────────────────────────────────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();

// ── Scroll progress bar ──────────────────────────────────────────────────
const progressBar = document.getElementById('scroll-progress');
const nav = document.querySelector('nav');

const backToTopBtn = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
  progressBar.style.width = pct + '%';
  nav.classList.toggle('scrolled', window.scrollY > 60);
  if (backToTopBtn) backToTopBtn.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });

backToTopBtn?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── Hero parallax ────────────────────────────────────────────────────────
const heroVisual = document.querySelector('.hero-visual');
window.addEventListener('scroll', () => {
  if (heroVisual && window.scrollY < window.innerHeight * 1.2) {
    heroVisual.style.transform = `translateY(${window.scrollY * 0.13}px)`;
  }
}, { passive: true });

// ── Reveal on scroll ─────────────────────────────────────────────────────
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// ── Gallery: cursor spotlight ────────────────────────────────────────────
const gallerySection = document.querySelector('.gallery-section');
if (gallerySection) {
  gallerySection.addEventListener('mousemove', e => {
    const r = gallerySection.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width * 100).toFixed(2) + '%';
    const y = ((e.clientY - r.top)  / r.height * 100).toFixed(2) + '%';
    gallerySection.style.setProperty('--mouse-x', x);
    gallerySection.style.setProperty('--mouse-y', y);
  }, { passive: true });
}

// ── Gallery: staggered scroll reveal ────────────────────────────────────
const galleryObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('gallery-in');
      galleryObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.gallery-item').forEach((item, i) => {
  item.style.transitionDelay = (i % 3) * 0.09 + 's';
  galleryObs.observe(item);
});

// ── Gallery: expand / collapse ───────────────────────────────────────────
const PREVIEW_COUNT = 6;
let galleryExpanded = false;
const expandArea  = document.getElementById('gallery-expand-area');
const expandBtn   = document.getElementById('gallery-expand-btn');
const showLessBtn = document.getElementById('gallery-show-less');

function getAllGalleryItems() {
  return Array.from(document.querySelectorAll('.gallery-item'));
}

function triggerGalleryIn(items) {
  items.forEach((item, i) => {
    item.classList.remove('gallery-in');
    item.style.transitionDelay = (i % 3) * 0.07 + 's';
    requestAnimationFrame(() => requestAnimationFrame(() => item.classList.add('gallery-in')));
  });
}

function applyGalleryState(activeTab) {
  const allItems = getAllGalleryItems();

  if (activeTab !== 'all') {
    allItems.forEach(item => {
      item.classList.remove('gallery-collapsed');
      item.classList.toggle('hidden', item.dataset.category !== activeTab);
    });
    if (expandArea) expandArea.style.display = 'none';
    return;
  }

  // "All" tab: clear hidden flags, apply preview collapse
  allItems.forEach(item => item.classList.remove('hidden'));
  if (expandArea) expandArea.style.display = '';

  let shown = 0;
  allItems.forEach(item => {
    if (!galleryExpanded && shown >= PREVIEW_COUNT) {
      item.classList.add('gallery-collapsed');
    } else {
      item.classList.remove('gallery-collapsed');
      shown++;
    }
  });

  const total = allItems.length;
  if (expandBtn) {
    expandBtn.textContent = `View All ${total} Works →`;
    expandBtn.style.display = galleryExpanded ? 'none' : '';
  }
  if (showLessBtn) showLessBtn.style.display = galleryExpanded ? '' : 'none';
}

// ── Gallery: tab filtering ───────────────────────────────────────────────
document.querySelectorAll('.gallery-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.gallery-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const filter = tab.dataset.tab;
    applyGalleryState(filter);
    const visible = document.querySelectorAll('.gallery-item:not(.hidden):not(.gallery-collapsed)');
    triggerGalleryIn(Array.from(visible));
  });
});

expandBtn?.addEventListener('click', () => {
  galleryExpanded = true;
  applyGalleryState('all');
  const newItems = document.querySelectorAll('.gallery-item:not(.gallery-collapsed):not(.gallery-in)');
  triggerGalleryIn(Array.from(newItems));
});

showLessBtn?.addEventListener('click', () => {
  galleryExpanded = false;
  applyGalleryState('all');
  document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' });
});

// Initialise preview on page load
applyGalleryState('all');

// ── Gallery: 3D tilt on mouse move ───────────────────────────────────────
document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('mousemove', e => {
    const r = item.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    item.style.transform = `perspective(700px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.04)`;
  }, { passive: true });
  item.addEventListener('mouseleave', () => {
    item.style.transform = '';
    // restore transition-delay after tilt
    requestAnimationFrame(() => item.style.transitionDelay = '0s');
  });
});

// ── Gallery: Lightbox ────────────────────────────────────────────────────
const lightbox  = document.getElementById('gallery-lightbox');
const lbImg     = document.getElementById('lightbox-img');
const lbLabel   = lightbox.querySelector('.lightbox-label');
const lbTitle   = lightbox.querySelector('.lightbox-title');
let lbItems = [], lbIndex = 0;

function getVisibleItems() {
  return Array.from(document.querySelectorAll('.gallery-item:not(.hidden):not(.gallery-collapsed)'));
}
function loadLightboxItem(index) {
  lbIndex = index;
  const item = lbItems[index];
  const img  = item.querySelector('img');
  lbImg.style.opacity = '0';
  setTimeout(() => {
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbLabel.textContent = item.querySelector('.gp-label')?.textContent || '';
    lbTitle.textContent = item.querySelector('.gp-caption')?.textContent || '';
    lbImg.style.opacity = '1';
  }, 180);
}
function openLightbox(index) {
  lbItems = getVisibleItems();
  loadLightboxItem(index);
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
function moveLightbox(dir) {
  lbItems = getVisibleItems();
  loadLightboxItem((lbIndex + dir + lbItems.length) % lbItems.length);
}

document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    lbItems = getVisibleItems();
    const idx = lbItems.indexOf(item);
    if (idx !== -1) openLightbox(idx);
  });
});
lightbox.querySelector('.lightbox-backdrop').addEventListener('click', closeLightbox);
lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
lightbox.querySelector('.lightbox-prev').addEventListener('click', () => moveLightbox(-1));
lightbox.querySelector('.lightbox-next').addEventListener('click', () => moveLightbox(1));
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   moveLightbox(-1);
  if (e.key === 'ArrowRight')  moveLightbox(1);
});

// ── Modal helpers ────────────────────────────────────────────────────────
function openModal(modal) {
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeModal(modal) {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.closest('.modal-overlay')));
});
document.querySelectorAll('.modal-backdrop').forEach(bd => {
  bd.addEventListener('click', () => closeModal(bd.closest('.modal-overlay')));
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m));
  }
});

// ── Performance booking modal ────────────────────────────────────────────
const perfModal    = document.getElementById('perf-modal');
const perfTrigger  = document.getElementById('perf-modal-trigger');
const perfIntro    = document.getElementById('perf-step-intro');
const perfFormStep = document.getElementById('perf-step-form');
const perfForm     = document.getElementById('perf-booking-form');
const perfSuccess  = document.getElementById('perf-success');

if (perfTrigger) {
  perfTrigger.addEventListener('click', e => {
    e.preventDefault();
    // reset state
    perfIntro.classList.remove('hidden');
    perfFormStep.classList.add('hidden');
    if (perfSuccess) perfSuccess.classList.add('hidden');
    if (perfForm) { perfForm.style.display = ''; perfForm.style.opacity = ''; perfForm.reset(); }
    openModal(perfModal);
  });
}

document.getElementById('perf-next')?.addEventListener('click', () => {
  perfIntro.style.animation = 'step-out 0.35s ease forwards';
  setTimeout(() => {
    perfIntro.classList.add('hidden');
    perfIntro.style.animation = '';
    perfFormStep.classList.remove('hidden');
  }, 340);
});

perfForm?.addEventListener('submit', async e => {
  e.preventDefault();
  let valid = true;
  perfForm.querySelectorAll('[required]').forEach(f => {
    f.classList.toggle('error', !f.value.trim());
    if (!f.value.trim()) valid = false;
  });
  if (!valid) return;

  const submitBtn = perfForm.querySelector('.form-submit-btn');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Sending…';
  submitBtn.disabled = true;

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: new FormData(perfForm)
    });
    const data = await res.json();
    if (data.success) {
      perfForm.style.opacity = '0';
      setTimeout(() => {
        perfForm.style.display = 'none';
        if (perfSuccess) perfSuccess.classList.remove('hidden');
      }, 400);
    } else {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      alert('Something went wrong. Please try again or email directly.');
    }
  } catch {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
    alert('Network error. Please check your connection and try again.');
  }
});

// ── Fashion commission modal ─────────────────────────────────────────────
const fashionModal    = document.getElementById('fashion-modal');
const fashionTrigger  = document.getElementById('fashion-modal-trigger');
const fashionIntro    = document.getElementById('fashion-step-intro');
const fashionFormStep = document.getElementById('fashion-step-form');
const fashionForm     = document.getElementById('fashion-commission-form');
const fashionSuccess  = document.getElementById('fashion-success');

if (fashionTrigger) {
  fashionTrigger.addEventListener('click', e => {
    e.preventDefault();
    fashionIntro.classList.remove('hidden');
    fashionFormStep.classList.add('hidden');
    if (fashionSuccess) fashionSuccess.classList.add('hidden');
    if (fashionForm) { fashionForm.style.display = ''; fashionForm.style.opacity = ''; fashionForm.reset(); }
    openModal(fashionModal);
  });
}

document.getElementById('fashion-next')?.addEventListener('click', () => {
  fashionIntro.style.animation = 'step-out 0.35s ease forwards';
  setTimeout(() => {
    fashionIntro.classList.add('hidden');
    fashionIntro.style.animation = '';
    fashionFormStep.classList.remove('hidden');
  }, 340);
});

fashionForm?.addEventListener('submit', async e => {
  e.preventDefault();
  let valid = true;
  fashionForm.querySelectorAll('[required]').forEach(f => {
    f.classList.toggle('error', !f.value.trim());
    if (!f.value.trim()) valid = false;
  });
  if (!valid) return;

  const submitBtn = fashionForm.querySelector('.form-submit-btn');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Sending…';
  submitBtn.disabled = true;

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: new FormData(fashionForm)
    });
    const data = await res.json();
    if (data.success) {
      fashionForm.style.opacity = '0';
      setTimeout(() => {
        fashionForm.style.display = 'none';
        if (fashionSuccess) fashionSuccess.classList.remove('hidden');
      }, 400);
    } else {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      alert('Something went wrong. Please try again or email directly.');
    }
  } catch {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
    alert('Network error. Please check your connection and try again.');
  }
});

// ── Clear error state on input ───────────────────────────────────────────
document.querySelectorAll('.booking-form input, .booking-form select, .booking-form textarea').forEach(f => {
  f.addEventListener('input', () => f.classList.remove('error'));
});
