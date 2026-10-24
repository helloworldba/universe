/* Shared controls for the two Earth / deep-space overview scenes. */
export function createDeepSpaceControls({onToggle=()=>{}}={}) {
  const playback=document.querySelector('.playback-controls');
  const footer=document.querySelector('.control-footer');
  const dock=document.querySelector('.destination-dock');
  const names=document.getElementById('toggle-labels');
  if(!playback||!footer||!dock||!names)throw new Error('Deep-space controls require the scene footer and destination dock.');

  const button=document.createElement('button');
  button.id='toggle-deep-space';
  button.className='deep-space-toggle';
  button.type='button';
  button.setAttribute('aria-label','深空航天器');
  button.setAttribute('aria-pressed','false');
  button.setAttribute('aria-controls','deep-space-legend');
  button.setAttribute('aria-describedby','deep-space-note');
  button.title='显示或隐藏詹姆斯·韦伯太空望远镜、南希·格蕾丝·罗曼太空望远镜、旅行者 1 号及其位置与轨迹示意';
  button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 7 7-5 5-7-7zM12 9l5-5m-2-1 6 6M7 15l-4 4m8-2 4 4m-1-9 5 5"/><circle cx="17" cy="5" r="1"/></svg><span>深空航天器</span>';
  playback.insertBefore(button,names.nextSibling);

  const legend=document.createElement('div');
  legend.id='deep-space-legend';
  legend.className='deep-space-legend';
  legend.setAttribute('role','note');
  legend.setAttribute('aria-label','深空航天器图例');
  legend.innerHTML='<div class="deep-space-legend-keys"><span class="deep-space-legend-key deep-space-legend-webb"><i aria-hidden="true"></i>詹姆斯·韦伯太空望远镜</span><span class="deep-space-legend-key deep-space-legend-roman"><i aria-hidden="true"></i>南希·格蕾丝·罗曼太空望远镜</span><span class="deep-space-legend-key deep-space-legend-voyager"><i aria-hidden="true"></i>旅行者 1 号</span></div><span id="deep-space-note" class="deep-space-legend-note">位置与轨迹为示意 · 非实时 · 非等比例</span>';
  dock.append(legend);

  let visible=false,enabled=false,disposed=false;
  function update(next={}) {
    if(disposed)return;
    visible=Boolean(next.visible);
    enabled=next.enabled===true;
    button.hidden=!visible;
    button.disabled=!visible;
    button.setAttribute('aria-pressed',String(enabled));
    legend.hidden=!visible||!enabled;
    playback.classList.toggle('deep-space-playback-controls',visible);
    footer.classList.toggle('deep-space-controls-visible',visible);
  }
  function toggle(){if(visible&&!disposed)onToggle(!enabled);}
  button.addEventListener('click',toggle);
  update({visible:false,enabled:false});
  return {
    update,
    dispose(){
      if(disposed)return;
      disposed=true;
      button.removeEventListener('click',toggle);
      button.remove();
      legend.remove();
      playback.classList.remove('deep-space-playback-controls');
      footer.classList.remove('deep-space-controls-visible');
    },
  };
}
