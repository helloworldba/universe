import { isPhoneLayout } from './phone-layout.js';
import { knowledgeFor } from './knowledge.js';
import { createCraftPositionDiagram, craftPositionFor } from './craft-position-diagram.js';
import { getNarrationPlayer } from './local-narration.js';
import { createTopicVideoButton } from './topic-video-button.js';

// Distances reuse the supplied solar-system reference; diameters retain this
// explorer's mean-diameter convention, rather than the reference's equatorial values.
const PLANETS = {
  mercury:['0.39 AU','类地行星'],venus:['0.72 AU','类地行星'],earth:['1.00 AU','类地行星'],mars:['1.52 AU','类地行星'],
  jupiter:['5.20 AU','气态巨行星'],saturn:['9.58 AU','气态巨行星'],uranus:['19.2 AU','冰巨星'],neptune:['30.1 AU','冰巨星'],
};
const KINDS={nebula:'星云',cluster:'星团',galaxy:'星系',star:'恒星',planet:'系外行星',satellite:'天然卫星',blackhole:'黑洞',craft:'航天器',overview:'探索概览',trajectory:'运动演示'};
const $=id=>document.getElementById(id);
export function factsFor(catalog,id){
  const d=catalog[id],planet=PLANETS[id],fictional=d.modelStatus?.includes('虚构');
  let type=planet?.[1]||d.type?.split('/').pop().trim()||KINDS[d.kind]||'宇宙天体';
  if(['天体类型','形态','任务类型'].includes(d.statLabels?.[0]))type=d.size;
  let context=catalog[d.parent]?.name||'宇宙图鉴';
  let stats=[{label:d.statLabels?.[0]||'平均直径',value:d.size||'—'},
    {label:d.statLabels?.[1]||'公转周期',value:(d.period||'—').replace(/[¹²³⁴]/g,'')}];
  if(planet){
    context=`第 ${Object.keys(PLANETS).indexOf(id)+1} 颗行星`;
    stats=[{label:'距日均距',value:planet[0]},{...stats[0],label:'平均直径'},{...stats[1],label:'绕日一圈'}];
  }else if(id==='moon'){
    context='地球的天然卫星';
    stats=[{label:'距地均距',value:'约 38.4 万 km'},stats[0],{...stats[1],label:'绕地一圈'}];
  }else if(id==='sun'){
    context='太阳系的中心恒星';type='G 型主序星';
    stats=[{label:'所属星系',value:'银河系'},stats[0],{...stats[1],label:'绕银河中心'}];
  }else if(id==='solar'){
    context='银河系 · 行星系统';type='恒星与行星的家族';
    stats=[{label:'核心恒星',value:'太阳'},{label:'行星数量',value:'8 颗'},{label:'所属星系',value:'银河系'}];
  }
  if(fictional)context='虚构天体 · 科普示意';
  else if(d.nearEarth)context=d.modelStatus?.includes('类型示意')?'卫星类型示意':'地球轨道';
  const summary=id==='earth'?'目前唯一已知拥有生命的行星，地表长期存在液态水。':d.description;
  return {name:d.name,type,context,stats,summary,kind:d.kind,color:d.color||'#5bc8ff',fictional,
    note:planet||id==='sun'||id==='moon'?'轨道、大小与动画速度均为便于观察的视觉化示意。':d.modelStatus||'大小、距离与运动为教学示意。'};
}

export function factsNarrationText(catalog,id){
  const d=catalog[id];if(!d)return '';
  if(d.narration)return d.narration;
  const model=factsFor(catalog,id),reading=knowledgeFor({...d,id}),position=craftPositionFor(id);
  return [model.name,model.type,model.fictional?'这是虚构天体，仅用于科普示意。':'',model.summary,
    ...[...model.stats,...reading.metrics].map(s=>`${s.label}，${s.value}`),
    position?.description,position?.clarification,
    ...reading.sections.map(section=>`${section.title}。${section.text}`),...reading.facts,model.note].filter(Boolean).join('。');
}

export function createFactsCard({catalog,toast,narration=getNarrationPlayer()}){
  const panel=$('facts-panel'),speakButton=$('facts-narrate'),more=$('facts-more');
  const positionDiagram=createCraftPositionDiagram();$('facts-content').insertBefore(positionDiagram.element,more);
  const summary=more.querySelector('summary');summary.textContent='详细资料';
  const count=document.createElement('span');count.className='facts-section-count';summary.append(count);
  const metrics=document.createElement('dl');metrics.className='facts-extra-stats';metrics.setAttribute('aria-label','补充参数');more.append(metrics);
  const sections=document.createElement('div');sections.className='facts-sections';more.append(sections);
  const list=document.createElement('ul');list.className='science-facts';more.append(list);
  more.open=true;
  const note=document.createElement('p');note.className='model-note';$('facts-content').append(note);
  const sources=document.createElement('div');sources.className='facts-sources';
  const sourceTitle=document.createElement('h3');sourceTitle.textContent='资料来源';sources.append(sourceTitle);
  const sourceList=document.createElement('ul');sources.append(sourceList);$('facts-content').append(sources);
  let current=null,model=null,reading=null,token=0;
  function narrationState(status){
    speakButton.textContent=status==='loading'?'取消加载':status==='playing'?'停止解说':'播放解说';
    speakButton.setAttribute('aria-pressed',String(status!=='idle'));
    speakButton.setAttribute('aria-busy',String(status==='loading'));
  }
  function stopNarration(){
    token++;narration.stop('facts');narrationState('idle');
  }
  function narrate(){
    if(!model)return;
    const ownToken=++token;
    narration.toggle({owner:'facts',key:`facts/${current}`,
      onState:status=>{if(token===ownToken)narrationState(status);},
      onError:message=>{if(token===ownToken)toast(message);}});
  }
  function render(id){
    // The shared scene UI also writes the top-level stat rows: normalize them on
    // every render, but preserve detailed reading position/focus on the same ID.
    const changed=id!==current;
    if(changed){
      stopNarration();panel.scrollTop=0;
      // On phones the body scrolls separately below the pinned toolbar.
      if(isPhoneLayout())$('facts-content').scrollTop=0;
    }
    current=id;const d=catalog[id];model=factsFor(catalog,id);reading=knowledgeFor({...d,id});
    $('facts-name').textContent=model.name;$('facts-type').textContent=model.type;
    $('facts-context-label').textContent=model.context;$('facts-summary').textContent=model.summary;
    const orb=$('facts-orb');orb.style.setProperty('--object-color',id==='earth'?'#5bc8ff':model.color);orb.dataset.kind=model.kind;
    const isNebula=model.kind==='nebula'||model.kind==='cluster';orb.classList.toggle('nebula-thumbnail',isNebula);orb.style.backgroundImage=isNebula?`url(./assets/nebula-thumbnails/${d.shape}.svg)`:'';
    panel.dataset.columns=String(model.stats.length);panel.classList.toggle('facts-fictional',model.fictional);
    const rows=[...panel.querySelectorAll('.object-stats>div')];
    const shown=model.stats.length===3?rows:rows.slice(1);
    rows[0].hidden=model.stats.length!==3;
    shown.forEach((row,i)=>{row.querySelector('dt').textContent=model.stats[i].label;row.querySelector('dd').textContent=model.stats[i].value;});
    if(!changed)return;
    $('facts-content').querySelector('.topic-video-facts')?.remove();
    const videoButton=createTopicVideoButton(`object/${id}`,model.name,'topic-video-facts');
    if(videoButton)$('facts-summary').after(videoButton);
    positionDiagram.render(id);
    metrics.replaceChildren(...reading.metrics.map(metric=>{
      const row=document.createElement('div'),label=document.createElement('dt'),value=document.createElement('dd');
      label.textContent=metric.label;value.textContent=metric.value;row.append(label,value);return row;
    }));
    metrics.hidden=!reading.metrics.length;
    sections.replaceChildren(...reading.sections.map(section=>{
      const block=document.createElement('section'),title=document.createElement('h3'),text=document.createElement('p');
      title.textContent=section.title;text.textContent=section.text;block.append(title,text);return block;
    }));
    list.replaceChildren(...reading.facts.map(f=>{const item=document.createElement('li');item.textContent=f;return item;}));
    list.hidden=!reading.facts.length;
    count.textContent=reading.sections.length?`${reading.sections.length} 个主题`:'';
    more.hidden=!(reading.metrics.length||reading.sections.length||reading.facts.length);note.textContent=model.note;
    sources.hidden=!reading.sources.length;
    sourceList.replaceChildren(...reading.sources.map(citation=>{
      const item=document.createElement('li'),text=document.createElement('span');text.className='science-source';
      text.textContent=citation.label;
      item.append(text);return item;
    }));
  }
  speakButton.addEventListener('click',narrate);
  $('enter-guide').addEventListener('click',stopNarration);
  document.addEventListener('earthsense:visibility',event=>{if(event.detail.visible)stopNarration();});
  window.addEventListener('pagehide',stopNarration);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopNarration();});
  return {render,stopNarration};
}
