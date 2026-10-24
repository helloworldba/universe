// Idealized lunar phase teaching model. No current-date ephemeris or eclipses.
// Reference: https://science.nasa.gov/moon/moon-phases/
export const SYNODIC_MONTH_DAYS=29.53059;
export const MOON_DEMO_DAYS_PER_SECOND=.22;
const TAU=Math.PI*2,DEG=Math.PI/180;
const wrap=(n,max)=>((n%max)+max)%max;
export const MOON_PHASES=Object.freeze([
  {id:'new',name:'新月',angle:0,description:'月球位于地球朝向太阳的一侧。被照亮的半球大多背向我们。'},
  {id:'waxing-crescent',name:'蛾眉月',angle:45,description:'从地球看，亮面逐渐增多。月面北方朝上时，右侧先亮起来。'},
  {id:'first-quarter',name:'上弦月',angle:90,description:'从地球看到的月面约有一半被照亮，月相正走向满月。'},
  {id:'waxing-gibbous',name:'盈凸月',angle:135,description:'月面亮起的部分已经超过一半，仍在逐渐增多。'},
  {id:'full',name:'满月',angle:180,description:'地球位于太阳和月球之间的方向上，我们几乎看见整个明亮的月面。'},
  {id:'waning-gibbous',name:'亏凸月',angle:225,description:'满月之后，地球所见的亮面逐渐减少。'},
  {id:'last-quarter',name:'下弦月',angle:270,description:'月面再次约有一半被照亮；月面北方朝上时，这次是左半边。'},
  {id:'waning-crescent',name:'残月',angle:315,description:'月面只剩一弯亮边，随后进入下一次新月。'}
]);

export function normalizedPhaseAngle(angle){return wrap(Number.isFinite(angle)?angle:0,360);}
export function illuminatedFraction(angle){return (1-Math.cos(normalizedPhaseAngle(angle)*DEG))/2;}
export function moonAgeAtAngle(angle){return normalizedPhaseAngle(angle)*SYNODIC_MONTH_DAYS/360;}
export function angleAtMoonAge(age){return normalizedPhaseAngle(age/SYNODIC_MONTH_DAYS*360);}
export function phaseOrbitPosition(angle,radius=5.2){const a=normalizedPhaseAngle(angle)*DEG;return {x:-radius*Math.cos(a),y:0,z:radius*Math.sin(a)};}
// Fixed observer looking toward -Z: +X is screen-right. Waxing lights the right.
export function observerSunDirection(angle){const a=normalizedPhaseAngle(angle)*DEG;return {x:Math.sin(a),y:0,z:-Math.cos(a)};}
export function phaseAtAngle(angle){
  const a=normalizedPhaseAngle(angle),epsilon=.75;
  if(a<epsilon||a>360-epsilon)return MOON_PHASES[0];
  if(Math.abs(a-90)<epsilon)return MOON_PHASES[2];
  if(Math.abs(a-180)<epsilon)return MOON_PHASES[4];
  if(Math.abs(a-270)<epsilon)return MOON_PHASES[6];
  return MOON_PHASES[a<90?1:a<180?3:a<270?5:7];
}

// Polygon of the illuminated part of an orthographic disk. Used by the eight
// small preset icons only; the large views are live shaded Three.js spheres.
export function phaseDiscPath(angle,radius=12){
  const a=normalizedPhaseAngle(angle),waxing=a<=180,side=waxing?1:-1,c=Math.cos(a*DEG),points=[];
  for(let i=0;i<=32;i++){const y=-radius+i*radius/16;points.push([side*Math.sqrt(Math.max(0,radius*radius-y*y)),y]);}
  for(let i=32;i>=0;i--){const y=-radius+i*radius/16;points.push([side*c*Math.sqrt(Math.max(0,radius*radius-y*y)),y]);}
  return points.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(3)},${y.toFixed(3)}`).join('')+'Z';
}

export function createMoonPhases({THREE,root,textures={},onVisibilityChange=()=>{},onChange=()=>{}}){
  const group=new THREE.Group();group.name='Lunar phase teaching scene';group.visible=false;root.add(group);
  const spaceGroup=new THREE.Group(),observerGroup=new THREE.Group();group.add(spaceGroup,observerGroup);
  const ownedTextures=[],materials=[],geometries=[];
  let visible=false,view='space',angle=90,autoPlay=true,lastTime=null,disposed=false,renderKey='';
  const sunDirection=new THREE.Vector3(-1,0,0),observerSun=new THREE.Vector3();
  const makeMaterial=(map,sun,tint,{observer=false,radius=1}={})=>{
    const material=new THREE.ShaderMaterial({
      name:'Lunar lesson independent sunlight',uniforms:{surfaceMap:{value:map||null},hasMap:{value:!!map},sunDirection:{value:sun},tint:{value:new THREE.Color(tint)},observerProjection:{value:observer},sphereRadius:{value:radius}},
      vertexShader:`#include <common>
        #include <logdepthbuf_pars_vertex>
        varying vec2 vUv;varying vec3 vNormal;
        void main(){vUv=uv;vNormal=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
        #include <logdepthbuf_vertex>
        }`,
      fragmentShader:`#include <logdepthbuf_pars_fragment>
        uniform sampler2D surfaceMap;uniform bool hasMap;uniform vec3 sunDirection;uniform vec3 tint;uniform bool observerProjection;uniform float sphereRadius;varying vec2 vUv;varying vec3 vNormal;
        void main(){
        #include <logdepthbuf_fragment>
        vec3 surface=hasMap?texture2D(surfaceMap,vUv).rgb:tint;
        vec3 phaseNormal=normalize(vNormal);
        if(observerProjection){
          // The fixed +Z viewer represents a distant Earth observer. Rebuild
          // an orthographic disk normal from the perspective sphere silhouette,
          // so enlarging the model cannot change its apparent phase fraction.
          float d=max(length(cameraPosition)/sphereRadius,1.001);
          vec2 disk=phaseNormal.xy*sqrt(d*d-1.)/max(d-phaseNormal.z,.001);
          phaseNormal=vec3(disk,sqrt(max(0.,1.-dot(disk,disk))));
        }
        float incidence=dot(phaseNormal,normalize(sunDirection));
        float daylight=smoothstep(-.012,.018,incidence);
        vec3 colour=surface*(.024+daylight*(.12+1.36*max(incidence,0.)));
        gl_FragColor=vec4(colour,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        }`
    });materials.push(material);return material;
  };
  const sphere=(radius,material)=>{const geometry=new THREE.SphereGeometry(radius,64,40);geometries.push(geometry);return new THREE.Mesh(geometry,material);};
  const lessonEarth=sphere(1.25,makeMaterial(textures['earth-day.jpg'],sunDirection,0x3c81b3));lessonEarth.rotation.y=2.2;spaceGroup.add(lessonEarth);
  const lessonMoon=sphere(.64,makeMaterial(textures['moon.jpg'],sunDirection,0xbfc3cc));spaceGroup.add(lessonMoon);
  // Space-view lookAt points the Moon's local +Z face toward Earth. Keep that
  // same face toward the fixed +Z observer camera here (tidal locking).
  const observerMoon=sphere(2.15,makeMaterial(textures['moon.jpg'],observerSun,0xbfc3cc,{observer:true,radius:2.15}));observerGroup.add(observerMoon);
  const orbitPoints=Array.from({length:128},(_,i)=>new THREE.Vector3().copy(phaseOrbitPosition(i*360/128)));
  const orbitGeometry=new THREE.BufferGeometry().setFromPoints(orbitPoints);geometries.push(orbitGeometry);
  const orbitMaterial=new THREE.LineBasicMaterial({color:0x76bad5,transparent:true,opacity:.3});materials.push(orbitMaterial);
  const orbitLine=new THREE.LineLoop(orbitGeometry,orbitMaterial);spaceGroup.add(orbitLine);
  const sightGeometry=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]);geometries.push(sightGeometry);
  const sightMaterial=new THREE.LineDashedMaterial({color:0x9bd9ec,transparent:true,opacity:.55,dashSize:.16,gapSize:.13});materials.push(sightMaterial);
  const sightLine=new THREE.Line(sightGeometry,sightMaterial);spaceGroup.add(sightLine);
  for(const z of [-2.7,0,2.7]){
    const arrow=new THREE.ArrowHelper(new THREE.Vector3(1,0,0),new THREE.Vector3(-8.4,0,z),2.5,0xe4b978,.35,.2);spaceGroup.add(arrow);
    // ArrowHelper geometries are cached by Three.js; own only these materials.
    materials.push(arrow.line.material,arrow.cone.material);
  }
  function textSprite(text,colour){
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;
    const context=canvas.getContext('2d');if(!context)return null;
    context.font='500 40px "Microsoft YaHei",sans-serif';context.textAlign='center';context.textBaseline='middle';context.fillStyle=colour;context.fillText(text,256,48);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;ownedTextures.push(texture);
    const material=new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false,depthWrite:false});materials.push(material);
    const sprite=new THREE.Sprite(material);sprite.scale.set(2.35,.44,1);sprite.renderOrder=2;return sprite;
  }
  const earthLabel=textSprite('地球','#b6d8ed'),moonLabel=textSprite('月球','#d9e6f4'),sunLabel=textSprite('太阳光方向','#eccd99');
  if(earthLabel){earthLabel.position.set(0,1.8,0);spaceGroup.add(earthLabel);}
  if(moonLabel)spaceGroup.add(moonLabel);
  if(sunLabel){sunLabel.position.set(-7.2,.8,-3.1);spaceGroup.add(sunLabel);}

  const panel=document.createElement('section');panel.className='moon-phases-panel';panel.hidden=true;panel.setAttribute('aria-labelledby','moon-phases-title');
  panel.innerHTML=`<header class="moon-phases-header"><div><span class="moon-phases-kicker">EARTH · MOON · SUN</span><h2 id="moon-phases-title">月相互动</h2></div><button type="button" class="moon-phases-close" aria-label="关闭月相互动">×</button></header>
    <div class="moon-phases-body"><p class="moon-phases-intro">通常，月球约有一半受太阳照亮。改变地月位置，看看我们能看见多少亮面。</p>
    <div class="moon-view-tabs" role="group" aria-label="月相观察视角"><button type="button" data-moon-view="space" aria-pressed="true">太空视角</button><button type="button" data-moon-view="observer" aria-pressed="false">地球所见</button></div>
    <p class="moon-view-hint"></p><div class="moon-phase-current"><div><span>示意月相</span><strong class="moon-phase-name"></strong></div><div><span>可见月面亮起</span><strong class="moon-illumination"></strong></div></div>
    <div class="moon-phase-presets" role="group" aria-label="选择月相">${MOON_PHASES.map(p=>`<button type="button" data-moon-phase="${p.angle}" aria-pressed="false"><svg viewBox="-15 -15 30 30" aria-hidden="true"><circle r="12" fill="#172536" stroke="#657f99" stroke-width=".6"/><path d="${phaseDiscPath(p.angle)}" fill="#d7e4ed"/></svg><span>${p.name}</span></button>`).join('')}</div>
    <div class="moon-age-heading"><label for="moon-age-range">月龄 · 从新月起算</label><output for="moon-age-range" class="moon-age-value"></output></div><input id="moon-age-range" class="moon-age-range" type="range" min="0" max="${SYNODIC_MONTH_DAYS}" value="${SYNODIC_MONTH_DAYS/4}" step=".02" aria-label="示意月龄，单位天"><div class="moon-age-ticks"><span>新月 · 0 天</span><span>满月 · 14.8 天</span><span>29.5 天</span></div>
    <button type="button" class="moon-demo-toggle" aria-pressed="true"><span class="moon-demo-symbol" aria-hidden="true">Ⅱ</span><span class="moon-demo-label">暂停月相演示</span></button><p class="moon-phase-explanation"></p>
    <div class="moon-geometry-diagram"><svg viewBox="0 0 300 132" role="img" aria-label="太阳光从左侧照来，月球绕地球运行的俯视示意"><defs><marker id="moon-sun-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5" fill="#d9b475"/></marker></defs><path d="M10,55 H71 M10,76 H71" stroke="#d9b475" stroke-width="1.3" marker-end="url(#moon-sun-arrow)"/><text x="13" y="36">太阳光</text><ellipse cx="174" cy="66" rx="66" ry="45" fill="none" stroke="#39516b" stroke-dasharray="3 4"/><line class="moon-diagram-sight" x1="174" y1="66" x2="174" y2="21" stroke="#82c8df" opacity=".7"/><circle cx="174" cy="66" r="11" fill="#4e9dc2"/><text x="161" y="94">地球</text><circle class="moon-diagram-moon" cx="174" cy="21" r="6" fill="#dce6ee"/><text class="moon-diagram-moon-label" x="184" y="25">月球</text></svg></div>
    <details class="moon-science-note"><summary>为什么不是每个月都有日月食？</summary><p>真实月球轨道相对地球绕太阳的轨道平面有倾斜。新月或满月时，三者通常没有准确排成一条直线。</p><p>这里把轨道画在同一平面，专门解释月相，不模拟日月食。大小、距离和演示速度均经调整。</p><span class="moon-science-source">NASA · 月相原理</span></details>
    <p class="moon-model-note">约 29.5 天完成一个月相周期。这里是教学演示，不代表今天的真实月相；演示同时受页面暂停与倍速控制。</p></div>`;
  document.body.append(panel);
  const hero=document.createElement('div');hero.className='moon-phase-hero';hero.hidden=true;hero.innerHTML='<span>LUNAR PERSPECTIVES</span><strong>同一轮月亮</strong><p>换一个位置，看懂阴晴圆缺。</p>';document.body.append(hero);
  const $=selector=>panel.querySelector(selector),all=selector=>[...panel.querySelectorAll(selector)];
  const ageRange=$('.moon-age-range'),ageValue=$('.moon-age-value'),phaseName=$('.moon-phase-name'),illumination=$('.moon-illumination'),description=$('.moon-phase-explanation'),viewHint=$('.moon-view-hint'),demo=$('.moon-demo-toggle');
  const diagramMoon=$('.moon-diagram-moon'),diagramLine=$('.moon-diagram-sight'),diagramLabel=$('.moon-diagram-moon-label');
  function refresh(){
    const a=angle*DEG;lessonMoon.position.copy(phaseOrbitPosition(angle));lessonMoon.lookAt(lessonEarth.position);
    if(moonLabel)moonLabel.position.copy(lessonMoon.position).add(new THREE.Vector3(0,1.05,0));
    observerSun.copy(observerSunDirection(angle));
    const p=sightGeometry.attributes.position;p.setXYZ(1,lessonMoon.position.x,lessonMoon.position.y,lessonMoon.position.z);p.needsUpdate=true;sightLine.computeLineDistances();
    spaceGroup.visible=view==='space';observerGroup.visible=view==='observer';
    const phase=phaseAtAngle(angle),age=moonAgeAtAngle(angle),fraction=illuminatedFraction(angle),key=`${view}:${autoPlay}:${age.toFixed(1)}:${phase.id}:${(fraction*100).toFixed(0)}`;
    if(key===renderKey)return;renderKey=key;
    phaseName.textContent=phase.name;illumination.textContent=`${(fraction*100).toFixed(0)}%`;ageValue.textContent=`${age.toFixed(1)} 天`;ageRange.value=age.toFixed(3);ageRange.setAttribute('aria-valuetext',`${age.toFixed(1)} 天，${phase.name}，亮面 ${(fraction*100).toFixed(0)}%`);description.textContent=phase.description;
    ageRange.style.setProperty('--moon-progress',`${angle/3.6}%`);
    viewHint.textContent=view==='space'?'拖动查看地月位置；金色箭头表示太阳光方向。':'从地球远望月球，缩放只改变画面大小。月面北方朝上示意，实际倾斜角会随地点和时间变化。';
    demo.setAttribute('aria-pressed',String(autoPlay));$('.moon-demo-symbol').textContent=autoPlay?'Ⅱ':'▷';$('.moon-demo-label').textContent=autoPlay?'暂停月相演示':'播放月相演示';
    for(const button of all('[data-moon-phase]')){const d=Math.abs(Number(button.dataset.moonPhase)-angle);button.setAttribute('aria-pressed',String(Math.min(d,360-d)<.75));}
    for(const button of all('[data-moon-view]'))button.setAttribute('aria-pressed',String(button.dataset.moonView===view));
    const x=174-66*Math.cos(a),y=66-45*Math.sin(a);diagramMoon.setAttribute('cx',x.toFixed(2));diagramMoon.setAttribute('cy',y.toFixed(2));diagramLine.setAttribute('x2',x.toFixed(2));diagramLine.setAttribute('y2',y.toFixed(2));diagramLabel.setAttribute('x',(x+9).toFixed(2));diagramLabel.setAttribute('y',(y+4).toFixed(2));
    panel.dataset.phase=phase.id;panel.dataset.view=view;panel.dataset.illuminated=fraction.toFixed(5);panel.dataset.angle=angle.toFixed(3);panel.dataset.playing=String(autoPlay);
  }
  function setPhase(next,{play=false}={}){if(!Number.isFinite(next))return;angle=normalizedPhaseAngle(next);autoPlay=play;refresh();onChange({reason:'phase',cameraChanged:false});}
  function setView(next){if(!['space','observer'].includes(next)||next===view)return;view=next;refresh();onChange({reason:'view',cameraChanged:true});}
  function setAutoPlay(value){autoPlay=Boolean(value);refresh();onChange({reason:'playback',cameraChanged:false});}
  function setVisible(value){
    value=Boolean(value);if(disposed||value===visible)return;visible=value;lastTime=null;group.visible=value;panel.hidden=!value;hero.hidden=!value;document.body.classList.toggle('moon-phases-active',value);refresh();onVisibilityChange(value);onChange({reason:'visibility',cameraChanged:value});if(value)$('.moon-phases-close').focus({preventScroll:true});else document.getElementById('open-moon-phases')?.focus({preventScroll:true});
  }
  function update(time,{orbits=true,labels=true}={}){
    orbitLine.visible=sightLine.visible=Boolean(orbits);
    for(const label of [earthLabel,moonLabel,sunLabel])if(label)label.visible=Boolean(labels);
    if(!Number.isFinite(time))return;if(!visible){lastTime=null;return;}
    if(lastTime!==null&&autoPlay){const dt=Math.max(0,time-lastTime);angle=normalizedPhaseAngle(angle+dt*MOON_DEMO_DAYS_PER_SECOND*360/SYNODIC_MONTH_DAYS);}
    lastTime=time;refresh();
  }
  $('.moon-phases-close').addEventListener('click',()=>setVisible(false));
  panel.addEventListener('keydown',event=>{if(event.key==='Escape'&&visible){event.preventDefault();setVisible(false);}});
  for(const button of all('[data-moon-phase]'))button.addEventListener('click',()=>setPhase(Number(button.dataset.moonPhase)));
  for(const button of all('[data-moon-view]'))button.addEventListener('click',()=>setView(button.dataset.moonView));
  ageRange.addEventListener('input',()=>setPhase(angleAtMoonAge(Number(ageRange.value))));demo.addEventListener('click',()=>setAutoPlay(!autoPlay));
  refresh();
  return {
    group,panel,setVisible,isVisible:()=>visible,update,setPhase,setView,setAutoPlay,
    getCameraView({compact=false}={}){return view==='observer'?{position:[0,0,compact?12.8:10.4],target:[0,0,0],minDistance:6,maxDistance:24,allowRotate:false}:{position:compact?[0,17.5,21]:[0,12.6,16.2],target:[-.9,0,0],minDistance:10,maxDistance:40,allowRotate:true};},
    getStatus(){return {visible,view,angle,phase:phaseAtAngle(angle).id,phaseName:phaseAtAngle(angle).name,moonAgeDays:moonAgeAtAngle(angle),illuminatedFraction:illuminatedFraction(angle),autoPlay,model:'illustrative',synodicMonthDays:SYNODIC_MONTH_DAYS};},
    dispose(){if(disposed)return;if(visible)setVisible(false);disposed=true;root.remove(group);panel.remove();hero.remove();for(const geometry of geometries)geometry.dispose();for(const material of materials)material.dispose();for(const texture of ownedTextures)texture.dispose();}
  };
}
