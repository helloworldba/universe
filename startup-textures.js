// Every material keeps one texture object, including before its download starts.
// Updating that object in place also repairs scenes created while a file is slow.
export function createTextureQueue({names, loader, textures, configure, fallback, onFailure = () => {}, onRecovery = () => {}, onLoaded = () => {}, timeout = 25000, concurrency = 2}) {
  const entries = new Map(), queue = [];
  const limit = Math.max(1, Math.floor(concurrency));
  let active = 0;
  for (const name of new Set(names)) {
    const texture = fallback(name);
    configure(texture);
    textures[name] = texture;
    let resolve;
    const promise = new Promise(done => { resolve = done; });
    entries.set(name, {name, texture, promise, resolve, state:'idle', settled:false, received:false});
  }
  function pump() {
    while (active < limit && queue.length) start(queue.shift());
  }
  function start(entry) {
    active++;
    entry.state = 'loading';
    let timer;
    function finish() {
      if (entry.settled) return;
      entry.settled = true;
      clearTimeout(timer);
      active--;
      entry.resolve();
      pump();
    }
    function fail() {
      if (entry.settled) return;
      entry.state = 'failed';
      onFailure(entry.name);
      finish();
    }
    timer = setTimeout(fail, timeout);
    try {
      loader.load(`./assets/${entry.name}`, texture => {
        if (entry.received) { texture.dispose(); return; }
        configure(texture);
        const recovering = entry.state === 'failed';
        entry.received = true;
        entry.texture.image = texture.image;
        entry.texture.anisotropy = texture.anisotropy;
        entry.texture.colorSpace = texture.colorSpace;
        entry.texture.needsUpdate = true;
        texture.dispose();
        entry.state = 'ready';
        if (recovering) onRecovery(entry.name);
        onLoaded(entry.name);
        finish();
      }, undefined, fail);
    } catch { fail(); }
  }
  function load(requested, {priority = false, onProgress = () => {}} = {}) {
    const selected = [...new Set(requested)].map(name => entries.get(name)).filter(Boolean);
    const pending = [];
    for (const entry of selected) {
      if (entry.state === 'idle') {
        entry.state = 'queued';
        pending.push(entry);
      } else if (priority && entry.state === 'queued') {
        queue.splice(queue.indexOf(entry), 1);
        pending.push(entry);
      }
    }
    if (priority) queue.unshift(...pending); else queue.push(...pending);
    let completed = 0;
    const done = Promise.all(selected.map(entry => entry.promise.then(() => onProgress(++completed, selected.length))));
    pump();
    return done;
  }
  return {load};
}

export async function loadStartupTextures(options) {
  const queue = createTextureQueue(options);
  await queue.load(options.names, {onProgress:options.onProgress});
}
