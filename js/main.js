/**
 * GTools Lab — Main JavaScript
 * Handles: Navbar scroll, particles, counters, scroll animations,
 *          tech carousel, form validation, mobile menu.
 */

'use strict';

/* ============================================================
   UTILITY
   ============================================================ */

/**
 * Wait for DOM to be ready
 */
const ready = (fn) => {
  if (document.readyState !== 'loading') fn();
  else document.addEventListener('DOMContentLoaded', fn);
};

/**
 * Throttle function calls
 */
const throttle = (fn, ms) => {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= ms) { last = now; fn(...args); }
  };
};

/**
 * Clamp a number between min and max
 */
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);


/* ============================================================
   NAVBAR — scroll state + mobile menu
   ============================================================ */

const initNavbar = () => {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.nav-mobile');
  const mobileLinks = document.querySelectorAll('.nav-mobile-link');

  if (!navbar) return;

  /* Scroll → add/remove .scrolled */
  const handleScroll = throttle(() => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, 50);

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* Hamburger toggle */
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    /* Close on link click */
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    /* Close on ESC */
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
};


/* ============================================================
   PARTICLES — hero background dots
   ============================================================ */

const initParticles = () => {
  const container = document.querySelector('.particles-container');
  if (!container) return;

  const COUNT = window.matchMedia('(max-width: 768px)').matches ? 20 : 40;

  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');

    /* Randomize appearance */
    const size = Math.random() * 3 + 1;
    const left = Math.random() * 100;
    const delay = Math.random() * 15;
    const duration = Math.random() * 12 + 8;
    const opacity = Math.random() * 0.5 + 0.2;

    /* Alternate colours */
    const colors = ['#06B6D4', '#3B82F6', '#8B5CF6', '#ffffff'];
    const color  = colors[Math.floor(Math.random() * colors.length)];

    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${left}%;
      background: ${color};
      opacity: ${opacity};
      animation-duration: ${duration}s;
      animation-delay: -${delay}s;
    `;

    container.appendChild(p);
  }
};


/* ============================================================
   SCROLL REVEAL — Intersection Observer
   ============================================================ */

const initScrollReveal = () => {
  const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
};


/* ============================================================
   COUNTER ANIMATION
   ============================================================ */

/**
 * Animated number counter.
 * Data attrs on each .stat-number:
 *   data-target  — final number (integer)
 *   data-suffix  — optional suffix shown inline, e.g. "+"
 *   data-duration — animation duration in ms (default 2000)
 */
const animateCounter = (el) => {
  const target   = parseInt(el.dataset.target, 10);
  const duration = parseInt(el.dataset.duration, 10) || 2000;
  const suffix   = el.dataset.suffix || '';
  const start    = performance.now();

  /* Ease-out cubic */
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  const tick = (now) => {
    const elapsed  = now - start;
    const progress = clamp(elapsed / duration, 0, 1);
    const current  = Math.round(easeOut(progress) * target);

    el.textContent = current + suffix;

    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target + suffix;
  };

  requestAnimationFrame(tick);
};

const initCounters = () => {
  const counterEls = document.querySelectorAll('.stat-number[data-target]');
  if (!counterEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  counterEls.forEach(el => observer.observe(el));
};


/* ============================================================
   TECH CAROUSEL — duplicate track for seamless loop
   ============================================================ */

const initTechCarousel = () => {
  const track = document.querySelector('.tech-track');
  if (!track) return;

  /* Clone all chips for infinite loop */
  const chips = Array.from(track.children);
  chips.forEach(chip => {
    const clone = chip.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });
};


/* ============================================================
   CONTACT FORM — validation & fake submission
   ============================================================ */

const initContactForm = () => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const success = document.getElementById('form-success');

  /* Simple validator rules */
  const rules = {
    'contact-name':    { required: true, minLen: 2,  label: 'nombre' },
    'contact-company': { required: false },
    'contact-email':   { required: true, email: true, label: 'correo electrónico' },
    'contact-phone':   { required: false },
    'contact-message': { required: true, minLen: 10,  label: 'mensaje' },
  };

  const getError = (id) => form.querySelector(`[data-for="${id}"]`);

  const validateField = (input) => {
    const id   = input.id;
    const rule = rules[id];
    if (!rule) return true;

    const val = input.value.trim();
    const errEl = getError(id);

    let msg = '';

    if (rule.required && !val) {
      msg = `Por favor ingrese su ${rule.label || 'campo'}.`;
    } else if (val && rule.minLen && val.length < rule.minLen) {
      msg = `Debe tener al menos ${rule.minLen} caracteres.`;
    } else if (val && rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      msg = 'Por favor ingrese un correo válido.';
    }

    input.classList.toggle('error', !!msg);
    if (errEl) {
      errEl.textContent = msg;
      errEl.classList.toggle('visible', !!msg);
    }

    return !msg;
  };

  /* Live validation on blur */
  Object.keys(rules).forEach(id => {
    const input = document.getElementById(id);
    if (input) input.addEventListener('blur', () => validateField(input));
  });

  /* Submit */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let valid = true;
    Object.keys(rules).forEach(id => {
      const input = document.getElementById(id);
      if (input && !validateField(input)) valid = false;
    });

    if (!valid) return;

    /* Simulate async submission */
    const submitBtn = form.querySelector('.form-submit');
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;

    setTimeout(() => {
      form.reset();
      submitBtn.textContent = 'Enviar Consulta';
      submitBtn.disabled = false;

      if (success) {
        success.classList.add('show');
        setTimeout(() => success.classList.remove('show'), 6000);
      }
    }, 1400);
  });
};


/* ============================================================
   SMOOTH SCROLL for anchor links
   ============================================================ */

const initSmoothScroll = () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;

      e.preventDefault();
      const offset = 80; /* navbar height */
      const top = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
};


/* ============================================================
   ACTIVE NAV LINK — highlight on scroll
   ============================================================ */

const initActiveNav = () => {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link[href^="#"]');
  if (!sections.length || !links.length) return;

  const setActive = throttle(() => {
    const scrollY = window.scrollY + 120;

    let currentId = '';
    sections.forEach(section => {
      if (section.offsetTop <= scrollY) currentId = section.id;
    });

    links.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });
  }, 100);

  window.addEventListener('scroll', setActive, { passive: true });
  setActive();
};


/* ============================================================
   BACK TO TOP (optional keyboard shortcut)
   ============================================================ */

const initBackToTop = () => {
  document.addEventListener('keydown', (e) => {
    /* Alt+T → scroll to top */
    if (e.altKey && e.key === 't') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
};


/* ============================================================
   HOVER TILT — subtle 3-D tilt on service cards
   ============================================================ */

const initCardTilt = () => {
  /* Only on non-touch devices */
  if (window.matchMedia('(hover: none)').matches) return;

  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width  / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);

      card.style.transform = `
        perspective(800px)
        rotateY(${dx * 4}deg)
        rotateX(${-dy * 4}deg)
        translateY(-6px)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
};


/* ============================================================
   INIT — run everything
   ============================================================ */

ready(() => {
  initNavbar();
  initParticles();
  initScrollReveal();
  initCounters();
  initTechCarousel();
  initContactForm();
  initSmoothScroll();
  initActiveNav();
  initBackToTop();
  initCardTilt();

  console.log('%c⚡ GTools Lab', 'color:#06B6D4;font-size:16px;font-weight:bold;');
  console.log('%cSoftware profesional para empresas, comercios y salud.', 'color:#94A3B8');
});
