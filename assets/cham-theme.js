(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('cham-js');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const header = document.querySelector('.cham-header');
  if (header) {
    const syncHeader = () => header.toggleAttribute('data-scrolled', window.scrollY > 8);
    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });
  }

  document.querySelectorAll('.cham-mobile-nav a').forEach((link) => {
    link.addEventListener('click', () => {
      const details = link.closest('details');
      if (details) details.removeAttribute('open');
    });
  });

  const revealTargets = document.querySelectorAll(
    '[data-cham-reveal], .cham-section-head, .cham-category-card, .cham-product-card, .cham-value, .cham-custom, .cham-product-context__item'
  );

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach((node) => node.classList.add('cham-inview'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('cham-inview');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );
    revealTargets.forEach((node) => revealObserver.observe(node));
  }

  if (finePointer && !reduceMotion) {
    let cursorFrame = 0;
    document.addEventListener(
      'pointermove',
      (event) => {
        if (cursorFrame) return;
        cursorFrame = window.requestAnimationFrame(() => {
          document.documentElement.style.setProperty('--cham-pointer-x', event.clientX + 'px');
          document.documentElement.style.setProperty('--cham-pointer-y', event.clientY + 'px');
          cursorFrame = 0;
        });
      },
      { passive: true }
    );

    document.querySelectorAll('[data-cham-tilt]').forEach((surface) => {
      const reset = () => {
        surface.style.setProperty('--tilt-x', '0deg');
        surface.style.setProperty('--tilt-y', '0deg');
        surface.style.setProperty('--parallax-a', '0px');
        surface.style.setProperty('--parallax-b', '0px');
        surface.style.setProperty('--hero-x', '68%');
        surface.style.setProperty('--hero-y', '26%');
      };

      surface.addEventListener('pointermove', (event) => {
        const rect = surface.getBoundingClientRect();
        const nx = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        const ny = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
        const tiltX = (nx - 0.5) * 6;
        const tiltY = (0.5 - ny) * 5;
        const px = (nx - 0.5) * 10;
        const py = (ny - 0.5) * 10;

        surface.style.setProperty('--tilt-x', tiltX.toFixed(2) + 'deg');
        surface.style.setProperty('--tilt-y', tiltY.toFixed(2) + 'deg');
        surface.style.setProperty('--parallax-a', px.toFixed(2) + 'px');
        surface.style.setProperty('--parallax-b', py.toFixed(2) + 'px');
        surface.style.setProperty('--hero-x', (nx * 100).toFixed(1) + '%');
        surface.style.setProperty('--hero-y', (ny * 100).toFixed(1) + '%');
      });

      surface.addEventListener('pointerleave', reset);
    });
  }
})();