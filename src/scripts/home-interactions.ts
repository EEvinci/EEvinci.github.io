const root = document.querySelector<HTMLElement>('#evinci-hook');
if (root) {
  const title = root.querySelector<HTMLElement>('h1')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const toggle = root.querySelector<HTMLButtonElement>('.reference-reveal')!;
  let timer: ReturnType<typeof setTimeout>;
  let frame = 0;
  let moveFrame = 0;
  let pinned = false;
  function stop() { clearTimeout(timer); cancelAnimationFrame(frame); title.classList.remove('reference-typing'); }
  function type() {
    stop();
    root!.dataset.unravel = 'false';
    void title.offsetWidth;
    if (reduced.matches) return;
    frame = requestAnimationFrame(() => {
      title.classList.add('reference-typing');
      timer = setTimeout(stop, 2500);
    });
  }
  root.querySelector('.reference-replay')!.addEventListener('click', type);
  root.querySelector('.eh-complexity')!.addEventListener('click', stop);
  document.fonts.ready.then(type);
  function show(x: number, y: number) {
    const box = root!.getBoundingClientRect();
    root!.style.setProperty('--lens-x', `${Math.max(0, Math.min(box.width, x - box.left))}px`);
    root!.style.setProperty('--lens-y', `${Math.max(0, Math.min(box.height, y - box.top))}px`);
  }
  root.addEventListener('pointermove', event => {
    if (reduced.matches || (!fine.matches && !pinned)) return;
    cancelAnimationFrame(moveFrame);
    moveFrame = requestAnimationFrame(() => { show(event.clientX, event.clientY); root!.classList.add('lens-visible'); });
  });
  root.addEventListener('pointerleave', () => { cancelAnimationFrame(moveFrame); if (!pinned) root!.classList.remove('lens-visible'); });
  toggle.addEventListener('click', () => {
    pinned = !pinned;
    root!.classList.toggle('lens-visible', pinned);
    root!.classList.toggle('lens-pinned', pinned);
    root!.style.setProperty('--lens-x', '50%'); root!.style.setProperty('--lens-y', '50%');
    toggle.setAttribute('aria-pressed', String(pinned));
  });
  function reset() {
    stop(); cancelAnimationFrame(moveFrame); pinned = false;
    root!.classList.remove('lens-visible', 'lens-pinned'); toggle.setAttribute('aria-pressed', 'false');
  }
  root.addEventListener('keydown', event => { if (event.key === 'Escape') reset(); });
  reduced.addEventListener('change', reset);
}
