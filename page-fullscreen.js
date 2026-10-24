// Keep page fullscreen separate from video fullscreen. Only a phone session
// requests portrait; desktop fullscreen and the scene's layout are unchanged.
export function createPageFullscreen({document, window, isPhone, onMessage = () => {}}) {
  const root = document.documentElement;
  const fullscreenElement = () => document.fullscreenElement || document.webkitFullscreenElement;
  const request = root.requestFullscreen || root.webkitRequestFullscreen;
  const exit = document.exitFullscreen || document.webkitExitFullscreen;
  let session = null, busy = false;

  function clearTimer(entry, name) {
    window.clearTimeout(entry[name]);
    entry[name] = null;
  }
  function releaseLock(entry) {
    const unlock = entry.unlock;
    entry.unlock = null;
    try { unlock?.(); } catch {}
  }
  function finish(entry) {
    if (!entry) return;
    for (const name of ['entryTimer', 'lockTimer', 'checkTimer', 'exitTimer']) clearTimer(entry, name);
    releaseLock(entry);
    if (session === entry) { session = null; busy = false; }
  }
  function exited(entry) {
    if (entry.leaving) onMessage('此浏览器无法保持竖屏全屏，已返回普通浏览。');
    finish(entry);
  }
  async function returnToBrowsing(entry) {
    if (session !== entry || fullscreenElement() !== root || entry.leaving) return;
    entry.leaving = true;
    releaseLock(entry);
    try {
      await exit.call(document);
      if (session !== entry) return;
      if (fullscreenElement() !== root) exited(entry);
      else entry.exitTimer = window.setTimeout(() => {
        if (session === entry && fullscreenElement() === root)
          onMessage('此浏览器无法保持竖屏，请退出全屏后继续浏览。');
      }, 1500);
    } catch {
      onMessage('此浏览器无法保持竖屏，请退出全屏后继续浏览。');
    }
  }
  function checkPortrait(entry) {
    if (session !== entry || !entry.phone || entry.lockPending || fullscreenElement() !== root) return;
    // Read the actual viewport, not just orientation.type: some WebViews report
    // portrait while their fullscreen host has already laid out a landscape.
    if (window.innerWidth > window.innerHeight) void returnToBrowsing(entry);
  }
  function scheduleCheck() {
    const entry = session;
    if (!entry?.active || !entry.phone || entry.leaving) return;
    clearTimer(entry, 'checkTimer');
    entry.checkTimer = window.setTimeout(() => checkPortrait(entry), 250);
  }
  function start(entry) {
    if (session !== entry || entry.active || fullscreenElement() !== root) return;
    entry.active = true;
    busy = false;
    clearTimer(entry, 'entryTimer');
    if (!entry.phone) return;
    const orientation = window.screen?.orientation;
    if (typeof orientation?.lock !== 'function') { scheduleCheck(); return; }
    entry.lockPending = true;
    entry.unlock = () => orientation.unlock?.();
    // A broken WebView must not leave the page waiting indefinitely for lock().
    entry.lockTimer = window.setTimeout(() => {
      if (session !== entry) return;
      entry.lockPending = false;
      releaseLock(entry);
      checkPortrait(entry);
    }, 1800);
    try {
      Promise.resolve(orientation.lock('portrait')).then(() => {
        if (session !== entry) {
          // Some WebViews resolve even after unlock() cancelled the request.
          if (!fullscreenElement()) { try { orientation.unlock?.(); } catch {} }
          return;
        }
        if (!entry.lockPending) {
          if (!entry.leaving) entry.unlock = () => orientation.unlock?.();
          return;
        }
        entry.lockPending = false;
        clearTimer(entry, 'lockTimer');
        scheduleCheck();
      }, () => lockFailed(entry));
    } catch { lockFailed(entry); }
  }
  function lockFailed(entry) {
    if (session !== entry || !entry.lockPending) return;
    entry.lockPending = false;
    entry.unlock = null;
    clearTimer(entry, 'lockTimer');
    scheduleCheck();
  }
  function fullscreenChanged() {
    if (!session) return;
    if (fullscreenElement() === root) start(session);
    else if (session.active) exited(session);
  }
  async function toggle() {
    if (busy || (session && !session.active && !session.expired)) return;
    busy = true;
    try {
      if (fullscreenElement()) {
        await exit.call(document);
        if (!fullscreenElement()) finish(session);
      } else {
        if (typeof request !== 'function' || typeof exit !== 'function') throw new Error('Fullscreen unavailable');
        finish(session);
        const entry = session = {phone: Boolean(isPhone()), active: false, lockPending: false};
        // Evaluate phone layout before native fullscreen can change its width.
        entry.entryTimer = window.setTimeout(() => {
          if (session !== entry || entry.active) return;
          // Retain the phone intent if a prefixed browser enters unusually late.
          // A new explicit attempt may replace this expired request.
          entry.expired = true;
          busy = false;
          onMessage('当前浏览器暂不支持网页全屏，已保留普通浏览。');
        }, 4000);
        await request.call(root);
        start(entry); // WebKit may instead complete via webkitfullscreenchange.
      }
    } catch {
      if (fullscreenElement() !== root) finish(session);
      onMessage('当前浏览器暂不支持网页全屏，请使用普通浏览。');
    } finally { busy = false; }
  }
  const listeners = [
    [document, 'fullscreenchange', fullscreenChanged],
    [document, 'webkitfullscreenchange', fullscreenChanged],
    [window, 'resize', scheduleCheck],
    [window, 'orientationchange', scheduleCheck],
    [window.screen?.orientation, 'change', scheduleCheck],
    [window.visualViewport, 'resize', scheduleCheck],
    [window, 'pagehide', () => finish(session)],
  ];
  for (const [target, type, handler] of listeners) target?.addEventListener?.(type, handler);
  return {
    toggle,
    dispose() {
      finish(session);
      for (const [target, type, handler] of listeners) target?.removeEventListener?.(type, handler);
    },
  };
}
