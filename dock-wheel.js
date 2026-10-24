// Map a normal mouse wheel to the horizontal destination strip.
export function enableDockWheel(panel, list) {
  let snapTimer = null, originalSnap = '';
  panel.addEventListener('wheel', event => {
    // Keep browser zoom and form controls native; hidden/collapsed lists do not scroll.
    if (event.ctrlKey || event.metaKey || event.target.closest('input, textarea, select, [contenteditable="true"]') || !list.clientWidth) return;
    event.stopPropagation();
    if (list.scrollWidth <= list.clientWidth + 1) return;
    // Horizontal trackpad gestures already work natively, including momentum.
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    if (!event.deltaY) return;
    event.preventDefault();
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? list.clientWidth : 1;
    // Let small wheel/trackpad deltas accumulate before snapping to a thumbnail.
    if (snapTimer === null) originalSnap = list.style.scrollSnapType;
    else clearTimeout(snapTimer);
    list.style.scrollSnapType = 'none';
    list.scrollBy({ left: event.deltaY * unit, behavior: 'instant' });
    snapTimer = setTimeout(() => {
      list.style.scrollSnapType = originalSnap;
      snapTimer = null;
    }, 180);
  }, { passive: false });
}
