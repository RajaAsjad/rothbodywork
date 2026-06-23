/**
 * RothBodyWork — loader, navigation, form
 */
(function () {
  'use strict';

  const loader = document.getElementById('loader');
  const loaderBar = document.getElementById('loaderBar');
  const header = document.getElementById('header');
  const navToggle = document.getElementById('navToggle');
  const siteNav = document.getElementById('siteNav');
  const yearEl = document.getElementById('year');
  const contactForm = document.getElementById('contactForm');

  /* Advanced loader with progress simulation */
  function initLoader() {
    document.body.classList.add('loading');
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 18 + 4;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        finishLoader();
      }
      if (loaderBar) loaderBar.style.width = progress + '%';
    }, 120);
  }

  function finishLoader() {
    setTimeout(() => {
      loader?.classList.add('is-done');
      document.body.classList.remove('loading');
    }, 300);
  }

  /* Sticky header on scroll + hero mode */
  function initHeader() {
    const hero = document.getElementById('hero');

    const onScroll = () => {
      const scrolled = window.scrollY > 40;
      header?.classList.toggle('is-scrolled', scrolled);

      if (hero) {
        const heroBottom = hero.offsetTop + hero.offsetHeight * 0.85;
        header?.classList.toggle('is-hero', window.scrollY < heroBottom);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* Active nav link on scroll */
  function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = siteNav?.querySelectorAll('a[href^="#"]');

    const onScroll = () => {
      let current = '';
      const offset = 120;
      sections.forEach((section) => {
        if (window.scrollY >= section.offsetTop - offset) {
          current = section.getAttribute('id');
        }
      });
      navLinks?.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === '#' + current);
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* Scroll reveal animations */
  function initReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    reveals.forEach((el) => observer.observe(el));
  }

  /* Mobile navigation */
  function initNav() {
    navToggle?.addEventListener('click', () => {
      const isOpen = siteNav?.classList.toggle('is-open');
      navToggle.classList.toggle('is-open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    siteNav?.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        siteNav.classList.remove('is-open');
        navToggle?.classList.remove('is-open');
        navToggle?.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* Contact form — build mailto with body */
  function initForm() {
    contactForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name')?.value || '';
      const email = document.getElementById('email')?.value || '';
      const session = document.getElementById('session');
      const sessionLabel = session?.options[session.selectedIndex]?.text || '';
      const message = document.getElementById('message')?.value || '';

      const subject = encodeURIComponent('RothBodyWork — Session Inquiry from ' + name);
      const body = encodeURIComponent(
        'Name: ' + name + '\n' +
        'Email: ' + email + '\n' +
        'Preferred session: ' + sessionLabel + '\n\n' +
        message
      );

      window.location.href = 'mailto:hello@rothbodywork.com?subject=' + subject + '&body=' + body;
    });
  }

  /* Smooth scroll offset for fixed header */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const id = anchor.getAttribute('href');
        if (!id || id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  /* Init */
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initLoader();
      initHeader();
      initNav();
      initForm();
      initSmoothScroll();
      initActiveNav();
      initReveal();
    });
  } else {
    initLoader();
    initHeader();
    initNav();
    initForm();
    initSmoothScroll();
    initActiveNav();
    initReveal();
  }

  window.addEventListener('load', () => {
    if (loaderBar) loaderBar.style.width = '100%';
    if (!loader?.classList.contains('is-done')) finishLoader();
    document.querySelectorAll('.hero .reveal').forEach((el) => {
      setTimeout(() => el.classList.add('is-visible'), 200);
    });
  });
})();
