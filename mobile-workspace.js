import { PHONE_MEDIA } from './phone-layout.js';
import { installSheetGesture } from './mobile-sheet-gesture.js';

// A phone-only presentation layer. Native controllers still own navigation,
// preferences, narration and simulation state; their controls are never cloned.
export function createMobileWorkspace({document=globalThis.document, window=globalThis.window, onLayout=()=>{}}={}) {
  const media=window.matchMedia(PHONE_MEDIA), $=selector=>document.querySelector(selector);
  const readers=[
    ['#facts-panel','.facts-toolbar','facts'],
    ['#earthsense-panel','.earthsense-header','geography'],
    ['#earth-environment-panel','.earth-environment-header','geography'],
    ['.moon-phases-panel','.moon-phases-header','geography'],
    ['.earth-sense-overview','.earth-overview-heading','geography'],
    ['.constellation-card','.constellation-card-toolbar','constellation'],
    ['#guide-lesson','.guide-lesson-heading','guide-lesson'],
  ];
  let active=false, bar, specialHost, guidePager, actions={}, observer, frame=0, route='', geographyActive=false, removers=[], added=[], moved=[], sheets=[], coveredBy='';
  let keyboardBaselineHeight=0,keyboardBaselineWidth=0;
  const make=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls;if(text)n.textContent=text;return n;};
  const attr=(node,key,value)=>{if(node && node.getAttribute(key)!==String(value))node.setAttribute(key,String(value));};
  const text=(node,value)=>{if(node && node.textContent!==value)node.textContent=value;};
  const flag=(node,key,value)=>{if(node.classList.contains(key)!==value)node.classList.toggle(key,value);};
  const listen=(node,event,fn)=>{node?.addEventListener(event,fn);removers.push(()=>node?.removeEventListener(event,fn));};
  const add=node=>{added.push(node);return node;};
  const move=(node,parent)=>{if(!node||!parent)return;const marker=document.createComment('phone-workspace');node.parentNode.insertBefore(marker,node);moved.push({node,marker,parent});parent.append(node);};
  const announce=panel=>document.dispatchEvent(new window.CustomEvent('mobile-open-panel',{detail:{panel}}));
  const schedule=()=>{if(!active||frame)return;frame=window.requestAnimationFrame(()=>{frame=0;if(active){sync();onLayout();}});};
  const nativeVisible=node=>Boolean(node&&!node.hidden);
  const guide=()=>document.body.classList.contains('guide-active');
  const constellation=()=>document.body.classList.contains('constellation-active');
  const blackholes=()=>document.body.classList.contains('blackholes-active');
  const geography=()=>document.body.dataset.earthExperience==='sense';
  const geoSheet=()=>sheets.find(s=>s.kind==='geography'&&nativeVisible(s.node));
  const nativeInfo=()=>guide()?$('#toggle-guide-lesson'):blackholes()?$('#toggle-black-hole-card'):constellation()?$('#toggle-constellation-card'):$('#toggle-facts');
  const nativeObjects=()=>guide()?$('#toggle-guide-chapters'):blackholes()?$('#black-hole-dock-toggle'):constellation()?$('.constellation-dock-collapse'):document.body.dataset.destination==='trajectories'?$('#trajectory-panel-toggle'):geography()?$('#mobile-features-toggle'):$('#dock-collapse');
  const narrator=()=>guide()?$('#guide-narrate'):blackholes()?$('#black-hole-narrate'):constellation()?$('#constellation-narrate'):geography()?null:$('#facts-narrate');
  function setSheet(sheet,state,{notify=true}={}) {
    attr(sheet.node,'data-mobile-reading',state);
    text(sheet.read,state==='reading'?'返回观察':'展开阅读');
    attr(sheet.read,'aria-expanded',state==='reading');
    if(sheet.fold)attr(sheet.fold,'aria-expanded',state!=='collapsed');
    if(notify&&state!=='collapsed')announce(sheet.kind==='geography'?'earth-feature':sheet.kind);
    schedule();
  }
  function closeCoveredPanel() {
    const kind=coveredBy;
    if(kind==='dock'&&$('#dock-collapse')?.getAttribute('aria-expanded')==='true')$('#dock-collapse').click();
    if(kind==='constellation-dock'&&$('.constellation-dock-collapse')?.getAttribute('aria-expanded')==='true')$('.constellation-dock-collapse').click();
    coveredBy='';
  }
  function infoClick() {
    if(geography()&&!guide()){
      const sheet=geoSheet();
      if(sheet){closeCoveredPanel();setSheet(sheet,sheet.node.dataset.mobileReading==='collapsed'?'reading':'collapsed');}
      else $('#mobile-features-toggle')?.click();
    }else{
      const control=nativeInfo();control?.click();
      if(control?.getAttribute('aria-expanded')==='true'){
        if(blackholes()){
          if(!$('.black-hole-card')?.classList.contains('is-reading'))$('#black-hole-read')?.click();
        }else{
          const sheet=sheets.find(s=>s.node.contains(control));
          if(sheet)setSheet(sheet,'reading');
        }
      }
    }
  }
  function sync() {
    const body=document.body;
    const next=[body.dataset.destination,body.dataset.earthExperience,body.dataset.earthSection,guide(),constellation(),blackholes()].join('|');
    const enteringGeography=geography()&&!guide()&&!geographyActive;
    geographyActive=geography()&&!guide();
    if(next!==route){
      route=next;coveredBy='';
      // Enter the geography scene without covering the globe; reading stays opt-in.
      for(const sheet of sheets)setSheet(sheet,enteringGeography&&sheet.kind==='geography'?'collapsed':'compact',{notify:false});
    }
    // The explorer relocates the same contextual controls on each route.
    // Adopt them only while they belong to the phone's object introduction.
    const special=$('.object-info>.special-controls');
    if(special&&specialHost)specialHost.append(special);
    const objects=nativeObjects(), info=nativeInfo(), narration=narrator();
    text(actions.objects,guide()?'章节':blackholes()?'黑洞':constellation()?'星座':geography()?'功能':body.dataset.destination==='trajectories'?'轨迹':'对象');
    attr(actions.objects,'aria-expanded',objects?.getAttribute('aria-expanded')==='true');
    attr(actions.info,'aria-expanded',geography()&&!guide()?Boolean(geoSheet()&&geoSheet().node.dataset.mobileReading!=='collapsed'):info?.getAttribute('aria-expanded')==='true');
    const speaking=narration?.getAttribute('aria-pressed')==='true';
    text(actions.narrate,speaking?'停止讲解':'听讲解');attr(actions.narrate,'aria-pressed',speaking);
    actions.narrate.disabled=!narration||narration.disabled;
    attr(actions.narrate,'title',narration?'播放当前页面讲解':'此页面可在资料中阅读说明');
    const paused=$('#toggle-pause')?.getAttribute('aria-pressed')==='true';
    text(actions.pause,paused?'继续':'暂停');attr(actions.pause,'aria-pressed',paused);
    actions.pause.hidden=constellation()||guide();
    actions.previous.hidden=actions.next.hidden=!guide();
    if(guidePager){
      guidePager.hidden=!guide();
      const lesson=$('#guide-lesson');
      const parent=lesson&&!lesson.classList.contains('is-collapsed')?lesson:$('#guide-panel');
      if(parent&&guidePager.parentNode!==parent)parent.append(guidePager);
    }
    actions.previous.disabled=Boolean($('#guide-prev')?.disabled);
    actions.next.disabled=Boolean($('#guide-next')?.disabled);
    const settingsOpen=$('#mobile-playback-toggle')?.getAttribute('aria-expanded')==='true';
    attr(actions.settings,'aria-expanded',settingsOpen);
    if(coveredBy==='playback'&&!settingsOpen)coveredBy='';
    if(coveredBy==='tools'&&$('#mobile-tools-toggle')?.getAttribute('aria-expanded')!=='true')coveredBy='';
    if(coveredBy==='features'&&$('#mobile-features-toggle')?.getAttribute('aria-expanded')!=='true')coveredBy='';
    if(coveredBy==='dock'&&$('#dock-collapse')?.getAttribute('aria-expanded')!=='true')coveredBy='';
    for(const sheet of sheets){
      const covered=sheet.kind==='geography'&&Boolean(coveredBy)&&!['earth-feature','geography'].includes(coveredBy);
      flag(sheet.node,'mobile-sheet-covered',covered);
    }
    const currentReader=geography()&&!guide()?geoSheet():sheets.find(s=>s.node.contains(info));
    const reading=blackholes()?$('.black-hole-card')?.classList.contains('is-reading')&&info?.getAttribute('aria-expanded')==='true':
      currentReader?.node.dataset.mobileReading==='reading'&&!currentReader.node.classList.contains('mobile-sheet-covered')&&
      (currentReader.kind==='geography'||info?.getAttribute('aria-expanded')==='true');
    flag(body,'mobile-reading-open',Boolean(reading));
    // Different contexts share one settings window.
    for(const section of document.querySelectorAll('[data-mobile-settings]')){
      const type=section.dataset.mobileSettings;
      section.hidden=type==='constellation'?!constellation():type==='geography'?!geography()||guide():type==='blackholes'?!blackholes():constellation()||blackholes();
    }
    const vv=window.visualViewport;
    const editing=Boolean(document.activeElement?.matches?.('input,textarea,select'));
    // Some mobile browsers resize only visualViewport, others resize the page too.
    // Keep the pre-keyboard height while editing; rotation starts a new baseline.
    if(!editing||Math.abs(window.innerWidth-keyboardBaselineWidth)>48){
      keyboardBaselineHeight=window.innerHeight;keyboardBaselineWidth=window.innerWidth;
    }else keyboardBaselineHeight=Math.max(keyboardBaselineHeight,window.innerHeight);
    const visibleHeight=vv?.height??window.innerHeight;
    const keyboard=editing&&(vv?.scale??1)<=1.05&&keyboardBaselineHeight-visibleHeight>130;
    flag(body,'mobile-keyboard-open',keyboard);
    if(vv)attr(body,'data-mobile-viewport-height',Math.round(vv.height));
    if(body.style){
      const inset=keyboard?Math.max(0,window.innerHeight-visibleHeight-(vv?.offsetTop||0)):0;
      const value=inset+'px';if(body.style.getPropertyValue('--mobile-keyboard-inset')!==value)body.style.setProperty('--mobile-keyboard-inset',value);
    }
  }
  function enter() {
    if(active)return;active=true;document.body.classList.add('mobile-workspace');
    keyboardBaselineHeight=window.innerHeight;keyboardBaselineWidth=window.innerWidth;
    bar=add(make('nav','mobile-scene-bar'));bar.id='mobile-scene-bar';bar.setAttribute('aria-label','手机探索工具');
    for(const [key,label]of [['objects','对象'],['info','资料'],['narrate','听讲解'],['previous','上一站'],['next','下一站'],['pause','暂停'],['settings','设置']]){
      const b=make('button','mobile-scene-action',label);b.id='mobile-action-'+key;b.type='button';bar.append(b);actions[key]=b;
    }
    document.body.append(bar);
    listen(actions.objects,'click',()=>{
      nativeObjects()?.click();
      window.requestAnimationFrame(()=>{
        if(!active)return;
        const list=blackholes()?$('#black-hole-destinations'):constellation()?$('.constellation-dock-list'):$('#destination-list');
        list?.querySelector('[aria-pressed="true"]')?.scrollIntoView?.({block:'nearest',inline:'nearest'});
      });
    });
    listen(actions.info,'click',infoClick);
    listen(actions.narrate,'click',()=>narrator()?.click());
    listen(actions.pause,'click',()=>$('#toggle-pause')?.click());
    listen(actions.previous,'click',()=>$('#guide-prev')?.click());
    listen(actions.next,'click',()=>$('#guide-next')?.click());
    listen(actions.settings,'click',()=>$('#mobile-playback-toggle')?.click());
    if($('#guide-lesson')){
      guidePager=add(make('nav','mobile-guide-pager'));guidePager.setAttribute('aria-label','导览翻页');
      guidePager.append(actions.previous,actions.next);$('#guide-lesson').append(guidePager);
    }
    const placeTools=$('.earthsense-places-tools');
    if(placeTools){
      const options=add(make('details','mobile-place-options'));
      const summary=make('summary','','筛选');options.append(summary);placeTools.append(options);
      for(const selector of ['.earthsense-region-filter','.earthsense-map-tools','.earthsense-surface-help'])move($(selector),options);
      listen(options,'toggle',schedule);
      listen($('#earthsense-region'),'change',()=>{options.open=false;schedule();});
    }
    const menu=$('#mobile-playback-panel .mobile-menu-items');
    if(menu){
      const ordinary=add(make('div','mobile-setting-group'));ordinary.dataset.mobileSettings='scene';menu.append(ordinary);
      move($('#toggle-labels'),ordinary);
      // The mobile-layout controller owns these controls; restore their exact positions on exit.
      for(const selector of ['#toggle-orbits','.deep-space-toggle','.speed-control','#reset-view'])move($(selector),ordinary);
      const stars=add(make('div','mobile-setting-group'));stars.dataset.mobileSettings='constellation';menu.append(stars);
      for(const node of [...document.querySelectorAll('.constellation-controls button')])move(node,stars);
      const holes=add(make('div','mobile-setting-group'));holes.dataset.mobileSettings='blackholes';menu.append(holes);
      for(const node of [...document.querySelectorAll('.black-hole-controls button')])move(node,holes);
      const earth=add(make('div','mobile-setting-group'));earth.dataset.mobileSettings='geography';menu.append(earth);
      move($('.earth-sense-controls'),earth);
      specialHost=add(make('div','mobile-special-host'));menu.append(specialHost);
    }
    for(const [selector,headingSelector,kind]of readers){
      const node=$(selector),heading=node?.querySelector(headingSelector);if(!heading)continue;
      const group=add(make('div','mobile-reader-actions')),read=make('button','mobile-read-button','展开阅读');
      read.type='button';group.append(read);
      const sheet={node,kind,read,fold:null};sheets.push(sheet);node.classList.add('mobile-reader');
      const close=make('button','mobile-reader-close'+(kind==='geography'?' mobile-fold-button':''),'×');
      close.type='button';close.setAttribute('aria-label','关闭资料，返回模型');group.append(close);
      if(kind==='geography')sheet.fold=close;
      listen(close,'click',()=>{
        setSheet(sheet,kind==='geography'?'collapsed':'compact',{notify:false});
        if(kind!=='geography')node.querySelector('#toggle-facts,#toggle-constellation-card,#toggle-guide-lesson')?.click();
        actions.info?.focus?.({preventScroll:true});
      });
      heading.append(group);
      listen(read,'click',()=>setSheet(sheet,node.dataset.mobileReading==='reading'?'compact':'reading'));
      removers.push(installSheetGesture(heading,{window,
        expand:()=>setSheet(sheet,'reading'),
        collapse:()=>{
          if(node.dataset.mobileReading==='reading')setSheet(sheet,'compact');
          else if(sheet.fold)setSheet(sheet,'collapsed');
          else node.querySelector('#toggle-facts,#toggle-constellation-card,#toggle-guide-lesson')?.click();
        }
      }));
      setSheet(sheet,'compact',{notify:false});
    }
    const holeHeading=$('.black-hole-card-toolbar');
    if(holeHeading){
      const close=add(make('button','mobile-reader-close','×'));close.type='button';
      close.setAttribute('aria-label','关闭资料，返回模型');holeHeading.append(close);
      listen(close,'click',()=>{$('#toggle-black-hole-card')?.click();actions.info?.focus?.({preventScroll:true});});
    }
    if(holeHeading)removers.push(installSheetGesture(holeHeading,{window,
      expand:()=>{if(!$('.black-hole-card').classList.contains('is-reading'))$('#black-hole-read')?.click();},
      collapse:()=>($('.black-hole-card').classList.contains('is-reading')?$('#black-hole-read'):$('#toggle-black-hole-card'))?.click()
    }));
    listen(document,'mobile-open-panel',event=>{
      coveredBy=event.detail?.panel||'';
      // An explicit feature selection can reopen the current folded card too.
      if(coveredBy==='earth-feature'){
        const sheet=geoSheet();
        if(sheet?.node.dataset.mobileReading==='collapsed')setSheet(sheet,'compact',{notify:false});
      }
      schedule();
    });
    listen(document,'click',event=>{
      const target=event.target.closest?.('button');
      if(target?.matches?.('.destination-list [data-target]')){
        if($('#dock-collapse')?.getAttribute('aria-expanded')==='true'){
          // Temporary fold after choosing a destination, without altering the manual preference.
          announce('selection');
        }
      }
      schedule();
    });
    listen(document,'focusin',schedule);listen(document,'focusout',schedule);
    listen(window.visualViewport,'resize',schedule);listen(window.visualViewport,'scroll',schedule);
    listen(window,'resize',schedule);
    listen(document,'keydown',event=>{
      if(event.key!=='Escape')return;
      const reading=sheets.find(s=>s.node.dataset.mobileReading==='reading'&&nativeVisible(s.node));
      if(reading){setSheet(reading,'compact');event.preventDefault();}
    });
    observer=new window.MutationObserver(schedule);
    observer.observe(document.body,{attributes:true,attributeFilter:['class','data-destination','data-earth-experience','data-earth-section']});
    for(const node of [...new Set([...sheets.map(s=>s.node),...document.querySelectorAll('#black-hole-explorer,#toggle-black-hole-card,#black-hole-narrate,#black-hole-dock-toggle,#constellation-explorer,#guide-panel,#facts-narrate,#guide-narrate,#constellation-narrate,#toggle-pause,#dock-collapse,.constellation-dock-collapse,#toggle-guide-lesson,#toggle-guide-chapters,#toggle-constellation-card,#toggle-facts,#mobile-playback-toggle,#mobile-tools-toggle,#mobile-features-toggle')])]){
      observer.observe(node,{attributes:true,attributeFilter:['class','hidden','aria-expanded','aria-pressed','disabled','data-layer']});
    }
    route='';sync();onLayout();
  }
  function leave() {
    if(!active)return;active=false;observer?.disconnect();observer=null;
    if(frame)window.cancelAnimationFrame(frame);frame=0;
    for(const remove of removers.splice(0))remove();
    const special=specialHost?.querySelector('.special-controls');
    if(special)$('.object-info')?.append(special);
    // The earlier mobile controller may already have restored its controls.
    // Only restore nodes still owned by this layer, never move them into a detached menu.
    for(const {node,marker,parent}of moved.reverse()){if(node.parentNode===parent)marker.parentNode?.insertBefore(node,marker);marker.remove();}moved=[];
    for(const sheet of sheets){sheet.node.classList.remove('mobile-reader','mobile-sheet-covered');sheet.node.removeAttribute('data-mobile-reading');}sheets=[];
    for(const node of added.reverse())node.remove();added=[];
    document.body.classList.remove('mobile-workspace','mobile-keyboard-open','mobile-reading-open');
    document.body.removeAttribute('data-mobile-viewport-height');
    document.body.style?.removeProperty('--mobile-keyboard-inset');
    actions={};bar=null;specialHost=null;guidePager=null;route='';geographyActive=false;coveredBy='';keyboardBaselineHeight=keyboardBaselineWidth=0;onLayout();
  }
  const update=()=>media.matches?enter():leave();
  media.addEventListener('change',update);update();
  return {dispose(){media.removeEventListener('change',update);leave();},getState:()=>({active,coveredBy})};
}
