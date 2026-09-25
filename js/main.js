(() => {
  'use strict';

  /* ---------- WhatsApp ----------
     Number (country code + number, digits only) and the default pre-filled
     message. A link can override the message with data-wa-text="...". */
  const WHATSAPP_NUMBER = '17863461045';
  const DEFAULT_MESSAGE =
    'Hola GDSB Export Corp, quisiera información sobre sus servicios de envíos y mudanzas.';

  document.querySelectorAll('[data-whatsapp]').forEach((link) => {
    const text = link.dataset.waText || DEFAULT_MESSAGE;
    link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    link.target = '_blank';
    link.rel = 'noopener';
  });

  /* ---------- Navigation ---------- */
  const desktop = window.matchMedia('(min-width: 960px)');
  const nav = document.getElementById('primary-nav');
  const navToggle = document.querySelector('.nav-toggle');
  const subItem = document.querySelector('.has-sub');
  const subToggle = subItem.querySelector('.sub-toggle');

  function setNavOpen(open) {
    nav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  }

  function setSubOpen(open) {
    subItem.classList.toggle('is-open', open);
    subToggle.setAttribute('aria-expanded', String(open));
  }

  // In the mobile drawer the services are always listed, so the toggle is just a label.
  function syncNavMode() {
    if (desktop.matches) {
      setNavOpen(false);
      setSubOpen(false);
    } else {
      setSubOpen(false);
      subToggle.setAttribute('aria-expanded', 'true');
    }
  }

  navToggle.addEventListener('click', () => setNavOpen(!nav.classList.contains('is-open')));

  subToggle.addEventListener('click', () => {
    if (desktop.matches) setSubOpen(!subItem.classList.contains('is-open'));
  });

  // Close after choosing a link
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      setNavOpen(false);
      setSubOpen(false);
      if (document.activeElement) document.activeElement.blur();
    }
  });

  // Close on outside click / Escape
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.site-header')) {
      setNavOpen(false);
      setSubOpen(false);
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const wasOpen = nav.classList.contains('is-open') || subItem.classList.contains('is-open');
    setNavOpen(false);
    setSubOpen(false);
    if (wasOpen) {
      if (document.activeElement) document.activeElement.blur();
      navToggle.focus({ preventScroll: true });
    }
  });

  desktop.addEventListener('change', syncNavMode);
  syncNavMode();

  /* ---------- Hero carousel ---------- */
  const hero = document.getElementById('inicio');
  const slides = Array.from(hero.querySelectorAll('.hero-slide'));
  const dots = Array.from(hero.querySelectorAll('.hero-dot'));
  const pauseBtn = hero.querySelector('.hero-pause');
  const INTERVAL_MS = 6000;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let index = 0;
  let timer = null;
  let userPaused = reducedMotion.matches; // autoplay off by default for reduced motion

  function show(n) {
    index = (n + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
    dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === index)));
  }

  function stop() {
    clearInterval(timer);
    timer = null;
  }

  function start() {
    if (timer || userPaused || slides.length < 2 || document.hidden) return;
    timer = setInterval(() => show(index + 1), INTERVAL_MS);
  }

  function restart() {
    stop();
    start();
  }

  function setPaused(paused) {
    userPaused = paused;
    pauseBtn.classList.toggle('is-paused', paused);
    pauseBtn.setAttribute('aria-label', paused ? 'Reanudar carrusel' : 'Pausar carrusel');
    paused ? stop() : start();
  }

  dots.forEach((dot, i) => dot.addEventListener('click', () => { show(i); restart(); }));
  hero.querySelector('.hero-prev').addEventListener('click', () => { show(index - 1); restart(); });
  hero.querySelector('.hero-next').addEventListener('click', () => { show(index + 1); restart(); });
  pauseBtn.addEventListener('click', () => setPaused(!userPaused));

  // Pause while hovering / focusing inside the hero and while the tab is hidden
  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  hero.addEventListener('focusin', stop);
  hero.addEventListener('focusout', start);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

  // Swipe on touch screens
  let touchStartX = null;
  hero.addEventListener('touchstart', (event) => { touchStartX = event.touches[0].clientX; }, { passive: true });
  hero.addEventListener('touchend', (event) => {
    if (touchStartX === null) return;
    const dx = event.changedTouches[0].clientX - touchStartX;
    touchStartX = null;
    if (Math.abs(dx) > 50) { show(index + (dx < 0 ? 1 : -1)); restart(); }
  }, { passive: true });

  pauseBtn.classList.toggle('is-paused', userPaused);
  pauseBtn.setAttribute('aria-label', userPaused ? 'Reanudar carrusel' : 'Pausar carrusel');
  show(0);
  start();
})();
