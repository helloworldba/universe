// DOM-free narration scripts shared by the offline audio build and its catalogue.
export const CONSTELLATION_PANELS = Object.freeze(['recognition', 'stars', 'story', 'distance']);

const PANEL_NAMES = { recognition: '认识星座', stars: '寻找亮星', story: '星座故事', distance: '恒星的远近' };
const clean = value => (Array.isArray(value) ? value.join(' ') : String(value ?? ''))
  .replace(/[←→↗↘↑↓›‹⌃⌄]/g, '').replace(/\s+/g, ' ').trim();
const sentence = value => {
  const text = clean(value);
  return text ? /[。！？!?]$/.test(text) ? text : `${text}。` : '';
};
const starName = star => clean(star.name || star.id);
const distance = star => `约 ${Math.round(star.distanceLy)} 光年`;
const brightness = star => Number(star.mag).toFixed(2).replace(/^-/, '负');
const featured = record => {
  const stars = record.stars || [];
  const chosen = (record.featured || []).map(id => stars.find(star => star.id === id)).filter(Boolean);
  return chosen.length ? chosen : stars.slice().sort((a, b) => a.mag - b.mag).slice(0, 3);
};

/** Return the spoken content of one constellation card, excluding UI controls.
 * Values follow the displayed HYG estimates, not a current observing forecast. */
export function constellationNarrationText(record, panel = 'recognition') {
  if (!record || !record.name) throw new TypeError('A named constellation record is required');
  if (!CONSTELLATION_PANELS.includes(panel)) throw new RangeError(`Unknown constellation panel: ${panel}`);
  const parts = [record.name, PANEL_NAMES[panel]];
  if (panel === 'recognition') {
    parts.push(record.tagline || '从亮星连线开始', record.recognition);
    const names = featured(record).map(starName).filter(Boolean);
    if (names.length) parts.push(`先认识这几颗亮星：${names.join('、')}`);
    parts.push(record.fact || '星座中的恒星看似相邻，实际可能相距很远。');
  } else if (panel === 'stars') {
    parts.push('亮星档案');
    for (const star of (record.stars || []).slice().sort((a, b) => a.mag - b.mag)) {
      const facts = [starName(star)];
      if (Number.isFinite(star.mag)) facts.push(`视星等 ${brightness(star)}`);
      if (Number.isFinite(star.distanceLy)) facts.push(`距地球${distance(star)}`);
      parts.push(facts.join('，'));
    }
    parts.push('视星等数值越小，肉眼看到的星越亮。亮度还受距离影响，不能直接比较恒星本身的发光能力。距地距离为 HYG 星表估计值。');
  } else if (panel === 'story') {
    parts.push('星空中的文化故事', `${record.name}的名字从何而来`, record.story);
    parts.push('不同文化以不同方式命名、连接星空。这里的故事帮助记忆星形，不用于解释人的性格或命运。');
  } else {
    parts.push('在天空中相邻，未必在空间中相近', '星图把恒星画在同一个视野里。把它们与地球的距离排开，就能看到图案背后的深度。');
    const stars = (record.stars || []).filter(star => Number.isFinite(star.distanceLy) && star.distanceLy > 0).sort((a, b) => a.distanceLy - b.distanceLy);
    if (stars.length) {
      for (const star of stars.slice(0, 8)) parts.push(`${starName(star)}，距地球${distance(star)}`);
      parts.push('横条按距地距离线性缩放，仅比较远近；不代表恒星之间的真实空间排列。距离为 HYG 星表估计值，测量方法不同会有差异。');
    } else parts.push('本组暂未收录可靠的距离数值。光年是光在真空中一年传播的距离，是长度单位。');
  }
  return parts.map(sentence).filter(Boolean).join('\n');
}
