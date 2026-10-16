/* =====================================================
   RAÍZ VIVA - JavaScript
   1 Páginas (navegación con deslizamiento) · 2 Menú móvil
   3 Barra de progreso · 4 Parallax y tarjetas 3D
   5 Pestañas · 7 Formulario · 8 Teclado y swipe
   9 Modo oscuro · 10 Galería y visor de imágenes
   ===================================================== */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ---------- 1. PÁGINAS ---------- */
  const PAGES = [
    { id: 'inicio',   title: 'Inicio' },
    { id: 'impacto',  title: 'Por qué importa' },
    { id: 'galeria',  title: 'Galería' },
    { id: 'acciones', title: 'Acciones' },
    { id: 'unete',    title: 'Súmate' }
  ];
  const DURATION = 700;

  const viewport = document.getElementById('viewport');
  const views = {};
  PAGES.forEach((p) => { views[p.id] = document.getElementById('view-' + p.id); });

  const navLinksWrap = document.getElementById('navLinks');
  const navPill = document.getElementById('navPill');
  const navLinks = document.querySelectorAll('[data-page]');

  let current = null;
  let cleanupTimer = null;

  const indexOfPage = (id) => PAGES.findIndex((p) => p.id === id);

  function pageFromHash() {
    const id = location.hash.replace('#', '').replace('/', '');
    return PAGES.some((p) => p.id === id) ? id : 'inicio';
  }

  function finishTransition() {
    clearTimeout(cleanupTimer);
    document.querySelectorAll('.view').forEach((v) => {
      v.classList.remove('is-leaving', 'leave-left', 'leave-right', 'enter-left', 'enter-right');
    });
  }

  function movePill() {
    const active = navLinksWrap.querySelector('[aria-current="page"]');
    if (!active) {
      navPill.style.opacity = '0';
      return;
    }
    navPill.style.opacity = '1';
    navPill.style.width = active.offsetWidth + 'px';
    navPill.style.transform = 'translateX(' + active.offsetLeft + 'px)';
  }

  function show(id) {
    if (id === current) return;
    finishTransition();

    const next = views[id];
    const prev = current ? views[current] : null;
    const direction = prev && !reduceMotion ? (indexOfPage(id) > indexOfPage(current) ? 1 : -1) : 0;

    if (prev) prev.classList.remove('is-active');
    next.classList.add('is-active');

    if (direction !== 0) {
      prev.classList.add('is-leaving', direction > 0 ? 'leave-left' : 'leave-right');
      next.classList.add(direction > 0 ? 'enter-right' : 'enter-left');
      cleanupTimer = setTimeout(finishTransition, DURATION);
    }

    const first = current === null;
    current = id;

    navLinks.forEach((link) => {
      if (link.dataset.page === id) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    movePill();

    const page = PAGES[indexOfPage(id)];
    document.title = page.title + ' | Raíz Viva';
    setMenu(false);
    window.scrollTo(0, 0);
    if (!first) next.focus({ preventScroll: true });
  }

  // Botones "Anterior / Siguiente" al final de cada página
  document.querySelectorAll('[data-pager]').forEach((el) => {
    const id = el.closest('.view').id.replace('view-', '');
    const i = indexOfPage(id);
    const prev = PAGES[i - 1];
    const next = PAGES[i + 1];
    let html = '';
    if (prev) {
      html += '<a class="pager__link pager__link--prev" href="#' + prev.id + '">' +
        '<span class="pager__arrow" aria-hidden="true">←</span>' +
        '<span><small>Anterior</small><strong>' + prev.title + '</strong></span></a>';
    }
    if (next) {
      html += '<a class="pager__link pager__link--next" href="#' + next.id + '">' +
        '<span><small>Siguiente</small><strong>' + next.title + '</strong></span>' +
        '<span class="pager__arrow" aria-hidden="true">→</span></a>';
    } else {
      html += '<a class="pager__link pager__link--next" href="#inicio">' +
        '<span><small>Volver</small><strong>Al inicio</strong></span>' +
        '<span class="pager__arrow" aria-hidden="true">↺</span></a>';
    }
    el.innerHTML = html;
  });

  window.addEventListener('hashchange', () => show(pageFromHash()));
  window.addEventListener('resize', movePill);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(movePill);

  function step(delta) {
    const i = indexOfPage(current) + delta;
    if (i >= 0 && i < PAGES.length) location.hash = '#' + PAGES[i].id;
  }

  /* ---------- 2. MENÚ MÓVIL ---------- */
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  }
  navToggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- 3. BARRA DE PROGRESO Y SOMBRA DEL HEADER ---------- */
  const header = document.getElementById('header');
  const progress = document.getElementById('progress');

  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('is-scrolled', y > 8);
    progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  /* ---------- 4. PARALLAX Y TARJETAS 3D ---------- */
  const layers = document.querySelectorAll('#heroArt [data-depth]');
  if (!reduceMotion && finePointer) {
    let ticking = false;
    let px = 0;
    let py = 0;
    const inicio = views.inicio;

    inicio.addEventListener('pointermove', (e) => {
      px = e.clientX / window.innerWidth - 0.5;
      py = e.clientY / window.innerHeight - 0.5;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          layers.forEach((layer) => {
            const d = Number(layer.dataset.depth);
            layer.style.transform = 'translate(' + (px * d).toFixed(2) + 'px,' + (py * d).toFixed(2) + 'px)';
          });
          ticking = false;
        });
      }
    });
    inicio.addEventListener('pointerleave', () => {
      layers.forEach((layer) => { layer.style.transform = ''; });
    });

    document.querySelectorAll('[data-tilt]').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(700px) rotateX(' + (-y * 8).toFixed(2) + 'deg) rotateY(' + (x * 8).toFixed(2) + 'deg) translateY(-4px)';
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- 5. PESTAÑAS (Por qué importa) ---------- */
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));

  function selectTab(tab, focus) {
    tabs.forEach((t) => {
      const selected = t === tab;
      t.setAttribute('aria-selected', String(selected));
      t.tabIndex = selected ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).classList.toggle('is-active', selected);
    });
    if (focus) tab.focus();
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab, false));
    tab.addEventListener('keydown', (e) => {
      let target = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') target = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') target = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') target = tabs[0];
      if (e.key === 'End') target = tabs[tabs.length - 1];
      if (target) {
        e.preventDefault();
        selectTab(target, true);
      }
    });
  });

  /* ---------- 7. FORMULARIO (Súmate) ---------- */
  const form = document.getElementById('joinForm');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const countrySelect = document.getElementById('country');
  const success = document.getElementById('success');
  const successTitle = document.getElementById('successTitle');
  const again = document.getElementById('again');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setError(input, message) {
    const err = document.getElementById('err-' + input.id);
    err.textContent = message;
    input.classList.toggle('is-invalid', Boolean(message));
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const dial = countrySelect.selectedOptions[0].dataset.dial;
    const phoneDigits = phoneInput.value.replace(/\D/g, '');
    let firstInvalid = null;

    if (name.length < 2) {
      setError(nameInput, 'Escribe tu nombre (mínimo 2 letras).');
      firstInvalid = firstInvalid || nameInput;
    } else {
      setError(nameInput, '');
    }

    // Cada país tiene su cantidad de dígitos (sin el código del país ni el 0 inicial)
    const opt = countrySelect.selectedOptions[0];
    const minDigits = Number(opt.dataset.min);
    const maxDigits = Number(opt.dataset.max);
    const phoneOk = phoneDigits.length >= minDigits && phoneDigits.length <= maxDigits;
    if (!phoneOk) {
      const cuantos = minDigits === maxDigits
        ? 'de ' + minDigits + ' dígitos'
        : 'con entre ' + minDigits + ' y ' + maxDigits + ' dígitos';
      setError(phoneInput, 'Escribe un teléfono ' + cuantos + ', por ejemplo ' + opt.dataset.ph + '.');
      firstInvalid = firstInvalid || phoneInput;
    } else {
      setError(phoneInput, '');
    }

    if (!emailPattern.test(email)) {
      setError(emailInput, 'Escribe un correo válido, por ejemplo nombre@correo.com.');
      firstInvalid = firstInvalid || emailInput;
    } else {
      setError(emailInput, '');
    }

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    // Aquí conectarías tu servicio real (Mailchimp, tu backend, etc.), por ejemplo:
    // fetch('https://tu-servidor.com/suscribir', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ name, phone: '+' + dial + phoneDigits, email })
    // });

    successTitle.textContent = '¡Gracias por sumarte, ' + name + '!';
    form.hidden = true;
    success.hidden = false;
    // Reinicia la animación del check
    const svg = success.querySelector('.success__check');
    svg.style.animation = 'none';
    void svg.getBoundingClientRect();
    svg.style.animation = '';
  });

  [nameInput, emailInput, phoneInput].forEach((input) => {
    input.addEventListener('input', () => setError(input, ''));
  });
  // El teléfono solo acepta números, espacios y guiones
  phoneInput.addEventListener('input', () => {
    phoneInput.value = phoneInput.value.replace(/[^\d\s-]/g, '');
  });
  function updatePhonePlaceholder() {
    phoneInput.placeholder = countrySelect.selectedOptions[0].dataset.ph;
  }
  countrySelect.addEventListener('change', () => {
    setError(phoneInput, '');
    updatePhonePlaceholder();
  });
  updatePhonePlaceholder();

  again.addEventListener('click', () => {
    form.reset();
    success.hidden = true;
    form.hidden = false;
    nameInput.focus();
  });

  /* ---------- 8. TECLADO Y SWIPE ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (!document.getElementById('lightbox').hidden) return;
    if (e.target.closest('input, textarea, select, [role="tablist"]')) return;
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });

  let startX = 0;
  let startY = 0;
  viewport.addEventListener('touchstart', (e) => {
    startX = e.changedTouches[0].clientX;
    startY = e.changedTouches[0].clientY;
  }, { passive: true });
  viewport.addEventListener('touchend', (e) => {
    if (e.target.closest('input, textarea, select')) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 90 && Math.abs(dy) < 60) step(dx < 0 ? 1 : -1);
  }, { passive: true });

  /* ---------- 9. MODO OSCURO ---------- */
  const THEME_KEY = 'raizviva-tema';
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function isDark() {
    const chosen = root.getAttribute('data-theme');
    return chosen ? chosen === 'dark' : darkQuery.matches;
  }
  function updateThemeButton() {
    const dark = isDark();
    themeToggle.setAttribute('aria-pressed', String(dark));
    themeToggle.setAttribute('aria-label', dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
  }
  themeToggle.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem(THEME_KEY, next); } catch (err) { /* nada */ }
    updateThemeButton();
  });
  if (darkQuery.addEventListener) darkQuery.addEventListener('change', updateThemeButton);
  updateThemeButton();

  /* ---------- 10. GALERÍA Y VISOR ---------- */
  const lightbox = document.getElementById('lightbox');
  const lbMedia = document.getElementById('lbMedia');
  const lbCaption = document.getElementById('lbCaption');
  const lbClose = document.getElementById('lbClose');
  const lbPrev = document.getElementById('lbPrev');
  const lbNext = document.getElementById('lbNext');
  const tiles = Array.from(document.querySelectorAll('[data-lightbox]'));
  let lbIndex = 0;
  let lbOpener = null;

  // Si pones fotos reales en la carpeta images/, se muestran encima de las ilustraciones.
  // Si la foto no existe, se queda la ilustración.
  document.querySelectorAll('[data-photo]').forEach((img) => {
    const drop = () => img.remove();
    img.addEventListener('error', drop);
    if (img.complete && img.naturalWidth === 0) drop();
  });

  function fillLightbox(i) {
    lbIndex = (i + tiles.length) % tiles.length;
    const tile = tiles[lbIndex];
    const copies = Array.from(tile.querySelector('.tile__media').children).map((n) => n.cloneNode(true));
    lbMedia.replaceChildren(...copies);
    lbCaption.textContent = tile.dataset.caption || '';
  }
  function openLightbox(i, opener) {
    lbOpener = opener;
    fillLightbox(i);
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }
  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    lbMedia.replaceChildren();
    if (lbOpener) lbOpener.focus();
  }

  tiles.forEach((tile, i) => tile.addEventListener('click', () => openLightbox(i, tile)));
  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', () => fillLightbox(lbIndex - 1));
  lbNext.addEventListener('click', () => fillLightbox(lbIndex + 1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') fillLightbox(lbIndex - 1);
    if (e.key === 'ArrowRight') fillLightbox(lbIndex + 1);
    if (e.key === 'Tab') {
      const first = lbClose;
      const last = lbNext;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  let lbStartX = 0;
  lightbox.addEventListener('touchstart', (e) => { lbStartX = e.changedTouches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - lbStartX;
    if (Math.abs(dx) > 60) fillLightbox(lbIndex + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /* ---------- ARRANQUE ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();
  show(pageFromHash());
  onScroll();
})();
