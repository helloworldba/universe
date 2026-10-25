// Both entries are bundled together so narration and media keep one shared state.
try {
  await import('./app.js');
  document.dispatchEvent(new Event('universe-startup-ready'));
  // Give the scene priority over the introductory video and background music.
  try { await import('./background-music-init.js'); }
  catch (error) { console.error('Media initialization failed', error); }
} catch (error) {
  document.dispatchEvent(new CustomEvent('universe-startup-error', {detail: String(error)}));
}
