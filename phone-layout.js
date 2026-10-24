// Include short touch landscapes without changing the desktop breakpoint.
export const PHONE_MEDIA = '(max-width:760px), (max-width:1000px) and (max-height:600px) and (hover:none) and (pointer:coarse)';
export function isPhoneLayout(view = globalThis) {
  return view.innerWidth <= 760 || Boolean(view.matchMedia?.('(max-width:1000px) and (max-height:600px) and (hover:none) and (pointer:coarse)').matches);
}

export function mobileSceneViewport(document, width, height) {
  const visible = node => {
    if (!node) return null;
    for (let parent = node; parent?.nodeType === 1; parent = parent.parentElement) {
      const css = document.defaultView.getComputedStyle(parent);
      if (parent.hidden || css.display === 'none' || css.visibility === 'hidden') return null;
    }
    const rect = node.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 ? rect : null;
  };
  let left = 16, right = width - 16, top = 16, bottom = height - 16;
  const bar = visible(document.querySelector('#mobile-scene-bar'));
  if (bar) bottom = Math.min(bottom, bar.top - 10);
  for (const selector of ['.site-header', '#mode-nav', '#earth-navigation', '#solar-navigation', '.object-info', '.constellation-hero', '.black-hole-hero', '.guide-topbar']) {
    const rect = visible(document.querySelector(selector));
    if (rect) top = Math.max(top, rect.bottom + 10);
  }
  for (const selector of ['.destination-dock', '#facts-panel', '#earthsense-panel', '#earth-environment-panel', '.moon-phases-panel', '.earth-sense-overview', '#trajectory-panel', '.constellation-card', '.constellation-dock', '.black-hole-card', '.black-hole-dock', '.black-hole-caption', '#guide-lesson', '.guide-chapters', '.guide-navigation']) {
    const rect = visible(document.querySelector(selector));
    if (!rect) continue;
    if (width > height && rect.left > width * .4 && rect.width < width * .65) right = Math.min(right, rect.left - 12);
    else if (rect.top >= top) bottom = Math.min(bottom, rect.top - 12);
  }
  right = Math.max(left + 96, right);
  bottom = Math.max(top + 96, bottom);
  return {left, right, top, bottom, width:right-left, height:bottom-top, cx:(left+right)/2, cy:(top+bottom)/2};
}
