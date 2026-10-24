import { videosFor } from './video-catalog.js';
import { getNarrationPlayer } from './local-narration.js';

export function createTopicVideoPlayer({ music, beforeOpen = () => {}, narration = getNarrationPlayer(),
  document: doc = document, getVideos = videosFor } = {}) {
  const dialog = doc.createElement('dialog');
  dialog.id = 'topic-video-dialog';
  dialog.className = 'cinema-dialog topic-video-dialog';
  dialog.setAttribute('aria-labelledby', 'topic-video-title');
  dialog.innerHTML = `<div class="topic-video-heading">
    <h2 id="topic-video-title"></h2>
    <button type="button" class="icon-button" aria-label="关闭视频" title="关闭"><svg aria-hidden="true"><use href="#i-close"/></svg></button>
    </div><nav class="topic-video-playlist" aria-label="选择视频" hidden></nav>
    <div class="topic-video-screen"></div>
    <p class="sr-only" role="status"></p>`;
  doc.body.append(dialog);
  const title = dialog.querySelector('h2'), closeButton = dialog.querySelector('button');
  const playlist = dialog.querySelector('nav'), screen = dialog.querySelector('.topic-video-screen');
  const status = dialog.querySelector('[role="status"]'), narrationBlock = Symbol('topic-video');
  let opened = false, disposed = false, trigger = null, frame = null, backdropDown = false;
  let videos = [], label = '';

  function removeFrame() {
    if (!frame) return;
    frame.onload = frame.onerror = null;
    frame.remove(); // Destroy the browsing context, including external audio.
    frame = null;
  }
  function select(index) {
    const video = videos[index];
    if (!opened || !video) return;
    removeFrame();
    const videoTitle = video.title || `${label} · 视频 ${index + 1}`;
    title.textContent = videoTitle;
    status.textContent = '正在载入播放器。';
    playlist.querySelectorAll('button').forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    const next = doc.createElement('iframe');
    next.title = `${videoTitle} · bilibili 播放器`;
    next.allow = 'fullscreen; autoplay; encrypted-media; picture-in-picture';
    next.allowFullscreen = true;
    next.referrerPolicy = 'strict-origin-when-cross-origin';
    next.onload = () => {
      if (frame !== next || !opened) return;
      // A cross-origin load event cannot confirm that the video is playable.
      status.textContent = '点击播放器中的播放键开始观看。';
    };
    next.onerror = () => {
      if (frame === next && opened) status.textContent = '播放器未能载入，请检查网络或稍后重试。';
    };
    next.src = video.embedUrl;
    frame = next;
    screen.append(next);
  }
  function open(key, { label: nextLabel = '相关视频', trigger: nextTrigger = doc.activeElement } = {}) {
    if (disposed) return false;
    const nextVideos = getVideos(key);
    if (!nextVideos.length) return false;
    if (!opened) {
      beforeOpen();
      dialog.showModal();
      opened = true;
      music?.suspend();
      narration.setBlocked(narrationBlock, true);
    }
    trigger?.setAttribute('aria-expanded', 'false');
    trigger = nextTrigger;
    trigger?.setAttribute('aria-expanded', 'true');
    label = nextLabel;
    videos = nextVideos;
    playlist.replaceChildren(...videos.map((video, index) => {
      const button = doc.createElement('button');
      button.type = 'button';
      button.textContent = video.title || `视频 ${index + 1}`;
      button.addEventListener('click', () => select(index));
      return button;
    }));
    playlist.hidden = videos.length < 2;
    select(0);
    closeButton.focus({ preventScroll: true });
    return true;
  }
  function finishClose({ focus = true } = {}) {
    if (!opened) return;
    opened = false;
    backdropDown = false;
    removeFrame();
    videos = [];
    playlist.replaceChildren();
    if (doc.fullscreenElement && dialog.contains(doc.fullscreenElement)) doc.exitFullscreen?.().catch(() => {});
    trigger?.setAttribute('aria-expanded', 'false');
    narration.setBlocked(narrationBlock, false);
    music?.resume();
    if (focus && trigger?.isConnected && trigger.getClientRects().length) trigger.focus({ preventScroll: true });
    trigger = null;
  }
  function close(options) {
    if (dialog.open) dialog.close();
    finishClose(options);
  }
  function backdrop(event) {
    if (event.target !== dialog) return false;
    const r = dialog.getBoundingClientRect();
    return event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom;
  }
  const listeners = [
    [doc, 'topic-video:open', event => open(event.detail?.key, event.detail || {})],
    [closeButton, 'click', () => close()],
    [dialog, 'cancel', event => { event.preventDefault(); close(); }],
    [dialog, 'close', () => { if (!dialog.open) finishClose(); }],
    [dialog, 'pointerdown', event => { backdropDown = backdrop(event); }],
    [dialog, 'click', event => { const dismiss = backdropDown && backdrop(event); backdropDown = false; if (dismiss) close(); }],
  ];
  const onPageHide = () => close({ focus: false });
  doc.defaultView?.addEventListener('pagehide', onPageHide);
  for (const [node, type, handler] of listeners) node.addEventListener(type, handler);
  return { open, close, dispose() {
    if (disposed) return;
    disposed = true;
    close({ focus: false });
    for (const [node, type, handler] of listeners) node.removeEventListener(type, handler);
    doc.defaultView?.removeEventListener('pagehide', onPageHide);
    dialog.remove();
  } };
}
