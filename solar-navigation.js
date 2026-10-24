/** Solar-system navigation. Scene selection is owned by app.js. */
export function createSolarNavigation({
  onNearOrbit = () => {},
  onTrajectories = () => {},
} = {}) {
  const element = document.createElement('nav');
  element.id = 'solar-navigation';
  element.className = 'solar-navigation interface';
  element.setAttribute('aria-label', '太阳系探索方式');
  element.hidden = true;

  const quickActions = document.createElement('nav');
  quickActions.id = 'solar-quick-actions';
  quickActions.className = 'solar-quick-actions interface';
  quickActions.setAttribute('aria-label', '太阳系快捷探索');
  quickActions.hidden = true;

  let visible = false;
  let active = false;
  let target = '';
  let disposed = false;
  let layoutFrame = 0;
  const listeners = [];
  const icons = {
    trajectories: '<circle cx="5" cy="17" r="2"/><circle cx="19" cy="7" r="2"/><path d="M6.7 15.9c2.2-1.6 2.1-8.4 5.3-8.4 3.1 0 1.3 9 4.3 9 1.7 0 2.2-4.5 2.4-7.5"/>',
  };

  function makeButton(id, label, callback, parent, icon = '') {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.solarAction = id;
    button.setAttribute('aria-pressed', 'false');
    if (icon) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      svg.innerHTML = icon;
      button.append(svg);
    }
    const text = document.createElement('span');
    text.textContent = label;
    button.append(text);
    const click = () => { if (visible && !disposed) callback(); };
    button.addEventListener('click', click);
    listeners.push([button, 'click', click]);
    parent.append(button);
    return button;
  }

  const nearOrbitButton = makeButton('nearorbit', '近地轨道', onNearOrbit, element);
  const trajectoriesButton = makeButton('trajectories', '运动轨迹', onTrajectories, quickActions, icons.trajectories);

  const primaryNav = document.getElementById('mode-nav');
  if (primaryNav) primaryNav.insertAdjacentElement('afterend', element);
  else document.body.append(element);
  document.body.append(quickActions);

  // Dock position and size change with the viewport and collapsed state. Measure
  // only on those changes, never in the scene's animation loop.
  const dock = document.querySelector('.destination-dock');
  const trajectoryPanel = document.getElementById('trajectory-panel');
  function scheduleLayout() {
    if (!visible || disposed || layoutFrame) return;
    layoutFrame = window.requestAnimationFrame(() => {
      layoutFrame = 0;
      if (!visible || disposed) return;
      if (target === 'trajectories' && trajectoryPanel) {
        quickActions.style.removeProperty('--solar-actions-left');
        quickActions.style.setProperty('--solar-actions-bottom', `${window.innerHeight-trajectoryPanel.getBoundingClientRect().top+12}px`);
        return;
      }
      if (!dock) {
        quickActions.style.removeProperty('--solar-actions-left');
        quickActions.style.removeProperty('--solar-actions-bottom');
        return;
      }
      const bounds = dock.getBoundingClientRect();
      const style = window.getComputedStyle(dock);
      if (bounds.height > 0 && style.display !== 'none' && style.visibility !== 'hidden') {
        quickActions.style.setProperty('--solar-actions-left', `${bounds.left}px`);
        quickActions.style.setProperty('--solar-actions-bottom', `${Math.max(80, window.innerHeight - bounds.top + 12)}px`);
      } else {
        quickActions.style.removeProperty('--solar-actions-left');
        quickActions.style.removeProperty('--solar-actions-bottom');
      }
    });
  }
  const resizeObserver = dock && typeof window.ResizeObserver === 'function'
    ? new window.ResizeObserver(scheduleLayout) : null;
  if (resizeObserver) resizeObserver.observe(dock);
  if (resizeObserver && trajectoryPanel) resizeObserver.observe(trajectoryPanel);
  window.addEventListener('resize', scheduleLayout);

  function update(next = {}) {
    if (disposed) return;
    const wasVisible = visible;
    const previousTarget = target;
    if (typeof next.visible === 'boolean') visible = next.visible;
    if (typeof next.active === 'boolean') active = next.active;
    if (typeof next.target === 'string') target = next.target;
    element.hidden = !visible;
    quickActions.hidden = !visible;
    element.dataset.active = active ? 'nearorbit' : 'none';
    nearOrbitButton.setAttribute('aria-pressed', String(active));
    trajectoriesButton.setAttribute('aria-pressed', String(target === 'trajectories'));
    document.body.classList.toggle('solar-navigation-active', visible);
    if (!visible && layoutFrame) {
      window.cancelAnimationFrame(layoutFrame);
      layoutFrame = 0;
    }
    if (visible && (!wasVisible || previousTarget !== target)) scheduleLayout();
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    visible = false;
    if (layoutFrame) window.cancelAnimationFrame(layoutFrame);
    resizeObserver?.disconnect();
    window.removeEventListener('resize', scheduleLayout);
    listeners.forEach(([node, event, listener]) => node.removeEventListener(event, listener));
    element.remove();
    quickActions.remove();
    document.body.classList.remove('solar-navigation-active');
  }

  update();
  return { update, getElement: () => element, dispose };
}
