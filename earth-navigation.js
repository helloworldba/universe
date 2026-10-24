/** Secondary navigation for the near-Earth scene. Scene state stays in app.js. */
export function createEarthNavigation({ onRoam = () => {}, onSense = () => {} } = {}) {
  const element = document.createElement('nav');
  element.id = 'earth-navigation';
  element.className = 'earth-navigation interface';
  element.setAttribute('aria-label', '地球探索方式');
  element.hidden = true;

  let visible = false;
  let active = 'roam';
  let disposed = false;
  const modes = [
    { id: 'roam', label: '地球漫游', select: onRoam },
    { id: 'sense', label: '感知地球', select: onSense },
  ];
  const listeners = [];
  const buttons = modes.map(mode => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.earthMode = mode.id;
    button.textContent = mode.label;
    button.setAttribute('aria-pressed', String(mode.id === active));
    const click = () => {
      if (!disposed && visible) mode.select();
    };
    button.addEventListener('click', click);
    listeners.push([button, 'click', click]);
    element.append(button);
    return button;
  });

  // Native buttons retain Tab / Enter / Space behavior. Arrow keys additionally
  // move focus; only activation changes the scene, avoiding accidental flights.
  const keydown = event => {
    if (disposed || !visible) return;
    const index = buttons.indexOf(document.activeElement);
    if (index < 0) return;
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
    else if (event.key === 'ArrowLeft') next = (index + buttons.length - 1) % buttons.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = buttons.length - 1;
    else return;
    event.preventDefault();
    buttons[next].focus();
  };
  element.addEventListener('keydown', keydown);
  listeners.push([element, 'keydown', keydown]);

  const primaryNav = document.getElementById('mode-nav');
  if (primaryNav) primaryNav.insertAdjacentElement('afterend', element);
  else document.body.append(element);

  function update(next = {}) {
    if (disposed) return;
    if (typeof next.visible === 'boolean') visible = next.visible;
    if (next.active === 'roam' || next.active === 'sense') active = next.active;
    element.hidden = !visible;
    element.dataset.active = active;
    buttons.forEach((button, index) => {
      button.setAttribute('aria-pressed', String(modes[index].id === active));
    });
    document.body.classList.toggle('earth-navigation-active', visible);
    document.body.dataset.earthNavigation = visible ? active : 'hidden';
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    visible = false;
    listeners.forEach(([target, event, listener]) => target.removeEventListener(event, listener));
    element.remove();
    document.body.classList.remove('earth-navigation-active');
    delete document.body.dataset.earthNavigation;
  }

  update();
  return { update, getStatus: () => ({ visible, active, disposed }), dispose };
}
