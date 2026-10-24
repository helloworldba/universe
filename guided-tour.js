import { isPhoneLayout } from './phone-layout.js';
import { getNarrationPlayer } from './local-narration.js';
import { createDockPreference } from './dock-preference.js?v=20261024-phone-landscape-startup';
import { GUIDE_KNOWLEDGE } from './guide-knowledge.js';
import { createLearningReading } from './learning-reading.js';
import { createTopicVideoButton } from './topic-video-button.js';

// Chapter routes reuse the explorer's live 3D scene. Narration is opt-in.
export const CHAPTERS = [
  {name:'我们的家园', target:'earth', title:'为什么地球会有昼夜？', copy:'地球不停自转，朝向太阳的一侧是白昼，背向太阳的一侧是黑夜。转动视角，看看明暗交界与夜侧城市的微光。', action:'查看夜半球', back:'返回白昼视角', alternate:'night', narration:'地球不停自转，让大多数地方交替经历白昼与黑夜。朝向太阳的一侧明亮，背向太阳的一侧变暗。切换到夜半球，找找城市的微光。'},
  {name:'月球邻居', target:'moon', title:'月球上的圆坑从哪里来？', copy:'月球是地球的天然卫星。它表面的许多环形山来自小天体撞击，保存着漫长的撞击历史。拉近一些，观察月海与环形山。', action:'靠近环形山', back:'恢复月球全景', alternate:'moon-close', narration:'月球是地球的天然卫星。你看到的许多圆形坑洞，是小天体撞击留下的痕迹。这些环形山，记录着太阳系漫长的历史。'},
  {name:'太阳的引力', target:'sun', title:'是什么把行星留在太阳身边？', copy:'太阳的引力牵引着行星，使它们沿轨道绕行。拉远镜头，看看八颗行星组成的太阳系，找到地球在其中的位置。', action:'展开太阳系', back:'回到太阳近景', alternate:'solar', narration:'太阳不只带来光和热。它的引力牵引着行星，让它们沿轨道绕行。现在拉远镜头，看看我们在这个行星家族中的位置。'},
  {name:'气态巨行星', target:'jupiter', title:'木星和土星有什么不同？', copy:'木星与土星都主要由氢和氦组成。木星拥有层层云带，土星的巨大光环则由无数冰粒和岩石颗粒组成。', action:'看看土星光环', back:'返回木星', alternate:'saturn', narration:'木星和土星都是气态巨行星，主要由氢和氦组成。看看木星层层相间的云带，再前往土星，欣赏冰粒与岩石围成的光环。'},
  {name:'更远的星空', target:'neptune', title:'越过海王星，太阳系就结束了吗？', copy:'海王星是最远的行星，外侧仍有柯伊伯带等遥远区域。继续拉远，看看太阳系在银河中的位置：我们的旅程才刚刚开始。', action:'拉远到银河', back:'返回海王星', alternate:'galaxy', narration:'海王星是距离太阳最远的行星，但太阳系并没有在这里结束。更外侧还有柯伊伯带。继续拉远，看看太阳系在银河中的位置。'},
  {name:'星系的样貌', target:'atlas', title:'每座星系都长得一样吗？', copy:'旋涡、椭圆与不规则星系有着不同的恒星分布。图鉴中的 14 座星系展示这些形态；排列和颜色经过示意处理，不代表真实距离。进入仙女座，看看它的明亮中心与旋臂。', action:'进入仙女座', back:'返回星系图鉴', alternate:'andromeda', narration:'星系并不都和银河系长得一样。它们可以有旋臂，也可以是椭圆形，或拥有不规则的轮廓。图鉴是探索地图，不是真实距离的星图。现在进入仙女座星系，看看它的中心和旋臂。'},
  {name:'太阳之外的世界', target:'proxima-b', title:'适居带里一定有生命吗？', copy:'比邻星 b 与 TRAPPIST-1 e 都是已确认的系外行星。适居带描述液态水可能存在的条件，并不证明那里有海洋或生命。这里的地貌与颜色是艺术想象，我们仍在寻找真实环境的证据。', action:'前往 TRAPPIST-1 e', back:'返回比邻星 b', alternate:'trappist-1-e', narration:'围绕其他恒星运行的行星，叫作系外行星。比邻星 b 和 TRAPPIST-1 e 都已获确认。但是，位于适居带并不证明那里有海洋或生命。你看到的地貌和颜色，是帮助理解的艺术示意。'},
  {name:'看不见的引力', target:'sagittarius-a', title:'黑洞看不见，如何发现它？', copy:'天文学家研究附近恒星的运动，以及周围高温物质发出的辐射，寻找黑洞的证据。银河中心的人马座 A* 是超大质量黑洞；M33 X-7 则是恒星级黑洞双星。光环与吸积盘为示意。', action:'比较 M33 X-7', back:'返回人马座 A*', alternate:'m33-x7', narration:'黑洞本身不会发出可见光。我们可以研究附近恒星的运动，以及黑洞周围高温物质的辐射。银河中心的人马座 A 星是超大质量黑洞，而 M33 X-7 是恒星级黑洞双星，并非三角座星系的中央黑洞。'},
  {name:'人类的远方', target:'jwst', title:'望远镜与探测器如何探索宇宙？', copy:'詹姆斯·韦伯太空望远镜在日地 L2 附近收集红外光，多层遮阳板帮助仪器保持低温。旅行者 1 号则穿越了日球层顶，探测星际介质。两种任务让我们用不同方式认识远方；模型不显示实时位置。', action:'看看旅行者 1 号', back:'返回詹姆斯·韦伯太空望远镜', alternate:'voyager', narration:'詹姆斯·韦伯太空望远镜用红外光观察宇宙，遮阳板帮助精密仪器保持低温。旅行者一号则穿越了日球层顶，进入星际介质。进入星际空间，并不等于离开太阳全部的引力影响。这里展示的是简化模型，不是实时航天器位置。'},
  {name:'运动与视角', target:'trajectories', title:'同一颗行星，为什么有不同轨迹？', copy:'以太阳为参照，行星绕太阳运行；换到银河参照系，还要考虑太阳本身的运动。切换参照系和轨迹长度，比较同一段运动。此处使用简化模型，轨迹不能当作精确星历。', action:'回看太阳系', back:'返回运动轨迹', alternate:'solar', narration:'描述运动，需要先选择参照系。以太阳为参照，我们看到行星的绕行；换到银河参照系，还要考虑太阳本身的运动。试着切换观察方式，比较轨迹形状。这是教学用的简化模型，不是精确星历。'},
  {name:'宇宙大爆炸', target:'big-bang', sceneTarget:'atlas', title:'宇宙大爆炸，是一次普通的爆炸吗？', copy:'约 138 亿年前，宇宙曾处于极热、极密的早期状态，随后持续膨胀并冷却。大爆炸描述空间本身的演化；恒星、星系和行星是在后来逐渐形成的。展开下方知识，沿时间线认识早期宇宙。', action:'看看今天的银河', back:'返回星系图鉴', alternate:'galaxy', narration:'宇宙大爆炸，是一次普通的爆炸吗？大爆炸理论描述宇宙从极热、极密的早期状态，逐渐膨胀并冷却的过程。根据观测和宇宙学模型，宇宙年龄约为一百三十八亿年。它不是一颗炸弹在空旷的空间中炸开，而是空间本身在膨胀。最初几分钟，形成了氦等轻元素的原子核；约三十八万年后，光才更容易穿行宇宙。后来，引力让物质逐渐聚集，形成恒星与星系。宇宙膨胀、宇宙微波背景和轻元素的丰度，是支持这一模型的重要证据。眼前的星系图鉴展示今天的星系形态，不是大爆炸过程的模拟。'},
];

export function createGuide({state,goTo,composition,syncToggles,toast,reducedMotion,observe,captureView,restoreView,narration=getNarrationPlayer()}) {
  const $=id=>document.getElementById(id);
  const buttonText=(id,text)=>{const button=$(id);(button.querySelector('span')||button).textContent=text;};
  const panel=$('guide-panel'), rail=panel.querySelector('.guide-chapters');
  const lesson=$('guide-lesson'), lessonContent=$('guide-lesson-content'), lessonToggle=$('toggle-guide-lesson');
  const reading=document.createElement('div');reading.id='guide-reading';
  lessonContent.append(reading);
  let readingTarget=null;
  const isMobile=()=>isPhoneLayout();
  const announcePanel=name=>{if(isMobile())document.dispatchEvent(new CustomEvent('mobile-open-panel',{detail:{panel:name}}));};
  const chapterToggle=document.createElement('button');
  chapterToggle.type='button';chapterToggle.className='guide-chapters-toggle';chapterToggle.id='toggle-guide-chapters';
  chapterToggle.hidden=true;rail.id='guide-chapters';
  chapterToggle.setAttribute('aria-controls',rail.id);chapterToggle.setAttribute('aria-expanded','false');
  panel.querySelector('.guide-topbar').append(chapterToggle);
  rail.querySelectorAll('[data-chapter]').forEach(button=>button.remove());
  const railNote=rail.querySelector('.guide-rail-note');
  const buttons=CHAPTERS.map((chapter,index)=>{
    const button=document.createElement('button');
    button.type='button';button.dataset.chapter=String(index);
    button.innerHTML=`<span class="chapter-number">${String(index+1).padStart(2,'0')}</span><span>${chapter.name}</span><svg><use href="#i-chevron"/></svg>`;
    rail.insertBefore(button,railNote);
    return button;
  });
  $('guide-progress').max=CHAPTERS.length;
  let saved=null, alternate=false, speechToken=0, lessonExpanded=true, chaptersExpanded=false;
  const dockPreference=createDockPreference({isMobile,onChange:collapsed=>setLessonExpanded(!collapsed,{announce:false,stop:state.guide,remember:false})});

  function setChaptersExpanded(expanded,{announce=true}={}) {
    if(!expanded&&rail.contains(document.activeElement)&&isMobile())chapterToggle.focus({preventScroll:true});
    chaptersExpanded=Boolean(expanded);
    rail.hidden=isMobile()&&!chaptersExpanded;
    panel.classList.toggle('mobile-guide-chapters-open',isMobile()&&chaptersExpanded);
    chapterToggle.setAttribute('aria-expanded',String(isMobile()&&chaptersExpanded));
    chapterToggle.setAttribute('aria-label',chaptersExpanded?'收起导览章节':'展开导览章节');
    if(isMobile()&&chaptersExpanded&&announce)announcePanel('guide-chapters');
    if(state.guide)composition();
  }
  function syncMobileLayout() {
    const title=$('guide-title');
    chapterToggle.hidden=!isMobile();
    if(isMobile()&&title.parentElement===lessonContent)lesson.insertBefore(title,lessonContent);
    else if(!isMobile()&&title.parentElement===lesson)lessonContent.insertBefore(title,lessonContent.children[0]||null);
    setChaptersExpanded(false,{announce:false});
  }

  function narrationState(status) {
    buttonText('guide-narrate',status==='loading'?'取消加载':status==='playing'?'停止讲解':'听讲解');
    $('guide-narrate').setAttribute('aria-pressed',String(status!=='idle'));
    $('guide-narrate').setAttribute('aria-busy',String(status==='loading'));
  }

  function stopNarration() {
    speechToken++;
    narration.stop('guide');narrationState('idle');
  }
  function setLessonExpanded(expanded,{announce=true,stop=true,remember=true}={}) {
    if(!expanded&&(lessonContent.contains(document.activeElement)||$('guide-title')===document.activeElement))lessonToggle.focus({preventScroll:true});
    lessonExpanded=expanded;
    if(remember)dockPreference.set(!expanded);
    lessonContent.hidden=!expanded;
    lesson.scrollTop=0;
    lesson.classList.toggle('is-collapsed',!expanded);
    lessonToggle.setAttribute('aria-expanded',String(expanded));
    lessonToggle.setAttribute('aria-label',expanded?'收起导览卡片':'展开导览卡片');
    buttonText('toggle-guide-lesson',expanded?'收起':'展开');
    if(!expanded&&stop)stopNarration();
    if(expanded&&announce)announcePanel('guide-lesson');
    if(state.guide)composition();
  }
  function render() {
    const chapter=CHAPTERS[state.chapter];
    $('guide-kicker').textContent=`第 ${String(state.chapter+1).padStart(2,'0')} 站 / ${chapter.name}`;
    $('guide-title').textContent=chapter.title;
    chapterToggle.textContent=`章节 ${state.chapter+1} / ${CHAPTERS.length}`;
    $('guide-copy').textContent=chapter.copy;
    $('guide-topic-video')?.remove();
    const videoButton=createTopicVideoButton(`guide/${chapter.target}`,chapter.name);
    if(videoButton){videoButton.id='guide-topic-video';panel.querySelector('.guide-lesson-actions').append(videoButton);}
    if(readingTarget!==chapter.target){
      readingTarget=chapter.target;
      reading.replaceChildren(createLearningReading(GUIDE_KNOWLEDGE[chapter.target],{
        onToggle:()=>{if(state.guide)composition();},narration,owner:'guide',key:`learning/guide/${chapter.target}`
      }));
      lesson.scrollTop=0;
      if(isMobile())lessonContent.scrollTop=0;
    }
    buttonText('guide-action',alternate?chapter.back:chapter.action);
    $('guide-action').querySelector('use')?.setAttribute('href',state.chapter===0?'#i-night':state.chapter===3?'#i-orbit':'#i-eye');
    $('guide-action').setAttribute('aria-pressed',String(alternate));
    $('guide-counter').textContent=`章节 ${String(state.chapter+1).padStart(2,'0')} / ${String(CHAPTERS.length).padStart(2,'0')}`;
    $('guide-progress').value=state.chapter+1;
    $('guide-progress').textContent=`${state.chapter+1} / ${CHAPTERS.length}`;
    $('guide-progress').setAttribute('aria-label',`导览进度，第 ${state.chapter+1} 站，共 ${CHAPTERS.length} 站`);
    $('guide-prev').disabled=state.chapter===0;
    buttonText('guide-next',state.chapter===CHAPTERS.length-1?'完成导览':`下一站：${CHAPTERS[state.chapter+1].name}`);
    buttons.forEach(button=>{
      const active=Number(button.dataset.chapter)===state.chapter;
      button.classList.toggle('active',active);
      if(active)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');
    });
  }
  function chapter(index,{focus=true}={}) {
    if(!state.guide||index<0||index>=CHAPTERS.length)return;
    stopNarration();alternate=false;state.chapter=index;
    state.speed=1;state.paused=reducedMotion;state.orbits=true;
    goTo(CHAPTERS[index].sceneTarget||CHAPTERS[index].target);syncToggles();render();
    if(isMobile())setChaptersExpanded(false,{announce:false});
    if(focus)(lessonExpanded?$('guide-title'):lessonToggle).focus({preventScroll:true});
    // Keep the selected chapter reachable in the compact mobile rail.
    if(!rail.hidden)buttons[index].scrollIntoView({block:'nearest',inline:'nearest',behavior:reducedMotion?'instant':'smooth'});
  }
  function enter() {
    if(state.guide)return;
    saved={target:state.target,paused:state.paused,speed:state.speed,orbits:state.orbits,labels:state.labels,view:captureView?.()};
    syncMobileLayout();
    setLessonExpanded(!dockPreference.read(),{remember:false});
    state.guide=true;document.body.classList.add('guide-active');panel.hidden=false;
    $('enter-guide').setAttribute('aria-expanded','true');
    chapter(0);composition();
  }
  function exit({finished=false}={}) {
    if(!state.guide)return;
    stopNarration();state.guide=false;
    setChaptersExpanded(false,{announce:false});
    document.body.classList.remove('guide-active');panel.hidden=true;
    $('enter-guide').setAttribute('aria-expanded','false');
    if(saved){
      const prior=saved;saved=null;
      state.paused=prior.paused;state.speed=prior.speed;state.orbits=prior.orbits;state.labels=prior.labels;
      goTo(prior.target,{mode:prior.view?.mode});
      if(prior.view!==undefined)restoreView?.(prior.view);
    }
    syncToggles();composition();$('enter-guide').focus({preventScroll:true});
    if(finished)toast(`${CHAPTERS.length} 站导览已完成 · 继续你的自由漫游`);
  }
  function action() {
    if(!state.guide)return;
    alternate=!alternate;
    const current=CHAPTERS[state.chapter];
    if(!alternate)goTo(current.sceneTarget||current.target);
    else if(current.alternate==='night'||current.alternate==='moon-close')observe(current.alternate);
    else goTo(current.alternate);
    render();
  }
  function reframe() {
    if(!state.guide)return;
    const current=CHAPTERS[state.chapter];
    if(!alternate)goTo(current.sceneTarget||current.target);
    else if(current.alternate==='night'||current.alternate==='moon-close'){
      goTo(current.sceneTarget||current.target);observe(current.alternate);
    }else goTo(current.alternate);
  }
  function narrate() {
    const token=++speechToken;
    narration.toggle({owner:'guide',key:`guide/${CHAPTERS[state.chapter].target}`,
      onState:status=>{if(token===speechToken)narrationState(status);},
      onError:message=>{if(token===speechToken)toast(message);}});
  }
  $('enter-guide').addEventListener('click',enter);
  $('enter-guide').setAttribute('aria-expanded','false');
  $('enter-guide').setAttribute('aria-controls','guide-panel');
  $('exit-guide').addEventListener('click',()=>exit());
  buttons.forEach(button=>button.addEventListener('click',()=>{chapter(Number(button.dataset.chapter));if(isMobile())setLessonExpanded(!dockPreference.read(),{remember:false});}));
  $('guide-prev').addEventListener('click',()=>chapter(state.chapter-1));
  $('guide-next').addEventListener('click',()=>state.chapter===CHAPTERS.length-1?exit({finished:true}):chapter(state.chapter+1));
  $('guide-action').addEventListener('click',action);
  $('guide-narrate').addEventListener('click',narrate);
  lessonToggle.addEventListener('click',()=>setLessonExpanded(!lessonExpanded));
  chapterToggle.addEventListener('click',()=>setChaptersExpanded(!chaptersExpanded));
  document.addEventListener('mobile-open-panel',event=>{
    if(!isMobile()||!event.detail?.panel)return;
    if(event.detail.panel!=='guide-chapters')setChaptersExpanded(false,{announce:false});
    if(state.guide&&event.detail.panel!=='guide-lesson')setLessonExpanded(false,{announce:false,stop:false,remember:false});
  });
  let mobileLayout=isMobile();
  window.addEventListener('resize',()=>{
    if(mobileLayout===isMobile())return;
    mobileLayout=isMobile();
    setLessonExpanded(!dockPreference.read(),{announce:false,stop:false,remember:false});
    syncMobileLayout();if(state.guide)composition();
  });
  window.addEventListener('pagehide',stopNarration);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopNarration();});
  render();syncMobileLayout();
  return {enter,exit,reframe,reset:()=>chapter(state.chapter,{focus:false})};
}
