import { PHONE_MEDIA } from './phone-layout.js';
import { createFactsCard } from './facts-card.js';
import { applyPlanetThumbnail } from './planet-thumbnails.js';
import { enableDockWheel } from './dock-wheel.js';
import { createDockPreference } from './dock-preference.js?v=20261024-phone-landscape-startup';
import { createTopicVideoButton } from './topic-video-button.js';
const KINDS = {nebula:'星云',cluster:'星团',galaxy:'星系',star:'恒星',planet:'行星',satellite:'天然卫星',blackhole:'黑洞',craft:'航天器',overview:'概览',trajectory:'运动演示'};
const $ = id => document.getElementById(id);
const el = (tag, cls, text) => {const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n;};

export function createExplorerUI({catalog,goTo,getState,onEarthSense,onEarthOverview,onEarthEnvironment,onContinents,onMoonPhases,onQuality,onTrajectory,onDeploy,onResetView,toast}) {
  const all=Object.values(catalog), dock=$('destination-list');
  let current='earth', filter='all', query='', trajectoryFrame='galaxy', trajectoryLength='short', deployed=true;
  const mobileLayout=matchMedia(PHONE_MEDIA);
  const shortIntroductionLayout=matchMedia('(min-width:761px) and (min-height:501px) and (max-height:740px)');
  shortIntroductionLayout.addEventListener?.('change',()=>syncIntroduction());
  const dockPreference=createDockPreference({isMobile:()=>mobileLayout.matches,onChange:value=>{setDockCollapsed(value);setTrajectoryCollapsed(value);}});
  const mobileDialogBodies=new Map();
  function syncMobileDialogBodies(){
    for(const [id,selectors]of [['help-dialog',['.help-grid','.dialog-note']],['source-dialog',['.source-copy']]]){
      const modal=$(id);if(!modal)continue;
      let body=mobileDialogBodies.get(id);
      if(mobileLayout.matches){
        if(body?.parentElement===modal)continue;
        const sections=selectors.map(selector=>modal.querySelector(selector)).filter(Boolean);if(!sections.length)continue;
        body=body||el('div','mobile-dialog-body');modal.insertBefore(body,sections[0]);body.append(...sections);mobileDialogBodies.set(id,body);
      }else if(body?.parentElement===modal){
        for(const section of [...body.children])modal.insertBefore(section,body);
        body.remove();
      }
    }
  }
  let dockCategory='natural',dockCollapsed=dockPreference.read(),dockContextText='';
  const navButton=el('button','', '星系图鉴');navButton.type='button';navButton.dataset.mode='atlas';navButton.setAttribute('aria-pressed','false');$('mode-nav').append(navButton);
  const breadcrumb=el('nav','cosmic-breadcrumb');breadcrumb.setAttribute('aria-label','当前位置与返回路径');document.querySelector('.explorer').prepend(breadcrumb);
  const actions=el('div','object-navigation');document.querySelector('.object-info').append(actions);
  const factsCard=createFactsCard({catalog,toast});
  const dockHeading=document.querySelector('.dock-heading>span');dockHeading.replaceChildren();
  const libraryButton=el('button','catalog-entry','全部图鉴 ↗');libraryButton.type='button';dockHeading.append(libraryButton);
  const dockContext=el('span','dock-context');dockHeading.append(dockContext);
  const dockPanel=document.querySelector('.destination-dock'),heading=dockPanel.querySelector('.dock-heading');
  dockPanel.setAttribute('aria-label','探索目的地');
  enableDockWheel(dockPanel,dock);
  const dockTabs=el('div','dock-tabs');dockTabs.setAttribute('role','group');dockTabs.setAttribute('aria-label','目的地分类');
  const categoryNames={natural:'天体',nebula:'星云 / 星团',craft:'航天器',demo:'运动演示'},categoryButtons=new Map();
  for(const [category,name] of Object.entries(categoryNames)){
    const b=el('button','',name),count=el('span','dock-category-count');b.type='button';b.dataset.category=category;
    b.setAttribute('aria-controls','destination-list');b.append(count);b.addEventListener('click',()=>{dockCategory=category;renderDock();});
    categoryButtons.set(category,{button:b,count});dockTabs.append(b);
  }
  heading.append(dockTabs);
  const dockTools=el('div','dock-tools');heading.append(dockTools);
  const searchLabel=heading.querySelector('.destination-search');dockTools.append(searchLabel);
  const dockScroll=el('span','dock-scroll-controls');dockScroll.setAttribute('role','group');dockScroll.setAttribute('aria-label','浏览更多目的地');
  const previous=el('button','','‹'),next=el('button','','›');
  previous.type=next.type='button';previous.setAttribute('aria-label','向前浏览目的地');next.setAttribute('aria-label','向后浏览目的地');
  dockScroll.append(previous,next);dockTools.append(dockScroll);
  const collapseButton=el('button','dock-collapse');collapseButton.type='button';collapseButton.id='dock-collapse';collapseButton.setAttribute('aria-controls','destination-list');dockTools.append(collapseButton);
  function setDockCollapsed(collapsed,{persist=false}={}){
    dockCollapsed=Boolean(collapsed);
    if(persist)dockPreference.set(dockCollapsed);
    syncDockCollapsed();
  }
  function announceMobilePanel(panel){if(mobileLayout.matches)document.dispatchEvent(new CustomEvent('mobile-open-panel',{detail:{panel}}));}
  collapseButton.addEventListener('click',()=>{
    setDockCollapsed(!dockCollapsed,{persist:true});
    if(!dockCollapsed)announceMobilePanel('dock');
  });
  // Panel coordination is temporary; opening a reading panel must not overwrite
  // the user's separate phone and desktop preferences.
  document.addEventListener?.('mobile-open-panel',event=>{
    if(!mobileLayout.matches||!event.detail?.panel)return;
    if(event.detail.panel!=='dock')setDockCollapsed(true);
    if(event.detail.panel!=='trajectory')setTrajectoryCollapsed(true);
  });
  mobileLayout.addEventListener?.('change',()=>{
    syncMobileDialogBodies();
    syncIntroduction();
    setDockCollapsed(dockPreference.read());
    setTrajectoryCollapsed(dockPreference.read());
    if(mobileLayout.matches&&!dockCollapsed)announceMobilePanel(current==='trajectories'&&!getState().guide?'trajectory':'dock');
  });
  function syncDockCollapsed(){
    dockPanel.classList.toggle('dock-collapsed',dockCollapsed);dockPanel.dataset.collapsed=String(dockCollapsed);
    collapseButton.textContent=dockCollapsed?'展开':'收起';collapseButton.setAttribute('aria-expanded',String(!dockCollapsed));
    collapseButton.setAttribute('aria-label',dockCollapsed?'展开目的地窗口':'收起目的地窗口');
    dock.hidden=dockTabs.hidden=searchLabel.hidden=dockCollapsed;
    dockContext.textContent=dockCollapsed?`当前：${catalog[current]?.name||'宇宙探索'}`:dockContextText;
    updateDockScroll();requestAnimationFrame(revealDockSelection);
  }
  function revealDockSelection(){
    if(dockCollapsed||!dock.clientWidth)return;
    const selected=dock.querySelector('button.active');
    if(selected){const bounds=dock.getBoundingClientRect(),item=selected.getBoundingClientRect();if(item.left<bounds.left||item.right>bounds.right)dock.scrollLeft+=item.left-bounds.left-(bounds.width-item.width)/2;}
    updateDockScroll();
  }
  function updateDockScroll(){const overflow=!dockCollapsed&&dock.scrollWidth>dock.clientWidth+2;dockScroll.hidden=!overflow;previous.disabled=dock.scrollLeft<2;next.disabled=dock.scrollLeft>=dock.scrollWidth-dock.clientWidth-2;}
  function scrollDock(direction){dock.scrollBy({left:direction*Math.max(150,dock.clientWidth*.7),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}
  previous.addEventListener('click',()=>scrollDock(-1));next.addEventListener('click',()=>scrollDock(1));dock.addEventListener('scroll',updateDockScroll,{passive:true});
  new ResizeObserver(updateDockScroll).observe(dock);
  $('destination-search').placeholder='搜索天体 / 航天器';$('destination-search').setAttribute('aria-label','搜索天体或航天器');
  const earthSenseButton=el('button','','感知地球');earthSenseButton.type='button';earthSenseButton.id='open-earthsense';$('earth-actions').append(earthSenseButton);earthSenseButton.addEventListener('click',onEarthSense);
  const orbitOverview=el('button','','环地全景');orbitOverview.type='button';orbitOverview.id='earth-orbit-overview';$('earth-actions').insertBefore(orbitOverview,earthSenseButton);orbitOverview.addEventListener('click',onEarthOverview);
  if(onEarthEnvironment){const environmentButton=el('button');environmentButton.type='button';environmentButton.id='open-earth-environment';environmentButton.innerHTML='<svg aria-hidden="true"><use href="#i-sun"/></svg><span>昼夜与四季</span>';environmentButton.addEventListener('click',onEarthEnvironment);$('earth-actions').insertBefore(environmentButton,earthSenseButton);}
  if(onMoonPhases){const lunarButton=el('button','','月相互动');lunarButton.type='button';lunarButton.id='open-moon-phases';lunarButton.addEventListener('click',onMoonPhases);$('earth-actions').append(lunarButton);}
  if(onContinents){const continentsButton=el('button','','七大洲 · 从地理开始探索');continentsButton.type='button';continentsButton.id='open-continents';continentsButton.addEventListener('click',onContinents);$('earth-actions').prepend(continentsButton);}
  const quality=el('select','quality-select');quality.setAttribute('aria-label','渲染画质');quality.title='渲染画质';
  [['auto','自适应画质'],['high','精细画质'],['low','流畅画质']].forEach(([value,text])=>{const o=el('option','',text);o.value=value;quality.append(o);});
  document.querySelector('.footer-actions').prepend(quality);quality.addEventListener('change',()=>onQuality(quality.value));
  const special=el('div','special-controls');document.querySelector('.object-info').append(special);
  const trajectoryPanel=el('section','trajectory-panel interface');trajectoryPanel.id='trajectory-panel';trajectoryPanel.setAttribute('aria-label','太阳系运动轨迹控制');trajectoryPanel.hidden=true;document.body.append(trajectoryPanel);
  const trajectoryHeading=el('div','trajectory-panel-heading mobile-sheet-heading');
  const trajectoryCaption=el('div','trajectory-panel-caption'),trajectorySummary=el('span','trajectory-panel-summary');
  trajectoryCaption.append(el('strong','','运动轨迹'),trajectorySummary);
  const trajectoryToggle=el('button','trajectory-panel-toggle mobile-sheet-close');trajectoryToggle.type='button';trajectoryToggle.id='trajectory-panel-toggle';trajectoryToggle.setAttribute('aria-controls','trajectory-panel-content');
  const trajectoryContent=el('div','trajectory-panel-content');trajectoryContent.id='trajectory-panel-content';
  trajectoryHeading.append(trajectoryCaption,trajectoryToggle);trajectoryPanel.append(trajectoryHeading,trajectoryContent);
  let trajectoryCollapsed=dockPreference.read();
  function setTrajectoryCollapsed(value,{persist=false}={}){
    trajectoryCollapsed=Boolean(value);
    if(persist)dockPreference.set(trajectoryCollapsed);
    trajectoryPanel.classList.toggle('trajectory-panel-collapsed',trajectoryCollapsed);
    trajectoryContent.hidden=trajectoryCollapsed;
    trajectoryToggle.textContent=trajectoryCollapsed?'展开':'收起';
    trajectoryToggle.setAttribute('aria-expanded',String(!trajectoryCollapsed));
    trajectoryToggle.setAttribute('aria-label',trajectoryCollapsed?'展开运动轨迹控制卡片':'收起运动轨迹控制卡片');
  }
  function syncTrajectorySummary(){
    trajectorySummary.textContent=`${trajectoryFrame==='galaxy'?'银河参照':'太阳参照'} · ${trajectoryLength==='long'?'长轨迹':'短轨迹'}`;
  }
  trajectoryToggle.addEventListener('click',()=>{
    setTrajectoryCollapsed(!trajectoryCollapsed,{persist:true});
    if(!trajectoryCollapsed)announceMobilePanel('trajectory');
  });
  setTrajectoryCollapsed(trajectoryCollapsed);syncTrajectorySummary();
  let deployStatus=null,deployMeter=null,voyagerStatus=null,voyagerRetry=null,hubbleStatus=null,hubbleRetry=null,romanStatus=null,romanRetry=null;
  const dialog=el('dialog','catalog-dialog');dialog.id='catalog-dialog';dialog.setAttribute('aria-labelledby','catalog-title');
  dialog.innerHTML='<div class="catalog-top"><div><p class="dialog-eyebrow">AN ATLAS OF CURIOSITY</p><h2 id="catalog-title">你的宇宙目的地</h2><p class="catalog-intro">从一颗行星，到更远的星系。</p></div><button class="catalog-close" type="button" aria-label="关闭天体图鉴">×</button></div><div class="catalog-toolbar"><label><span class="sr-only">搜索图鉴</span><input type="search" id="catalog-search" placeholder="搜索中文、英文或编号" autocomplete="off"></label><span id="catalog-count" role="status"></span></div><nav class="catalog-filters" aria-label="按天体类型筛选"></nav><div class="catalog-grid"></div><p class="catalog-footnote">天体尺度、位置与运动经过压缩；外观为艺术示意。虚构目标会单独标注。</p>';
  document.body.append(dialog);
  syncMobileDialogBodies();
  const headerLibraryButton=$('open-catalog');
  let libraryOpener=libraryButton;
  const close=()=>{
    dialog.close();
    const opener=libraryOpener?.getClientRects().length?libraryOpener:$('mobile-tools-toggle')||libraryButton;
    opener.focus({preventScroll:true});
  };
  dialog.querySelector('.catalog-close').addEventListener('click',close);
  function openLibrary(category){
    libraryOpener=document.activeElement;
    if(typeof category==='string'){filter=category;query='';$('catalog-search').value='';}
    renderLibrary();announceMobilePanel('catalog');dialog.showModal();
    headerLibraryButton.setAttribute('aria-expanded','true');
    (mobileLayout.matches?dialog.querySelector('.catalog-close'):$('catalog-search')).focus({preventScroll:true});
  }
  libraryButton.addEventListener('click',openLibrary);
  headerLibraryButton.addEventListener('click',()=>openLibrary('all'));
  dialog.addEventListener('close',()=>headerLibraryButton.setAttribute('aria-expanded','false'));
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});
  const filters=dialog.querySelector('.catalog-filters');
  [['all','全部'],['galaxy','星系'],['nebula','星云 / 星团'],['star','恒星'],['planet','行星 / 卫星'],['blackhole','黑洞'],['craft','航天器'],['trajectory','运动演示']].forEach(([id,name])=>{
    const b=el('button','',name);b.type='button';b.dataset.filter=id;b.addEventListener('click',()=>{filter=id;renderLibrary();});filters.append(b);
  });
  $('catalog-search').addEventListener('input',()=>{query=$('catalog-search').value;renderLibrary();});
  function matches(d,q){return `${d.name} ${d.en||''} ${d.id} ${d.aliases?.join(' ')||''}`.toLowerCase().replace(/[\s-]/g,'').includes(q.toLowerCase().replace(/[\s-]/g,''));}
  const officialCraftThumbs={jwst:{file:'jwst-nasa.png',width:1654,height:1735},voyager:{file:'voyager-nasa.png',width:1700,height:1233},hubble:{file:'hubble-nasa.jpg',width:2022,height:1518},roman:{file:'roman-nasa.png',width:512,height:288}};
  function thumbnail(d){const n=el('span',`planet-thumb destination-icon kind-${d.kind} ${d.id in localThumbs?'planet-'+d.id:''}`);n.style.setProperty('--object-color',d.color||'#bce7fa');if(d.shape)n.dataset.shape=d.shape;if(d.kind==='nebula'||d.kind==='cluster'){n.style.backgroundImage=`url(./assets/nebula-thumbnails/${d.shape}.svg)`;n.classList.add('nebula-thumbnail');}if(!applyPlanetThumbnail(n,d.id)&&craftThumbs.has(d.id)){n.classList.add('craft-thumbnail');const img=el('img');const official=officialCraftThumbs[d.id];if(official)n.classList.add('official-craft-thumbnail');if(d.id==='voyager')n.classList.add('voyager-thumbnail');img.src=`./assets/craft-thumbnails/${official?.file||d.id+'.svg'}`;img.alt='';img.width=official?.width||64;img.height=official?.height||48;img.decoding='async';img.draggable=false;n.append(img);}n.setAttribute('aria-hidden','true');return n;}
  const localThumbs=Object.fromEntries(['sun','mercury','venus','earth','moon','mars','jupiter','saturn','uranus','neptune'].map(x=>[x,true]));
  const craftThumbs=new Set(['iss','tiangong','hubble','earth-observer','navigation-sat','comms-sat','weather-sat','polar-sat','jwst','voyager','roman']);
  function makeDestination(d,card=false){
    const b=el('button',card?'catalog-card':'');b.type='button';b.dataset.target=d.id;b.setAttribute('aria-label',`前往${d.name}`);b.setAttribute('aria-pressed',String(current===d.id));b.classList.toggle('active',current===d.id);b.append(thumbnail(d));
    const copy=el('span',card?'catalog-card-copy':'');copy.append(el('span','destination-name',d.name));
    if(card){const context=catalog[d.parent]?.kind==='nebula'?catalog[d.parent].name:catalog[d.parentGalaxy]?.name||d.hostGalaxyName||catalog[d.parent]?.name||'宇宙图鉴';copy.append(el('small','',`${KINDS[d.kind]||'目的地'} · ${context}`));if(d.modelStatus?.includes('虚构'))copy.append(el('em','fiction-badge','虚构示意'));}
    b.append(copy);b.addEventListener('click',()=>{if(dialog.open)dialog.close();$('destination-search').value='';if(mobileLayout.matches)setDockCollapsed(true);goTo(d.id);});return b;
  }
  function dockScope(){
    const state=getState(),d=catalog[current];
    const allowCraft=!state.solarNearOrbit&&state.mode!=='solar'&&(d?.kind==='craft'||(state.mode==='earth'&&['earth','moon'].includes(current)));
    let label;
    if(state.solarNearOrbit)label='太阳系与近地空间';
    else if(state.mode==='solar'||current==='solar')label='太阳系探索';
    else if(allowCraft)label='地球与航天器';
    else if(current==='atlas')label='星系图鉴';
    else{
      const galaxy=d?.kind==='galaxy'?d:catalog[d?.parentGalaxy];
      label=galaxy?`${galaxy.name}探索`:'天体探索';
    }
    return {allowCraft,label};
  }
  function contextItems(allowCraft){
    const d=catalog[current],q=$('destination-search').value.trim();
    // Apply the page's scope before searching or limiting the related objects.
    const available=all.filter(x=>(current!=='galaxy'||categoryOf(x)!=='nebula')&&(['natural','nebula'].includes(categoryOf(x))||(allowCraft&&x.kind==='craft')));
    if(q)return available.filter(x=>matches(x,q));
    if(getState().solarNearOrbit)return ['sun','mercury','venus','earth','moon','mars','jupiter','saturn','uranus','neptune'].map(id=>catalog[id]).filter(Boolean);
    if(getState().mode==='solar')return [catalog.solar,...['sun','mercury','venus','earth','moon','mars','jupiter','saturn','uranus','neptune'].map(id=>catalog[id])].filter(Boolean);
    if(allowCraft)return [catalog.earth,catalog.moon,...available.filter(x=>x.kind==='craft')];
    if(current==='atlas')return available.filter(x=>x.kind==='galaxy'||categoryOf(x)==='nebula');
    if(categoryOf(d)==='nebula')return available.filter(x=>categoryOf(x)==='nebula');
    if(d?.kind==='galaxy')return [d,...available.filter(x=>x.parentGalaxy===current&&x.kind!=='galaxy'),...(current==='galaxy'?[catalog.solar]:[])].filter(Boolean);
    if(d?.parentGalaxy&& !['solar','earth'].includes(d.parent)){
      const system=d.kind==='planet'?d.parent:d.id;
      const family=available.filter(x=>x.id===system||x.parent===system);
      return family.length>1?family:[d,...available.filter(x=>x.parentGalaxy===d.parentGalaxy&&x.id!==d.id)].slice(0,30);
    }
    return ['sun','mercury','venus','earth','moon','mars','jupiter','saturn','uranus','neptune'].map(id=>catalog[id]).filter(Boolean);
  }
  function categoryOf(d){if(d?.kind==='nebula'||d?.kind==='cluster')return 'nebula';return d?.kind==='craft'?'craft':d?.kind==='trajectory'?'demo':'natural';}
  function openCraftList(){
    if(!dockScope().allowCraft)return;
    $('destination-search').value='';dockCategory='craft';renderDock();
    setDockCollapsed(false,{persist:true});announceMobilePanel('dock');
    dock.querySelector('button')?.focus({preventScroll:true});
  }
  function renderDock({chooseMatchingCategory=false}={}){
    const scope=dockScope(),naturalOnly=!scope.allowCraft;
    const available=[...new Map(contextItems(scope.allowCraft).map(d=>[d.id,d])).values()],groups={natural:[],nebula:[],craft:[],demo:[]};available.forEach(d=>groups[categoryOf(d)].push(d));
    if(naturalOnly&&!['natural','nebula'].includes(dockCategory))dockCategory='natural';
    if(!groups[dockCategory].length&&(!$("destination-search").value.trim()||chooseMatchingCategory))dockCategory=Object.keys(groups).find(key=>groups[key].length)||'natural';
    for(const [category,{button,count}]of categoryButtons){
      const length=groups[category].length;count.textContent=String(length);button.disabled=!length;
      button.hidden=(naturalOnly&&!['natural','nebula'].includes(category))||category==='demo'||(category==='nebula'&&!length)||(category==='natural'&&!length&&groups.nebula.length>0);button.setAttribute('aria-pressed',String(category===dockCategory));
      button.setAttribute('aria-label',`${categoryNames[category]}，${length} 项`);
    }
    $('destination-search').placeholder=naturalOnly?'搜索天体':'搜索天体 / 航天器';$('destination-search').setAttribute('aria-label',naturalOnly?'搜索天体':'搜索天体或航天器');
    const items=groups[dockCategory];dock.replaceChildren(...items.map(d=>makeDestination(d)));dock.scrollLeft=0;
    dock.setAttribute('aria-label',`${categoryNames[dockCategory]}目的地`);dock.dataset.category=dockCategory;
    if(!items.length)dock.append(el('p','search-empty','没有匹配的结果，试试其它名称或编号。'));
    dockContextText=scope.label+($('destination-search').value.trim()?` · 找到 ${available.length} 项`:'');
    syncDockCollapsed();
  }
  $('destination-search').addEventListener('input',()=>renderDock({chooseMatchingCategory:true}));
  function renderLibrary(){
    const items=all.filter(d=>(filter==='all'||d.kind===filter||(filter==='nebula'&&d.kind==='cluster')||(filter==='planet'&&d.kind==='satellite'))&&matches(d,query));
    filters.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===filter)));
    dialog.querySelector('.catalog-grid').replaceChildren(...items.map(d=>makeDestination(d,true)));
    dialog.querySelector('.catalog-grid').scrollTop=0;
    if(!items.length)dialog.querySelector('.catalog-grid').append(el('p','search-empty','没有找到，试试其它名称或编号。'));
    $('catalog-count').textContent=`${items.length} 个目的地`;
  }
  function button(text,callback){const b=el('button','',text);b.type='button';b.addEventListener('click',callback);return b;}
  function syncIntroduction(){
    const introduction=$('object-introduction');
    const state=getState(),kind=catalog[current]?.kind;
    const fixedIntroduction=state.mode==='deep'&&['star','planet','blackhole'].includes(kind);
    document.body.classList.toggle('fixed-object-intro',fixedIntroduction&&!state.guide);
    const solarIntroduction=state.mode==='solar'&&!state.solarNearOrbit&&(kind==='planet'||kind==='satellite'||current==='sun')&&shortIntroductionLayout.matches;
    if(introduction)introduction.tabIndex=(fixedIntroduction||kind==='craft'||kind==='nebula'||kind==='cluster'||solarIntroduction)&&!state.guide&&!mobileLayout.matches?0:-1;
  }
  function render(id){
    const d=catalog[id];if(!d)return;
    if(current!==id){const introduction=$('object-introduction');if(introduction)introduction.scrollTop=0;}
    if(current!==id){dockCategory=categoryOf(d);if(d.kind==='craft')$('destination-search').value='';}current=id;
    syncIntroduction();
    trajectoryPanel.hidden=id!=='trajectories'||getState().guide;
    (getState().guide?$('guide-lesson-content'):id==='trajectories'?trajectoryContent:document.querySelector('.object-info')).append(special);
    const hierarchy=[];let cursor=d;const seen=new Set();
    while(cursor&&!seen.has(cursor.id)){hierarchy.unshift(cursor);seen.add(cursor.id);cursor=catalog[cursor.parent];}
    const craftExperience=d.kind==='craft'&&!getState().guide;
    if(craftExperience)hierarchy.splice(0,hierarchy.length,{id:'earth',name:'地球漫游'},d);
    breadcrumb.replaceChildren();hierarchy.slice(-4).forEach((item,i,arr)=>{if(i)breadcrumb.append(el('span','','/'));if(i===arr.length-1){const s=el('span','current-crumb',item.name);s.setAttribute('aria-current','location');breadcrumb.append(s);}else breadcrumb.append(button(item.name,()=>goTo(item.id,craftExperience?{mode:'earth'}:undefined)));});
    actions.replaceChildren();actions.hidden=id==='solar'||id==='galaxy';
    actions.classList.toggle('has-mobile-shortcut',id==='galaxy'||id==='sagittarius-a');
    const returnTarget=id==='pillars-of-creation'?'galaxy':getState().mode==='solar'&&id==='moon'?'solar':d.parent;
    if(craftExperience)actions.append(button('← 地球漫游',()=>goTo('earth',{mode:'earth'})));else if(!actions.hidden&&returnTarget&&catalog[returnTarget])actions.append(button(`← ${catalog[returnTarget].name}`,()=>goTo(returnTarget)));
    if(getState().solarNearOrbit&&id==='earth'){actions.append(button('追寻夜色',()=>$('night-view').click()),button('探访空间站',()=>goTo('iss')),button('环地全景',onEarthOverview));}
    if(d.nearEarth||craftExperience){actions.append(button('环地全景 ↗',onEarthOverview));const neighbors=all.filter(x=>craftExperience?x.kind==='craft':x.nearEarth),next=neighbors[(neighbors.findIndex(x=>x.id===id)+1)%neighbors.length];actions.append(button('下一航天器 →',()=>goTo(next.id)));}
    if(d.kind==='galaxy'&&!actions.hidden)actions.append(button('打开星系图鉴 ↗',()=>goTo('atlas')));
    const videoButton=createTopicVideoButton(`object/${id}`,d.name);
    if(videoButton){if(id==='sagittarius-a')videoButton.classList.add('mobile-scene-shortcut');actions.hidden=false;actions.append(videoButton);}
    if(id==='galaxy'){const shortcut=button('人马座A*',()=>goTo('sagittarius-a'));shortcut.classList.add('mobile-scene-shortcut');actions.hidden=false;actions.append(shortcut);}
    factsCard.render(id);if(getState().guide)factsCard.stopNarration();
    special.replaceChildren();special.hidden=true;deployStatus=deployMeter=voyagerStatus=voyagerRetry=hubbleStatus=hubbleRetry=romanStatus=romanRetry=null;
    if(id==='jwst'){
      special.hidden=false;const b=button(deployed?'收拢望远镜':'展开望远镜',()=>{deployed=!deployed;onDeploy(deployed?1:0);b.textContent=deployed?'收拢望远镜':'展开望远镜';b.setAttribute('aria-pressed',String(deployed));});b.id='jwst-deploy';b.setAttribute('aria-pressed',String(deployed));
      deployStatus=el('p','deployment-status');deployStatus.id='deployment-status';deployMeter=el('progress','deployment-progress');deployMeter.max=1;deployMeter.value=deployed?1:0;deployMeter.setAttribute('aria-label','詹姆斯·韦伯太空望远镜展开进度');special.append(b,deployStatus,deployMeter,el('p','','遮阳板 → 光学塔 → 副镜 → 主镜侧翼。可中途反向；演示用时约 8 秒，非真实部署时长。'));
    }
    if(id==='voyager'){
      special.hidden=false;
      voyagerStatus=el('p','voyager-model-status','正在载入官方模型…');voyagerStatus.id='voyager-model-status';voyagerStatus.setAttribute('role','status');
      const source=el('span','science-source','NASA · 三维模型来源');
      voyagerRetry=button('重新加载模型',()=>goTo('voyager'));voyagerRetry.id='voyager-model-retry';voyagerRetry.hidden=true;
      special.append(voyagerStatus,source,voyagerRetry);
    }
    if(id==='hubble'){
      special.hidden=false;
      hubbleStatus=el('p','hubble-model-status','正在载入官方模型…');hubbleStatus.id='hubble-model-status';hubbleStatus.setAttribute('role','status');
      const source=el('span','science-source','NASA · 三维模型来源');
      hubbleRetry=button('重新加载模型',()=>goTo('hubble'));hubbleRetry.id='hubble-model-retry';hubbleRetry.hidden=true;
      special.append(hubbleStatus,source,hubbleRetry);
    }
    if(id==='roman'){
      special.hidden=false;
      romanStatus=el('p','roman-model-status','正在载入官方模型…');romanStatus.id='roman-model-status';romanStatus.setAttribute('role','status');
      const source=el('span','science-source','NASA 戈达德太空飞行中心 · 官方三维模型');
      romanRetry=button('重新加载模型',()=>goTo('roman'));romanRetry.id='roman-model-retry';romanRetry.hidden=true;
      special.append(romanStatus,source,romanRetry);
    }
    if(id==='trajectories'){
      special.hidden=false;
      for(const [key,choices,value] of [['frame',[['galaxy','银河参照'],['sun','太阳参照']],trajectoryFrame],['length',[['short','短轨迹'],['long','长轨迹']],trajectoryLength]]){
        const group=el('div','segmented-control');group.setAttribute('role','group');group.setAttribute('aria-label',key==='frame'?'轨迹参照系':'轨迹长度');
        choices.forEach(([v,text])=>{const b=button(text,()=>{if(key==='frame')trajectoryFrame=v;else trajectoryLength=v;onTrajectory({frame:trajectoryFrame,length:trajectoryLength});syncTrajectorySummary();group.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});b.setAttribute('aria-pressed',String(value===v));group.append(b);});special.append(group);
      }
      const links=el('div','trajectory-view-actions');links.append(button('重置视角',()=>onResetView?.()),button('返回太阳系 ↗',()=>goTo('solar')));special.append(links);
      const legend=el('div','trajectory-legend');legend.setAttribute('aria-label','行星轨迹颜色');
      for(const [id,color] of [['mercury','#b5aaa1'],['venus','#dcc490'],['earth','#7cc8ff'],['mars','#e8a080'],['jupiter','#dcbfa4'],['saturn','#e2cfa1'],['uranus','#9fd8d9'],['neptune','#759bff']]){const item=el('span','',catalog[id].name);item.style.setProperty('--trail-color',color);legend.append(item);}special.append(legend);
      special.append(el('p','trajectory-note','公转与太阳前进运动叠加 · 轨迹、时间与距离均为教学示意。'));
    }
    document.body.classList.toggle('long-target-name',d.name.length>3);
    const state=getState(),nearEarthScene=state.mode==='earth'&&(id==='earth'||id==='moon'||Boolean(d.nearEarth));
    document.body.classList.toggle('near-earth-scene',nearEarthScene);
    // Share introduction typography across all spacecraft without changing their scene layout.
    document.body.classList.toggle('compact-object-intro',!state.solarNearOrbit&&(nearEarthScene||d.kind==='craft'));
    syncTrajectorySummary();
    document.body.dataset.sceneKind=d.kind;document.body.dataset.destination=id;renderDock();
  }
  function visibleRect(node){
    if(!node||node.hidden||document.body.classList.contains('ui-hidden')||document.body.classList.contains('clean-view'))return null;
    for(let parent=node;parent&&parent!==document.body;parent=parent.parentElement){const style=getComputedStyle(parent);if(parent.hidden||style.display==='none'||style.visibility==='hidden'||Number(style.opacity)===0)return null;}
    const r=node.getBoundingClientRect();return r.width>0&&r.height>0&&r.right>0&&r.bottom>0&&r.left<innerWidth&&r.top<innerHeight?r:null;
  }
  function getLayoutBounds(){return Object.fromEntries(Object.entries({left:'.object-info',right:'.facts-panel',dock:'.destination-dock',breadcrumb:'.cosmic-breadcrumb',sense:'.earthsense-panel',environment:'.earth-environment-panel',moon:'.moon-phases-panel',tools:'.view-tools',overview:'.earth-sense-overview',geographyTools:'.earth-sense-controls'}).map(([key,selector])=>{const r=visibleRect(document.querySelector(selector));return [key,r?{x:r.x,y:r.y,left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}:null];}));}
  function updateAnimationStatus(status){
    if(current==='roman'&&romanStatus&&status?.romanModel){
      const state=status.romanModel.state;
      const text=state==='ready'?'NASA 官方三维模型 · 拖动旋转':state==='error'?'官方模型加载失败，请点击重新加载。':'正在载入官方模型…';
      if(romanStatus.textContent!==text)romanStatus.textContent=text;
      romanRetry.hidden=state!=='error';
    }
    if(current==='hubble'&&hubbleStatus&&status?.hubbleModel){
      const state=status.hubbleModel.state;
      const text=state==='ready'?'NASA 官方三维模型 · 拖动旋转':state==='error'?'官方模型暂未加载，当前显示简化预览。':'正在载入官方模型…';
      if(hubbleStatus.textContent!==text)hubbleStatus.textContent=text;
      hubbleRetry.hidden=state!=='error';
    }
    if(current==='voyager'&&voyagerStatus&&status?.voyagerModel){
      const state=status.voyagerModel.state;
      const text=state==='ready'?'NASA 官方三维模型 · 拖动旋转':state==='error'?'官方模型暂未加载，当前显示简化预览。':'正在载入官方模型…';
      if(voyagerStatus.textContent!==text)voyagerStatus.textContent=text;
      voyagerRetry.hidden=state!=='error';
    }
    if(current!=='jwst'||!deployStatus||!status?.deployment)return;const d=status.deployment;deployMeter.value=d.progress;const stages={sunshield:'遮阳板',tower:'光学塔','secondary-mirror':'副镜','primary-mirror-wings':'主镜侧翼',deployed:'主镜侧翼',stowed:'遮阳板'};deployStatus.textContent=d.animating?`${d.target>d.progress?'正在展开':'正在收拢'} · ${stages[d.stage]||d.stage||'结构演示'} · ${Math.round(d.progress*100)}%`:(d.progress>.99?'已完全展开':'已收拢');}
  return {render,renderDock,openLibrary,openCraftList,getLayoutBounds,updateAnimationStatus,collapseDock:()=>{if(mobileLayout.matches)setDockCollapsed(true);},stopCardNarration:factsCard.stopNarration,closeLibrary:()=>dialog.open&&dialog.close(),capturePreferences:()=>({trajectoryFrame,trajectoryLength,deployed}),restorePreferences(saved){if(!saved)return;({trajectoryFrame,trajectoryLength,deployed}=saved);onTrajectory({frame:trajectoryFrame,length:trajectoryLength});onDeploy(deployed?1:0);render(current);},getOcclusionRects(){return [...document.querySelectorAll('.object-info,.facts-panel,.destination-dock,.cosmic-breadcrumb,.earthsense-panel,.earth-environment-panel,.moon-phases-panel,.earth-sense-overview,.earth-sense-controls,.view-tools,.trajectory-panel,#solar-quick-actions')].map(visibleRect).filter(Boolean);}};
}
