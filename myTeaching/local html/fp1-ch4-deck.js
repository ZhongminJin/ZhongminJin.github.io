document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const ignored = new Set(['SCRIPT', 'STYLE', 'LINK']);
  const titleBlock = document.getElementById('title-block-header');
  if (titleBlock) titleBlock.remove();

  const original = Array.from(body.children).filter(node => !ignored.has(node.tagName));
  const groups = [];
  let group = null;
  let page = null;
  let pending = [];

  const meaningful = nodes => nodes.some(n => {
    if (n.tagName === 'HR') return false;
    return (n.textContent || '').trim() || n.tagName === 'IMG' || n.querySelector?.('img');
  });

  const flushPending = () => {
    if (!group || !meaningful(pending)) { pending = []; return; }
    const section = document.createElement('section');
    section.className = 'source-page';
    pending.forEach(n => section.appendChild(n));
    group.pages.push({ title: 'Chapter overview', section });
    pending = [];
  };

  original.forEach(node => {
    if (node.tagName === 'H1' && !node.classList.contains('title')) {
      flushPending();
      group = { title: node.textContent.trim(), id: node.id || `group-${groups.length}`, pages: [] };
      groups.push(group);
      page = null;
      node.remove();
      return;
    }
    if (!group) { node.remove(); return; }
    if (node.tagName === 'H2') {
      if (!page) flushPending();
      const section = document.createElement('section');
      section.className = 'source-page';
      section.appendChild(node);
      page = { title: node.textContent.trim(), section };
      group.pages.push(page);
      return;
    }
    if (page) page.section.appendChild(node);
    else pending.push(node);
  });
  flushPending();

  const labels = title => {
    if (title.startsWith('FP1 Chapter')) return 'Overview';
    if (title.startsWith('4.1')) return '4.1 Parametric';
    if (title.startsWith('4.2')) return '4.2 Parabola';
    if (title.startsWith('Parabola past-paper')) return 'Parabola Practice';
    if (title.startsWith('Parabola homework')) return 'Parabola HW';
    if (title.startsWith('4.3')) return '4.3 Hyperbola';
    if (title.startsWith('Rectangular hyperbola past-paper')) return 'Hyperbola Practice';
    if (title.startsWith('Rectangular hyperbola homework')) return 'Hyperbola HW';
    if (title.startsWith('Formula')) return 'Formulae';
    if (title.startsWith('Suggested')) return 'Teaching';
    if (title.startsWith('Source')) return 'Sources';
    return title;
  };
  const shortPage = title => title
    .replace(/^\d+\.\s*/, '')
    .replace(/^Selected textbook practice for Section\s*/i, 'Practice ')
    .replace(/^Textbook\s*/i, '')
    .replace(/—/g, '—');

  const shell = document.createElement('div');
  shell.className = 'deck-shell';
  shell.innerHTML = `
    <div class="deck-top">
      <div class="deck-title-row">
        <div>
          <p class="deck-kicker">FP1 · Chapter 4</p>
          <h1 class="deck-main-title">Coordinate Systems — Interactive Teaching Note · V16</h1>
        </div>
        <div class="deck-actions">
          <a class="deck-action" href="fp1-ch4-parametric-curve-sketcher.html">Parametric curve lab</a>
          <button class="deck-action" type="button" id="print-current">Print current page</button>
        </div>
      </div>
      <nav class="chapter-tabs" role="tablist" aria-label="Chapter sections"></nav>
    </div>
    <div class="deck-layout">
      <aside class="page-nav" aria-label="Pages in this section">
        <h2 class="page-nav-title">Pages</h2>
        <div class="page-links"></div>
      </aside>
      <main class="stage">
        <div class="stage-head">
          <div><p class="breadcrumb"></p><h2 class="stage-title" aria-live="polite"></h2></div>
          <div class="page-count"></div>
        </div>
        <div class="progress-track" aria-hidden="true"><div class="progress-bar"></div></div>
        <article class="slide-page"></article>
        <div class="stage-footer">
          <span class="keyboard-tip">Use ← and → to move between pages · click an image to enlarge</span>
          <div class="deck-nav-group">
            <button class="deck-nav-button" type="button" id="previous-page">← Previous</button>
            <button class="deck-nav-button primary" type="button" id="next-page">Next →</button>
          </div>
        </div>
      </main>
    </div>`;
  body.replaceChildren(shell);
  body.classList.add('deck-ready');

  const tabs = shell.querySelector('.chapter-tabs');
  const links = shell.querySelector('.page-links');
  const slide = shell.querySelector('.slide-page');
  const breadcrumb = shell.querySelector('.breadcrumb');
  const stageTitle = shell.querySelector('.stage-title');
  const pageCount = shell.querySelector('.page-count');
  const progress = shell.querySelector('.progress-bar');
  const previous = shell.querySelector('#previous-page');
  const next = shell.querySelector('#next-page');
  let activeGroup = 0;
  let activePage = 0;

  const readHash = () => {
    const match = location.hash.match(/^#g=(\d+)&p=(\d+)$/);
    if (!match) return;
    const g = Number(match[1]), p = Number(match[2]);
    if (groups[g] && groups[g].pages[p]) { activeGroup = g; activePage = p; }
  };
  readHash();

  groups.forEach((g, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chapter-tab';
    button.role = 'tab';
    button.textContent = labels(g.title);
    button.addEventListener('click', () => { activeGroup = index; activePage = 0; render(); });
    tabs.appendChild(button);
  });

  const goRelative = delta => {
    let g = activeGroup, p = activePage + delta;
    if (p >= groups[g].pages.length && g < groups.length - 1) { g += 1; p = 0; }
    if (p < 0 && g > 0) { g -= 1; p = groups[g].pages.length - 1; }
    if (!groups[g]?.pages[p]) return;
    activeGroup = g; activePage = p; render();
  };

  const render = () => {
    const g = groups[activeGroup];
    const p = g.pages[activePage];
    tabs.querySelectorAll('.chapter-tab').forEach((button, index) => {
      const active = index === activeGroup;
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    links.replaceChildren();
    g.pages.forEach((item, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'page-link';
      button.innerHTML = `<span class="page-link-number">${index + 1}</span>${shortPage(item.title)}`;
      if (index === activePage) button.setAttribute('aria-current', 'page');
      button.addEventListener('click', () => { activePage = index; render(); });
      links.appendChild(button);
    });
    const rendered = p.section.cloneNode(true);
    rendered.classList.remove('source-page');
    slide.replaceChildren(rendered);
    slide.querySelectorAll('img').forEach(img => {
      img.addEventListener('click', () => img.classList.toggle('is-zoomed'));
    });
    breadcrumb.textContent = labels(g.title);
    stageTitle.textContent = p.title;
    pageCount.textContent = `Page ${activePage + 1} of ${g.pages.length}`;
    progress.style.width = `${((activePage + 1) / g.pages.length) * 100}%`;
    previous.disabled = activeGroup === 0 && activePage === 0;
    next.disabled = activeGroup === groups.length - 1 && activePage === groups[groups.length - 1].pages.length - 1;
    history.replaceState(null, '', `#g=${activeGroup}&p=${activePage}`);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  previous.addEventListener('click', () => goRelative(-1));
  next.addEventListener('click', () => goRelative(1));
  shell.querySelector('#print-current').addEventListener('click', () => window.print());
  window.addEventListener('keydown', event => {
    if (document.querySelector('.ms-modal.is-open')) return;
    if (event.target.matches('input, textarea, select, button, a')) return;
    if (event.key === 'ArrowRight') goRelative(1);
    if (event.key === 'ArrowLeft') goRelative(-1);
  });
  window.addEventListener('hashchange', () => { readHash(); render(); });
  render();
});
