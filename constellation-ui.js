import { isPhoneLayout } from './phone-layout.js';
import { CONSTELLATIONS } from './constellation-data.js';
import { projectConstellation } from './constellation-scene.js';
import { enableDockWheel } from './dock-wheel.js';
import { getNarrationPlayer } from './local-narration.js';
import { createDockPreference } from './dock-preference.js?v=20261024-phone-landscape-startup';
import { CONSTELLATION_KNOWLEDGE, CONSTELLATION_FOUNDATIONS } from './constellation-knowledge.js';
import { createLearningReading } from './learning-reading.js';
import { createTopicVideoButton } from './topic-video-button.js';

const REGION_NAMES = { north: '北天星座', south: '南天星座', equatorial: '赤道附近' };
const PANEL_NAMES = { recognition: '认识星座', stars: '寻找亮星', story: '星座故事', distance: '恒星的远近' };
const SVG_NS = 'http://www.w3.org/2000/svg';
const node = (tag, className = '', text = '') => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
};
const button = (text, className = '') => {
  const element = node('button', className, text);
  element.type = 'button';
  return element;
};
const textOf = value => Array.isArray(value) ? value.join(' ') : String(value || '');
const normalize = value => String(value).toLowerCase().replace(/[\s·_-]/g, '');
const starName = star => star.name || star.id;

/** Small sky maps share the main scene's north-up, east-left gnomonic projection.
 * These are recognition figures, not official constellation boundaries. */
export function constellationThumbnail(record, { width = 150, height = 90 } = {}) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('constellation-mini-map');
  const points = projectConstellation(record).stars.map(star => ({ star, x: star.x, y: -star.y }));
  if (!points.length) return svg;
  const minX = Math.min(...points.map(p => p.x)), maxX = Math.max(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y)), maxY = Math.max(...points.map(p => p.y));
  const scale = Math.min((width - 28) / Math.max(1, maxX - minX), (height - 20) / Math.max(1, maxY - minY));
  const byId = new Map(points.map(p => [p.star.id, {
    ...p, x: width / 2 + (p.x - (minX + maxX) / 2) * scale,
    y: height / 2 + (p.y - (minY + maxY) / 2) * scale,
  }]));
  for (const [from, to] of record.lines || []) {
    const a = byId.get(from), b = byId.get(to);
    if (!a || !b) continue;
    const line = document.createElementNS(SVG_NS, 'line');
    for (const [key, value] of Object.entries({ x1: a.x, y1: a.y, x2: b.x, y2: b.y })) line.setAttribute(key, value.toFixed(2));
    line.setAttribute('stroke', '#7cafc9');
    line.setAttribute('stroke-opacity', '.7');
    line.setAttribute('stroke-width', '.8');
    svg.append(line);
  }
  for (const point of byId.values()) {
    const circle = document.createElementNS(SVG_NS, 'circle');
    circle.setAttribute('cx', point.x.toFixed(2));
    circle.setAttribute('cy', point.y.toFixed(2));
    circle.setAttribute('r', Math.max(1.2, Math.min(2.3, 2.4 - Number(point.star.mag || 0) * .23)).toFixed(2));
    circle.setAttribute('fill', point.star.color || '#d2efff');
    svg.append(circle);
  }
  return svg;
}

export function createConstellationUI({ onSelect = () => {}, onViewChange = () => {}, onToggle = () => {}, onFocusStar = () => {}, onBackToSky = () => {}, onInvalidate = () => {} } = {}) {
  const isMobile = () => isPhoneLayout();
  const announcePanel = panel => { if (isMobile()) document.dispatchEvent(new CustomEvent('mobile-open-panel', { detail: { panel } })); };
  let mobileLayout = isMobile();
  const catalog = new Map(CONSTELLATIONS.map(record => [record.id, record]));
  const first = CONSTELLATIONS.find(record => record.abbr === 'Ori' || record.latin?.toLowerCase() === 'orion') || CONSTELLATIONS[0];
  let current = first.id, panel = 'recognition', selectedStar = null, visible = false;
  let cardExpanded = false, filter = 'all', query = '', librarySelected = current;
  const cardPreferences = { desktop: true, mobile: false };
  const toggles = { lines: true, labels: true };
  let narrationToken = 0;

  const root = node('section', 'constellation-explorer interface');
  root.id = 'constellation-explorer';
  root.setAttribute('aria-label', '星座探索');
  root.hidden = true;
  const hero = node('aside', 'constellation-hero');
  hero.innerHTML = '<p class="constellation-eyebrow">CONSTELLATION EXPLORER</p><h1 id="constellation-title"></h1><p class="constellation-latin"></p><p class="constellation-tagline">把星光连起来，读懂夜空。</p>';
  const heroActions = node('nav', 'constellation-hero-actions');
  heroActions.setAttribute('aria-label', '星座科普内容');
  const actionButtons = new Map();
  for (const [key, icon] of [['recognition', 'i-book'], ['stars', 'i-search'], ['story', 'i-info']]) {
    const action = button('', 'constellation-action');
    action.innerHTML = `<svg aria-hidden="true"><use href="#${icon}"/></svg><span>${PANEL_NAMES[key]}</span><span aria-hidden="true">›</span>`;
    action.dataset.constellationPanel = key;
    action.setAttribute('aria-pressed', 'false');
    action.addEventListener('click', () => changePanel(key, true));
    actionButtons.set(key, action);
    heroActions.append(action);
  }
  const libraryEntry = button('', 'constellation-library-entry');
  libraryEntry.innerHTML = '<svg aria-hidden="true"><use href="#i-book"/></svg><span>星座图鉴</span><span aria-hidden="true">↗</span>';
  libraryEntry.id = 'open-constellation-library';
  hero.append(heroActions, libraryEntry);

  const card = node('aside', 'constellation-card');
  card.id = 'constellation-card';
  card.setAttribute('aria-label', '星座科普卡片');
  const cardToolbar = node('div', 'constellation-card-toolbar');
  const cardToggle = button('', 'constellation-card-toggle');
  cardToggle.id = 'toggle-constellation-card';
  cardToggle.innerHTML = '<span>星座科普</span><span class="constellation-card-action" aria-hidden="true">收起</span><span class="constellation-card-chevron" aria-hidden="true">⌃</span>';
  cardToggle.setAttribute('aria-controls', 'constellation-card-content');
  cardToggle.setAttribute('aria-expanded', 'false');
  cardToggle.addEventListener('click', () => setCardExpanded(!cardExpanded));
  const narrateButton = button('播放解说', 'constellation-narrate');
  narrateButton.id = 'constellation-narrate';
  narrateButton.setAttribute('aria-pressed', 'false');
  narrateButton.addEventListener('click', narrate);
  cardToolbar.append(cardToggle, narrateButton);
  const cardContent = node('div', 'constellation-card-content');
  cardContent.id = 'constellation-card-content';
  cardContent.innerHTML = '<div class="constellation-card-identity"><p class="constellation-card-category"></p><h2></h2><p class="constellation-card-latin"></p></div>';
  const cardTabs = node('nav', 'constellation-card-tabs');
  cardTabs.setAttribute('aria-label', '切换科普卡片');
  const tabButtons = new Map();
  for (const [key, name] of [['recognition', '辨认线索'], ['stars', '亮星档案'], ['story', '星座故事']]) {
    const tab = button(name);
    tab.setAttribute('aria-pressed', 'false');
    tab.dataset.constellationTab = key;
    tab.addEventListener('click', () => changePanel(key, true));
    tabButtons.set(key, tab);
    cardTabs.append(tab);
  }
  const cardBody = node('div', 'constellation-card-body');
  cardBody.id = 'constellation-lesson';
  const speechStatus = node('p', 'constellation-speech-status');
  speechStatus.setAttribute('role', 'status');
  cardContent.append(cardTabs, cardBody, speechStatus);
  card.append(cardToolbar, cardContent);

  const dock = node('section', 'constellation-dock');
  dock.setAttribute('aria-label', '选择星座');
  const dockHeader = node('div', 'constellation-dock-heading');
  dockHeader.append(node('span', '', '从一片星空开始'));
  const dockCount = node('span', '', `${CONSTELLATIONS.length} 个入门星座`);
  const dockPrev = button('‹', 'constellation-dock-scroll'), dockNext = button('›', 'constellation-dock-scroll');
  dockPrev.setAttribute('aria-label', '向前浏览星座'); dockNext.setAttribute('aria-label', '向后浏览星座');
  dockHeader.append(dockCount, dockPrev, dockNext);
  const dockList = node('div', 'constellation-dock-list');
  dockList.id = 'constellation-dock-list';
  enableDockWheel(dock,dockList);
  const dockPreference = createDockPreference({isMobile, onChange: value => setDockCollapsed(value)});
  let dockCollapsed = dockPreference.read();
  const dockCollapse = button('收起', 'constellation-dock-collapse');
  dockCollapse.setAttribute('aria-controls', dockList.id);
  dockHeader.append(dockCollapse);
  function setDockCollapsed(value, { remember = false, announce = false } = {}) {
    dockCollapsed = Boolean(value);
    if (remember) dockPreference.set(dockCollapsed);
    dock.classList.toggle('constellation-dock-collapsed', dockCollapsed);
    root.classList.toggle('constellation-dock-open', mobileLayout && !dockCollapsed);
    dockList.hidden = dockCount.hidden = dockPrev.hidden = dockNext.hidden = dockCollapsed;
    dockCollapse.textContent = dockCollapsed ? '展开' : '收起';
    dockCollapse.setAttribute('aria-expanded', String(!dockCollapsed));
    dockCollapse.setAttribute('aria-label', dockCollapsed ? '展开星座窗口' : '收起星座窗口');
    if (!dockCollapsed && announce) announcePanel('constellation-dock');
    onInvalidate();
  }
  dockCollapse.addEventListener('click', () => {
    setDockCollapsed(!dockCollapsed, { remember: true, announce: true });
    requestAnimationFrame(() => {
      if (visible && !dockCollapsed) dockButtons.get(current)?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'auto' });
      updateDockArrows();
    });
  });
  setDockCollapsed(dockCollapsed);
  const dockButtons = new Map();
  for (const record of CONSTELLATIONS) {
    const item = button('', 'constellation-destination');
    item.dataset.constellation = record.id;
    item.setAttribute('aria-label', `探索${record.name}`);
    item.setAttribute('aria-pressed', 'false');
    item.append(constellationThumbnail(record, { width: 110, height: 52 }), node('span', '', record.name));
    item.addEventListener('click', () => choose(record.id));
    dockButtons.set(record.id, item);
    dockList.append(item);
  }
  const updateDockArrows = () => {
    dockPrev.disabled = dockList.scrollLeft < 2;
    dockNext.disabled = dockList.scrollLeft >= dockList.scrollWidth - dockList.clientWidth - 2;
  };
  for (const [control, direction] of [[dockPrev, -1], [dockNext, 1]]) {
    control.addEventListener('click', () => dockList.scrollBy({ left: direction * dockList.clientWidth * .75, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));
  }
  dockList.addEventListener('scroll', updateDockArrows, { passive: true });
  dock.append(dockHeader, dockList);

  const controls = node('nav', 'constellation-controls');
  controls.setAttribute('aria-label', '星图显示');
  const toggleButtons = new Map();
  for (const [key, label, icon] of [['lines', '连线', 'i-orbit'], ['labels', '名称', 'i-label']]) {
    const control = button('');
    control.innerHTML = `<svg aria-hidden="true"><use href="#${icon}"/></svg><span>${label}</span>`;
    control.id = `constellation-toggle-${key}`;
    control.setAttribute('aria-pressed', 'true');
    control.addEventListener('click', () => {
      toggles[key] = !toggles[key];
      control.setAttribute('aria-pressed', String(toggles[key]));
      onToggle(key, toggles[key]); onInvalidate();
    });
    toggleButtons.set(key, control); controls.append(control);
  }
  const reset = button('');
  reset.id = 'constellation-reset';
  reset.innerHTML = '<svg aria-hidden="true"><use href="#i-reset"/></svg><span>回到星图</span>';
  reset.addEventListener('click', () => { onBackToSky(); onInvalidate(); });
  controls.append(reset);
  const hint = node('p', 'constellation-scene-hint', '拖动探索 · 滚轮缩放 · 点击亮星');
  const note = node('p', 'constellation-model-note', '地球视角 · J2000 星位 · 连线为辨认辅助');
  root.append(hero, card, dock, controls, hint, note);
  document.body.append(root);

  const library = node('dialog', 'constellation-library');
  library.id = 'constellation-library';
  library.setAttribute('aria-labelledby', 'constellation-library-title');
  library.innerHTML = '<div class="constellation-library-header"><div><p class="constellation-eyebrow">AN ATLAS OF THE NIGHT SKY</p><h2 id="constellation-library-title">星座图鉴</h2><p>从一幅星图，认识一片天空。</p></div><button type="button" class="constellation-library-close" aria-label="关闭星座图鉴">×</button></div>';
  const libraryLayout = node('div', 'constellation-library-layout');
  const librarySidebar = node('aside', 'constellation-library-sidebar');
  const searchLabel = node('label', 'constellation-library-search');
  searchLabel.append(node('span', 'sr-only', '搜索星座名称'));
  const search = node('input');
  search.type = 'search'; search.placeholder = '中文 / Latin / 缩写'; search.autocomplete = 'off';
  search.id = 'constellation-library-search';
  searchLabel.append(search);
  const filters = node('nav', 'constellation-library-filters');
  filters.setAttribute('aria-label', '筛选星座');
  for (const [key, label] of [['all', '全部星座'], ['north', '北天星座'], ['south', '南天星座'], ['zodiac', '黄道星座']]) {
    const option = button(label);
    option.dataset.constellationFilter = key;
    option.setAttribute('aria-pressed', 'false');
    option.addEventListener('click', () => { filter = key; renderLibrary(); });
    filters.append(option);
  }
  const libraryCount = node('p', 'constellation-library-count');
  libraryCount.setAttribute('role', 'status');
  librarySidebar.append(searchLabel, filters, libraryCount,
    node('p', 'constellation-library-scope', `精选 ${CONSTELLATIONS.length} 个入门星座。现代天文学将全天划分为 88 个星座区域；这里的连线用于辨认星形。`));
  const libraryGrid = node('div', 'constellation-library-grid');
  const libraryPreview = node('aside', 'constellation-library-preview');
  const libraryResults = node('div', 'constellation-library-results');
  libraryPreview.setAttribute('aria-label', '所选星座介绍');
  libraryLayout.append(librarySidebar, libraryGrid, libraryPreview);
  library.append(libraryLayout);
  document.body.append(library);
  const closeLibrary = (restoreFocus = false) => {
    if (library.open) library.close();
    if (restoreFocus && visible) libraryEntry.focus({ preventScroll: true });
    onInvalidate();
  };
  library.querySelector('.constellation-library-close').addEventListener('click', () => closeLibrary(true));
  library.addEventListener('cancel', () => { requestAnimationFrame(() => libraryEntry.focus({ preventScroll: true })); });
  library.addEventListener('click', event => {
    if (event.target !== library) return;
    const rect = library.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeLibrary(true);
  });
  libraryEntry.addEventListener('click', () => {
    stopNarration(); librarySelected = current; renderLibrary(); library.showModal(); search.focus();
  });
  search.addEventListener('input', () => { query = search.value; renderLibrary(); });

  function setCardExpanded(expanded, { announce = true, stop = true, remember = true } = {}) {
    if (!expanded && cardExpanded && stop) stopNarration();
    cardExpanded = Boolean(expanded);
    if (remember) cardPreferences[isMobile() ? 'mobile' : 'desktop'] = cardExpanded;
    root.classList.toggle('constellation-card-open', cardExpanded);
    cardToggle.setAttribute('aria-expanded', String(cardExpanded));
    cardToggle.setAttribute('aria-label', cardExpanded ? '收起星座科普' : '展开星座科普');
    cardToggle.querySelector('.constellation-card-action').textContent = cardExpanded ? '收起' : '展开';
    if (cardExpanded && announce) announcePanel('constellation');
    onInvalidate();
  }
  function changePanel(next, expand = false) {
    if (!(next in PANEL_NAMES)) return;
    panel = next; stopNarration(); renderLesson();
    if (expand) setCardExpanded(true);
    onViewChange(panel); onInvalidate();
  }
  function choose(id) {
    if (!catalog.has(id)) return;
    if (isMobile()) setDockCollapsed(true);
    select(id); closeLibrary(); onSelect(id); onInvalidate();
  }
  function select(id) {
    const record = catalog.get(id); if (!record) return;
    const changed = current !== id;
    current = id; selectedStar = null;
    if (changed) { stopNarration(); panel = 'recognition'; }
    hero.querySelector('h1').textContent = record.name;
    hero.querySelector('.constellation-latin').textContent = record.latin.toUpperCase();
    cardContent.querySelector('h2').textContent = record.name;
    cardContent.querySelector('.constellation-card-latin').textContent = record.latin.toUpperCase();
    cardContent.querySelector('.constellation-card-category').textContent = `${REGION_NAMES[record.region] || '星空探索'}${record.zodiac ? ' · 黄道星座' : ''}`;
    for (const [key, control] of dockButtons) control.setAttribute('aria-pressed', String(key === id));
    root.dataset.constellation = id;
    renderLesson(); onInvalidate();
    requestAnimationFrame(() => {
      if (visible && !dockCollapsed) dockButtons.get(id)?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'auto' });
      updateDockArrows();
    });
  }
  function featuredStars(record) {
    const ids = record.featured || [];
    return ids.map(id => record.stars.find(star => star.id === id)).filter(Boolean).length
      ? ids.map(id => record.stars.find(star => star.id === id)).filter(Boolean)
      : [...record.stars].sort((a, b) => a.mag - b.mag).slice(0, 3);
  }
  function starButton(star, { compact = false } = {}) {
    const control = button('', `constellation-star-button${compact ? ' compact' : ''}`);
    control.dataset.constellationStar = star.id;
    const dot = node('i', 'constellation-star-dot'); dot.style.setProperty('--star-color', star.color || '#bde8ff');
    const copy = node('span'); copy.append(node('strong', '', starName(star)));
    if (!compact) copy.append(node('small', '', `视星等 ${Number(star.mag).toFixed(2)}${Number.isFinite(star.distanceLy) ? ` · 约 ${Math.round(star.distanceLy).toLocaleString('zh-CN')} 光年` : ''}`));
    control.append(dot, copy, node('span', 'constellation-star-arrow', '↗'));
    control.setAttribute('aria-pressed', String(selectedStar === star.id));
    control.addEventListener('click', () => { showStar(star.id); onFocusStar(star.id); });
    return control;
  }
  function renderLesson() {
    const record = catalog.get(current);
    cardBody.replaceChildren();
    const videoButton=createTopicVideoButton(`constellation/${current}`,record.name);
    if(videoButton)cardBody.append(videoButton);
    actionButtons.forEach((control, key) => control.setAttribute('aria-pressed', String(panel === key)));
    tabButtons.forEach((control, key) => control.setAttribute('aria-pressed', String(panel === key)));
    if (panel === 'recognition') {
      cardBody.append(node('h3', '', textOf(record.tagline) || '从亮星连线开始'));
      cardBody.append(node('p', '', textOf(record.recognition)));
      const bright = node('div', 'constellation-featured');
      bright.append(node('h3', '', '先认识这几颗亮星'));
      featuredStars(record).forEach(star => bright.append(starButton(star, { compact: true })));
      cardBody.append(bright, node('p', 'constellation-key-fact', textOf(record.fact) || '星座中的恒星看似相邻，实际可能相距很远。'));
    } else if (panel === 'stars') {
      cardBody.append(node('h3', '', '点击名字，在星图中找到它'));
      const list = node('div', 'constellation-star-list');
      record.stars.slice().sort((a, b) => a.mag - b.mag).forEach(star => list.append(starButton(star)));
      cardBody.append(list, node('p', 'constellation-small-note', '视星等数值越小，肉眼看到的星越亮。亮度还受距离影响，不能直接比较恒星本身的发光能力。距地距离为 HYG 星表估计值。'));
    } else if (panel === 'story') {
      cardBody.append(node('span', 'constellation-story-label', '星空中的文化故事'), node('h3', '', `${record.name}的名字从何而来`));
      cardBody.append(node('p', '', textOf(record.story)), node('p', 'constellation-key-fact', '不同文化以不同方式命名、连接星空。这里的故事帮助记忆星形，不用于解释人的性格或命运。'));
    } else {
      cardBody.append(node('h3', '', '在天空中相邻，未必在空间中相近'), node('p', '', '星图把恒星画在同一个视野里。把它们与地球的距离排开，就能看到图案背后的深度。'));
      const stars = record.stars.filter(star => Number.isFinite(star.distanceLy) && star.distanceLy > 0).sort((a, b) => a.distanceLy - b.distanceLy);
      if (stars.length) {
        const max = Math.max(...stars.map(star => star.distanceLy));
        const rows = node('ol', 'constellation-distance-chart');
        for (const star of stars.slice(0, 8)) {
          const row = node('li');
          const label = node('span', '', starName(star));
          const meter = node('span', 'constellation-distance-track');
          const bar = node('i'); bar.style.width = `${Math.max(1, star.distanceLy / max * 100)}%`;
          meter.append(bar);
          row.append(label, node('strong', '', `约 ${Math.round(star.distanceLy).toLocaleString('zh-CN')} 光年`), meter);
          rows.append(row);
        }
        cardBody.append(rows, node('p', 'constellation-small-note', '横条按距地距离线性缩放，仅比较远近；不代表恒星之间的真实空间排列。距离为 HYG 星表估计值，测量方法不同会有差异。'));
      } else cardBody.append(node('p', 'constellation-small-note', '本组暂未收录可靠的距离数值。光年是光在真空中一年传播的距离，是长度单位。'));
      const returnButton = button('← 返回辨认线索', 'constellation-return');
      returnButton.addEventListener('click', () => changePanel('recognition', true));
      cardBody.append(returnButton);
    }
    if (panel !== 'distance') {
      const distances = button('看看恒星的远近  →', 'constellation-distance-entry');
      distances.addEventListener('click', () => changePanel('distance', true));
      cardBody.append(distances);
    }
    if (panel === 'recognition' && CONSTELLATION_KNOWLEDGE[record.id]) {
      cardBody.append(createLearningReading(CONSTELLATION_KNOWLEDGE[record.id], { narration: getNarrationPlayer(), owner: 'constellation', key: `learning/constellation/${record.id}` }));
    }
    cardBody.append(createLearningReading(CONSTELLATION_FOUNDATIONS[panel], { narration: getNarrationPlayer(), owner: 'constellation', key: `learning/basics/${panel}` }));
    cardBody.dataset.panel = panel;
    cardContent.scrollTop = 0;
  }
  function showStar(id) {
    const star = catalog.get(current).stars.find(item => item.id === id);
    if (!star) return;
    selectedStar = id; panel = 'stars'; stopNarration(); renderLesson(); setCardExpanded(true);
    onViewChange(panel); onInvalidate();
    requestAnimationFrame(() => cardBody.querySelector(`[data-constellation-star="${CSS.escape(id)}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'auto' }));
  }
  function renderLibrary() {
    const q = normalize(query);
    const records = CONSTELLATIONS.filter(record =>
      (filter === 'all' || filter === 'zodiac' && record.zodiac || record.region === filter) &&
      normalize(`${record.name} ${record.latin} ${record.abbr} ${record.id}`).includes(q));
    filters.querySelectorAll('button').forEach(control => control.setAttribute('aria-pressed', String(control.dataset.constellationFilter === filter)));
    libraryCount.textContent = `${records.length} / ${CONSTELLATIONS.length} 个星座`;
    libraryGrid.replaceChildren();
    if (!records.length) {
      libraryGrid.append(node('p', 'constellation-empty', '没有找到匹配的星座。试试中文名、英文名，或切换到「全部星座」。'));
      libraryPreview.hidden = true;
      return;
    }
    libraryPreview.hidden = false;
    if (!records.some(record => record.id === librarySelected)) librarySelected = records[0].id;
    for (const record of records) {
      const item = button('', 'constellation-library-tile');
      item.dataset.constellationPreview = record.id;
      item.setAttribute('aria-pressed', String(record.id === librarySelected));
      item.setAttribute('aria-label', `查看${record.name}资料`);
      const art = node('span', 'constellation-library-art');
      art.append(constellationThumbnail(record, { width: 210, height: 120 }));
      const title = node('span', 'constellation-library-tile-copy');
      title.append(node('strong', '', record.name), node('small', '', record.latin.toUpperCase()));
      item.append(art, title, node('span', 'constellation-library-region', REGION_NAMES[record.region] || '星座'));
      item.addEventListener('click', () => {
        librarySelected = record.id;
        libraryGrid.querySelectorAll('button').forEach(control => control.setAttribute('aria-pressed', String(control.dataset.constellationPreview === librarySelected)));
        renderLibraryPreview();
        if (isMobile()) requestAnimationFrame(() => libraryPreview.scrollIntoView({ block: 'nearest', behavior: 'auto' }));
      });
      libraryGrid.append(item);
    }
    renderLibraryPreview();
  }
  function renderLibraryPreview() {
    const record = catalog.get(librarySelected);
    libraryPreview.replaceChildren(node('p', 'constellation-eyebrow', 'A WINDOW INTO THE SKY'), node('h3', '', record.name), node('p', 'constellation-library-latin', record.latin.toUpperCase()));
    libraryPreview.append(constellationThumbnail(record, { width: 250, height: 150 }), node('h4', '', '辨认线索'), node('p', '', textOf(record.recognition)));
    libraryPreview.append(node('h4', '', '亮星档案'), node('p', 'constellation-library-bright', featuredStars(record).map(starName).join(' · ')));
    const enter = button('进入星空探索  →', 'constellation-library-enter');
    enter.addEventListener('click', () => choose(record.id));
    libraryPreview.append(enter, node('p', 'constellation-small-note', '从地球视角认识星座，不表示此刻你所在地的可见天空。'));
  }
  function stopNarration() {
    narrationToken++;
    getNarrationPlayer().stop('constellation');
    narrateButton.textContent = '播放解说'; narrateButton.setAttribute('aria-pressed', 'false');
    speechStatus.textContent = '';
  }
  function narrate() {
    setCardExpanded(true);
    const token = ++narrationToken;
    speechStatus.textContent = '';
    const onState = state => {
      if (token !== narrationToken) return;
      narrateButton.textContent = state === 'loading' ? '正在加载…' : state === 'playing' ? '停止解说' : '播放解说';
      narrateButton.setAttribute('aria-pressed', String(state !== 'idle'));
      speechStatus.textContent = state === 'loading' ? '正在加载解说…' : '';
    };
    const onError = error => {
      if (token !== narrationToken) return;
      onState('idle');
      speechStatus.textContent = typeof error === 'string' ? error : '解说未能播放，可继续阅读科普卡片。';
    };
    try {
      Promise.resolve(getNarrationPlayer().toggle({ owner: 'constellation', key: `constellation/${current}/${panel}`, onState, onError })).catch(onError);
    } catch (error) { onError(error); }
  }
  const handleVisibility = () => { if (document.hidden) stopNarration(); };
  function syncMobileLayout() {
    const next = isMobile();
    if (next !== mobileLayout) {
      mobileLayout = next;
      setDockCollapsed(dockPreference.read());
      setCardExpanded(cardPreferences[mobileLayout ? 'mobile' : 'desktop'], { announce: false, stop: false, remember: false });
      if (mobileLayout && cardExpanded) setDockCollapsed(true);
    }
    // Keep the dialog header and search outside the single mobile result scroller.
    // Returning to desktop restores the original three-column DOM structure.
    if (mobileLayout && libraryGrid.parentElement !== libraryResults) {
      libraryResults.append(libraryGrid, libraryPreview); libraryLayout.append(libraryResults);
    } else if (!mobileLayout && libraryGrid.parentElement === libraryResults) {
      libraryLayout.append(libraryGrid, libraryPreview); libraryResults.remove();
    }
    setCardExpanded(cardExpanded, { announce: false, stop: false, remember: false });
  }
  const handleResize = () => { syncMobileLayout(); updateDockArrows(); };
  const handleMobilePanel = event => {
    if (!isMobile() || !event.detail?.panel) return;
    if (event.detail.panel !== 'constellation-dock') setDockCollapsed(true);
    if (event.detail.panel !== 'constellation') setCardExpanded(false, { announce: false, stop: false, remember: false });
  };
  const handleGuide = () => stopNarration();
  document.addEventListener('visibilitychange', handleVisibility);
  document.addEventListener('mobile-open-panel', handleMobilePanel);
  window.addEventListener('pagehide', stopNarration);
  window.addEventListener('resize', handleResize);
  document.getElementById('enter-guide')?.addEventListener('click', handleGuide);
  const observer = new ResizeObserver(() => { updateDockArrows(); onInvalidate(); });
  observer.observe(dock); observer.observe(card); observer.observe(hero);
  select(current); setCardExpanded(!isMobile(), { announce: false }); syncMobileLayout();

  function visibleRect(element) {
    if (!visible || root.hidden || document.body.classList.contains('ui-hidden') || document.body.classList.contains('clean-view') || document.body.classList.contains('guide-active')) return null;
    const rect = element.getBoundingClientRect();
    return rect.width && rect.height ? rect : null;
  }
  return {
    setVisible(value) {
      visible = Boolean(value); root.hidden = !visible;
      if (!visible) { stopNarration(); closeLibrary(); }
      else { syncMobileLayout(); setDockCollapsed(dockPreference.read()); requestAnimationFrame(updateDockArrows); setCardExpanded(cardExpanded); }
      onInvalidate();
    },
    select, showStar, closeLibrary, stopNarration,
    getLayoutBounds: () => ({ left: visibleRect(hero), right: visibleRect(card), dock: visibleRect(dock), controls: visibleRect(controls) }),
    captureState: () => ({ current, panel, selectedStar, cardExpanded, dockCollapsed, dockLayout:mobileLayout?'mobile':'desktop', toggles: { ...toggles }, filter, query, cardScroll:cardContent.scrollTop, dockScroll:dockList.scrollLeft }),
    restoreState(saved) {
      if (!saved) return;
      stopNarration();
      if (catalog.has(saved.current)) select(saved.current);
      if (saved.panel in PANEL_NAMES) panel = saved.panel;
      selectedStar = saved.selectedStar || null;
      for (const key of Object.keys(toggles)) if (typeof saved.toggles?.[key] === 'boolean') {
        toggles[key] = saved.toggles[key]; toggleButtons.get(key).setAttribute('aria-pressed', String(toggles[key])); onToggle(key, toggles[key]);
      }
      filter = ['all', 'north', 'south', 'zodiac'].includes(saved.filter) ? saved.filter : 'all';
      query = saved.query || ''; search.value = query;
      const layout = isMobile() ? 'mobile' : 'desktop';
      // Restoring a scene must not undo a newer manual card preference.
      setDockCollapsed(dockPreference.read());
      renderLesson(); setCardExpanded((saved.dockLayout || 'desktop') === layout ? Boolean(saved.cardExpanded) : cardPreferences[layout]); onViewChange(panel);
      if(selectedStar)onFocusStar(selectedStar);
      requestAnimationFrame(()=>{cardContent.scrollTop=saved.cardScroll||0;dockList.scrollLeft=saved.dockScroll||0;updateDockArrows();});
    },
    dispose() {
      dockPreference.dispose();
      stopNarration(); closeLibrary(); observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('mobile-open-panel', handleMobilePanel);
      window.removeEventListener('pagehide', stopNarration); window.removeEventListener('resize', handleResize);
      document.getElementById('enter-guide')?.removeEventListener('click', handleGuide);
      root.remove(); library.remove();
    },
  };
}
