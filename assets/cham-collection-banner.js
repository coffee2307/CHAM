(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  function init(root) {
    if (root.dataset.bannerReady) return;
    const track = root.querySelector('[data-banner-track]');
    const slides = [...root.querySelectorAll('[data-banner-slide]')];
    const controls = root.querySelector('[data-banner-controls]');
    const dots = root.querySelector('[data-banner-dots]');
    const viewport = root.querySelector('[data-banner-viewport]');
    const pause = root.querySelector('[data-banner-pause]');
    if (!track || !slides.length || !controls || !dots) return;
    root.dataset.bannerReady = 'true';
    const n = slides.length, loop = n > 1;
    let index = 0, timer = null, hovered = false, focused = false, wrapTimer = null;
    let userPaused = reduced.matches, inView = false, pointer = null, suppressClickUntil = 0;
    const interval = Math.max(3500, Number(root.dataset.interval) || 5000);
    function clone(slide) {
      const c = slide.cloneNode(true);
      c.removeAttribute('data-banner-slide');
      c.setAttribute('aria-hidden','true'); c.inert = true;
      return c;
    }
    const before = loop ? clone(slides[n-1]) : null, after = loop ? clone(slides[0]) : null;
    if (loop) { track.prepend(before); track.append(after); }
    const buttons = slides.map((slide, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'cham-banner__dot';
      b.setAttribute('aria-label', 'Xem ' + slide.getAttribute('aria-label'));
      b.addEventListener('click', () => { show(i); schedule(); });
      dots.appendChild(b); return b;
    });
    function loadSlide(slide) {
      const image = slide?.querySelector('[data-banner-image]');
      if (image && image.dataset.src) { image.src = image.dataset.src; delete image.dataset.src; }
    }
    function load(i) {
      i = (i+n)%n;
      loadSlide(slides[i]);
      if (i === n-1) loadSlide(before);
      if (i === 0) loadSlide(after);
    }
    function position(physical, instant) {
      if (instant) track.style.transition = 'none';
      track.style.transform = 'translate3d(' + (-100*physical) + '%,0,0)';
      if (instant) { void track.offsetWidth; track.style.removeProperty('transition'); }
    }
    function finishWrap() {
      if (wrapTimer === null) return;
      clearTimeout(wrapTimer); wrapTimer = null;
      position(index + 1, true);
    }
    function show(next, initial = false) {
      finishWrap();
      const old = index;
      index = (next + n) % n;
      load(index); load(index+1);
      slides.forEach((slide, i) => {
        slide.inert = i !== index;
        if (i === index) slide.removeAttribute('aria-hidden');
        else slide.setAttribute('aria-hidden','true');
        buttons[i].setAttribute('aria-current', i === index ? 'true' : 'false');
      });
      const wrap = loop && !reduced.matches && ((old === n-1 && next === n) || (old === 0 && next === -1));
      if (wrap) {
        position(next === n ? n+1 : 0, false);
        wrapTimer = setTimeout(finishWrap, 700);
      } else position(index+(loop?1:0), initial || reduced.matches || Math.abs(index-old)>1);
    }
    track.addEventListener('transitionend', e => { if (e.target === track && e.propertyName === 'transform') finishWrap(); });
    function schedule() {
      clearTimeout(timer);
      if (!loop || userPaused || hovered || focused || !inView || document.hidden) return;
      timer = setTimeout(() => { show(index + 1); schedule(); }, interval);
    }
    function updatePause() {
      pause.setAttribute('aria-pressed', String(userPaused));
      pause.setAttribute('aria-label', userPaused ? 'Tiếp tục tự chuyển' : 'Tạm dừng tự chuyển');
      const icon = pause.querySelector('[data-banner-pause-icon]');
      if (icon) icon.setAttribute('d', userPaused ? 'M9 6l9 6-9 6Z' : 'M9 6v12M15 6v12');
    }
    root.querySelector('[data-banner-prev]').addEventListener('click', () => { show(index - 1); schedule(); });
    root.querySelector('[data-banner-next]').addEventListener('click', () => { show(index + 1); schedule(); });
    pause.addEventListener('click', () => { userPaused = !userPaused; updatePause(); schedule(); });
    root.addEventListener('mouseenter', () => { hovered = true; schedule(); });
    root.addEventListener('mouseleave', () => { hovered = false; schedule(); });
    root.addEventListener('focusin', () => { focused = true; schedule(); });
    root.addEventListener('focusout', e => { focused = root.contains(e.relatedTarget); schedule(); });
    document.addEventListener('visibilitychange', schedule);
    reduced.addEventListener?.('change', e => { if (e.matches) { userPaused = true; finishWrap(); } updatePause(); schedule(); });
    viewport.addEventListener('touchstart', e => { pointer = {x:e.touches[0].clientX,y:e.touches[0].clientY}; }, {passive:true});
    viewport.addEventListener('touchcancel', () => { pointer = null; }, {passive:true});
    viewport.addEventListener('touchend', e => {
      if (!pointer) return;
      const dx = e.changedTouches[0].clientX - pointer.x, dy = e.changedTouches[0].clientY - pointer.y;
      pointer = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)*1.4) {
        suppressClickUntil = Date.now()+350;
        show(index + (dx < 0 ? 1 : -1)); schedule();
      }
    }, {passive:true});
    viewport.addEventListener('click', e => { if (Date.now()<suppressClickUntil) { e.preventDefault(); e.stopPropagation(); } }, true);
    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver(entries => { inView = entries[0].isIntersecting; if(inView) load(index+1); schedule(); }, {threshold:.15});
      obs.observe(root);
    } else inView = true;
    show(0,true); updatePause(); controls.hidden = !loop; schedule();
  }
  const boot = () => document.querySelectorAll('[data-cham-banner]').forEach(init);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true}); else boot();
  document.addEventListener('shopify:section:load', boot);
})();