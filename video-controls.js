// The small player exposes only playback, seeking, volume and fullscreen.
// Avoid browser-specific overflow menus rather than styling native shadow DOM.
export function createVideoControls({video, player, onPlay, onError = () => {}}) {
  const doc = player.ownerDocument;
  const find = id => player.querySelector('#' + id);
  const playButton = find('cinema-play'), muteButton = find('cinema-mute');
  const seek = find('cinema-seek'), volume = find('cinema-volume');
  const time = find('cinema-time'), fullscreen = find('cinema-fullscreen');
  const bar = player.querySelector('.cinema-controls'), timers = doc.defaultView || globalThis;
  const nativeControls = video.controls;
  video.controls = false;
  let disposed = false, lastVolume = video.volume || 1, hideTimer = 0, interacting = false, waiting = false, revealTap = false, keyboardFocus = false;
  const isPlaying = () => !video.paused && !video.ended && !video.error;
  function clearHideTimer() { timers.clearTimeout(hideTimer); hideTimer = 0; }
  function showControls() {
    if (disposed) return;
    clearHideTimer();
    player.classList.remove('cinema-controls-idle');
    if (isPlaying() && !interacting && !waiting) hideTimer = timers.setTimeout(() => {
      hideTimer = 0;
      if (!disposed && isPlaying() && !interacting && !waiting && !(keyboardFocus && bar.contains(doc.activeElement))) player.classList.add('cinema-controls-idle');
    }, 2500);
  }
  const format = value => {
    const seconds = Math.floor(Number.isFinite(value) ? Math.max(0, value) : 0);
    const hours = Math.floor(seconds / 3600), minutes = Math.floor(seconds / 60) % 60;
    return (hours ? `${hours}:${String(minutes).padStart(2, '0')}` : String(minutes)) + ':' + String(seconds % 60).padStart(2, '0');
  };
  function label(button, text, icon) {
    button.setAttribute('aria-label', text); button.title = text;
    button.querySelector('use')?.setAttribute('href', '#' + icon);
  }
  const isFullscreen = () => doc.fullscreenElement === player;
  function sync() {
    if (disposed) return;
    const playing = !video.paused && !video.ended;
    const muted = video.muted || video.volume === 0;
    label(playButton, playing ? '暂停视频' : '播放视频', playing ? 'i-pause' : 'i-play');
    playButton.setAttribute('aria-pressed', String(playing));
    label(muteButton, muted ? '开启视频声音' : '静音视频', muted ? 'i-muted' : 'i-sound');
    muteButton.setAttribute('aria-pressed', String(muted));
    volume.value = muted ? '0' : String(video.volume);
    volume.style.setProperty('--video-progress', `${Number(volume.value) * 100}%`);
    const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
    const current = Math.max(0, video.currentTime || 0);
    seek.disabled = !duration;
    seek.value = duration ? String(Math.round(Math.min(1, current / duration) * 1000)) : '0';
    seek.style.setProperty('--video-progress', `${Number(seek.value) / 10}%`);
    seek.setAttribute('aria-valuetext', `${format(current)} / ${format(duration)}`);
    time.textContent = `${format(current)} / ${format(duration)}`;
    label(fullscreen, isFullscreen() ? '退出视频全屏' : '视频全屏', 'i-expand');
    fullscreen.setAttribute('aria-pressed', String(isFullscreen()));
  }
  function togglePlay() {
    if (video.paused || video.ended) {
      if (video.ended) video.currentTime = 0;
      onPlay();
    } else video.pause();
    sync();
    showControls();
  }
  function toggleMute() {
    if (video.muted || video.volume === 0) {
      if (video.volume === 0) video.volume = lastVolume;
      video.muted = false;
    } else {
      lastVolume = video.volume;
      video.muted = true;
    }
    sync();
  }
  function changeVolume() {
    video.volume = Math.min(1, Math.max(0, Number(volume.value)));
    video.muted = video.volume === 0;
    if (video.volume > 0) lastVolume = video.volume;
    sync();
  }
  function changeSeek() {
    if (Number.isFinite(video.duration) && video.duration > 0) {
      video.currentTime = Math.min(video.duration, Math.max(0, Number(seek.value) / 1000 * video.duration));
    }
    sync();
  }
  async function toggleFullscreen() {
    try {
      if (isFullscreen()) await doc.exitFullscreen();
      else await player.requestFullscreen();
    } catch { if (!disposed) onError('暂时无法切换全屏，请重试。'); }
    sync();
  }
  function exitFullscreen() {
    if (isFullscreen()) Promise.resolve(doc.exitFullscreen()).catch(() => {});
  }
  function keyboard(event) {
    if (event.target !== player && event.target !== video) return;
    keyboardFocus = true;
    showControls();
    if (event.key === ' ' || event.key.toLowerCase() === 'k') { event.preventDefault(); togglePlay(); }
    else if (event.key.toLowerCase() === 'm') { event.preventDefault(); toggleMute(); }
    else if (event.key.toLowerCase() === 'f' && !fullscreen.hidden) { event.preventDefault(); toggleFullscreen(); }
    else if (['ArrowLeft', 'ArrowRight'].includes(event.key) && Number.isFinite(video.duration)) {
      event.preventDefault();
      video.currentTime = Math.min(video.duration, Math.max(0, video.currentTime + (event.key === 'ArrowLeft' ? -5 : 5)));
      sync();
    }
  }
  function pointerDown(event) {
    keyboardFocus = false;
    revealTap = event.target === video && event.pointerType === 'touch' && player.classList.contains('cinema-controls-idle');
    if (bar.contains(event.target)) interacting = true;
    showControls();
  }
  function pointerEnd() { if (interacting) { interacting = false; showControls(); } }
  function videoClick() { if (revealTap) { revealTap = false; showControls(); } else togglePlay(); }
  function playbackChanged() { waiting = false; sync(); showControls(); }
  function playbackWaiting() { waiting = true; showControls(); }
  function fullscreenChanged() { sync(); showControls(); }
  function keyboardNavigation(event) {
    if (event.key === 'Tab' || bar.contains(event.target)) { keyboardFocus = true; showControls(); }
  }
  fullscreen.hidden = typeof player.requestFullscreen !== 'function' || doc.fullscreenEnabled === false;
  const listeners = [
    [playButton, 'click', togglePlay], [video, 'click', videoClick],
    [muteButton, 'click', toggleMute], [volume, 'input', changeVolume],
    [seek, 'input', changeSeek], [fullscreen, 'click', toggleFullscreen],
    [player, 'keydown', keyboard], [doc, 'fullscreenchange', fullscreenChanged],
    [player, 'pointermove', showControls], [player, 'pointerdown', pointerDown],
    [doc, 'pointerup', pointerEnd], [doc, 'pointercancel', pointerEnd],
    [doc, 'keydown', keyboardNavigation],
    [player, 'focusin', showControls], [player, 'focusout', showControls],
    ...['play', 'playing', 'pause', 'ended', 'loadedmetadata', 'emptied', 'error'].map(type => [video, type, playbackChanged]),
    ...['waiting', 'stalled'].map(type => [video, type, playbackWaiting]),
    ...['timeupdate', 'durationchange', 'volumechange'].map(type => [video, type, sync])
  ];
  for (const [node, type, listener] of listeners) node.addEventListener(type, listener);
  sync(); showControls();
  return {
    sync, exitFullscreen,
    dispose() {
      exitFullscreen(); disposed = true; clearHideTimer();
      player.classList.remove('cinema-controls-idle');
      for (const [node, type, listener] of listeners) node.removeEventListener(type, listener);
      video.controls = nativeControls;
    }
  };
}
