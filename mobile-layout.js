import { PHONE_MEDIA } from './phone-layout.js';
import { createMobileSelect } from './mobile-select.js';

/* Mobile-only presentation. Existing controls keep their nodes and listeners. */
export function createMobileLayout({document=globalThis.document,window=globalThis.window,onLayout=()=>{}}={}) {
  const media=window.matchMedia(PHONE_MEDIA);
  const $=selector=>document.querySelector(selector);
  let active=false,opened='',context='',records=[],added=[],cleanups=[],observer=null,frame=0;
  let toolsButton,playbackButton,featuresButton,toolsPanel,playbackPanel,factsBeforeMobile,choices=[];
  const make=(tag,className,text)=>{const node=document.createElement(tag);node.className=className;if(text)node.textContent=text;return node;};
  const listen=(node,type,fn,options)=>{node?.addEventListener(type,fn,options);cleanups.push(()=>node?.removeEventListener(type,fn,options));};
  const add=node=>{added.push(node);return node;};
  const move=(node,parent)=>{
    if(!node||!parent)return;
    const marker=document.createComment('mobile-control-position');
    node.parentNode.insertBefore(marker,node);records.push({node,marker});parent.append(node);
  };
  const button=(text,id)=>{const node=add(make('button','mobile-menu-toggle',text));node.type='button';node.id=id;node.setAttribute('aria-expanded','false');return node;};
  const schedule=()=>{if(!active||frame)return;frame=window.requestAnimationFrame(()=>{frame=0;if(active){sync();onLayout();}});};
  const announce=panel=>document.dispatchEvent(new window.CustomEvent('mobile-open-panel',{detail:{panel}}));
  const origin=()=>opened==='tools'?toolsButton:opened==='playback'?playbackButton:opened==='features'?featuresButton:null;
  function close(restoreFocus=false) {
    for(const choice of choices)choice.close();
    const previous=origin();opened='';
    for(const node of [toolsButton,playbackButton,featuresButton])node?.setAttribute('aria-expanded','false');
    if(toolsPanel)toolsPanel.hidden=true;if(playbackPanel)playbackPanel.hidden=true;
    document.body.classList.remove('mobile-features-open','mobile-menu-open');
    if(restoreFocus)previous?.focus({preventScroll:true});
    schedule();
  }
  function toggle(name) {
    if(opened===name){close(true);return;}
    close();announce(name);opened=name;
    const trigger=origin();trigger.setAttribute('aria-expanded','true');
    if(name==='features')document.body.classList.add('mobile-features-open');
    else (name==='tools'?toolsPanel:playbackPanel).hidden=false;
    document.body.classList.add('mobile-menu-open');schedule();
  }
  function panel(id,title) {
    const node=add(make('section','mobile-menu'));node.id=id;node.hidden=true;
    node.setAttribute('aria-label',title);
    const heading=make('div','mobile-menu-heading'),caption=make('strong','',title),dismiss=make('button','mobile-menu-close','×');
    dismiss.type='button';dismiss.setAttribute('aria-label','关闭'+title);heading.append(caption,dismiss);
    const content=make('div','mobile-menu-items');node.append(heading,content);document.body.append(node);
    listen(dismiss,'click',()=>close(true));return {node,content};
  }
  function labelControl(node,text) {if(node)node.append(add(make('span','mobile-tool-label',text)));}
  function sync() {
    if(!active)return;
    for(const choice of choices)choice.sync();
    const body=document.body;
    const next=[body.dataset.destination,body.dataset.earthExperience,body.dataset.earthSection,body.classList.contains('guide-active'),body.classList.contains('ui-hidden'),body.classList.contains('clean-view')].join('|');
    if(context!==next){context=next;if(opened)close();}
    const title=body.dataset.earthExperience==='sense'?'地理与自然':'观察方式';
    if(featuresButton&&featuresButton.textContent!==title+' ⌄')featuresButton.textContent=title+' ⌄';
  }
  function enter() {
    if(active)return;active=true;document.body.classList.add('mobile-layout');
    factsBeforeMobile=$('#toggle-facts')?.getAttribute('aria-expanded')==='true';
    if(factsBeforeMobile)$('#toggle-facts')?.click();
    const tools=panel('mobile-tools-panel','更多功能');toolsPanel=tools.node;
    toolsButton=button('更多 ⋯','mobile-tools-toggle');toolsButton.setAttribute('aria-controls',toolsPanel.id);$('.display-tools').append(toolsButton);
    for(const id of ['open-cinema','enter-guide','open-catalog','help-button','toggle-ui','toggle-fullscreen'])move($('#'+id),tools.content);
    labelControl($('#help-button'),'操作帮助');labelControl($('#toggle-ui'),'显示 / 隐藏界面');labelControl($('#toggle-fullscreen'),'全屏浏览');
    const playback=panel('mobile-playback-panel','场景设置');playbackPanel=playback.node;
    playbackButton=button('更多 ⋯','mobile-playback-toggle');playbackButton.setAttribute('aria-controls',playbackPanel.id);$('.playback-controls').append(playbackButton);
    move($('#toggle-orbits'),playback.content);move($('.deep-space-toggle'),playback.content);
    const speed=$('.speed-control');move(speed,playback.content);if(speed)speed.prepend(add(make('span','mobile-setting-label','播放速度')));
    const quality=$('.quality-select');
    if(quality){const label=add(make('label','mobile-quality-setting'));tools.content.append(label);move(quality,label);}
    const closeChoices=()=>choices.forEach(choice=>choice.close());
    choices=[
      createMobileSelect($('#speed-select'),{document,window,id:'mobile-speed-choice',name:'播放速度',onOpen:closeChoices}),
      createMobileSelect(quality,{document,window,id:'mobile-quality-choice',name:'渲染画质',onOpen:closeChoices}),
    ].filter(Boolean);
    move($('#source-button'),tools.content);labelControl($('#source-button'),'资料与说明');
    move($('#author-statement-button'),tools.content);
    move($('#reset-view'),playback.content);labelControl($('#reset-view'),'重置视角');
    featuresButton=button('观察方式 ⌄','mobile-features-toggle');featuresButton.setAttribute('aria-controls','earth-actions');$('#earth-actions')?.prepend(featuresButton);
    const overviewHeading=$('.earth-overview-heading');
    if(overviewHeading){const dismiss=add(make('button','mobile-sheet-close','×'));dismiss.type='button';dismiss.setAttribute('aria-label','关闭感知总览，返回地球漫游');overviewHeading.append(dismiss);listen(dismiss,'click',()=>$('.earth-return-roam')?.click());}
    listen(toolsButton,'click',()=>toggle('tools'));listen(playbackButton,'click',()=>toggle('playback'));listen(featuresButton,'click',()=>toggle('features'));
    listen(document,'mobile-open-panel',event=>{
      const name=event.detail?.panel;
      if(name!==opened)close();
      // Opening a scene selector dismisses the reading card. Utility menus leave narration alone.
      if(['dock','constellation-dock','trajectory','features','earth-feature'].includes(name)&&!$('#facts-panel')?.classList.contains('collapsed'))$('#toggle-facts')?.click();
    });
    listen(document,'click',event=>{
      const target=event.target.closest?.('button');
      if(target?.id==='toggle-facts'&&target.getAttribute('aria-expanded')==='true')announce('facts');
      if(target?.matches?.('[data-earth-feature]')){close();announce(target.dataset.earthFeature==='spacecraft'?'dock':'earth-feature');}
      if(target&&toolsPanel.contains(target)&&!target.classList.contains('mobile-menu-close')&&!target.closest('.mobile-select-control'))close();
      if(target?.id==='source-button')close();
    });
    listen(document,'pointerdown',event=>{
      if(!opened)return;
      const area=opened==='tools'?toolsPanel:opened==='playback'?playbackPanel:$('#earth-actions');
      if(area?.contains(event.target)||origin()?.contains(event.target)||event.target.closest?.('.mobile-select-options'))return;
      // Bottom-bar proxies must reach toggle() before the outside-click handler
      // closes the same menu, otherwise a second tap would immediately reopen it.
      if(opened==='playback'&&event.target.closest?.('#mobile-action-settings'))return;
      if(opened==='features'&&event.target.closest?.('#mobile-action-objects'))return;
      close();
    },true);
    listen(document,'keydown',event=>{if(!event.defaultPrevented&&event.key==='Escape'&&opened){event.preventDefault();close(true);}});
    observer=new window.MutationObserver(schedule);
    observer.observe(document.body,{attributes:true,attributeFilter:['class','data-destination','data-earth-experience','data-earth-section']});
    context='';sync();schedule();
  }
  function leave() {
    if(!active)return;close();active=false;observer?.disconnect();observer=null;
    if(frame)window.cancelAnimationFrame(frame);frame=0;
    for(const choice of choices)choice.dispose();choices=[];
    for(const cleanup of cleanups.splice(0))cleanup();
    for(const {node,marker}of records.reverse()){marker.parentNode?.insertBefore(node,marker);marker.remove();}records=[];
    for(const node of added.reverse())node.remove();added=[];
    document.body.classList.remove('mobile-layout','mobile-features-open','mobile-menu-open');
    const factsToggle=$('#toggle-facts');
    if(factsToggle&&(factsToggle.getAttribute('aria-expanded')==='true')!==factsBeforeMobile)factsToggle.click();
    toolsButton=playbackButton=featuresButton=toolsPanel=playbackPanel=null;context='';onLayout();
  }
  const update=()=>media.matches?enter():leave();
  media.addEventListener('change',update);update();
  return {dispose(){media.removeEventListener('change',update);leave();},getState:()=>({active,opened})};
}
