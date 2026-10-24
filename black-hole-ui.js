import {BLACK_HOLES,BLACK_HOLE_COMPARISON,BLACK_HOLE_COMPARISON_SOURCES,BLACK_HOLE_LESSONS,BLACK_HOLE_SOURCES,blackHoleById,schwarzschildRadiusKm} from './black-hole-data.js';
import {getNarrationPlayer} from './local-narration.js';
import {createDockPreference} from './dock-preference.js?v=20261024-phone-landscape-startup';
import {isPhoneLayout} from './phone-layout.js';
import {createTopicVideoButton} from './topic-video-button.js';

export function createBlackHoleUI({onSelect,onLibrary=()=>{},onGalaxy=()=>{},onChange=()=>{},onToggle=()=>{},onReset=()=>{},onPause=()=>{},getPaused=()=>false,toast=()=>{}}){
  const root=document.createElement('section');root.id='black-hole-explorer';root.className='black-hole-explorer interface';root.hidden=true;
  const options=[...BLACK_HOLES,{id:'compare',name:'大小对比',kind:'从恒星级到超大质量'}];
  root.innerHTML=`<div class="black-hole-hero"><p class="black-hole-eyebrow">超越光的边界</p><h1>黑洞</h1><p class="black-hole-english">BLACK HOLES</p><p class="black-hole-intro">从看不见的天体，读懂极端的引力。</p><div class="black-hole-topics" aria-label="黑洞知识主题">${[['overview','认识黑洞'],['structure','结构示意'],['detection','如何发现']].map(([id,name])=>`<button type="button" data-bh-topic="${id}" aria-pressed="${id==='overview'}">${name}<span aria-hidden="true">↗</span></button>`).join('')}</div></div>
    <aside class="black-hole-card" aria-label="黑洞科普资料"><div class="black-hole-card-toolbar"><button id="toggle-black-hole-card" aria-expanded="true" aria-controls="black-hole-card-content" type="button"><span>黑洞科普</span><span class="card-fold-action" aria-hidden="true">收起</span><span class="card-fold-chevron" aria-hidden="true">⌃</span></button><button id="black-hole-narrate" type="button" aria-pressed="false">播放讲解</button><button type="button" id="black-hole-read">展开阅读</button></div><div id="black-hole-card-content"></div></aside>
    <div class="black-hole-caption"><strong id="black-hole-scene-name"></strong><span id="black-hole-scene-note"></span></div>
    <section class="black-hole-dock" aria-label="黑洞目标"><div class="black-hole-dock-heading"><span>探索黑洞 <small>${BLACK_HOLES.length} 个目标 · 尺度对比</small></span><div class="black-hole-dock-actions"><button type="button" id="black-hole-catalog">全部图鉴 ↗</button><button type="button" id="black-hole-dock-toggle" aria-controls="black-hole-destinations" aria-expanded="true">收起 ⌄</button></div></div><div id="black-hole-destinations">${options.map(item=>`<button type="button" data-bh-target="${item.id}" aria-pressed="false"><span class="black-hole-thumb ${item.id==='compare'?'black-hole-compare-thumb':''}" aria-hidden="true"></span><strong>${item.name}</strong><small>${item.kind}</small></button>`).join('')}</div></section>
    <nav class="black-hole-controls" aria-label="黑洞观察设置"><button type="button" id="black-hole-disk" aria-pressed="true">吸积盘</button><button type="button" id="black-hole-names" aria-pressed="true">名称</button><button type="button" id="black-hole-pause" aria-pressed="false">暂停</button><button type="button" id="black-hole-reset">重置视角</button></nav>`;
  document.body.append(root);
  const $=selector=>root.querySelector(selector),narrator=getNarrationPlayer();
  // Controls may be moved to the shared phone settings panel; keep their nodes.
  const diskButton=$('#black-hole-disk'),namesButton=$('#black-hole-names'),pauseButton=$('#black-hole-pause');
  let current='sgr-a',topic='overview',disk=true,names=true,compact=isPhoneLayout();
  const cardPreference={desktop:true,mobile:false};
  const card=$('.black-hole-card'),content=$('#black-hole-card-content'),fold=$('#toggle-black-hole-card'),dock=$('.black-hole-dock'),dockButton=$('#black-hole-dock-toggle'),narrate=$('#black-hole-narrate');
  let expanded=!compact,reading=false,dockCollapsed=true;
  const announce=panel=>document.dispatchEvent(new CustomEvent('mobile-open-panel',{detail:{panel}}));
  const stop=()=>narrator.stop('blackholes');
  const dockPreference=createDockPreference({isMobile:isPhoneLayout,onChange:value=>foldDock(value)});
  function foldDock(value){dockCollapsed=Boolean(value);dock.classList.toggle('is-collapsed',dockCollapsed);root.classList.toggle('black-hole-dock-folded',dockCollapsed);$('#black-hole-destinations').hidden=dockCollapsed;dockButton.textContent=dockCollapsed?'展开 ⌃':'收起 ⌄';dockButton.setAttribute('aria-expanded',String(!dockCollapsed));if(!dockCollapsed)requestAnimationFrame(revealSelection);onChange();}
  function expandCard(value,{remember=true,notify=true}={}){expanded=Boolean(value);if(remember)cardPreference[compact?'mobile':'desktop']=expanded;reading=false;card.classList.remove('is-reading');$('#black-hole-read').textContent='展开阅读';card.classList.toggle('is-collapsed',!expanded);content.hidden=!expanded;fold.setAttribute('aria-expanded',String(expanded));fold.setAttribute('aria-label',expanded?'收起黑洞科普':'展开黑洞科普');fold.querySelector('.card-fold-action').textContent=expanded?'收起':'展开';fold.querySelector('.card-fold-chevron').textContent=expanded?'⌃':'⌄';if(expanded&&compact){foldDock(true);if(notify)announce('blackholes');}onChange();}
  const paragraphs=sections=>sections.map(([title,text])=>`<section><h3>${title}</h3><p>${text}</p></section>`).join('');
  const radiusText=mass=>{const km=schwarzschildRadiusKm(mass),unit=km>=1e8?1e8:km>=1e4?1e4:1;return `约 ${unit===1?Math.round(km):(km/unit).toLocaleString('zh-CN',{useGrouping:false,maximumSignificantDigits:3})}${unit===1e8?' 亿':unit===1e4?' 万':''} km`;};
  function render(){
    const compare=current==='compare',record=blackHoleById(current),lesson=BLACK_HOLE_LESSONS[compare?'compare':topic];
    const title=compare?'大小对比':record.name;
    $('#black-hole-scene-name').textContent=title;
    $('#black-hole-scene-note').textContent=compare?'8 个黑洞 · 对数压缩 · 不按真实比例':'可拖动旋转 · 双指缩放 / 滚轮缩放 · 教学示意';
    const identity=compare?'恒星级 → 超大质量':lesson?`${record.name} · ${record.kind}`:record.kind;
    const english=compare?'A MATTER OF SCALE':topic==='structure'?'ANATOMY OF A BLACK HOLE':topic==='detection'?'FINDING THE INVISIBLE':record.en;
    const values=compare?`<div class="black-hole-comparison-values">${BLACK_HOLE_COMPARISON.map(r=>`<div><strong>${r.name}</strong><span>${r.massLabel}</span><small>参考半径 ${radiusText(r.mass)}</small><i style="--value:${12+Math.log10(r.mass)*8}%"></i></div>`).join('')}</div>`:lesson?'':`<div class="black-hole-facts">${(record.metrics||[{label:'参考质量',value:record.massLabel},{label:'所在位置',value:record.location}]).map(m=>`<div><small>${m.label}</small><strong>${m.value}</strong></div>`).join('')}</div>`;
    content.innerHTML=`<p class="black-hole-context">${identity}</p><h2>${lesson?.title||title}</h2><p class="black-hole-latin">${english}</p>
      <p class="black-hole-summary">${lesson?.intro||record.summary}</p>${values}
      ${lesson&&!compare?'':`<h3 class="black-hole-section-title">${compare?'如何阅读这张对比图':'认识这颗黑洞'}</h3>`}${paragraphs(lesson?.sections||record.facts)}
      <p class="black-hole-model-note">${compare?'模型说明：8 个圆球使用相同的对数压缩规则，表示参考尺度的排序；圆球直径不代表真实比例。':'模型说明：暗球代表黑洞位置；吸积盘、亮弧和颜色为教学示意，不是观测照片或精确相对论模拟。各目标独立缩放。'}</p>
      <details class="black-hole-sources"><summary>资料来源</summary><p>${compare?'参考质量取自下列资料；半径按 Rs ≈ 2.95 × M/M☉ km 计算。':record.source}</p>${(compare?BLACK_HOLE_COMPARISON_SOURCES:lesson?BLACK_HOLE_SOURCES:record.sources).map(s=>`<p><strong>${s.name}</strong></p>`).join('')}<p>数据为近似参考值，非实时测量。</p></details>`;
    $('.black-hole-links')?.remove();
    const videoButton=createTopicVideoButton(`blackhole/${compare?'compare':topic==='overview'?current:topic}`,lesson?.title||title,'black-hole-video-entry',{onUnavailable:()=>toast('视频准备中')});
    const links=document.createElement('div');links.className='black-hole-links';links.append(videoButton);
    if(!compare&&record.parentGalaxy){const back=document.createElement('button');back.type='button';back.className='black-hole-galaxy-entry';back.textContent='所在星系 ↗';back.addEventListener('click',onGalaxy);links.append(back);}
    $('.black-hole-topics').append(links);
    root.querySelectorAll('[data-bh-target]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.bhTarget===current)));
    root.querySelectorAll('[data-bh-topic]').forEach(b=>b.setAttribute('aria-pressed',String(!compare&&b.dataset.bhTopic===topic)));
    diskButton.disabled=compare;namesButton.setAttribute('aria-pressed',String(names));diskButton.setAttribute('aria-pressed',String(disk));
    onToggle('structure',topic==='structure'&&!compare);content.scrollTop=0;onChange();
  }
  function revealSelection(){const list=$('#black-hole-destinations'),selected=list.querySelector('[aria-pressed="true"]');if(root.hidden||list.hidden||!selected)return;const a=list.getBoundingClientRect(),b=selected.getBoundingClientRect();if(b.left<a.left||b.right>a.right)list.scrollLeft+=b.left-a.left-(a.width-b.width)/2;}
  function select(id){stop();current=id==='compare'?id:blackHoleById(id).id;render();requestAnimationFrame(revealSelection);if(compact){foldDock(true);expandCard(false,{remember:false,notify:false});}}
  function setTopic(value){stop();topic=value;if(current==='compare'){onSelect('sgr-a');}render();expandCard(true);}
  root.addEventListener('click',event=>{const b=event.target.closest('button');if(!b)return;if(b.dataset.bhTarget)onSelect(b.dataset.bhTarget);if(b.dataset.bhTopic)setTopic(b.dataset.bhTopic);});
  dockButton.addEventListener('click',()=>{const opening=dockCollapsed;dockPreference.set(!opening);if(opening&&compact){expandCard(false,{remember:false,notify:false});announce('blackholes-dock');}});
  fold.addEventListener('click',()=>expandCard(!expanded));
  $('#black-hole-read').addEventListener('click',()=>{reading=!reading;card.classList.toggle('is-reading',reading);$('#black-hole-read').textContent=reading?'返回观察':'展开阅读';onChange();});
  $('#black-hole-catalog').addEventListener('click',onLibrary);
  narrate.addEventListener('click',()=>narrator.toggle({owner:'blackholes',key:current!=='compare'&&topic==='overview'?blackHoleById(current).narrationKey:`blackholes/${current==='compare'?'compare':topic}`,onError:message=>toast(message)}));
  narrator.subscribe(state=>{const active=state.active&&state.owner==='blackholes';narrate.setAttribute('aria-pressed',String(active));narrate.textContent=active?(state.status==='loading'?'正在加载…':'停止讲解'):'播放讲解';});
  diskButton.addEventListener('click',()=>{disk=!disk;diskButton.setAttribute('aria-pressed',String(disk));onToggle('disk',disk);onChange();});
  namesButton.addEventListener('click',()=>{names=!names;namesButton.setAttribute('aria-pressed',String(names));onToggle('names',names);onChange();});
  pauseButton.addEventListener('click',()=>{onPause();syncPause();});
  $('#black-hole-reset').addEventListener('click',onReset);
  function syncPause(){pauseButton.textContent=getPaused()?'继续':'暂停';pauseButton.setAttribute('aria-pressed',String(getPaused()));}
  document.addEventListener('mobile-open-panel',event=>{if(!compact||root.hidden)return;const panel=event.detail?.panel;if(panel!=='blackholes')expandCard(false,{remember:false,notify:false});if(panel!=='blackholes-dock')foldDock(true);});
  document.addEventListener('keydown',event=>{if(event.key!=='Escape'||root.hidden||!compact)return;if(reading){reading=false;card.classList.remove('is-reading');$('#black-hole-read').textContent='展开阅读';onChange();}else if(expanded)expandCard(false);else if(!dockCollapsed)foldDock(true);});
  window.addEventListener('resize',()=>{const next=isPhoneLayout();if(next!==compact){compact=next;foldDock(dockPreference.read());expandCard(cardPreference[compact?'mobile':'desktop'],{remember:false,notify:false});}onChange();});
  const rect=node=>{if(!node||root.hidden||node.hidden||getComputedStyle(node).display==='none')return null;const r=node.getBoundingClientRect();return r.width&&r.height?r:null;};
  foldDock(dockPreference.read());expandCard(!compact,{notify:false});render();
  return {select,setTopic,syncPause,
    setVisible(value){root.hidden=!value;if(!value)stop();else{foldDock(dockPreference.read());expandCard(cardPreference[compact?'mobile':'desktop'],{remember:false,notify:false});syncPause();}},
    captureState:()=>({current,topic,disk,names,expanded}),
    restoreState(saved){if(!saved)return;topic=saved.topic||'overview';disk=saved.disk??true;names=saved.names??true;select(saved.current);onToggle('disk',disk);onToggle('names',names);expandCard(saved.expanded,{remember:false,notify:false});},
    getLayoutBounds:()=>({left:rect($('.black-hole-hero')),right:rect(card),dock:rect(dock),controls:rect($('.black-hole-controls')),caption:rect($('.black-hole-caption'))})
  };
}
