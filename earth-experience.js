/* Keep the same Earth canvas, with two clearly separated sets of tools. */
const ICONS = {
  night:'<path d="M19 14.6A8 8 0 0 1 9.4 5 8 8 0 1 0 19 14.6Z"/><path d="m16 3 .5 1.5L18 5l-1.5.5L16 7l-.5-1.5L14 5l1.5-.5Z"/>',
  panorama:'<ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-25 12 12)"/><circle cx="12" cy="12" r="6"/><path d="M12 6c-3 3-3 9 0 12M12 6c3 3 3 9 0 12"/>',
  stations:'<path d="M9 10h6v4H9zM11 8h2v8h-2zM2 7h5v10H2zM17 7h5v10h-5zM7 12h2m6 0h2M2 12h5m10 0h5M4.5 7v10m15-10v10"/>',
  satellites:'<path d="m10 9 5 5-4 4-5-5zM5 3l4 4-3 3-4-4zM16 14l6 6-3 3-6-6zM15 9a5 5 0 0 1 5 5M15 5a9 9 0 0 1 9 9"/>',
  continents:'<circle cx="12" cy="12" r="9"/><path d="m6 5 2 4 4 1 1 4 3 1 2 4M4 14l4-1 2 3-1 4M14 4l-1 4 4 1 2-3"/>',
  places:'<path d="M18 9c0 4-6 10-6 10S6 13 6 9a6 6 0 1 1 12 0Z"/><circle cx="12" cy="9" r="2"/><path d="M6 20H4m16 0h-2"/>',
  environment:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  moon:'<circle cx="12" cy="12" r="9"/><path d="M12 3c5 5 5 13 0 18"/>',
  lightning:'<path d="m13 2-8 12h6l-1 8 9-13h-7z"/>',
  typhoons:'<path d="M20 9A8 8 0 0 0 6 6m-2 9a8 8 0 0 0 14 3M8 8c-3 3-1 8 3 8m5 0c3-3 1-8-3-8"/><circle cx="12" cy="12" r="2"/>',
  wind:'<path d="M3 8h12a3 3 0 1 0-3-3M2 12h17a3 3 0 1 1-3 3M4 16h5a3 3 0 1 1-3 3"/>',
  grid:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 7h14M5 17h14"/>',
  labels:'<path d="M5 5h14M12 5v14M8 19h8"/>',
  regions:'<path d="m5 7 5-3 7 2 3 6-4 7-7 1-5-6Z" stroke-dasharray="3 2"/><path d="m9 9 5-1 2 5-4 3-4-3Z"/>',
  reset:'<path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/>',
  arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]||ICONS.arrow}</svg>`;
const make = (tag,className) => {const node=document.createElement(tag);if(className)node.className=className;return node;};

export function createEarthExperienceUI({onFeature=()=>{}}={}) {
  const actions=document.getElementById('earth-actions');
  if(!actions)throw new Error('Earth actions must exist before the experience navigation.');
  const originalNodes=[...actions.children], originalMarkup=new Map(originalNodes.map(node=>[node,node.innerHTML]));
  const listeners=[];
  const listen=(node,event,callback)=>{node.addEventListener(event,callback);listeners.push(()=>node.removeEventListener(event,callback));};
  const originals=Object.fromEntries(originalNodes.filter(node=>node.id).map(node=>[node.id,node]));
  const featureButtons=new Map();
  const tile=(id,label,feature,iconName=feature)=>{
    const reused=originals[id],button=reused||make('button');button.type='button';
    if(id)button.id=id;
    button.classList.add('earth-feature-tile');button.dataset.earthFeature=feature;
    button.innerHTML=`${icon(iconName)}<span>${label}</span>`;
    button.setAttribute('aria-label',label);button.setAttribute('aria-pressed','false');
    if(!reused)listen(button,'click',()=>onFeature(feature));
    featureButtons.set(feature,button);return button;
  };
  const roam=make('div','earth-mode-features earth-roam-features');
  const sense=make('div','earth-mode-features earth-learn-features');
  roam.setAttribute('role','group');roam.setAttribute('aria-label','地球漫游功能');
  sense.setAttribute('role','group');sense.setAttribute('aria-label','感知地球功能');
  const roamGrid=make('div','earth-feature-grid'),senseGrid=make('div','earth-feature-grid');
  roamGrid.append(tile('night-view','追寻夜色','night'),tile('earth-orbit-overview','环地全景','panorama'),tile('earth-craft-view','航天器探索','spacecraft','satellites'));
  senseGrid.append(tile('open-continents','七大洲','continents'),tile('open-earthsense','地点与天气','places'),tile('open-earth-environment','昼夜与四季','environment'),tile('open-moon-phases','月相互动','moon'));
  const crosslink=make('button','earth-mode-crosslink');crosslink.type='button';crosslink.innerHTML=`<span>探索地理与自然</span>${icon('arrow')}`;listen(crosslink,'click',()=>onFeature('sense'));
  const back=make('button','earth-mode-crosslink earth-return-roam');back.type='button';back.innerHTML=`${icon('arrow')}<span>返回地球漫游</span>`;listen(back,'click',()=>onFeature('roam'));
  const natural=make('details','earth-natural-features');
  natural.innerHTML='<summary><span>自然现象</span><span class="earth-natural-chevron" aria-hidden="true">⌄</span></summary>';
  const naturalGrid=make('div','earth-natural-options');
  naturalGrid.append(tile('earth-lightning-view','闪电模拟','lightning'),tile('earth-cyclone-view','台风模拟','cyclone-demo','typhoons'),tile('earth-wind-view','风场模拟','wind'),tile('earth-storm-view','风暴事件','typhoons'));
  natural.append(naturalGrid);senseGrid.append(natural);
  listen(natural,'toggle',()=>{if(matchMedia('(max-width:760px)').matches)senseGrid.scrollLeft=natural.open?senseGrid.scrollWidth:0;});
  roam.append(roamGrid,crosslink);sense.append(senseGrid,back);actions.replaceChildren(roam,sense);actions.classList.add('earth-experience-actions');

  const overview=make('section','earth-sense-overview interface');overview.hidden=true;overview.setAttribute('aria-labelledby','earth-sense-overview-title');
  overview.innerHTML='<div class="earth-overview-heading"><span>OUR LIVING PLANET</span><h2 id="earth-sense-overview-title">感知地球</h2><p>从地点出发，理解地球的变化。</p></div><div class="earth-overview-entries"></div><p class="earth-overview-note">转动地球，选择你的探索方向。<br>天气显示查询时间；四季与月相为教学演示。</p>';
  const overviewCopy=[['continents','七大洲','跨越山海，认识不同的大陆'],['places','地点与天气','搜索地点，查看当地天气'],['environment','昼夜与四季','观察阳光、昼长与季节变化'],['moon','月相互动','换一个角度，看懂阴晴圆缺']];
  overview.querySelector('h2').tabIndex=-1;
  for(const [feature,label,description]of overviewCopy){
    const button=make('button','earth-overview-entry');button.type='button';button.dataset.earthFeature=feature;
    button.innerHTML=`<span class="earth-overview-icon">${icon(feature)}</span><span class="earth-overview-copy"><strong>${label}</strong><small>${description}</small></span><span class="earth-overview-arrow" aria-hidden="true">›</span>`;
    listen(button,'click',()=>featureButtons.get(feature)?.click());overview.querySelector('.earth-overview-entries').append(button);
  }
  const controls=make('div','earth-sense-controls interface');controls.hidden=true;controls.setAttribute('role','group');controls.setAttribute('aria-label','地理视图工具');
  const controlButtons=new Map();
  for(const [feature,label]of [['grid','经纬网'],['labels','名称'],['regions','范围示意'],['reset','重置视角']]){
    const button=make('button');button.type='button';button.innerHTML=`${icon(feature)}<span>${label}</span>`;button.dataset.earthFeature=feature;
    if(feature!=='reset')button.setAttribute('aria-pressed','false');listen(button,'click',()=>onFeature(feature));controls.append(button);controlButtons.set(feature,button);
  }
  document.body.append(overview,controls);
  let lastSection=null;
  function update({visible=false,mode='roam',section='overview',roamAction='',grid=false,labels=true,regions=true}={}){
    const isSense=mode==='sense';
    document.body.classList.toggle('earth-experience-active',visible);
    if(visible){document.body.dataset.earthExperience=mode;document.body.dataset.earthSection=section;}
    else {delete document.body.dataset.earthExperience;delete document.body.dataset.earthSection;}
    actions.hidden=!visible;roam.hidden=isSense;sense.hidden=!isSense;
    overview.hidden=!(visible&&isSense&&section==='overview');
    controls.hidden=!(visible&&isSense&&['overview','continents','places','weather'].includes(section));
    controlButtons.get('regions').hidden=!(visible&&isSense&&section==='continents');
    for(const [feature,button]of featureButtons){const selected=isSense?(feature===section||(feature==='places'&&section==='weather')):feature===roamAction;button.setAttribute('aria-pressed',String(selected));}
    if(lastSection!==section){natural.open=isSense&&['lightning','typhoons','cyclone-demo','wind'].includes(section);if(!natural.open)senseGrid.scrollLeft=0;lastSection=section;}
    controlButtons.get('grid').setAttribute('aria-pressed',String(grid));controlButtons.get('labels').setAttribute('aria-pressed',String(labels));controlButtons.get('regions').setAttribute('aria-pressed',String(regions));
    if(visible&&document.body.dataset.destination==='earth'){
      const kicker=document.getElementById('info-kicker'),description=document.getElementById('info-description');
      const kickerText=isSense?'感知地球 · 地理与自然':'地球漫游 · 太空视角';
      const copy=isSense?'从地点出发，理解地球的变化。':'从太空欣赏我们的家园。';
      if(kicker&&kicker.textContent!==kickerText)kicker.textContent=kickerText;
      if(description&&description.textContent!==copy)description.textContent=copy;
    }
  }
  return {update,dispose(){listeners.forEach(remove=>remove());overview.remove();controls.remove();for(const node of originalNodes){node.innerHTML=originalMarkup.get(node);node.classList.remove('earth-feature-tile');delete node.dataset.earthFeature;node.removeAttribute('aria-pressed');}actions.replaceChildren(...originalNodes);actions.classList.remove('earth-experience-actions');document.body.classList.remove('earth-experience-active');delete document.body.dataset.earthExperience;delete document.body.dataset.earthSection;}};
}
