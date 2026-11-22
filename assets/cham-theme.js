/* CHẠM — restrained scroll motion. Content stays visible before JS runs. */
(function () {
  'use strict';
  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('cham-js');

  const header = document.querySelector('[data-cham-header]');
  if (header) {
    let scheduled = false;
    const update = () => {
      header.toggleAttribute('data-scrolled', window.scrollY > 32);
      scheduled = false;
    };
    update();
    window.addEventListener('scroll', () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
  }

  // Legacy CSS cannot leave product or copy blocks invisible on slow devices.
  const alwaysVisible = '[data-cham-reveal], .cham-section-head, .cham-category-card, .cham-product-card, .cham-value, .cham-custom, .cham-product-context__item, .cham-process__steps article, .cham-showcase article, .cham-editorial-grid article, .cham-story-timeline article, .cham-story-manifesto, .cham-editorial-cta';
  document.querySelectorAll(alwaysVisible).forEach(node => node.classList.add('cham-inview'));

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion || !('IntersectionObserver' in window)) return;
  const candidates = document.querySelectorAll('.cham-section-head h2, .cham-editorial-hero h1');
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      // A short entrance, never a gate to reading or navigation.
      if (typeof entry.target.animate === 'function') {
        entry.target.animate([
          { opacity: .78, transform: 'translateY(9px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 340, easing: 'cubic-bezier(.2,.75,.3,1)', fill: 'none' });
      }
    }
  }, { threshold: .06, rootMargin: '0px 0px -18px 0px' });
  candidates.forEach(node => observer.observe(node));
})();
