/* CHẠM — mobile navigation: progressive enhancement for <details>. */
(function () {
  'use strict';

  var menus = document.querySelectorAll('.cham-mobile-nav details');
  if (!menus.length) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var desktop = window.matchMedia('(min-width: 861px)');

  menus.forEach(function (details) {
    var summary = details.querySelector('summary');
    var panel = details.querySelector('.cham-mobile-nav__panel');
    var timer = null;
    var frame = null;
    if (!summary || !panel) return;

    if (!panel.id) panel.id = 'cham-mobile-panel';
    summary.setAttribute('aria-controls', panel.id);
    summary.setAttribute('aria-expanded', String(details.open));
    summary.setAttribute('aria-label', details.open ? 'Đóng menu' : 'Mở menu');

    function finishClosing() {
      window.clearTimeout(timer);
      timer = null;
      if (frame != null) window.cancelAnimationFrame(frame);
      frame = null;
      details.classList.remove('is-open', 'is-closing');
      details.open = false;
      summary.setAttribute('aria-expanded', 'false');
      summary.setAttribute('aria-label', 'Mở menu');
    }

    function closeMenu(immediate) {
      if (!details.open) return;
      if (details.classList.contains('is-closing') && !immediate) return;

      details.classList.remove('is-open');
      details.classList.add('is-closing');
      summary.setAttribute('aria-expanded', 'false');
      summary.setAttribute('aria-label', 'Mở menu');

      if (immediate || reducedMotion.matches) {
        finishClosing();
      } else {
        window.clearTimeout(timer);
        timer = window.setTimeout(finishClosing, 230);
      }
    }

    function openMenu() {
      window.clearTimeout(timer);
      timer = null;
      if (frame != null) window.cancelAnimationFrame(frame);
      details.classList.remove('is-closing', 'is-open');
      details.open = true;
      summary.setAttribute('aria-expanded', 'true');
      summary.setAttribute('aria-label', 'Đóng menu');

      if (reducedMotion.matches) {
        details.classList.add('is-open');
        return;
      }
      frame = window.requestAnimationFrame(function () {
        frame = window.requestAnimationFrame(function () {
          details.classList.add('is-open');
          frame = null;
        });
      });
    }

    summary.addEventListener('click', function (event) {
      event.preventDefault();
      if (!details.open || details.classList.contains('is-closing')) {
        openMenu();
      } else {
        closeMenu(false);
      }
    });

    // Capture-phase pointerdown works for mouse, touch and stylus.
    document.addEventListener('pointerdown', function (event) {
      if (details.open && !details.contains(event.target)) closeMenu(false);
    }, { passive: true });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && details.open) {
        event.preventDefault();
        closeMenu(false);
        summary.focus();
      }
    });

    // Native navigation will take over after clicking a link.
    panel.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { closeMenu(true); });
    });

    var onViewportChange = function () {
      if (desktop.matches) closeMenu(true);
    };
    if (desktop.addEventListener) {
      desktop.addEventListener('change', onViewportChange);
    } else {
      desktop.addListener(onViewportChange);
    }
  });
})();
