import { videosFor } from './video-catalog.js';

// Empty topics stay hidden unless the caller provides an unavailable action.
export function createTopicVideoButton(key, label, className = '', {onUnavailable} = {}) {
  const available = videosFor(key).length > 0;
  if (!available && !onUnavailable) return null;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `topic-video-button ${className}`.trim();
  button.innerHTML = '<svg aria-hidden="true"><use href="#i-play"/></svg><span>看视频</span>';
  button.dataset.videoKey = key;
  button.setAttribute('aria-label', `${label} · 看视频`);
  if (available) {
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-controls', 'topic-video-dialog');
    button.setAttribute('aria-expanded', 'false');
  }
  button.addEventListener('click', () => {
    if (!videosFor(key).length) { onUnavailable?.(); return; }
    document.dispatchEvent(new CustomEvent('topic-video:open', {
      detail: { key, label, trigger: button },
    }));
  });
  return button;
}
