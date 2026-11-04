interface GraphNode { id: string; type: 'article' | 'concept'; label: string; href?: string; description?: string; }
interface GraphEdge { source: string; target: string; type: string; evidence?: string; concepts?: string[]; }
interface GraphData { nodes: GraphNode[]; edges: GraphEdge[]; }
const svg = document.querySelector<SVGSVGElement>('#knowledge-svg');
if (svg) {
  const data: GraphData = JSON.parse(document.querySelector('#knowledge-data')!.textContent!);
  const ns = 'http://www.w3.org/2000/svg';
  const create = <K extends keyof SVGElementTagNameMap>(tag: K) => document.createElementNS(ns, tag);
  const positions = new Map<string, { x: number; y: number }>();
  const nodeElements = new Map<string, SVGGElement>();
  const lineElements: { edge: GraphEdge; element: SVGLineElement }[] = [];
  let view = { x: 0, y: 0, w: 1200, h: 760 };
  let selected: string | null = null;
  let query = '';
  const articles = data.nodes.filter(node => node.type === 'article');
  const concepts = data.nodes.filter(node => node.type === 'concept');
  // Stable initial positions; no perpetual animation or simulated activity.
  articles.forEach((node, i) => { const angle = i * Math.PI * 2 / articles.length; positions.set(node.id, { x: 600 + (articles.length === 1 ? 0 : 230 * Math.cos(angle)), y: 380 + (articles.length === 1 ? 0 : 220 * Math.sin(angle)) }); });
  concepts.forEach((node, i) => { const angle = i * Math.PI * 2 / concepts.length - Math.PI / 2; positions.set(node.id, { x: 600 + 440 * Math.cos(angle), y: 380 + 320 * Math.sin(angle) }); });
  const initialPositions = new Map([...positions].map(([id, p]) => [id, { ...p }]));
  const lineLayer = create('g'), nodeLayer = create('g'); svg.append(lineLayer, nodeLayer);
  for (const edge of data.edges) {
    const line = create('line'); line.classList.add('graph-edge');
    if (edge.type === 'shared-concepts') line.classList.add('shared-edge');
    lineLayer.append(line); lineElements.push({ edge, element: line });
  }
  for (const node of data.nodes) {
    const group = create('g'); group.classList.add('graph-node', `${node.type}-node`); group.setAttribute('role', 'button'); group.setAttribute('tabindex', '0'); group.setAttribute('aria-label', `${node.type === 'article' ? '文章' : '概念'}：${node.label}`);
    const hit = create('circle'); hit.classList.add('node-hit'); hit.style.fill = 'transparent'; hit.style.stroke = 'none';
    const circle = create('circle'); circle.classList.add('node-visible'); circle.setAttribute('r', node.type === 'article' ? '20' : '11');
    const text = create('text'); text.setAttribute('y', node.type === 'article' ? '43' : '32'); text.setAttribute('text-anchor', 'middle'); text.textContent = node.label.length > 22 ? node.label.slice(0, 21) + '…' : node.label;
    const title = create('title'); title.textContent = node.label;
    group.append(hit, circle, text, title); nodeLayer.append(group); nodeElements.set(node.id, group);
    group.addEventListener('click', () => { if (!moved) select(node.id); });
    group.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(node.id); } });
    group.addEventListener('pointerdown', event => startDrag(event, node.id));
  }
  function update() {
    svg!.setAttribute('viewBox', `${view.x} ${view.y} ${view.w} ${view.h}`);
    const scale = Math.abs(svg!.getScreenCTM()?.a || 1);
    for (const [id, position] of positions) {
      const group = nodeElements.get(id)!;
      group.setAttribute('transform', `translate(${position.x} ${position.y})`);
      const node = data.nodes.find(n => n.id === id)!;
      group.querySelector('.node-visible')!.setAttribute('r', String((node.type === 'article' ? 10 : 7) / scale));
      group.querySelector('.node-hit')!.setAttribute('r', String(22 / scale));
      const text = group.querySelector('text')!;
      text.style.fontSize = `${13 / scale}px`; text.style.strokeWidth = `${3 / scale}px`; text.setAttribute('y', String(31 / scale));
      const max = svg!.clientWidth < 600 ? 14 : 22;
      text.textContent = node.label.length > max ? node.label.slice(0, max - 1) + '…' : node.label;
    }
    for (const { edge, element } of lineElements) {
      const a = positions.get(edge.source)!, b = positions.get(edge.target)!;
      element.setAttribute('x1', String(a.x)); element.setAttribute('y1', String(a.y)); element.setAttribute('x2', String(b.x)); element.setAttribute('y2', String(b.y));
    }
  }
  function highlight() {
    const related = new Set<string>(selected ? [selected] : []);
    if (selected) for (const edge of data.edges) if (edge.source === selected || edge.target === selected) { related.add(edge.source); related.add(edge.target); }
    for (const node of data.nodes) {
      const visible = (!selected || related.has(node.id)) && (!query || node.label.toLocaleLowerCase().includes(query));
      nodeElements.get(node.id)!.classList.toggle('dimmed', !visible);
      nodeElements.get(node.id)!.classList.toggle('selected', node.id === selected);
      nodeElements.get(node.id)!.setAttribute('aria-pressed', String(node.id === selected));
    }
    for (const { edge, element } of lineElements) element.classList.toggle('dimmed', !!selected && edge.source !== selected && edge.target !== selected);
  }
  function select(id: string | null) {
    selected = id; highlight();
    const node = data.nodes.find(node => node.id === id);
    const heading = document.querySelector('#graph-selection-title')!, description = document.querySelector('#graph-selection-description')!, evidence = document.querySelector('#graph-selection-evidence')!;
    const link = document.querySelector<HTMLAnchorElement>('#graph-selection-link')!;
    heading.textContent = node?.label || '从一个节点开始'; description.textContent = node?.description || (node ? '在以下文章中出现，附对应的正文依据。' : '点击文章或概念，查看摘要、正文依据和相关内容。');
    link.hidden = !node?.href; if (node?.href) link.href = node.href; else link.removeAttribute('href');
    evidence.replaceChildren();
    if (node) for (const edge of data.edges.filter(edge => edge.source === id || edge.target === id)) {
      const other = data.nodes.find(n => n.id === (edge.source === id ? edge.target : edge.source))!;
      const li = document.createElement('li'); const button = document.createElement('button'); button.type = 'button'; button.textContent = `${edge.type === 'shared-concepts' ? '共享概念 · ' : ''}${other.label}`; button.addEventListener('click', () => select(other.id)); li.append(button);
      const quote = document.createElement('p'); quote.textContent = edge.evidence || `共同概念：${edge.concepts?.map(key => data.nodes.find(n => n.id === key)?.label).join('、')}`; li.append(quote); evidence.append(li);
    }
  }
  let drag: { pointer: number; id: string | null; x: number; y: number } | null = null;
  let moved = false;
  function point(event: PointerEvent) { const matrix = svg!.getScreenCTM(); return matrix ? new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse()) : new DOMPoint(); }
  function startDrag(event: PointerEvent, id: string | null) {
    if (event.button !== 0) return; event.stopPropagation(); const p = point(event); moved = false; drag = { pointer: event.pointerId, id, x: p.x, y: p.y }; svg!.setPointerCapture(event.pointerId);
  }
  svg.addEventListener('pointerdown', event => startDrag(event, null));
  svg.addEventListener('pointermove', event => {
    if (!drag || drag.pointer !== event.pointerId) return;
    const p = point(event), dx = p.x - drag.x, dy = p.y - drag.y;
    if (Math.abs(dx) + Math.abs(dy) < 2) return; moved = true;
    if (drag.id) { const old = positions.get(drag.id)!; old.x += dx; old.y += dy; drag.x = p.x; drag.y = p.y; }
    else { view.x -= dx; view.y -= dy; }
    update();
  });
  function endDrag(event: PointerEvent) { if (drag?.pointer === event.pointerId) { if (!moved && drag.id) select(drag.id); svg!.releasePointerCapture(event.pointerId); drag = null; } }
  svg.addEventListener('pointerup', endDrag); svg.addEventListener('pointercancel', endDrag);
  function zoom(factor: number) {
    const width = Math.max(300, Math.min(3600, view.w * factor)); const height = width * 760 / 1200;
    view.x += (view.w - width) / 2; view.y += (view.h - height) / 2; view.w = width; view.h = height; update();
  }
  svg.addEventListener('wheel', event => { event.preventDefault(); zoom(event.deltaY > 0 ? 1.1 : .9); }, { passive: false });
  document.querySelector('#graph-in')!.addEventListener('click', () => zoom(.8)); document.querySelector('#graph-out')!.addEventListener('click', () => zoom(1.25));
  document.querySelector('#graph-reset')!.addEventListener('click', () => { view = { x: 0, y: 0, w: 1200, h: 760 }; for (const [id, p] of initialPositions) positions.set(id, { ...p }); query = ''; (document.querySelector('#graph-search') as HTMLInputElement).value = ''; select(null); update(); });
  document.querySelector<HTMLInputElement>('#graph-search')!.addEventListener('input', event => { query = (event.target as HTMLInputElement).value.trim().toLocaleLowerCase(); highlight(); });
  svg.addEventListener('keydown', event => { if (event.key === 'Escape') select(null); });
  new ResizeObserver(update).observe(svg);
  update();
}
