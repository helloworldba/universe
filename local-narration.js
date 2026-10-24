import { NARRATION_TRACKS } from './narration-manifest.js';

// Importing this module is side-effect free. Media is created only after a
// caller's explicit toggle; all three narration surfaces share one active run.
export function createNarrationPlayer({
  tracks = NARRATION_TRACKS,
  createAudio = () => new globalThis.Audio(),
  document: doc = globalThis.document,
  window: win = globalThis.window,
} = {}) {
  const subscribers = new Set(), blockers = new Set();
  let current = null, version = 0, disposed = false;
  if (doc?.hidden) blockers.add('document-hidden');

  const call = (callback, value) => { try { callback?.(value); } catch { /* A view callback must not interrupt media cleanup. */ } };
  function getState() {
    return { active: Boolean(current), owner: current?.owner || null, key: current?.key || null,
      status: current?.status || 'idle', blocked: blockers.size > 0 };
  }
  function publish() {
    const state = getState();
    for (const subscriber of [...subscribers]) call(subscriber, state);
  }
  function isCurrent(run) { return !disposed && current === run && run.version === version && !blockers.size; }
  function release(run) {
    const audio = run.audio;
    if (!audio) return;
    // An old play() promise can settle after cancellation. Its own, retired
    // media element stays muted and can never pause a newer element's playback.
    audio.muted = true;
    for (const [type, listener] of run.listeners) audio.removeEventListener(type, listener);
    run.listeners = [];
    try { audio.pause(); } catch { /* Already detached media may reject operations. */ }
    if (run.released) return;
    run.released = true;
    try { audio.currentTime = 0; } catch { /* Metadata may not have loaded. */ }
    try { audio.removeAttribute('src'); audio.load(); } catch { /* No active resource remains to retain. */ }
  }
  function finish(run) {
    if (current !== run) return false;
    current = null; version++;
    release(run);
    call(run.onState, 'idle');
    publish();
    return true;
  }
  function stop(owner) {
    if (!current || (owner !== undefined && current.owner !== owner)) return false;
    return finish(current);
  }
  function setStatus(run, status) {
    if (!isCurrent(run) || run.status === status) return;
    run.status = status;
    call(run.onState, status);
    publish();
  }
  function errorMessage(error, audio) {
    if (error?.name === 'NotAllowedError') return '浏览器暂未允许播放解说，请再次点击播放。';
    if (audio?.error?.code === 2) return '解说音频加载失败，请点击播放重试。';
    if (audio?.error?.code === 3) return '解说音频无法解码，请重试或换用支持 MP3 的浏览器。';
    if (audio?.error?.code === 4 || error?.name === 'NotSupportedError') return '解说音频不可用，请检查本地音频文件后重试。';
    if (error?.name === 'AbortError') return '解说播放已中断，请再次点击播放。';
    return '解说暂时无法播放，请点击播放重试，也可以继续阅读文字介绍。';
  }
  function fail(run, error) {
    if (!isCurrent(run)) { release(run); return false; }
    const message = errorMessage(error, run.audio);
    finish(run);
    call(run.onError, message);
    return false;
  }
  function decline(onState, onError, message) {
    call(onState, 'idle'); call(onError, message);
    return Promise.resolve(false);
  }
  function toggle({ owner, key, onState, onError } = {}) {
    if (disposed) return decline(onState, onError, '解说播放器已关闭，请刷新页面后重试。');
    // Some mobile WebViews omit the matching foreground lifecycle event.
    // A new explicit request rechecks visibility; video blockers stay intact.
    visibility();
    if (current?.owner === owner && current?.key === key) {
      stop(owner);
      // The caller may have replaced its callback token for this second click.
      call(onState, 'idle');
      return Promise.resolve(false);
    }
    stop();
    if (blockers.has('document-hidden') || blockers.has('page-hidden'))
      return decline(onState, onError, '请返回页面后，再点击听讲解。');
    if (blockers.size) return decline(onState, onError, '请先关闭视频，再播放讲解。');
    const track = tracks[key];
    if (!owner || !key || !track || typeof track.src !== 'string' || !track.src) {
      return decline(onState, onError, '这段解说音频暂不可用，可以继续阅读文字介绍。');
    }
    const run = { owner, key, onState, onError, version: ++version, status: 'loading', audio: null, listeners: [], released: false };
    current = run;
    try {
      const audio = run.audio = createAudio();
      audio.preload = 'none'; audio.loop = false; audio.muted = false; audio.volume = 1;
      const listen = (type, listener) => { audio.addEventListener(type, listener); run.listeners.push([type, listener]); };
      listen('playing', () => { if (isCurrent(run) && !audio.paused && !audio.error) setStatus(run, 'playing'); });
      listen('waiting', () => setStatus(run, 'loading'));
      listen('stalled', () => setStatus(run, 'loading'));
      listen('pause', () => { if (isCurrent(run) && !audio.ended && !audio.error) finish(run); });
      listen('ended', () => { if (isCurrent(run) && audio.ended) finish(run); });
      listen('error', () => { if (isCurrent(run)) fail(run); });
      call(onState, 'loading'); publish();
      if (!isCurrent(run)) { release(run); return Promise.resolve(false); }
      audio.src = track.src;
      return Promise.resolve(audio.play()).then(() => {
        if (!isCurrent(run)) { release(run); return false; }
        if (audio.error) return fail(run);
        if (audio.paused) { finish(run); return false; }
        setStatus(run, 'playing');
        return true;
      }, error => fail(run, error));
    } catch (error) { return Promise.resolve(fail(run, error)); }
  }
  function setBlocked(reason, blocked) {
    if (disposed) return;
    const key = reason || 'external';
    const changed = blocked ? !blockers.has(key) : blockers.has(key);
    if (blocked) blockers.add(key); else blockers.delete(key);
    if (blocked && stop()) return;
    if (changed) publish();
  }
  function subscribe(listener) {
    if (typeof listener !== 'function') return () => {};
    if (!disposed) subscribers.add(listener);
    call(listener, getState());
    return () => subscribers.delete(listener);
  }
  const visibility = () => {
    const hidden = Boolean(doc?.hidden);
    if (!hidden) setBlocked('page-hidden', false);
    setBlocked('document-hidden', hidden);
  };
  const pagehide = () => setBlocked('page-hidden', true);
  const pageshow = () => { setBlocked('page-hidden', false); visibility(); };
  doc?.addEventListener('visibilitychange', visibility);
  win?.addEventListener('pagehide', pagehide);
  win?.addEventListener('pageshow', pageshow);
  win?.addEventListener('focus', visibility);
  return {
    toggle, stop, setBlocked, subscribe, getState,
    dispose() {
      if (disposed) return;
      stop(); disposed = true; version++;
      doc?.removeEventListener('visibilitychange', visibility);
      win?.removeEventListener('pagehide', pagehide);
      win?.removeEventListener('pageshow', pageshow);
      win?.removeEventListener('focus', visibility);
      subscribers.clear(); blockers.clear();
    },
  };
}

let singleton;
export function getNarrationPlayer() {
  if (!singleton) singleton = createNarrationPlayer();
  return singleton;
}
