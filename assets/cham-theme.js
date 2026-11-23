/* CHẠM — restrained scroll motion. Content stays visible before JS runs. */
(function () {
  'use strict';
  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('cham-js');

  const header = document.querySelector('[data-cham-header]');
  const headerGroup = document.querySelector('#header-group');
  if (header && headerGroup) {
    let scheduled = false;
    let lastDecisionY = Math.max(0, window.scrollY);
    let hidden = false;
    const reduceHeader = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      const y = Math.max(0, window.scrollY);
      const menuOpen = Boolean(header.querySelector('.cham-mobile-nav details[open]'));
      const focused = header.contains(document.activeElement);
      header.toggleAttribute('data-scrolled', y > 32);
      if (y < 96 || menuOpen || focused || reduceHeader.matches) {
        hidden = false;
        lastDecisionY = y;
      } else if (y > 136 && y - lastDecisionY > 14) {
        hidden = true;
        lastDecisionY = y;
      } else if (lastDecisionY - y > 9) {
        hidden = false;
        lastDecisionY = y;
      }
      headerGroup.toggleAttribute('data-cham-hidden', hidden);
      scheduled = false;
    };
    const requestUpdate = () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    header.addEventListener('toggle', requestUpdate, true);
    header.addEventListener('focusin', requestUpdate);
    reduceHeader.addEventListener?.('change', requestUpdate);
  }

  // Legacy CSS cannot leave product or copy blocks invisible on slow devices.
  const alwaysVisible = '[data-cham-reveal], .cham-section-head, .cham-category-card, .cham-product-card, .cham-value, .cham-custom, .cham-product-context__item, .cham-process__steps article, .cham-showcase article, .cham-editorial-grid article, .cham-story-timeline article, .cham-story-manifesto, .cham-editorial-cta';
  document.querySelectorAll(alwaysVisible).forEach(node => node.classList.add('cham-inview'));

  // Shared reversible scroll cues are provided by cham-unified-motion.js.
  // The header hide/show and always-visible safety logic above remain intact.
})();
