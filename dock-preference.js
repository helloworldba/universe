// All bottom cards share the current page's manual choice. Phones start folded
// on each load; only the independent desktop choice survives a page reload.
const stores = new WeakMap();
const desktopKey = 'explore-universe-dock-collapsed';
const legacyDesktopKey = 'explore-universe-constellation-dock-collapsed';

export function createDockPreference({isMobile, onChange = () => {}}) {
  const owner = globalThis.document;
  let store = stores.get(owner);
  if (!store) {
    const values = {desktop: false, mobile: true};
    try {
      const saved = sessionStorage.getItem(desktopKey) ?? sessionStorage.getItem(legacyDesktopKey);
      if (saved === 'true' || saved === 'false') values.desktop = saved === 'true';
    } catch {}
    store = {values, clients: new Set()};
    stores.set(owner, store);
  }
  const layout = () => isMobile() ? 'mobile' : 'desktop';
  const client = {layout, onChange};
  store.clients.add(client);
  return {
    read: () => store.values[layout()],
    set(value) {
      const target = layout(), collapsed = Boolean(value);
      store.values[target] = collapsed;
      if (target === 'desktop') {
        try { sessionStorage.setItem(desktopKey, String(collapsed)); } catch {}
      }
      // Notify even for the same preference: a temporary mobile fold may differ.
      for (const entry of [...store.clients]) if (entry.layout() === target) entry.onChange(collapsed);
    },
    dispose: () => store.clients.delete(client)
  };
}
