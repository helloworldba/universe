// A stalled image must not prevent the entire explorer from opening. Keep a
// stable fallback texture so a late successful download can update existing meshes.
export async function loadStartupTextures({names, loader, textures, configure, fallback, onProgress, onFailure, onRecovery, timeout = 25000}) {
  let completed = 0;
  await Promise.all(names.map(name => new Promise(resolve => {
    let settled = false, placeholder = null;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      onProgress(++completed, names.length);
      resolve();
    };
    const fail = () => {
      if (settled) return;
      placeholder = fallback(name);
      textures[name] = placeholder;
      onFailure(name);
      finish();
    };
    const timer = setTimeout(fail, timeout);
    try {
      loader.load(`./assets/${name}`, texture => {
        configure(texture);
        if (placeholder) {
          placeholder.image = texture.image;
          placeholder.anisotropy = texture.anisotropy;
          placeholder.needsUpdate = true;
          texture.dispose();
          onRecovery(name);
        } else {
          textures[name] = texture;
          finish();
        }
      }, undefined, fail);
    } catch { fail(); }
  })));
}
