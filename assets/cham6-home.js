(() => {
  const preference = window.matchMedia('(min-width: 1024px) and (min-height: 670px) and (prefers-reduced-motion: no-preference)');
  let dispose;

  function mount() {
    dispose?.();
    const root = document.querySelector('[data-cham6-story]');
    const scene = root?.querySelector('[data-cham6-making]');
    if (!scene) return;

    const stage = scene.querySelector('[data-cham6-stage]');
    const viewport = scene.querySelector('[data-cham6-viewport]');
    const track = scene.querySelector('[data-cham6-track]');
    const controls = scene.querySelector('[data-cham6-controls]');
    const current = controls.querySelector('[data-cham6-current]');
    const buttons = [...controls.querySelectorAll('button')];
    const transition = root.querySelector('[data-cham6-transition]');
    const header = document.getElementById('header-group');
    const frameCount = track.children.length;
    const events = new AbortController();
    const { signal } = events;
    let frame = 0;
    let distance = 0;
    let hold = 0;
    let activeIndex = -1;
    let headerHeight = 0;

    function update() {
      frame = 0;
      if (!scene.hasAttribute('data-enhanced')) return;

      const top = scene.getBoundingClientRect().top;
      const offset = Math.min(distance, Math.max(0, headerHeight - top - hold));
      const progress = offset / (distance || 1);
      const index = Math.round(progress * (frameCount - 1));

      if (transition) {
        const bounds = transition.getBoundingClientRect();
        const reveal = Math.max(0, Math.min(1, (innerHeight - bounds.top) / (bounds.height || 1)));
        transition.style.setProperty('--cham6-photo-scale', 1.09 - reveal * .09);
      }

      track.style.setProperty('--cham6-track-x', `${-offset}px`);
      controls.style.setProperty('--cham6-progress', progress);
      if (index !== activeIndex) {
        activeIndex = index;
        current.textContent = index + 1;
        buttons[0].setAttribute('aria-disabled', String(index === 0));
        buttons[1].setAttribute('aria-disabled', String(index >= frameCount - 1));
      }
    }

    function scheduleUpdate() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    function measure() {
      headerHeight = Math.ceil(header?.getBoundingClientRect().height ?? 0);
      document.body.style.setProperty('--cham6-header-height', `${headerHeight}px`);
      const enhanced = preference.matches && frameCount > 1;
      scene.toggleAttribute('data-enhanced', enhanced);
      controls.hidden = !enhanced;

      if (enhanced) {
        distance = Math.max(0, track.scrollWidth - viewport.clientWidth);
        hold = Math.round(viewport.clientWidth * .14);
        scene.style.height = `${stage.offsetHeight + distance + hold * 2}px`;
      } else {
        scene.style.removeProperty('height');
        track.style.removeProperty('--cham6-track-x');
        transition?.style.removeProperty('--cham6-photo-scale');
      }

      scheduleUpdate();
    }

    for (const button of buttons) {
      button.addEventListener('click', () => {
        if (button.getAttribute('aria-disabled') === 'true' || !distance) return;
        const next = Math.min(frameCount - 1, Math.max(0, activeIndex + Number(button.dataset.cham6Direction)));
        const start = scrollY + scene.getBoundingClientRect().top - headerHeight;
        window.scrollTo({ top: start + hold + distance * next / (frameCount - 1), behavior: 'instant' });
      }, { signal });
    }

    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null;
    observer?.observe(viewport);
    if (header) observer?.observe(header);
    preference.addEventListener('change', measure, { signal });
    window.addEventListener('resize', measure, { passive: true, signal });
    window.addEventListener('scroll', scheduleUpdate, { passive: true, signal });
    root.addEventListener('load', measure, { capture: true, signal });
    document.fonts?.ready.then(() => { if (!signal.aborted) measure(); });
    measure();

    dispose = () => {
      events.abort();
      observer?.disconnect();
      cancelAnimationFrame(frame);
    };
  }

  mount();
  document.addEventListener('shopify:section:load', mount);
  document.addEventListener('shopify:section:unload', () => requestAnimationFrame(mount));
})();
