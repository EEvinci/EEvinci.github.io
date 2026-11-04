const home = document.querySelector<HTMLElement>('.interactive-home');
if (home) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const title = home.querySelector<HTMLElement>('.kinetic-title')!;
  const complexity = home.querySelector<HTMLButtonElement>('.complexity-button')!;
  const flip = home.querySelector<HTMLButtonElement>('.flip-note')!;
  const idea = home.querySelector<HTMLButtonElement>('.idea-trigger')!;
  const lens = home.querySelector<HTMLButtonElement>('.reveal-toggle')!;
  const status = home.querySelector<HTMLElement>('.home-status')!;
  const plane = home.querySelector<HTMLElement>('.home-plane')!;
  let clarityTimer: ReturnType<typeof setTimeout>;
  let flightTimer: ReturnType<typeof setTimeout>;
  let typeTimer: ReturnType<typeof setTimeout>;
  let typingFrame = 0;
  let pointerFrame = 0;
  let pinned = false;

  function stopTyping() {
    cancelAnimationFrame(typingFrame);
    clearTimeout(typeTimer);
    title.classList.remove('is-typing');
  }
  function typeTitle() {
    stopTyping();
    if (reduced.matches) return;
    void title.offsetWidth;
    home!.classList.remove('is-clear');
    complexity.setAttribute('aria-pressed', 'false');
    clearTimeout(clarityTimer);
    // Full text reserves its final layout; only character opacity and transform animate.
    typingFrame = requestAnimationFrame(() => {
      title.classList.add('is-typing');
      typeTimer = setTimeout(stopTyping, 2500);
    });
  }
  home.querySelector('.replay-type')!.addEventListener('click', typeTitle);
  // Render the readable title if JavaScript or animation is unavailable.
  document.fonts.ready.then(typeTitle);

  complexity.addEventListener('click', () => {
    stopTyping();
    clearTimeout(clarityTimer);
    const enabled = home!.classList.toggle('is-clear');
    complexity.setAttribute('aria-pressed', String(enabled));
    status.textContent = enabled ? 'Complexity becomes clarity. 从复杂走向清晰。' : '';
    if (enabled) clarityTimer = setTimeout(() => {
      home!.classList.remove('is-clear');
      complexity.setAttribute('aria-pressed', 'false');
      status.textContent = '';
    }, 3200);
  });
  flip.addEventListener('click', () => {
    const flipped = home!.classList.toggle('is-flipped');
    flip.setAttribute('aria-pressed', String(flipped));
    flip.setAttribute('aria-label', flipped ? '新的视角，新的发现。点击翻回' : '换个角度看看，点击翻转便签');
  });
  idea.addEventListener('click', () => {
    const caught = home!.classList.toggle('has-idea');
    idea.setAttribute('aria-pressed', String(caught));
    status.textContent = caught ? '接住一个想法，再把它做出来。' : '';
  });
  home.querySelector('.act-button')!.addEventListener('click', () => {
    if (home!.classList.contains('is-flying')) return;
    stopTyping();
    const box = home!.getBoundingClientRect();
    const act = home!.querySelector('.act-button')!.getBoundingClientRect();
    plane.style.setProperty('--flight-x', `${act.left - box.left + act.width / 2}px`);
    plane.style.setProperty('--flight-y', `${act.top - box.top}px`);
    const distance = Math.max(0, Math.min(box.width - 64, box.width * .78) - (act.left - box.left));
    plane.style.setProperty('--flight-distance', `${distance}px`);
    home!.classList.add('is-flying');
    status.textContent = '让想法起飞。';
    flightTimer = setTimeout(() => { home!.classList.remove('is-flying'); status.textContent = ''; }, reduced.matches ? 900 : 2400);
  });
  function moveLens(x: number, y: number) {
    const box = home!.getBoundingClientRect();
    home!.style.setProperty('--lens-x', `${Math.max(0, Math.min(box.width, x - box.left))}px`);
    home!.style.setProperty('--lens-y', `${Math.max(0, Math.min(box.height, y - box.top))}px`);
  }
  home.addEventListener('pointermove', event => {
    if (reduced.matches || (!fine.matches && !pinned)) return;
    cancelAnimationFrame(pointerFrame);
    pointerFrame = requestAnimationFrame(() => { moveLens(event.clientX, event.clientY); home!.classList.add('lens-visible'); });
  });
  home.addEventListener('pointerleave', () => { cancelAnimationFrame(pointerFrame); if (!pinned) home!.classList.remove('lens-visible'); });
  lens.addEventListener('click', () => {
    pinned = !pinned;
    lens.setAttribute('aria-pressed', String(pinned));
    home!.classList.toggle('lens-visible', pinned);
    home!.classList.toggle('lens-pinned', pinned);
    home!.style.setProperty('--lens-x', '52%');
    home!.style.setProperty('--lens-y', '55%');
  });
  document.querySelectorAll<HTMLElement>('.home-shell .tilt-surface').forEach(card => {
    let frame = 0;
    function reset() { cancelAnimationFrame(frame); card.style.removeProperty('--tilt-x'); card.style.removeProperty('--tilt-y'); }
    card.addEventListener('pointermove', event => {
      if (!fine.matches || reduced.matches) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = card.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (event.clientX - box.left) / box.width));
        const y = Math.max(0, Math.min(1, (event.clientY - box.top) / box.height));
        card.style.setProperty('--tilt-x', `${(0.5 - y) * 5}deg`);
        card.style.setProperty('--tilt-y', `${(x - 0.5) * 5}deg`);
        card.style.setProperty('--light-x', `${x * 100}%`);
        card.style.setProperty('--light-y', `${y * 100}%`);
      });
    });
    card.addEventListener('pointerleave', reset);
    card.addEventListener('pointercancel', reset);
    reduced.addEventListener('change', reset);
  });
  function reset() {
    stopTyping();
    cancelAnimationFrame(pointerFrame);
    clearTimeout(clarityTimer); clearTimeout(flightTimer);
    home!.classList.remove('is-clear', 'is-flying', 'lens-visible', 'lens-pinned');
    pinned = false;
    lens.setAttribute('aria-pressed', 'false');
    complexity.setAttribute('aria-pressed', 'false');
    status.textContent = '';
  }
  home.addEventListener('keydown', event => { if (event.key === 'Escape') reset(); });
  reduced.addEventListener('change', reset);
}
