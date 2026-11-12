const FP1_MARK_SCHEMES = {"parabola-practice-q1": ["fp1-ch4-assets/image-1e98801deecd9927.jpg"], "parabola-practice-q3": ["fp1-ch4-assets/image-774b14a3eda7c9c3.jpg"], "parabola-practice-q6": ["fp1-ch4-assets/image-bbb842a84beab053.jpg", "fp1-ch4-assets/image-eec008d8e36a1a42.jpg"], "parabola-practice-q5": ["fp1-ch4-assets/image-cc37bb5131e4a48b.jpg"], "parabola-practice-q2": ["fp1-ch4-assets/image-60eb403839aa1b75.jpg"], "parabola-practice-q7": ["fp1-ch4-assets/image-b758df73072ee6b7.jpg"], "parabola-practice-q4": ["fp1-ch4-assets/image-83ae16485200f465.jpg", "fp1-ch4-assets/image-b5edf1b5616e48d8.jpg"], "parabola-homework-q1": ["fp1-ch4-assets/image-c9932c215c1416e8.jpg", "fp1-ch4-assets/image-be898f4104b6aaeb.jpg"], "parabola-homework-q2": ["fp1-ch4-assets/image-9593d7cb20b07e6c.jpg"], "parabola-homework-q3": ["fp1-ch4-assets/image-ec6d78ffeb023215.jpg"], "parabola-homework-q4": ["fp1-ch4-assets/image-7948fc557e3a626f.jpg"], "hyperbola-practice-q2": ["fp1-ch4-assets/image-d11f14d15bb70575.jpg"], "hyperbola-practice-q4": ["fp1-ch4-assets/image-2f9aa93efd8ab85f.jpg"], "hyperbola-practice-q3": ["fp1-ch4-assets/image-7b3b14c2897c1bcc.jpg"], "hyperbola-practice-q7": ["fp1-ch4-assets/image-ea76ad7851b3b1fc.jpg"], "hyperbola-practice-q6": ["fp1-ch4-assets/image-e16aeba49a7a463b.jpg"], "hyperbola-practice-q1": ["fp1-ch4-assets/image-b98fb1e58ef41c51.jpg"], "hyperbola-practice-q5": ["fp1-ch4-assets/image-a52c913a32d35dc3.jpg"], "hyperbola-homework-q1": ["fp1-ch4-assets/image-946462540e76cfe0.jpg"], "hyperbola-homework-q2": ["fp1-ch4-assets/image-3b679fe55a5c7dc0.jpg"], "hyperbola-homework-q3": ["fp1-ch4-assets/image-8aa81853fa5cfe14.jpg"], "hyperbola-homework-q4": ["fp1-ch4-assets/image-6f48d7eb42dcfd6e.jpg"]};
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.createElement('div');
  modal.className = 'ms-modal';
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = `
    <section class="ms-dialog" role="dialog" aria-modal="true" aria-label="Official mark scheme">
      <div class="ms-dialog-head"><h2 class="ms-dialog-title"></h2><button class="ms-close" type="button" aria-label="Close mark scheme">×</button></div>
      <div class="zoom-toolbar" aria-label="Image zoom controls">
        <button class="zoom-button" type="button" data-zoom-action="out" aria-label="Zoom out">−</button>
        <input class="zoom-slider" type="range" min="10" max="1200" step="1" value="100" aria-label="Zoom level" />
        <button class="zoom-button" type="button" data-zoom-action="in" aria-label="Zoom in">＋</button>
        <span class="zoom-percent">100%</span>
        <button class="zoom-button" type="button" data-zoom-action="fit">Fit width</button>
        <span class="zoom-readout">Wheel/trackpad: continuous zoom · drag: move · double-click: fit width</span>
      </div>
      <p class="ms-dialog-hint">Continuous zoom range: 10%-1200%. Click outside the panel, press Esc, or use × to close.</p>
      <div class="ms-images"><div class="zoom-canvas"></div></div>
    </section>`;
  document.body.appendChild(modal);

  const viewport = modal.querySelector('.ms-images');
  const canvas = modal.querySelector('.zoom-canvas');
  const slider = modal.querySelector('.zoom-slider');
  const percent = modal.querySelector('.zoom-percent');
  const zoomState = { scale: 1, x: 0, y: 0, dragging: false, startX: 0, startY: 0, originX: 0, originY: 0 };

  const PROGRESS_STORAGE_KEY = 'fp1-ch4-class-teaching-progress-v1';
  const PARABOLA_ROUTINE_ORDER = [1, 3, 6, 5, 2, 7, 4];
  const HYPERBOLA_ROUTINE_ORDER = [2, 4, 3, 7, 6, 1, 5];
  const QUESTION_ORDER = [
    ...PARABOLA_ROUTINE_ORDER.map((number, index) => ({ key: `parabola-practice-q${number}`, group: 3, page: index + 1, label: `Parabola Practice ${index + 1} (Handout Q${number})` })),
    ...[1, 2, 3, 4].map(number => ({ key: `parabola-homework-q${number}`, group: 4, page: number, label: `Parabola Homework Q${number}` })),
    ...HYPERBOLA_ROUTINE_ORDER.map((number, index) => ({ key: `hyperbola-practice-q${number}`, group: 6, page: index + 1, label: `Hyperbola Practice ${index + 1} (Handout Q${number})` })),
    ...[1, 2, 3, 4].map(number => ({ key: `hyperbola-homework-q${number}`, group: 7, page: number, label: `Hyperbola Homework Q${number}` })),
  ];
  let storageAvailable = true;
  const loadProgress = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) || 'null');
      return saved && typeof saved === 'object'
        ? { activeClass: saved.activeClass || 'class2', class2: saved.class2 || {}, class4: saved.class4 || {} }
        : { activeClass: 'class2', class2: {}, class4: {} };
    } catch (error) {
      storageAvailable = false;
      return { activeClass: 'class2', class2: {}, class4: {} };
    }
  };
  let progressState = loadProgress();
  const saveProgress = () => {
    if (!storageAvailable) return;
    try { localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progressState)); }
    catch (error) { storageAvailable = false; }
  };

  const tracker = document.createElement('div');
  tracker.className = 'class-tracker';
  tracker.innerHTML = `
    <span class="class-tracker-label">课堂记录</span>
    <select class="class-select" aria-label="Choose class">
      <option value="class2">2班</option>
      <option value="class4">4班</option>
    </select>
    <span class="class-progress-count"></span>
    <button class="next-lesson-button" type="button"></button>
    <span class="storage-warning" hidden>浏览器未允许保存记录</span>`;
  const actionArea = document.querySelector('.deck-actions');
  if (actionArea) actionArea.prepend(tracker);
  const chapterTabs = document.querySelector('.chapter-tabs');
  const parabolaHomeworkTab = [...document.querySelectorAll('.chapter-tab')]
    .find(button => button.textContent.trim() === 'Parabola HW');
  if (chapterTabs && parabolaHomeworkTab && !chapterTabs.querySelector('.chapter-tab-break')) {
    const lineBreak = document.createElement('span');
    lineBreak.className = 'chapter-tab-break';
    lineBreak.setAttribute('aria-hidden', 'true');
    parabolaHomeworkTab.insertAdjacentElement('afterend', lineBreak);
  }
  const deckTop = document.querySelector('.deck-top');
  if (deckTop && 'ResizeObserver' in window) {
    const topObserver = new ResizeObserver(entries => {
      const height = Math.ceil(entries[0].contentRect.height + 14);
      document.documentElement.style.setProperty('--deck-top-height', `${height}px`);
    });
    topObserver.observe(deckTop);
  }
  const classSelect = tracker.querySelector('.class-select');
  const progressCount = tracker.querySelector('.class-progress-count');
  const nextLessonButton = tracker.querySelector('.next-lesson-button');
  classSelect.value = progressState.activeClass;

  const activeClassLabel = () => progressState.activeClass === 'class4' ? '4班' : '2班';
  const currentQuestionKey = () => document.querySelector('.slide-page .practice-grid')?.dataset.practiceKey || null;
  const isTaught = key => Boolean(progressState[progressState.activeClass]?.[key]);
  const keyFromPageButton = (button, zonePrefix) => {
    const match = button.textContent.match(/(?:Handout|Homework) Q(\d+)/i);
    if (!match) return null;
    return `${zonePrefix}-q${match[1]}`;
  };

  const updateTeachingProgress = () => {
    classSelect.value = progressState.activeClass;
    const taughtCount = QUESTION_ORDER.filter(item => isTaught(item.key)).length;
    const nextItem = QUESTION_ORDER.find(item => !isTaught(item.key));
    progressCount.textContent = `${taughtCount} / ${QUESTION_ORDER.length}`;
    nextLessonButton.disabled = !nextItem;
    nextLessonButton.dataset.group = nextItem ? String(nextItem.group) : '';
    nextLessonButton.dataset.page = nextItem ? String(nextItem.page) : '';
    nextLessonButton.textContent = nextItem ? `下次：${nextItem.label}` : '✓ 全部已讲完';
    tracker.querySelector('.storage-warning').hidden = storageAvailable;

    const selectedTab = document.querySelector('.chapter-tab[aria-selected="true"]')?.textContent || '';
    const zonePrefix = selectedTab.includes('Parabola Practice') ? 'parabola-practice'
      : selectedTab.includes('Parabola HW') ? 'parabola-homework'
      : selectedTab.includes('Hyperbola Practice') ? 'hyperbola-practice'
      : selectedTab.includes('Hyperbola HW') ? 'hyperbola-homework' : null;
    document.querySelectorAll('.page-link').forEach(button => {
      button.classList.remove('is-taught');
      button.querySelector('.taught-badge')?.remove();
      if (!zonePrefix) return;
      const key = keyFromPageButton(button, zonePrefix);
      if (!key || !isTaught(key)) return;
      button.classList.add('is-taught');
      const badge = document.createElement('span');
      badge.className = 'taught-badge';
      badge.textContent = '✓';
      badge.setAttribute('aria-label', `${activeClassLabel()} already taught`);
      button.appendChild(badge);
    });

    document.querySelector('.taught-row')?.remove();
    const key = currentQuestionKey();
    if (!key) return;
    const meta = document.querySelector('.slide-page .practice-meta');
    if (!meta) return;
    const row = document.createElement('div');
    row.className = 'taught-row';
    const taught = isTaught(key);
    row.innerHTML = `
      <span class="taught-row-copy"><b>${activeClassLabel()}</b> · 本题课堂记录</span>
      <button class="taught-toggle ${taught ? 'is-taught' : ''}" type="button" data-question-key="${key}">${taught ? '☑ 已讲过' : '☐ 标记为已讲'}</button>`;
    meta.insertAdjacentElement('afterend', row);
  };

  classSelect.addEventListener('change', () => {
    progressState.activeClass = classSelect.value;
    saveProgress();
    updateTeachingProgress();
  });
  nextLessonButton.addEventListener('click', () => {
    if (nextLessonButton.disabled) return;
    location.hash = `#g=${nextLessonButton.dataset.group}&p=${nextLessonButton.dataset.page}`;
  });
  document.addEventListener('click', event => {
    const toggle = event.target.closest('.taught-toggle');
    if (!toggle) return;
    const key = toggle.dataset.questionKey;
    progressState[progressState.activeClass][key] = !isTaught(key);
    saveProgress();
    updateTeachingProgress();
  });
  const HOMEWORK_PASSWORD = '123123';
  let homeworkUnlocked = false;
  try { homeworkUnlocked = sessionStorage.getItem('fp1-ch4-homework-unlocked') === 'yes'; } catch (error) {}
  const passwordModal = document.createElement('div');
  passwordModal.className = 'homework-password-modal';
  passwordModal.innerHTML = `
    <div class="homework-lock-card" role="dialog" aria-modal="true" aria-label="Unlock homework solutions">
      <div class="homework-lock-icon">🔒</div>
      <h3>解锁作业答案与 MS</h3>
      <p>题目默认可见；输入教师密码后才能显示关键步骤和官方 mark scheme。</p>
      <div class="homework-password-row">
        <input class="homework-password" type="password" autocomplete="off" placeholder="Teacher password" aria-label="Teacher password" />
        <button class="homework-unlock" type="button">解锁</button>
      </div>
      <p class="homework-lock-error" aria-live="polite"></p>
      <p class="homework-lock-note">本次打开页面期间保持解锁；关闭页面后将再次锁定。</p>
    </div>`;
  document.body.appendChild(passwordModal);
  const openHomeworkPassword = () => {
    passwordModal.classList.add('is-open');
    const input = passwordModal.querySelector('.homework-password');
    input.value = '';
    passwordModal.querySelector('.homework-lock-error').textContent = '';
    requestAnimationFrame(() => input.focus());
  };
  const closeHomeworkPassword = () => passwordModal.classList.remove('is-open');
  const applyHomeworkLock = () => {
    const marker = document.querySelector('.slide-page .homework-lock-marker');
    const page = document.querySelector('.slide-page');
    if (!page) return;
    page.classList.toggle('homework-content-locked', Boolean(marker && !homeworkUnlocked));
    page.querySelector('.homework-lock-notice')?.remove();
    if (!marker) return;
    const notice = document.createElement('div');
    notice.className = 'homework-lock-notice';
    notice.innerHTML = homeworkUnlocked
      ? '<b>🔓 教师模式：</b>关键步骤与官方 MS 已解锁。题目保持默认显示。'
      : '<b>题目默认显示。</b>关键步骤与官方 MS 仍锁定；点击相应按钮时输入教师密码。';
    marker.insertAdjacentElement('afterend', notice);
  };
  const tryHomeworkUnlock = () => {
    const input = passwordModal.querySelector('.homework-password');
    const error = passwordModal.querySelector('.homework-lock-error');
    if (!input) return;
    if (input.value === HOMEWORK_PASSWORD) {
      homeworkUnlocked = true;
      try { sessionStorage.setItem('fp1-ch4-homework-unlocked', 'yes'); } catch (storageError) {}
      closeHomeworkPassword();
      applyHomeworkLock();
      updateTeachingProgress();
    } else {
      if (error) error.textContent = '密码不正确，请重新输入。';
      input.select();
    }
  };
  document.addEventListener('click', event => {
    if (event.target.closest('.homework-unlock')) { tryHomeworkUnlock(); return; }
    if (event.target === passwordModal) { closeHomeworkPassword(); return; }
    const lockedControl = event.target.closest('.reveal-next, .show-ms');
    if (lockedControl && document.querySelector('.slide-page .homework-lock-marker') && !homeworkUnlocked) {
      event.preventDefault();
      event.stopImmediatePropagation();
      openHomeworkPassword();
    }
  }, true);
  document.addEventListener('keydown', event => {
    if (event.key === 'Enter' && event.target.matches('.homework-password')) {
      event.preventDefault();
      tryHomeworkUnlock();
    }
    if (event.key === 'Escape' && passwordModal.classList.contains('is-open')) {
      event.preventDefault();
      closeHomeworkPassword();
    }
  });
  const slideObserver = new MutationObserver(() => requestAnimationFrame(() => { updateTeachingProgress(); applyHomeworkLock(); }));
  const slidePage = document.querySelector('.slide-page');
  if (slidePage) slideObserver.observe(slidePage, { childList: true });
  updateTeachingProgress();
  applyHomeworkLock();

  const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
  const applyTransform = () => {
    canvas.style.transform = `translate(${zoomState.x}px, ${zoomState.y}px) scale(${zoomState.scale})`;
    const value = Math.round(zoomState.scale * 100);
    slider.value = String(value);
    percent.textContent = `${value}%`;
  };
  const setZoom = (newScale, clientX, clientY) => {
    newScale = clamp(newScale, 0.1, 12);
    const rect = viewport.getBoundingClientRect();
    const anchorX = (clientX ?? (rect.left + rect.width / 2)) - rect.left;
    const anchorY = (clientY ?? (rect.top + rect.height / 2)) - rect.top;
    const contentX = (anchorX - zoomState.x) / zoomState.scale;
    const contentY = (anchorY - zoomState.y) / zoomState.scale;
    zoomState.x = anchorX - contentX * newScale;
    zoomState.y = anchorY - contentY * newScale;
    zoomState.scale = newScale;
    applyTransform();
  };
  const fitViewer = () => {
    zoomState.scale = 1;
    zoomState.x = 0;
    zoomState.y = 0;
    applyTransform();
  };
  const openViewer = (title, sources, altPrefix) => {
    modal.querySelector('.ms-dialog-title').textContent = title;
    canvas.replaceChildren(...sources.map((src, index) => {
      const image = document.createElement('img');
      image.className = 'ms-modal-image';
      image.src = src;
      image.alt = `${altPrefix} ${index + 1}`;
      return image;
    }));
    fitViewer();
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    modal.querySelector('.ms-close').focus();
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    canvas.replaceChildren();
    fitViewer();
  };

  viewport.addEventListener('wheel', event => {
    if (!modal.classList.contains('is-open')) return;
    event.preventDefault();
    const factor = Math.exp(-event.deltaY * 0.0016);
    setZoom(zoomState.scale * factor, event.clientX, event.clientY);
  }, { passive: false });
  viewport.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    zoomState.dragging = true;
    zoomState.startX = event.clientX;
    zoomState.startY = event.clientY;
    zoomState.originX = zoomState.x;
    zoomState.originY = zoomState.y;
    viewport.classList.add('is-dragging');
    viewport.setPointerCapture(event.pointerId);
  });
  viewport.addEventListener('pointermove', event => {
    if (!zoomState.dragging) return;
    zoomState.x = zoomState.originX + event.clientX - zoomState.startX;
    zoomState.y = zoomState.originY + event.clientY - zoomState.startY;
    applyTransform();
  });
  const stopDragging = event => {
    zoomState.dragging = false;
    viewport.classList.remove('is-dragging');
    if (event.pointerId !== undefined && viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
  };
  viewport.addEventListener('pointerup', stopDragging);
  viewport.addEventListener('pointercancel', stopDragging);
  viewport.addEventListener('dblclick', fitViewer);
  slider.addEventListener('input', () => setZoom(Number(slider.value) / 100));

  document.addEventListener('click', event => {
    const reveal = event.target.closest('.reveal-next');
    if (reveal) {
      const panel = reveal.closest('.teaching-panel');
      const steps = [...panel.querySelectorAll('.solution-step')];
      const nextStep = steps.find(step => step.classList.contains('is-hidden'));
      if (nextStep) nextStep.classList.remove('is-hidden');
      const remaining = steps.filter(step => step.classList.contains('is-hidden')).length;
      const shown = steps.length - remaining;
      reveal.textContent = remaining ? `Show step ${shown + 1} of ${steps.length}` : 'All key steps shown';
      reveal.disabled = remaining === 0;
      return;
    }

    const reset = event.target.closest('.reset-steps');
    if (reset) {
      const panel = reset.closest('.teaching-panel');
      const steps = [...panel.querySelectorAll('.solution-step')];
      steps.forEach(step => step.classList.add('is-hidden'));
      const revealButton = panel.querySelector('.reveal-next');
      revealButton.disabled = false;
      revealButton.textContent = `Show step 1 of ${steps.length}`;
      return;
    }

    const show = event.target.closest('.show-ms');
    if (show) {
      const images = FP1_MARK_SCHEMES[show.dataset.msKey] || [];
      openViewer(show.dataset.msTitle, images, 'Official mark scheme page');
      return;
    }

    const questionImage = event.target.closest('.practice-question-image');
    if (questionImage) {
      openViewer(questionImage.alt, [questionImage.src], questionImage.alt);
      return;
    }

    const syllabusImage = event.target.closest('.syllabus-screenshot');
    if (syllabusImage) {
      openViewer(syllabusImage.dataset.viewerTitle || 'Pearson Edexcel specification extract', [syllabusImage.src], syllabusImage.alt);
      return;
    }

    const zoomButton = event.target.closest('[data-zoom-action]');
    if (zoomButton) {
      const action = zoomButton.dataset.zoomAction;
      if (action === 'in') setZoom(zoomState.scale * 1.25);
      if (action === 'out') setZoom(zoomState.scale / 1.25);
      if (action === 'fit') fitViewer();
      return;
    }
    if (event.target === modal || event.target.closest('.ms-close')) closeModal();
  });

  window.addEventListener('keydown', event => {
    if (!modal.classList.contains('is-open')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
      return;
    }
    if (event.key === '+' || event.key === '=') { event.preventDefault(); setZoom(zoomState.scale * 1.25); }
    if (event.key === '-') { event.preventDefault(); setZoom(zoomState.scale / 1.25); }
    if (event.key === '0') { event.preventDefault(); fitViewer(); }
  });
});
