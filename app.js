import * as THREE from 'three';
import { createTextureQueue } from './startup-textures.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createGuide } from './guided-tour.js?v=20261024-phone-landscape-startup';
import { CATALOG } from './catalog.js';
import { createDeepUniverse } from './deep-universe.js?v=20261023-overview';
import { createExplorerUI } from './explorer-interface.js?v=20261024-galaxy-shortcuts';
import { createEarthSense } from './earthsense.js?v=20261023-card-fold-labels';
import { createNearEarth, EARTH_ROTATION_RATE } from './near-earth.js';
import { createDeepSpaceOverview } from './deep-space-overview.js';
import { createDeepSpaceControls } from './deep-space-controls.js';
import { fitDeepSpaceFov } from './deep-space-framing.js';
import { craftViewport, fitCraftView, centerCraftView } from './craft-framing.js?v=20261023-overview';
import { centerMobileAtlas } from './mobile-overview-framing.js?v=20261024-phone-center';
import { createEarthMaterial, createAtmosphere, createEarthEnvironment, updateCityLights, EARTH_INITIAL_ROTATION } from './earth-environment.js';
import { createRenderScheduler } from './render-scheduler.js';
import { createMoonPhases } from './moon-phases.js';
import { surfaceCoordinates } from './earth-surface.js';
import { EARTH_CONTINENTS, getContinent } from './earth-continents.js';
import { createContinentOverlay } from './continent-overlay.js';
import { createEarthNavigation } from './earth-navigation.js';
import { createSolarNavigation } from './solar-navigation.js';
import { createAmbientFlybys } from './ambient-flybys.js';
import { createEarthExperienceUI } from './earth-experience.js';
import { CONSTELLATIONS } from './constellation-data.js';
import { createConstellationScene } from './constellation-scene.js';
import { createConstellationUI } from './constellation-ui.js?v=20261024-phone-landscape-startup';
import { createBlackHoleScene } from './black-hole-scene.js';
import { createBlackHoleUI } from './black-hole-ui.js?v=20261024-narration-return';
import { findBlackHole } from './black-hole-data.js';
import { createMobileLayout } from './mobile-layout.js?v=20261024-author-statement';
import { createMobileWorkspace } from './mobile-workspace.js?v=20261024-keyboard-layout';
import { isPhoneLayout, mobileSceneViewport } from './phone-layout.js';
import { createPageFullscreen } from './page-fullscreen.js?v=20261024-portrait-fullscreen';

// EXPLORE THE UNIVERSE is an original local explorer. Positions, sizes and speeds are illustrative.
const $ = id => document.getElementById(id);
$('loading').dataset.state = 'textures';
$('loading-message').textContent = '正在准备星空贴图…';
const mobile = () => isPhoneLayout();
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const reducedMotion = motionPreference.matches;
const DATA = {
  sun: { name:'太阳', en:'THE SUN', type:'太阳系 / 恒星', description:'一颗平凡却独一无二的恒星。它将光与热送往八颗行星，也照亮了我们关于宇宙的想象。', size:'1,392,700 km', period:'约 2.3 亿年¹', color:'#ffc16b', radius:4.1, orbit:0, days:1, texture:'sun.jpg' },
  mercury: { name:'水星', en:'MERCURY', type:'太阳系 / 类地行星', description:'最靠近太阳的岩石世界。陨石坑记录着漫长岁月，白昼与黑夜之间，是截然不同的温度。', size:'4,879 km', period:'87.97 天', color:'#b7ada3', radius:.62, orbit:10, days:88, texture:'mercury.jpg' },
  venus: { name:'金星', en:'VENUS', type:'太阳系 / 类地行星', description:'厚厚的云层包裹着这颗明亮的行星。远看温柔的晨星，地表却是一片炽热而高压的世界。', size:'12,104 km', period:'224.70 天', color:'#dfc18a', radius:.95, orbit:15, days:225, texture:'venus.jpg' },
  earth: { name:'地球', en:'EARTH', type:'太阳系 / 类地行星', description:'从我们的家园，向更远的星空出发。', size:'12,742 km', period:'365.25 天', color:'#82caff', radius:1, orbit:21, days:365, texture:'earth-day.jpg' },
  moon: { name:'月球', en:'THE MOON', type:'地月系统 / 天然卫星', description:'一片安静的灰色荒原，陪伴地球走过数十亿年。环形山与月海，保存着太阳系早年的记忆。', size:'3,475 km', period:'27.32 天²', color:'#c7c9ca', radius:.78, orbit:0, days:27, texture:'moon.jpg' },
  mars: { name:'火星', en:'MARS', type:'太阳系 / 类地行星', description:'红色沙尘之下，藏着河流与海洋的古老线索。人类的探测器正在这里，寻找另一个世界的故事。', size:'6,779 km', period:'686.98 天', color:'#e29b7b', radius:.78, orbit:28, days:687, texture:'mars.jpg' },
  jupiter: { name:'木星', en:'JUPITER', type:'太阳系 / 气态巨行星', description:'云带像丝绸一样环绕着这位行星之王。巨大的风暴跨越数个世纪，在深不可测的大气中旋转。', size:'139,820 km', period:'11.86 年', color:'#d7baa0', radius:2.55, orbit:40, days:4333, texture:'jupiter.jpg' },
  saturn: { name:'土星', en:'SATURN', type:'太阳系 / 气态巨行星', description:'无数冰粒与岩屑，围成太阳系最优雅的光环。靠近一些，看看这颗被星环拥抱的世界。', size:'116,460 km', period:'29.45 年', color:'#dfcc9e', radius:2.16, orbit:53, days:10759, texture:'saturn.jpg' },
  uranus: { name:'天王星', en:'URANUS', type:'太阳系 / 冰巨行星', description:'淡青色的大气之下，是遥远而寒冷的冰巨星。它几乎侧躺着绕太阳运行，经历极端漫长的季节。', size:'50,724 km', period:'84.02 年', color:'#9dd9df', radius:1.53, orbit:66, days:30687, texture:'uranus.jpg' },
  neptune: { name:'海王星', en:'NEPTUNE', type:'太阳系 / 冰巨行星', description:'在阳光渐弱的远方，深蓝色的海王星仍被强风席卷。越过它，向更辽阔的星空出发。', size:'49,244 km', period:'164.79 年', color:'#668bff', radius:1.46, orbit:79, days:60190, texture:'neptune.jpg' },
};
const SOLAR_IDS = ['sun','mercury','venus','earth','mars','jupiter','saturn','uranus','neptune'];
// Reference display proportions, independent of the factual catalogue and the
// Earth / near-orbit scene. A common unit scale preserves every size ratio.
const SOLAR_VIEW = {
  scale:79/28.2,
  overviewTarget:[1.8,0,0],
  overviewOffset:[32.2,20.08733564,49.76443456],
  focusDirection:[8.6,4.39642233,8.98005961],
  bodies:{
    sun:{radius:2.72,orbit:0,start:0,rate:0,spin:.0462,tilt:.32},
    mercury:{radius:.34,orbit:4.55,start:1.2,rate:1.62,spin:.0272,tilt:.03},
    venus:{radius:.58,orbit:6.45,start:4.1,rate:1.18,spin:-.0192,tilt:2.8},
    earth:{radius:.68,orbit:8.65,start:5,rate:1,spin:.32,tilt:.41},
    mars:{radius:.46,orbit:10.85,start:2.45,rate:.81,spin:.304,tilt:.44},
    jupiter:{radius:1.58,orbit:15.2,start:3.6,rate:.43,spin:.56,tilt:.05},
    saturn:{radius:1.32,orbit:19.7,start:.82,rate:.29,spin:.48,tilt:.47},
    uranus:{radius:.94,orbit:24,start:5.75,rate:.19,spin:.352,tilt:1.7},
    neptune:{radius:.9,orbit:28.2,start:2.1,rate:.14,spin:.368,tilt:.5},
    moon:{radius:.18,orbit:1.32,start:0,rate:1.9/.22,spin:.012,tilt:0},
  },
};
const SOLAR_FACTS = {
  sun:['太阳主要由氢和氦组成，核心通过核聚变释放能量。','太阳绕银河系中心运行，带着整个太阳系一同前行。'],
  mercury:['水星几乎没有能够保温的稠密大气。','这里的陨石坑记录了岩石世界的撞击历史。'],
  venus:['厚厚的二氧化碳大气造成强烈的温室效应。','金星的自转方向与大多数行星相反。'],
  earth:['液态海洋、大气与磁场共同塑造了我们的家园。','转动视角观察晨昏线：地球自转带来昼夜交替。'],
  moon:['月海是古老熔岩形成的平原，并不是液态海洋。','月球自转与绕地球公转同步，因此总以近乎同一面朝向地球。'],
  mars:['地表红色主要来自含铁矿物的氧化。','古代河道与沉积物为火星曾经存在液态水提供线索。'],
  jupiter:['木星没有像地球那样坚实的可站立表面。','大红斑是一场巨大的风暴；其形状与尺度会变化。'],
  saturn:['光环由大量冰粒与岩屑组成，并不是一整块圆盘。','在近景里拖动视角，可以从不同方向观察光环。'],
  uranus:['天王星自转轴倾角很大，看上去像侧躺着公转。','大气中的甲烷会吸收红光，使其呈现蓝绿色调。'],
  neptune:['遥远并不意味着平静：海王星的大气中有强烈的风。','海王星轨道之外还有柯伊伯带等太阳系区域。'],
};
const catalog={...CATALOG};
for(const [id,d] of Object.entries(DATA))catalog[id]={...d,id,kind:id==='sun'?'star':id==='moon'?'satellite':'planet',parent:id==='moon'?'earth':'solar',parentGalaxy:'galaxy',facts:SOLAR_FACTS[id],modelStatus:'贴图与模型用于教学；大小、距离与速度不按真实比例。',source:{label:'NASA · 太阳系',url:'https://science.nasa.gov/solar-system/'}};
const state = { mode:'earth', target:'earth', paused:reducedMotion, speed:1, orbits:true, labels:true, deepSpaceCraft:false, ui:true, loaded:false, elapsed:0, textureFailures:[], guide:false, chapter:0 };
const canvas = $('universe');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true, logarithmicDepthBuffer:true, powerPreference:mobile()?'low-power':'default' });
} catch (error) {
  $('loading-message').textContent = '浏览器无法启动 3D 渲染。请开启硬件加速，或使用更新版本的浏览器重试。';
  throw error;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, mobile() ? 1.5 : 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
const scene = new THREE.Scene();
scene.background = null;
renderer.setClearColor(0x020611, 0);
const camera = new THREE.PerspectiveCamera(43, innerWidth / innerHeight, .015, 6000);
camera.position.set(0, 1.3, mobile() ? 24.5 : 15.6);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = .065;
controls.enablePan = false;
controls.rotateSpeed = .45;
controls.zoomSpeed = .8;
controls.minDistance = 3.45;
controls.maxDistance = 54;
const detailRoot = new THREE.Group();
const solarRoot = new THREE.Group();
const galaxyRoot = new THREE.Group();
scene.add(detailRoot, solarRoot, galaxyRoot);
solarRoot.visible = galaxyRoot.visible = false;
scene.add(new THREE.AmbientLight(0x7e9cce, .52));
const sunlight = new THREE.DirectionalLight(0xfff1df, 2.6);
sunlight.position.set(-12, 7, 12);
detailRoot.add(sunlight);
const solarLight = new THREE.PointLight(0xffe9d1, 42, 0, 1);
solarRoot.add(solarLight);
const softSolarLight = new THREE.AmbientLight(0x8b9eb4,.32);
solarRoot.add(softSolarLight);
const textures = {};
const solarBodies = {};
const labelItems = [];
const orbitLines = [];
const spinObjects = [];
let earth, clouds, earthAtmosphere, moon, moonOrbit, station, nearEarth, galaxySun;
let deepSpaceOverview=null,deepSpaceControls=null;
let flight = null;
let following = null;
const lastFollowPosition = new THREE.Vector3();
const lastFollowRotation=new THREE.Quaternion(),currentFollowRotation=new THREE.Quaternion(),followRotationDelta=new THREE.Quaternion();
const temp = new THREE.Vector3();
const worldPos = new THREE.Vector3();
let toastTimer, hudTime = 0;
let explorerUI,earthSense,earthEnvironment,moonPhases,deepUniverse,deepFocus=null,deepFraming=null,craftViewRect=null,renderScheduler=null;
let continentOverlay=null,continentFollow=null;
let earthNavigation=null,earthExperience='roam',earthRoamSnapshot=null,earthSessionTransition=false;
let solarNavigation=null;
state.solarNearOrbit=false;
let earthExperienceUI=null,lastSenseSection='continents',roamAction='night';
let constellationScene=null,constellationUI=null,constellationId='orion';
let blackHoleScene=null,blackHoleUI=null,blackHoleId='sgr-a';
let closingMoonForNavigation=false;
const earthSunDirection=new THREE.Vector3(-.83,.28,.47).normalize();
let layoutDirty=true,labelTime=0;
function invalidate(){renderScheduler?.invalidate();}
let qualityMode='auto',qualityRatio=Math.min(devicePixelRatio,mobile()?1.5:1.75),slowFrames=0,qualityWindow=0,qualityFrames=0;

function seeded(seed=42) {
  return () => { seed=(seed*1664525+1013904223)>>>0; return seed/4294967296; };
}
function glowTexture() {
  const c=document.createElement('canvas'); c.width=c.height=256;
  const ctx=c.getContext('2d');
  const g=ctx.createRadialGradient(128,128,0,128,128,128);
  g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.08,'rgba(255,255,255,.8)');g.addColorStop(.25,'rgba(255,255,255,.24)');g.addColorStop(.55,'rgba(255,255,255,.055)');g.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=g;ctx.fillRect(0,0,256,256);
  return new THREE.CanvasTexture(c);
}
const glowMap=glowTexture();
const ambientFlybys=createAmbientFlybys({THREE,scene,camera,glowMap,reducedMotion,mobile});
const starCanvas=document.createElement('canvas');starCanvas.width=starCanvas.height=64;
const starContext=starCanvas.getContext('2d'),starGradient=starContext.createRadialGradient(32,32,0,32,32,32);
starGradient.addColorStop(0,'rgba(255,255,255,1)');starGradient.addColorStop(.24,'rgba(255,255,255,1)');starGradient.addColorStop(.55,'rgba(255,255,255,.5)');starGradient.addColorStop(1,'rgba(255,255,255,0)');starContext.fillStyle=starGradient;starContext.fillRect(0,0,64,64);
const starMap=new THREE.CanvasTexture(starCanvas);
function glow(color,size,opacity=1) {
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowMap,color,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity}));
  s.scale.setScalar(size);return s;
}
function backgroundStars() {
  const rand=seeded(784), count=mobile()?220:450, positions=[], colors=[];
  const palette=['#8fd3ff','#d5b5ff','#fff0c0','#8bb1ff'].map(color=>new THREE.Color(color));
  for(let i=0;i<count;i++) {
    const z=rand()*2-1, theta=rand()*Math.PI*2, r=650+rand()*1800, q=Math.sqrt(1-z*z);
    positions.push(Math.cos(theta)*q*r,z*r,Math.sin(theta)*q*r);
    const c=palette[Math.floor(rand()*palette.length)];colors.push(c.r,c.g,c.b);
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  scene.add(new THREE.Points(g,new THREE.PointsMaterial({size:1.2,sizeAttenuation:false,vertexColors:true,transparent:true,opacity:.46,depthWrite:false})));
}
backgroundStars();
function fallbackTexture(color) {
  const c=document.createElement('canvas');c.width=4;c.height=2;const x=c.getContext('2d');x.fillStyle=color;x.fillRect(0,0,4,2);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
const textureNames=[...new Set(Object.values(DATA).map(d=>d.texture)),'earth-night.jpg','earth-clouds.png','saturn-ring.png'];
const loader=new THREE.TextureLoader();
const textureQueue=createTextureQueue({
  names:textureNames,loader,textures,timeout:12000,
  configure:t=>{t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());},
  fallback:name=>fallbackTexture(name.includes('night')?'#000000':name.endsWith('.png')?'rgba(0,0,0,0)':'#6c7781'),
  onFailure:name=>state.textureFailures.push(name),
  onRecovery:name=>{state.textureFailures=state.textureFailures.filter(item=>item!==name);},
  onLoaded:invalidate,
});
// Only the opening Earth view blocks startup. Other maps keep stable placeholders
// until the introductory video finishes or closes; visible destinations get priority.
const openingTextures=['earth-day.jpg','earth-night.jpg','earth-clouds.png','moon.jpg'];
await textureQueue.load(openingTextures,{
  onProgress:(completed,total)=>{$('loading-progress').style.width=`${completed/total*100}%`;$('loading-message').textContent=`正在准备星空 · ${completed} / ${total}`;}
});
let secondarySceneReady=false;
document.addEventListener('universe-load-secondary',()=>{
  void textureQueue.load(textureNames).then(()=>{secondarySceneReady=true;invalidate();});
},{once:true});
$('loading').dataset.state='scene';
$('loading-message').textContent='正在展开宇宙…';

function makeEarth(radius) {
  const sunDirection=radius===3?earthSunDirection:new THREE.Vector3(-.83,.28,.47).normalize();
  return new THREE.Mesh(new THREE.SphereGeometry(radius,96,64),createEarthMaterial({THREE,textures,sunDirection}));
}
function atmosphere(radius,sunDirection=earthSunDirection) {return createAtmosphere({THREE,radius,sunDirection});}
function ringLine(radius,parent,color=0x89c8cc,opacity=.22,tilt=0) {
  const points=[];for(let i=0;i<=160;i++){const a=i/160*Math.PI*2;points.push(new THREE.Vector3(Math.cos(a)*radius,0,Math.sin(a)*radius));}
  const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color,transparent:true,opacity,depthWrite:false}));l.rotation.z=tilt;parent.add(l);orbitLines.push(l);return l;
}
function label(object,text,target,color='#90b6b9',min=0,max=Infinity) {
  const b=document.createElement(target?'button':'span');b.className='scene-label';b.textContent=text;b.style.setProperty('--label-color',color);
  if(target){b.type='button';b.setAttribute('aria-label',`前往${text}`);b.addEventListener('click',()=>goTo(target));}
  $('label-layer').append(b);const item={object,element:b,min,max,target};labelItems.push(item);return item;
}
function basicPlanet(id, radius) {
  const d=DATA[id];const m=new THREE.Mesh(new THREE.SphereGeometry(radius,64,40),new THREE.MeshStandardMaterial({map:textures[d.texture],roughness:1,metalness:0}));
  m.userData.id=id;spinObjects.push(m);return m;
}
function makeRing(radius) {
  const g=new THREE.RingGeometry(radius*1.3,radius*2.25,128,1);
  const uv=g.attributes.uv, p=g.attributes.position;
  for(let i=0;i<p.count;i++){const r=Math.hypot(p.getX(i),p.getY(i));uv.setXY(i,(r-radius*1.3)/(radius*.95),.5);}
  return new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:textures['saturn-ring.png'],side:THREE.DoubleSide,transparent:true,opacity:.88,depthWrite:false,color:0xd9c8a0}));
}
function buildDetail() {
  earth=makeEarth(3);earth.rotation.y=EARTH_INITIAL_ROTATION;detailRoot.add(earth);
  clouds=new THREE.Mesh(new THREE.SphereGeometry(3.014,96,64),new THREE.MeshStandardMaterial({map:textures['earth-clouds.png'],transparent:true,opacity:.42,depthWrite:false,roughness:1}));clouds.rotation.y=earth.rotation.y;detailRoot.add(clouds);earthAtmosphere=atmosphere(3);detailRoot.add(earthAtmosphere);
  moon=basicPlanet('moon',.78);moon.position.set(-8.8,1.5,-6);detailRoot.add(moon);label(moon,'月球','moon','#c9cdd5',4,60);
  moonOrbit=ringLine(10.8,detailRoot,0x8d9da9,.15);moonOrbit.rotation.x=.11;
  nearEarth=createNearEarth({THREE,earthRadius:3,mobile,onChange:invalidate});detailRoot.add(nearEarth.root);station=nearEarth.station;
  for(const item of nearEarth.getLabels()){const l=label(item.object,catalog[item.id]?.name||item.name,item.id,item.color,.2,44);l.nearEarth=true;}
  deepSpaceOverview=createDeepSpaceOverview({THREE,sunDirection:earthSunDirection,mobile,onChange:invalidate});detailRoot.add(deepSpaceOverview.root);
  for(const item of deepSpaceOverview.getLabels()){
    const l=label(item.object,item.name,item.id,item.color,0,Infinity);
    l.priority=item.priority||10;l.deepSpace=true;l.annotation=Boolean(item.annotation);
    l.element.classList.add(item.annotation?'deep-space-annotation':'deep-space-label');
    if(!item.annotation){
      l.avoidRadius=item.id==='jwst'?1.3:1;
      l.leader=document.createElement('span');l.leader.className='deep-space-label-leader';l.leader.hidden=true;l.leader.setAttribute('aria-hidden','true');
      l.leader.style.setProperty('--label-color',item.color);$('label-layer').append(l.leader);
    }
    if(item.description){l.element.title=item.description;l.element.setAttribute('aria-label',item.description);}
  }
}
buildDetail();
function buildSolar() {
  const initial=[0,.8,3.4,2.15,5.45,.33,4.35,2.76,5.78];
  SOLAR_IDS.forEach((id,i)=>{
    const d=DATA[id], group=new THREE.Group(),visual=new THREE.Group();solarRoot.add(group);group.add(visual);
    let mesh;
    if(id==='sun'){
      mesh=new THREE.Mesh(new THREE.SphereGeometry(d.radius,64,48),new THREE.MeshBasicMaterial({map:textures[d.texture],color:0xffce84}));
      visual.add(glow(0xff9c3a,22,.8));visual.add(glow(0xffdd8a,12,.5));
    } else if(id==='earth'){mesh=makeEarth(d.radius);visual.add(atmosphere(d.radius,mesh.material.uniforms.sunDirection.value));}
    else mesh=basicPlanet(id,d.radius);
    visual.add(mesh);mesh.userData.id=id;
    let ring=null;
    if(id==='saturn'){ring=makeRing(d.radius);ring.rotation.x=-Math.PI/2+.3;ring.rotation.y=.12;visual.add(ring);}
    if(id==='uranus')mesh.rotation.z=1.7;
    const angle=initial[i];group.position.set(Math.cos(angle)*d.orbit,0,Math.sin(angle)*d.orbit);
    const orbitLine=d.orbit?ringLine(d.orbit,solarRoot,0x66828e,.27):null;
    const labelItem=label(group,d.name,id,d.color,d.radius*3,550);labelItem.solarBody=id;
    solarBodies[id]={group,visual,mesh,ring,orbitLine,labelItem,angle,baseRadius:d.radius,baseOrbit:d.orbit,radius:d.radius,orbit:d.orbit,rate:id==='sun'?0:.16/Math.pow(d.days/88,.56)};
  });
  // The solar Moon follows Earth's orbit, independently of Earth's axial spin.
  const group=new THREE.Group(),visual=new THREE.Group(),frame=new THREE.Group(),radius=DATA.moon.radius/3,orbit=3.6,angle=.6;
  const mesh=basicPlanet('moon',radius);visual.add(mesh);group.add(visual);frame.add(group);solarBodies.earth.group.add(frame);
  group.position.set(Math.cos(angle)*orbit,0,Math.sin(angle)*orbit);
  const orbitLine=ringLine(orbit,frame,0x8d9da9,.15);
  const labelItem=label(group,DATA.moon.name,'moon',DATA.moon.color,radius*3,550);labelItem.solarBody='moon';
  solarBodies.moon={group,visual,frame,mesh,orbitLine,labelItem,angle,baseRadius:radius,baseOrbit:orbit,radius,orbit,rate:.36};
}
buildSolar();
function buildGalaxy() {
  const random=seeded(7299), count=mobile()?12500:23500, p=[],c=[];
  for(let i=0;i<count;i++){
    const arm=i%4, r=Math.pow(random(),.72)*93, spread=.12+random()*.28;
    const theta=arm*Math.PI/2+r*.058+(random()-.5)*spread*3;
    const bulge=i<count*.19;
    const rad=bulge?Math.pow(random(),1.4)*19:r;
    const angle=bulge?random()*Math.PI*2:theta;
    p.push(Math.cos(angle)*rad,(random()-.5)*(bulge?9:2.7)*(1-rad/115),Math.sin(angle)*rad);
    const color=new THREE.Color().setHSL(bulge?.1:(random()>.17?.59:.09),bulge?.42:.3, .47+random()*.46);c.push(color.r,color.g,color.b);
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));
  const points=new THREE.Points(g,new THREE.PointsMaterial({size:.9,map:starMap,vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:.98}));galaxyRoot.add(points);
  const halo=glow(0xffc486,54,.64);galaxyRoot.add(halo);galaxyRoot.add(glow(0xffe4b5,19,.58));
  for(let i=0;i<62;i++){const arm=i%4,r=16+random()*72,a=arm*Math.PI/2+r*.058;const fog=glow(i%7===0?0xe4a271:0x446ea8,12+random()*17,.16);fog.position.set(Math.cos(a)*r,(random()-.5)*2,Math.sin(a)*r);galaxyRoot.add(fog);}
  galaxySun=new THREE.Object3D();galaxySun.position.set(43,1.3,25);galaxyRoot.add(galaxySun);const pinpoint=glow(0xa5ffe3,2.5,1);pinpoint.position.copy(galaxySun.position);galaxyRoot.add(pinpoint);label(galaxySun,'太阳系 · 猎户臂','solar','#afffe3',0,500);
}
deepUniverse=createDeepUniverse({THREE,glow,starMap,mobile,catalog,textures,onChange:()=>{layoutDirty=true;invalidate();}});
scene.add(deepUniverse.root);deepUniverse.root.visible=false;

function toast(message) {$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3200);}
function showObjectInfo(id) {
  const d=catalog[id];
  if(!d)return;
  canvas.dataset.destination=id;
  canvas.setAttribute('aria-label','可交互的三维宇宙，拖动旋转，滚动缩放；也可以使用页面按钮导航。');
  $('info-kicker').textContent=d.type||`${catalog[d.parent]?.name||'宇宙图鉴'} / ${{nebula:'星云',cluster:'星团',galaxy:'星系',star:'恒星',planet:'行星',blackhole:'黑洞',craft:'航天器',trajectory:'运动演示',overview:'概览'}[d.kind]||'探索'}`;$('info-title').textContent=d.name;$('info-subtitle').textContent=d.en;$('info-description').textContent=d.description;$('stat-size').textContent=d.size||'—';$('stat-period').textContent=d.period||'—';
  const statLabels=document.querySelectorAll('[data-stat-label]');
  statLabels.forEach(el=>{const key=el.dataset.statLabel;el.textContent=d.statLabels?.[key==='size'?0:1]||(key==='size'?'平均直径':id==='sun'?'绕银河中心':id==='moon'?'绕行周期':'公转周期');});
  $('info-status').textContent=id==='solar'?'八大行星 · 演示轨道':id==='galaxy'?'你在这里 · 猎户臂':id==='iss'?'正在跟随空间站':`正在探索${d.name}`;
  $('earth-actions').hidden=!(state.mode==='earth' && id==='earth'&&!state.solarNearOrbit);
  document.querySelectorAll('#destination-list [data-target]').forEach(el=>{const selected=el.dataset.target===id;el.classList.toggle('active',selected);el.setAttribute('aria-pressed',String(selected));});
  document.querySelectorAll('#mode-nav [data-mode]').forEach(el=>{const mode=state.solarNearOrbit?'solar':!state.guide&&d.kind==='craft'?'earth':state.mode==='deep'?(d.parent==='solar'?'solar':d.parentGalaxy==='galaxy'?'galaxy':'atlas'):state.mode==='galaxy'&&id!=='galaxy'?'atlas':state.mode==='trajectories'?'solar':state.mode;const selected=el.dataset.mode===mode;el.classList.toggle('active',selected);el.setAttribute('aria-pressed',String(selected));});
  $('mode-caption').textContent=state.mode==='galaxy'?'每一颗光点，都可能是另一个太阳。':state.mode==='solar'?'沿着引力的线索，探索我们的行星家族。':state.mode==='atlas'?'十四座星系，十四种遥远的风景。':state.mode==='deep'?'从一个天体，认识更广阔的宇宙。':state.mode==='trajectories'?'改变参照系，看见运动的另一种模样。':'从一颗蓝色星球，向宇宙出发。';
  $('scale-label').textContent=state.mode==='earth'?'近地空间':state.mode==='solar'?'太阳系':state.mode==='atlas'?'星系图鉴':d.name;
  $('info-status').textContent=d.modelStatus?.includes('虚构')?'虚构天体 · 科普示意':`正在探索${d.name}`;
  explorerUI?.render(id);
  if(!state.guide&&d.kind==='craft'){$('info-kicker').textContent='地球漫游 / 航天器';$('mode-caption').textContent='从地球出发，跟随航天器探索宇宙。';}
  if(state.solarNearOrbit){$('info-kicker').textContent='太阳系 / 近地轨道';$('mode-caption').textContent='从地球轨道出发，观察我们的太阳系。';if(id==='earth'){$('info-description').textContent='看城市灯火，跟随月球与航天器运行；转动视角，发现远处的太阳和行星。';$('info-status').textContent='近地轨道 · 太阳系同场观察';}}
  syncEarthNavigation();
  layoutDirty=true;composition();invalidate();
}
function composition() {
  const w=innerWidth,h=innerHeight;
  const phoneView=mobile()&&state.ui&&document.body.classList.contains('mobile-workspace')?mobileSceneViewport(document,w,h):null;
  craftViewRect=null;
  if(state.mode==='blackholes'){
    const bounds=state.ui?blackHoleUI?.getLayoutBounds():null;
    let x1=22,x2=w-22,y1=state.ui?145:22,y2=h-(state.ui?130:22);
    if(bounds){
      if(mobile()){
        if(bounds.left)y1=Math.max(y1,bounds.left.bottom+12);
        if(bounds.right)y2=Math.min(y2,bounds.right.top-12);
      }else{
        if(bounds.left)x1=Math.max(x1,bounds.left.right+25);
        if(bounds.right)x2=Math.min(x2,bounds.right.left-25);
      }
      if(bounds.dock)y2=Math.min(y2,bounds.dock.top-25);
      if(bounds.caption)y2=Math.min(y2,bounds.caption.top-25);
    }
    if(phoneView)({left:x1,right:x2,top:y1,bottom:y2}=phoneView);
    const availableW=Math.max(140,x2-x1),availableH=Math.max(140,y2-y1),distance=Math.hypot(26,4.8);
    const extent=blackHoleScene?.getExtent(availableW/availableH)||{width:21,height:11};
    const unitsPerPixel=Math.max(extent.width/availableW,extent.height/availableH);
    camera.aspect=w/h;camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(h*unitsPerPixel/(2*distance)));
    camera.setViewOffset(w,h,w/2-(x1+x2)/2,h/2-(y1+y2)/2,w,h);
    camera.updateProjectionMatrix();layoutDirty=false;invalidate();return;
  }
  if(state.mode==='constellation'){
    const compactChart=mobile();
    const bounds=state.ui?constellationUI?.getLayoutBounds():null;
    let x1=24,x2=w-24,y1=state.ui?(compactChart?148:h<=500?85:125):24,y2=h-(state.ui?36:24);
    if(bounds){
      if(compactChart){
        if(bounds.left)y1=Math.max(y1,bounds.left.bottom+10);
        if(bounds.right)y2=Math.min(y2,bounds.right.top-16);
      }else{
        if(bounds.left)x1=Math.max(x1,bounds.left.right+24);
        if(bounds.right)x2=Math.min(x2,bounds.right.left-24);
      }
      if(bounds.dock)y2=Math.min(y2,bounds.dock.top-22);
      if(bounds.controls)y2=Math.min(y2,bounds.controls.top-18);
    }
    if(phoneView)({left:x1,right:x2,top:y1,bottom:y2}=phoneView);
    const centerX=phoneView?phoneView.cx:w/2;
    const availableW=Math.max(150,2*Math.min(centerX-x1,x2-centerX)),availableH=Math.max(150,y2-y1);
    const extent=constellationScene?.getExtent?.()||{width:8,height:8};
    // Keep the entire selected star pattern inside the space between the panels.
    const unitsPerPixel=Math.max((extent.width+.6)/availableW,(extent.height+.4)/availableH);
    camera.aspect=w/h;camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(h*unitsPerPixel/32));
    camera.setViewOffset(w,h,w/2-centerX,h/2-(phoneView?phoneView.cy:y1+availableH/2),w,h);
    camera.updateProjectionMatrix();layoutDirty=false;invalidate();return;
  }
  const baseFov=state.mode==='solar'&&!state.guide?42:43;
  camera.aspect=w/h;camera.fov=mobile()?(state.mode==='earth'?46:64):baseFov;
  if(!mobile()&&state.mode!=='earth'&&!state.guide){
    // Keep wide scenes readable when the preview becomes a tall desktop pane.
    camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(baseFov*Math.PI/360)*Math.max(1,1.5/camera.aspect)));
  }
  // The scene and guide lesson share the viewport's horizontal center.
  let offsetX=phoneView?w/2-phoneView.cx:0;
  let offsetY=!state.ui?0:state.guide?h*(mobile()?.10:.11):phoneView?h/2-phoneView.cy:(mobile()?-h*.055:0);
  if(state.guide&&state.ui){
    // Reserve the lesson's actual height, including the taller spacecraft/trajectory controls.
    const lesson=document.querySelector('.guide-lesson').getBoundingClientRect();
    const topbar=document.querySelector('.guide-topbar').getBoundingClientRect();
    const rail=document.querySelector('.guide-chapters');
    const railBottom=getComputedStyle(rail).display==='flex'?rail.getBoundingClientRect().bottom:0;
    const top=phoneView?phoneView.top:Math.max(topbar.bottom+22,railBottom+16),bottom=phoneView?phoneView.bottom:Math.max(top+96,lesson.top-24);
    const nominalHeight=h*(state.mode==='trajectories'?(mobile()?.16:.46):(mobile()?.34:.56));
    const fit=Math.max(1,nominalHeight/(bottom-top));
    camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov)/2)*fit));
    offsetY=h/2-(top+bottom)/2;
    if(phoneView)offsetX=w/2-phoneView.cx;
  }
  if(state.mode==='solar'&&state.target==='solar'&&!state.guide){
    // Lower, wider overview: keep its Sun centered with room above the dock.
    const bounds=state.ui?explorerUI?.getLayoutBounds():null;
    if(w/h<1.2&&bounds){
      const top=phoneView?phoneView.top:Math.max(155,(bounds.left?.bottom||0)+24);
      const bottom=phoneView?phoneView.bottom:bounds.dock?bounds.dock.top-22:h-100;
      // Perspective extends the near half of the orbit farther below the Sun.
      const distance=solarOverviewOffset().length(),radius=SOLAR_VIEW.bodies.neptune.orbit*SOLAR_VIEW.scale;
      const elevation=Math.atan2(20.087,Math.hypot(32.2,49.765));
      const focal=h/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov)/2));
      const near=focal*radius*Math.sin(elevation)/(distance-radius*Math.cos(elevation));
      const far=focal*radius*Math.sin(elevation)/(distance+radius*Math.cos(elevation));
      offsetY=h/2-(top+Math.max(top+140,bottom)+far-near)/2;
    }else if(state.ui){
      const centerY=Math.min(h*.535,(bounds?.dock?.top??h)-h*.31);
      offsetY=h/2-centerY;
    }else offsetY=0;
    if(phoneView){
      // Fit the outer orbit in projection, including its nearer/larger half.
      const radius=(SOLAR_VIEW.bodies.neptune.orbit+SOLAR_VIEW.bodies.neptune.radius)*SOLAR_VIEW.scale;
      const target=new THREE.Vector3(...SOLAR_VIEW.overviewTarget).multiplyScalar(SOLAR_VIEW.scale);
      const points=Array.from({length:64},(_,i)=>new THREE.Vector3(Math.cos(i*Math.PI/32)*radius,0,Math.sin(i*Math.PI/32)*radius).sub(target));
      const fullWidth=phoneView.width>=w-32;
      const overviewViewport=fullWidth?{...phoneView,left:6,right:w-6,width:w-12}:phoneView;
      const fitted=fitCraftView({THREE,points,offset:solarOverviewOffset(),width:w,height:h,viewport:overviewViewport,fillX:fullWidth?1:.86});
      if(fitted){camera.fov=fitted.fov;offsetX=fitted.offsetX;offsetY=fitted.offsetY;}
    }
  }
  if(mobile()&&state.mode==='solar'&&solarBodies[state.target]&&!state.guide&&state.ui){
    const bounds=explorerUI?.getLayoutBounds();
    const top=phoneView?phoneView.top:Math.max(155,(bounds?.left?.bottom||0)+18);
    const quick=document.getElementById('solar-quick-actions');
    const quickTop=quick&&!quick.hidden?quick.getBoundingClientRect().top:Infinity;
    const bottom=phoneView?phoneView.bottom:Math.min(bounds?.dock?.top??h-110,quickTop)-18;
    const diameter=Math.max(96,Math.min((phoneView?.width??w)*.84,(Math.max(top+120,bottom)-top)*.88));
    const radius=solarBodies[state.target].radius,distance=solarFocusOffset(state.target).length();
    camera.fov=Math.max(camera.fov,THREE.MathUtils.radToDeg(2*Math.atan(h*radius/Math.sqrt(distance*distance-radius*radius)/diameter)));
    offsetY=phoneView?h/2-phoneView.cy:h/2-(top+Math.max(top+120,bottom))/2;
    if(phoneView)offsetX=w/2-phoneView.cx;
  }
  if(deepFraming&&(['galaxy','atlas'].includes(state.mode)||['nebula','cluster'].includes(catalog[state.target]?.kind))&&!state.guide){
    const bounds=state.ui?explorerUI?.getLayoutBounds():null;
    let x1=24,x2=w-24,y1=state.ui?135:24,y2=state.ui?h-100:h-24;
    if(bounds){
      if(mobile()){
        x1=16;x2=w-16;
        if(bounds.left)y1=Math.max(145,bounds.left.bottom+16);
        if(bounds.right&&bounds.right.height>100&&bounds.right.top>y1+160)y2=Math.min(y2,bounds.right.top-18);
      }else if(w/h<1.2){
        // A tall preview places the scene below the introduction instead of squeezing it between columns.
        if(bounds.left)y1=Math.max(y1,bounds.left.bottom+24);
        if(bounds.right)y1=Math.max(y1,bounds.right.bottom+20);
      }else{
        if(bounds.left)x1=Math.max(x1,bounds.left.right+24);
        if(bounds.right)x2=Math.min(x2,bounds.right.left-24);
      }
      if(bounds.dock)y2=Math.min(y2,bounds.dock.top-24);
    }
    if(phoneView)({left:x1,right:x2,top:y1,bottom:y2}=phoneView);
    const availableW=Math.max(150,phoneView?phoneView.width:2*Math.min(w/2-x1,x2-w/2)),availableH=Math.max(150,y2-y1);
    // The phone's Milky Way overview fills the width like the requested entry view.
    const framingWidth=deepFraming.width*(phoneView&&state.target==='galaxy'?.82:1);
    const unitsPerPixel=Math.max(framingWidth/availableW,deepFraming.height/availableH);
    camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(h*unitsPerPixel/(2*deepFraming.distance)));
    offsetX=phoneView?w/2-phoneView.cx:0;offsetY=h/2-(phoneView?phoneView.cy:y1+availableH/2);
    if(phoneView&&state.mode==='atlas'){
      const centered=centerMobileAtlas({THREE,points:deepFraming.points,offset:deepFraming.offset,fov:camera.fov,width:w,height:h,viewport:phoneView});
      if(centered){offsetX=centered.offsetX;offsetY=centered.offsetY;}
    }
  }
  if(state.mode==='trajectories'&&state.ui&&!state.guide){
    const panel=document.getElementById('trajectory-panel'),info=document.querySelector('.object-info');
    const top=phoneView?phoneView.top:mobile()?Math.max(220,info.getBoundingClientRect().bottom+12):150;
    const bottom=phoneView?phoneView.bottom:panel&&!panel.hidden?panel.getBoundingClientRect().top-26:h-150;
    offsetY=phoneView?h/2-phoneView.cy:h/2-(top+Math.max(top+120,bottom))/2;
    if(phoneView)offsetX=w/2-phoneView.cx;
  }
  if(state.mode==='earth'&&!state.guide&&(state.target==='earth'||state.target==='moon'||catalog[state.target]?.nearEarth)){
    const rect=selector=>{const el=document.querySelector(selector);if(!el||el.hidden)return null;const css=getComputedStyle(el);return css.display==='none'||css.visibility==='hidden'?null:el.getBoundingClientRect();};
    const panel=rect('.moon-phases-panel')||rect('.earthsense-panel')||rect('.earth-environment-panel')||rect('.earth-sense-overview')||(mobile()&&!$('facts-panel').classList.contains('collapsed')?rect('.facts-panel'):null);
    const left=state.ui?rect('.object-info'):null,right=state.ui?(panel||rect('.facts-panel')):null,dock=state.ui?rect('.destination-dock'):null;
    let x1=24,x2=w-24,y1=state.ui?145:24,y2=state.ui?(dock?dock.top-22:h-110):h-24;
    if(mobile()){x1=16;x2=w-16;y1=state.ui?Math.max(145,left?left.bottom+12:145):24;y2=!state.ui?h-24:panel?panel.top-18:(dock?dock.top-12:h-100);}
    else{if(left)x1=Math.min(w*.3,left.right+26);if(right)x2=Math.max(x1+190,right.left-24);}
    const navigation=state.ui?rect(state.solarNearOrbit?'#solar-navigation':'#earth-navigation'):null;
    if(navigation)y1=Math.max(y1,navigation.bottom+12);
    if(phoneView)({left:x1,right:x2,top:y1,bottom:y2}=phoneView);
    const cx=phoneView?phoneView.cx:w/2,cy=(y1+Math.max(y1+(mobile()?96:160),y2))/2;
    const centeredWidth=Math.max(mobile()?96:190,2*Math.min(cx-x1,x2-cx));
    offsetX=phoneView?w/2-cx:0;offsetY=h/2-cy;
    if(moonPhases?.isVisible()){
      const availableHeight=Math.max(150,y2-y1),availableWidth=Math.max(200,centeredWidth);
      // Fit the full lesson into the unobscured viewport, including the mobile sheet.
      camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(43*Math.PI/360)*Math.max(h/availableHeight,w/availableWidth)*(mobile()?.6:.87)));
    }else if(state.target==='earth'){
      const diameter=Math.max(mobile()?96:150,Math.min(centeredWidth*.94,(y2-y1)*.9));
      const nominalDistance=mobile()?24.5:15.6;
      const fittedFov=THREE.MathUtils.radToDeg(2*Math.atan(h*3/Math.sqrt(nominalDistance**2-9)/diameter));
      camera.fov=mobile()?THREE.MathUtils.clamp(fittedFov,24,90):Math.max(camera.fov,Math.min(90,fittedFov));
      if(deepSpaceOverview&&state.deepSpaceCraft&&isDeepSpaceOverview()){
        const offset=state.solarNearOrbit?nearOrbitEntryOffset(mobile()?24.5:16.8):earthEntryOffset(nominalDistance);
        camera.fov=fitDeepSpaceFov({THREE,points:deepSpaceOverview.getFramingPoints(),offset,width:w,height:h,availableWidth:centeredWidth,availableHeight:Math.max(120,y2-y1),baseFov:camera.fov});
      }
    }
  }
  if(state.mode==='deep'&&deepFraming?.craft&&!state.guide){
    const rect=selector=>{const el=document.querySelector(selector);if(!el||el.hidden||getComputedStyle(el).display==='none'||getComputedStyle(el).visibility==='hidden')return null;return el.getBoundingClientRect();};
    craftViewRect=craftViewport({width:w,height:h,compact:mobile(),ui:state.ui,
      bounds:state.ui?(explorerUI?.getLayoutBounds()||{}):{},navigation:rect('#earth-navigation'),header:rect('.site-header')});
    if(phoneView)craftViewRect=phoneView;
    const fitted=fitCraftView({THREE,points:deepUniverse.getCraftReferencePoints(),offset:deepFraming.offset,width:w,height:h,viewport:craftViewRect});
    if(fitted){camera.fov=fitted.fov;offsetX=fitted.offsetX;offsetY=fitted.offsetY;}
    else{offsetX=w/2-craftViewRect.cx;offsetY=h/2-craftViewRect.cy;}
  }
  camera.setViewOffset(w,h,offsetX,offsetY,w,h);camera.updateProjectionMatrix();
  layoutDirty=false;invalidate();
}
function setVisibleMode(mode) {
  const changed=state.mode!==mode;state.mode=mode;
  detailRoot.visible=mode==='earth';solarRoot.visible=mode==='solar'||(mode==='earth'&&state.solarNearOrbit);galaxyRoot.visible=false;deepUniverse.root.visible=!['earth','solar','constellation','blackholes'].includes(mode);
  constellationScene?.setVisible(mode==='constellation');constellationUI?.setVisible(mode==='constellation');
  document.body.classList.toggle('constellation-active',mode==='constellation');
  blackHoleScene?.setVisible(mode==='blackholes');blackHoleUI?.setVisible(mode==='blackholes');
  document.body.classList.toggle('blackholes-active',mode==='blackholes');
  if(mode!=='earth'){earthSense?.setVisible(false);earthSense?.clearLocationLock();earthEnvironment?.setVisible(false);closeMoonLesson();}
  controls.minDistance=mode==='earth'?3.45:mode==='solar'?1:20;controls.maxDistance=mode==='earth'?54:mode==='solar'?(mobile()?600:410):500;
  controls.minPolarAngle=mode==='constellation'?Math.PI/2-.16:0;controls.maxPolarAngle=mode==='constellation'?Math.PI/2+.16:Math.PI;
  controls.minAzimuthAngle=mode==='constellation'?-.2:-Infinity;controls.maxAzimuthAngle=mode==='constellation'?.2:Infinity;
  controls.enableRotate=true;
  if(changed){following=null;flight=null;controls.target.set(0,0,0);controls.update();}
  updateMotion(0);composition();invalidate();
  return changed;
}
function startFlight(object,offset,duration=1600,fromFar=false) {
  const target=object instanceof THREE.Vector3?object:object.getWorldPosition(new THREE.Vector3());
  if(fromFar){camera.position.copy(target).add(offset.clone().multiplyScalar(1.55));controls.target.copy(target);controls.update();}
  flight={object,offset,orbitId:catalog[object.userData?.id]?.nearEarth?object.userData.id:null,fromPosition:camera.position.clone(),fromTarget:controls.target.clone(),start:performance.now(),duration:reducedMotion?80:duration};
  following=null;controls.enabled=false;
  invalidate();
}
function solarOverviewOffset(){return new THREE.Vector3(...SOLAR_VIEW.overviewOffset).multiplyScalar(SOLAR_VIEW.scale*(mobile()?320/185:1));}
function solarFocusOffset(id){
  const radius=SOLAR_VIEW.bodies[id].radius;
  // The reference clamps OrbitControls to nine units even for the small worlds.
  const distance=(id==='sun'?11.5:Math.max(9,radius*5.4+2.8))*SOLAR_VIEW.scale;
  return new THREE.Vector3(...SOLAR_VIEW.focusDirection).normalize().multiplyScalar(distance);
}
function setMode(mode) {
  if(!['earth','solar','galaxy','atlas','constellation','blackholes'].includes(mode))return;
  if(mode==='solar')void textureQueue.load(textureNames,{priority:true});
  state.solarNearOrbit=false;
  if(!earthSessionTransition)discardEarthSession();
  if(mode==='blackholes'){openBlackHole(blackHoleId);return;}
  if(mode==='constellation'){openConstellation(constellationId);return;}
  if(mode==='galaxy'||mode==='atlas'){goToDeep(mode);return;}
  if(mode==='earth'){goTo('earth',{mode:'earth'});return;}
  const changed=setVisibleMode(mode);state.target=mode;
  const referenceView=mode==='solar'&&!state.guide;
  const offset=referenceView?solarOverviewOffset():mode==='solar'?new THREE.Vector3(4,mobile()?165:110,mobile()?290:190):new THREE.Vector3(0,mobile()?180:125,mobile()?290:235);
  const target=referenceView?new THREE.Vector3(...SOLAR_VIEW.overviewTarget).multiplyScalar(SOLAR_VIEW.scale):new THREE.Vector3();
  if(referenceView)controls.minDistance=9*SOLAR_VIEW.scale;
  if(state.guide)offset.multiplyScalar(1.45);
  startFlight(target,offset,1800,changed);showObjectInfo(mode);
}
function goTo(id,{mode}={}) {
  if(DATA[id])void textureQueue.load([DATA[id].texture,...(id==='saturn'?['saturn-ring.png']:[])],{priority:true});
  if(typeof id==='string'&&id.startsWith('blackhole:')){openBlackHole(id.slice(10));return;}
  // Sagittarius A* keeps its original galaxy detail view; the top-level black-hole topic is separate.
  if(!state.guide&&id!=='sagittarius-a'&&catalog[id]?.kind==='blackhole'){openBlackHole(catalog[id].blackHoleId,{overview:true});return;}
  if(typeof id==='string'&&id.startsWith('constellation:')){openConstellation(id.slice(14));return;}
  const solarEarthMoon=(id==='earth'||id==='moon')&&(mode==='solar'||(!mode&&!state.guide&&state.mode==='solar'&&!state.solarNearOrbit));
  if(solarEarthMoon||state.guide||catalog[id]?.kind==='craft'||(id!=='earth'&&id!=='moon'&&!catalog[id]?.nearEarth))state.solarNearOrbit=false;
  if(!earthSessionTransition)discardEarthSession();
  if(id==='earth')roamAction='night';else if(catalog[id]?.kind==='craft')roamAction='spacecraft';
  closeMoonLesson();earthSense?.clearLocationLock();
  if(earthSense?.isVisible())earthSense.setVisible(false);
  if(earthEnvironment?.isVisible())earthEnvironment.setVisible(false);
  if(id==='solar'||id==='galaxy'||id==='atlas'){setMode(id);return;}
  if(catalog[id]&&!DATA[id]&&!catalog[id].nearEarth){goToDeep(id);return;}
  if(!solarEarthMoon&&(id==='earth'||id==='moon'||catalog[id]?.nearEarth)){
    const changed=setVisibleMode('earth');state.target=id;composition();
    if(id==='hubble')nearEarth.ensureHubbleModel();
    const obj=id==='earth'?earth:id==='moon'?moon:nearEarth.getObject(id);
    const offset=id==='earth'?(state.solarNearOrbit?nearOrbitEntryOffset(mobile()?24.5:16.8):earthEntryOffset(state.guide?(mobile()?22.5:15.2):(mobile()?24.5:15.6))):id==='moon'?new THREE.Vector3(1.8,.5,mobile()?5.8:3.4).multiplyScalar(state.guide?1.25:1):nearEarth.getCameraOffset(id,mobile());
    controls.minDistance=id==='earth'?3.45:id==='moon'?.94:id==='iss'?.85:.55;controls.maxDistance=catalog[id]?.nearEarth?26:54;
    startFlight(obj,offset,1800,changed);showObjectInfo(id);return;
  }
  if(!solarBodies[id])return;
  const changed=setVisibleMode('solar');state.target=id;const b=solarBodies[id];
  controls.minDistance=state.guide?b.radius*1.25:9*SOLAR_VIEW.scale;controls.maxDistance=340;
  const multiplier=(id==='saturn'?1.5:1)*(state.guide?1.4:1);
  const offset=state.guide?new THREE.Vector3(b.radius*.75,b.radius*.6,b.radius*(mobile()?7.7:4.5)*multiplier):solarFocusOffset(id);
  startFlight(b.group,offset,state.guide?1700:2100,changed);showObjectInfo(id);
}
function cancelFlight() {if(flight){flight=null;controls.enabled=true;const obj=getFollowObject();if(obj){following=obj;rememberFollowFrame();}}}
function rememberFollowFrame(){if(following){following.getWorldPosition(lastFollowPosition);following.getWorldQuaternion(lastFollowRotation);}}
function getFollowObject(){if(moonPhases?.isVisible())return null;if(state.mode==='earth')return nearEarth.getObject(state.target)||(state.target==='moon'?moon:earth);if(state.mode==='solar'&&solarBodies[state.target])return solarBodies[state.target].group;return deepUniverse.root.visible?deepFocus:null;}
function showEarthOverview(){goTo('earth',{mode:'earth'});roamAction='panorama';startFlight(earth,new THREE.Vector3(0,4.5,mobile()?29:21),1500);syncEarthNavigation();}
function openNearOrbit(){state.solarNearOrbit=true;goTo('earth',{mode:'earth'});}
function nearOrbitEntryOffset(distance){const tangent=new THREE.Vector3(earthSunDirection.z,0,-earthSunDirection.x).normalize();return earthSunDirection.clone().multiplyScalar(-.68).addScaledVector(tangent,.72).add(new THREE.Vector3(0,.16,0)).normalize().multiplyScalar(distance);}
function goToDeep(id){
  state.solarNearOrbit=false;
  if(!earthSessionTransition)discardEarthSession();
  if(!catalog[id])return;
  const mode=id==='atlas'?'atlas':id==='trajectories'?'trajectories':catalog[id].kind==='galaxy'?'galaxy':'deep';
  setVisibleMode(mode);state.target=id;following=null;flight=null;controls.enabled=true;
  for(let i=labelItems.length-1;i>=0;i--)if(labelItems[i].deep){labelItems[i].element.remove();labelItems.splice(i,1);}
  const view=deepUniverse.show(id);deepUniverse.root.visible=true;deepUniverse.update(0,state.elapsed,{paused:state.paused,speed:state.speed,orbits:state.orbits});scene.updateMatrixWorld(true);deepFocus=view.focus;
  for(const item of deepUniverse.getLabels()){const l=label(item.object,item.name,item.id,item.color,0,Infinity);l.deep=true;l.radius=item.radius||0;l.priority=item.priority||0;if(item.className)l.element.classList.add(item.className);if(item.description){l.element.title=item.description;l.element.setAttribute('aria-label',item.description);}}
  controls.minDistance=view.minDistance||1;controls.maxDistance=view.maxDistance||600;
  const offset=view.offset?new THREE.Vector3(...view.offset):new THREE.Vector3(0,view.distance*.4,view.distance);
  if(mobile())offset.multiplyScalar(1.24);if(state.guide)offset.multiplyScalar(1.35);
  deepFraming=view.craft?{craft:true,offset:offset.clone()}:view.framing?{...view.framing,distance:offset.length(),offset:offset.clone()}:null;
  startFlight(view.focus,offset,1500,true);showObjectInfo(id);
}
function syncToggles() {
  blackHoleUI?.syncPause();
  document.body.classList.toggle('motion-paused',state.paused);invalidate();
  $('toggle-orbits').setAttribute('aria-pressed',String(state.orbits));$('toggle-orbits').classList.toggle('active',state.orbits);orbitLines.forEach(l=>l.visible=state.orbits);
  $('toggle-labels').setAttribute('aria-pressed',String(state.labels));$('toggle-labels').classList.toggle('active',state.labels);
  $('toggle-pause').setAttribute('aria-pressed',String(state.paused));$('toggle-pause').setAttribute('aria-label',state.paused?'继续天体运动':'暂停天体运动');$('toggle-pause').title=state.paused?'继续天体运动（空格）':'暂停天体运动（空格）';
  const icon=$('toggle-pause').querySelector('[data-pause-icon]');if(icon)icon.textContent=state.paused?'▶':'Ⅱ';
  const caption=$('toggle-pause').querySelector('span');if(caption)caption.textContent=state.paused?'继续':'暂停';
  const pauseUse=$('toggle-pause').querySelector('use');if(pauseUse)pauseUse.setAttribute('href',state.paused?'#i-play':'#i-pause');
  $('speed-select').value=String(state.speed);
  syncEarthNavigation();
}
function zoom(factor){cancelFlight();const v=camera.position.clone().sub(controls.target);const distance=THREE.MathUtils.clamp(v.length()*factor,controls.minDistance,controls.maxDistance);camera.position.copy(controls.target).add(v.setLength(distance));controls.update();}
function toggleUI(){state.ui=!state.ui;document.body.classList.toggle('ui-hidden',!state.ui);$('toggle-ui').setAttribute('aria-pressed',String(!state.ui));syncEarthNavigation();composition();if(!state.ui)toast('沉浸模式 · 双击画面或按 I 恢复界面');}
function setQuality(mode){qualityMode=mode;qualityRatio=mode==='low'?Math.min(1,devicePixelRatio):mode==='high'?Math.min(2,devicePixelRatio):Math.min(devicePixelRatio,mobile()?1.5:1.75);renderer.setPixelRatio(qualityRatio);slowFrames=qualityWindow=0;toast(mode==='auto'?'已启用自适应画质':mode==='low'?'流畅画质 · 降低渲染分辨率':'精细画质 · 提升渲染分辨率');}
function focusLocation(lat,lon){
  cancelFlight();state.target='earth';earth.updateWorldMatrix(true,false);
  const phi=lat*Math.PI/180,theta=lon*Math.PI/180;
  const localDirection=new THREE.Vector3(Math.cos(phi)*Math.cos(theta),Math.sin(phi),-Math.cos(phi)*Math.sin(theta));
  const direction=localDirection.clone().transformDirection(earth.matrixWorld);
  // Fix an illustrative dusk light at entry, so dragging still reveals a day/night boundary.
  if(earth.material.uniforms.natureStyle?.value){
    const left=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),direction).normalize().negate();
    const dusk=left.multiplyScalar(.94).addScaledVector(direction,-.3).add(new THREE.Vector3(0,.12,0)).normalize();
    earth.material.uniforms.natureSunDirection.value.copy(dusk);
    earthAtmosphere.material.uniforms.natureSunDirection.value.copy(dusk);
  }
  controls.minDistance=3.45;startFlight(earth,direction.multiplyScalar(mobile()?24.5:15.6),1200);flight.localDirection=localDirection;flight.locationDistance=mobile()?24.5:15.6;
}
earthEnvironment=createEarthEnvironment({THREE,earth,clouds,sunlight,root:detailRoot,
  onChange(){invalidate();},
  onOpenPlaces:openEarthSense,
  onLocationFocus(place){earthSense.selectLocation(place,{focus:true,lock:true});},
  onVisibilityChange(visible){if(visible)earthSense?.setVisible(false,{preserveLock:true});earthSense?.setLinkedViewVisible(visible);queueEarthModeSync();layoutDirty=true;invalidate();}
});
earthSense=createEarthSense({THREE,earth,root:detailRoot,toast,onFocus:focusLocation,
  onSelectionChange(place){earthEnvironment.setLocation(place);invalidate();},
  onOpenEnvironment:openEarthEnvironment,
  onContinentSelect(id,{focus=true}={}){continentOverlay?.select(id);if(focus)focusContinent(id);invalidate();},
  onContinentVisibilityChange(visible){continentOverlay?.setVisible(visible);if(!visible){if(continentFollow)cancelFlight();continentFollow=null;}layoutDirty=true;invalidate();},
  onLockChange(){rememberFollowFrame();invalidate();}
});
continentOverlay=createContinentOverlay({THREE,earth,continents:EARTH_CONTINENTS,
  onSelect:continent=>earthSense.selectContinent(continent.id),onChange:invalidate
});
moonPhases=createMoonPhases({THREE,root:detailRoot,textures,
  onChange(event){if(event?.cameraChanged&&moonPhases?.isVisible())frameMoonLesson();invalidate();},
  onVisibilityChange(visible){
    if(visible){earthSense.setVisible(false);earthSense.clearLocationLock();earthEnvironment.setVisible(false);frameMoonLesson();}
    else{controls.enableRotate=true;if(!closingMoonForNavigation&&earthExperience!=='sense')goTo('earth');}
    queueEarthModeSync();
    updateMotion(0);layoutDirty=true;invalidate();
  }
});
function closeMoonLesson(){
  if(!moonPhases?.isVisible())return;
  closingMoonForNavigation=true;moonPhases.setVisible(false);closingMoonForNavigation=false;
}
function frameMoonLesson(){
  const view=moonPhases.getCameraView({compact:mobile()});
  flight=null;following=null;controls.enabled=true;controls.enableRotate=view.allowRotate!==false;
  // Drain orbit damping before entering the fixed observer view.
  const damping=controls.enableDamping;controls.enableDamping=false;controls.update();controls.enableDamping=damping;
  controls.minDistance=view.minDistance;controls.maxDistance=view.maxDistance;
  camera.position.fromArray(view.position);controls.target.fromArray(view.target);controls.update();composition();
}
function activeEarthSection(){
  if(moonPhases?.isVisible())return 'moon';
  if(earthEnvironment?.isVisible())return 'environment';
  if(earthSense?.isVisible())return earthSense.getStatus().activeTab;
  return 'overview';
}
function isDeepSpaceOverview(){
  return state.mode==='earth'&&state.target==='earth'&&!state.guide&&earthExperience==='roam'&&!earthSense?.isVisible()&&!earthEnvironment?.isVisible()&&!moonPhases?.isVisible();
}
function syncEarthNavigation(){
  const solarSection=state.solarNearOrbit||state.mode==='solar'||state.mode==='trajectories';
  solarNavigation?.update({visible:solarSection&&!state.guide&&state.ui,active:state.solarNearOrbit,target:state.target});
  document.body.classList.toggle('solar-near-orbit',state.solarNearOrbit);
  earthNavigation?.update({visible:(state.mode==='earth'||catalog[state.target]?.kind==='craft')&&!state.solarNearOrbit&&!state.guide&&state.ui,active:earthExperience});
  const section=activeEarthSection();
  if(earthExperience==='sense'&&section!=='overview'&&!state.guide)lastSenseSection=section;
  const nature=earthExperience==='sense'&&!state.guide&&['lightning','typhoons','cyclone-demo','wind'].includes(section);
  const geography=earthExperience==='sense'&&!state.guide&&!nature&&!['environment','moon'].includes(section);
  if(earth?.material.uniforms.geographicLight)earth.material.uniforms.geographicLight.value=geography?1:0;
  if(earth?.material.uniforms.natureStyle)earth.material.uniforms.natureStyle.value=nature?1:0;
  if(earthAtmosphere?.material.uniforms.natureStyle)earthAtmosphere.material.uniforms.natureStyle.value=nature?1:0;
  earthSense?.setGeographyVisible(geography);
  earthSense?.setLabelsVisible(state.labels);
  earthExperienceUI?.update({visible:state.mode==='earth'&&state.target==='earth'&&!state.solarNearOrbit&&!state.guide&&state.ui,mode:earthExperience,section,roamAction,grid:earthSense?.getStatus().gridEnabled||false,labels:state.labels,regions:continentOverlay?.getStatus().regionsEnabled??true});
  deepSpaceControls?.update({visible:state.ui&&isDeepSpaceOverview(),enabled:state.deepSpaceCraft});
  layoutDirty=true;invalidate();
}
function discardEarthSession(){earthExperience='roam';earthRoamSnapshot=null;syncEarthNavigation();}
function beginEarthSession(){
  if(earthExperience==='sense')return;
  earthRoamSnapshot={target:state.target,paused:state.paused,speed:state.speed,orbits:state.orbits,labels:state.labels,view:captureView()};
  explorerUI?.stopCardNarration();
  earthExperience='sense';syncEarthNavigation();
}
function returnToRoam(){
  if(earthExperience!=='sense')return;
  const saved=earthRoamSnapshot,rememberedSection=lastSenseSection;earthSessionTransition=true;
  try{
    discardEarthSession();earthSense.setVisible(false);earthEnvironment.setVisible(false);closeMoonLesson();
    if(saved){goTo(saved.target,{mode:saved.view?.mode});state.paused=saved.paused;state.speed=saved.speed;state.orbits=saved.orbits;state.labels=saved.labels;restoreView(saved.view);syncToggles();}
  }finally{lastSenseSection=rememberedSection;earthSessionTransition=false;syncEarthNavigation();composition();invalidate();}
}
function queueEarthModeSync(){
  queueMicrotask(()=>{
    if(earthExperience==='sense'&&!earthSessionTransition&&!state.guide&&!earthSense?.isVisible()&&!earthEnvironment?.isVisible()&&!moonPhases?.isVisible()){
      resetEarthSenseView();
      syncEarthNavigation();
      document.querySelector('.earth-sense-overview h2')?.focus({preventScroll:true});
      return;
    }
    syncEarthNavigation();
  });
}
function prepareEarthLesson(){
  beginEarthSession();earthSessionTransition=true;
  try{if(state.mode!=='earth'||state.target!=='earth'||moonPhases.isVisible())goTo('earth',{mode:'earth'});}
  finally{earthSessionTransition=false;}
  controls.maxDistance=32;
}
function openEarthSense(tab='places'){
  prepareEarthLesson();earthEnvironment.setVisible(false);earthSense.selectTab(typeof tab==='string'?tab:'places');earthSense.setVisible(true);syncEarthNavigation();
  earthSense.focusNature();
}
function enterEarthSense(){
  if(earthExperience==='sense')return;
  selectEarthFeature(lastSenseSection);
}
function resetEarthSenseView(){
  if(moonPhases.isVisible()){frameMoonLesson();return;}
  if(earthSense.focusNature())return;
  if(earthSense.isVisible()&&earthSense.getStatus().activeTab==='continents'){focusContinent(earthSense.getStatus().continent);return;}
  const place=earthSense.getLockedLocation();
  if(place){focusLocation(place.lat,place.lon);return;}
  controls.minDistance=3.45;controls.maxDistance=32;controls.enableRotate=true;
  startFlight(earth,new THREE.Vector3(0,1.3,mobile()?24.5:15.6),800);
}
function selectEarthFeature(feature){
  if(feature==='sense'){enterEarthSense();return;}
  if(feature==='roam'){returnToRoam();return;}
  if(feature==='spacecraft'){explorerUI.openCraftList();roamAction='spacecraft';syncEarthNavigation();composition();invalidate();return;}
  if(feature==='continents'){openContinents();return;}
  if(feature==='environment'){openEarthEnvironment();return;}
  if(feature==='moon'){openMoonPhases();return;}
  if(['places','weather','lightning','typhoons','cyclone-demo','wind'].includes(feature)){openEarthSense(feature);return;}
  if(feature==='grid'){earthSense.setGridEnabled(!earthSense.getStatus().gridEnabled);syncEarthNavigation();return;}
  if(feature==='labels'){state.labels=!state.labels;syncToggles();return;}
  if(feature==='regions'){continentOverlay.setRegionsVisible(!continentOverlay.getStatus().regionsEnabled);syncEarthNavigation();return;}
  if(feature==='reset')resetEarthSenseView();
}
function focusContinent(id){
  const continent=getContinent(id);if(!continent)return;
  earthSense.clearLocationLock();continentFollow=id;focusLocation(continent.lat,continent.lon);
}
function openContinents(){
  prepareEarthLesson();earthEnvironment.setVisible(false);earthSense.selectTab('continents');earthSense.setVisible(true);
  earthSense.selectContinent(earthSense.getStatus().continent||'asia');
  syncEarthNavigation();
}
function openEarthEnvironment(place=earthSense.getSelectedLocation()){
  prepareEarthLesson();earthSense.setVisible(false,{preserveLock:true});earthEnvironment.setLocation(place);earthEnvironment.setVisible(true);
  syncEarthNavigation();
}
function openMoonPhases(){prepareEarthLesson();moonPhases.setVisible(true);syncEarthNavigation();}
document.addEventListener('earthsense:visibility',event=>{if(event.detail.visible)earthEnvironment.setVisible(false);queueEarthModeSync();layoutDirty=true;invalidate();});
document.addEventListener('earthsense:invalidate',invalidate);
document.addEventListener('earthsense:change',()=>{syncEarthNavigation();composition();});
explorerUI=createExplorerUI({catalog,goTo,getState:()=>state,toast,onEarthOverview:showEarthOverview,onEarthSense:openEarthSense,onContinents:openContinents,onEarthEnvironment(){openEarthEnvironment();},onMoonPhases:openMoonPhases,onQuality:setQuality,onTrajectory:options=>{deepUniverse.setTrajectoryOptions(options);invalidate();},onDeploy:value=>{deepUniverse.setDeploy(value);invalidate();},onResetView:()=>goTo(state.target)});
deepSpaceControls=createDeepSpaceControls({onToggle(enabled){
  state.deepSpaceCraft=enabled;updateMotion(0);syncEarthNavigation();composition();invalidate();
}});
earthExperienceUI=createEarthExperienceUI({onFeature:selectEarthFeature});
earthNavigation=createEarthNavigation({onRoam(){if(earthExperience==='sense')returnToRoam();else if(state.mode!=='earth'||state.target!=='earth')setMode('earth');},onSense:enterEarthSense});
solarNavigation=createSolarNavigation({onNearOrbit:openNearOrbit,onTrajectories:()=>goTo('trajectories')});
constellationScene=createConstellationScene({scene,camera,renderer,invalidate,onSelectStar:star=>constellationUI?.showStar(typeof star==='string'?star:star.id)});
constellationUI=createConstellationUI({
  onSelect:openConstellation,
  onViewChange(){layoutDirty=true;invalidate();},
  onToggle(key,enabled){if(key==='lines')constellationScene.setLines(enabled);if(key==='labels')constellationScene.setLabels(enabled);invalidate();},
  onFocusStar(id){constellationScene.focusStar(id);invalidate();},
  onBackToSky:resetConstellationView,
  onInvalidate(){layoutDirty=true;invalidate();}
});
const constellationNav=document.createElement('button');constellationNav.type='button';constellationNav.dataset.mode='constellation';constellationNav.textContent='星座探索';constellationNav.setAttribute('aria-pressed','false');$('mode-nav').append(constellationNav);
blackHoleScene=createBlackHoleScene({THREE,scene,camera});
blackHoleUI=createBlackHoleUI({onSelect:openBlackHole,onReset:resetBlackHoleView,toast,getPaused:()=>state.paused,
  onLibrary:()=>explorerUI.openLibrary('blackhole'),
  onGalaxy:()=>{const galaxy=findBlackHole(blackHoleId)?.parentGalaxy;if(galaxy)goTo(galaxy);},
  onChange(){layoutDirty=true;invalidate();},
  onPause(){state.paused=!state.paused;syncToggles();},
  onToggle(key,value){if(key==='disk')blackHoleScene.setDisk(value);if(key==='names')blackHoleScene.setNames(value);if(key==='structure')blackHoleScene.setStructure(value);invalidate();}
});
const blackHoleNav=document.createElement('button');blackHoleNav.type='button';blackHoleNav.dataset.mode='blackholes';blackHoleNav.textContent='黑洞';blackHoleNav.setAttribute('aria-pressed','false');$('mode-nav').querySelector('[data-mode="galaxy"]').after(blackHoleNav);
function resetBlackHoleView(){
  if(state.mode!=='blackholes')return;
  const view=blackHoleScene.getCameraView(mobile());flight=null;following=null;
  const damping=controls.enableDamping;controls.enableDamping=false;controls.update();controls.enableDamping=damping;
  camera.position.copy(view.position);controls.target.copy(view.target);controls.minDistance=view.minDistance;controls.maxDistance=view.maxDistance;controls.enabled=true;controls.update();composition();invalidate();
}
function openBlackHole(id='sgr-a',{overview=false}={}){
  state.solarNearOrbit=false;discardEarthSession();explorerUI?.stopCardNarration();explorerUI?.closeLibrary();
  setVisibleMode('blackholes');blackHoleScene.select(id);blackHoleId=blackHoleScene.getStatus().id;state.target=`blackhole:${blackHoleId}`;
  const record=findBlackHole(blackHoleId);if(record)explorerUI.render(record.catalogId);
  blackHoleUI.select(blackHoleId);if(overview)blackHoleUI.setTopic('overview');resetBlackHoleView();canvas.dataset.destination=state.target;document.body.dataset.destination=state.target;
  canvas.setAttribute('aria-label','黑洞三维教学模型，拖动旋转，双指或滚轮缩放；吸积盘与弯曲光线为示意。');
  document.querySelectorAll('#mode-nav [data-mode]').forEach(button=>{const active=button.dataset.mode==='blackholes';button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
  $('scale-label').textContent='黑洞探索';syncEarthNavigation();layoutDirty=true;invalidate();
}
function resetConstellationView(){
  if(state.mode!=='constellation')return;
  const view=constellationScene.getCameraView();flight=null;following=null;
  const damping=controls.enableDamping;controls.enableDamping=false;controls.update();controls.enableDamping=damping;
  camera.position.copy(view.position);controls.target.copy(view.target);controls.minDistance=view.minDistance;controls.maxDistance=view.maxDistance;controls.enabled=true;controls.update();composition();invalidate();
}
function openConstellation(id='orion'){
  state.solarNearOrbit=false;
  const selected=CONSTELLATIONS.find(item=>item.id===id)||CONSTELLATIONS[0];
  discardEarthSession();explorerUI?.stopCardNarration();explorerUI?.closeLibrary();
  setVisibleMode('constellation');constellationId=selected.id;state.target=`constellation:${selected.id}`;
  constellationScene.select(selected.id);constellationUI.select(selected.id);resetConstellationView();
  canvas.dataset.destination=state.target;
  canvas.setAttribute('aria-label','星座星图，拖动轻转视角，滚动缩放；点击亮星查看资料，也可使用星座图鉴。');
  document.querySelectorAll('#mode-nav [data-mode]').forEach(button=>{const active=button.dataset.mode==='constellation';button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
  $('scale-label').textContent='星座探索';$('distance-label').textContent='恒星天球坐标 · 连线为辨认辅助';
  syncEarthNavigation();layoutDirty=true;invalidate();
}
function captureView(){
  const anchor=getFollowObject()?.getWorldPosition(new THREE.Vector3())||new THREE.Vector3();
  let position=camera.position.clone(),target=controls.target.clone();
  // An observation panel opened mid-flight returns to the intended destination,
  // not an intermediate far-away position that would immediately change scale.
  if(flight){
    target=flight.object instanceof THREE.Vector3?flight.object.clone():flight.object.getWorldPosition(new THREE.Vector3());
    const offset=flight.orbitId?nearEarth.getCameraOffset(flight.orbitId,mobile()):flight.localDirection?flight.localDirection.clone().transformDirection(earth.matrixWorld).multiplyScalar(flight.locationDistance):flight.offset;
    position=target.clone().add(offset);
  }
  return {position:position.sub(anchor).toArray(),target:target.sub(anchor).toArray(),elapsed:state.elapsed,compact:mobile(),mode:state.mode,solarNearOrbit:state.solarNearOrbit,deepSpaceCraft:state.deepSpaceCraft,preferences:explorerUI.capturePreferences(),environment:earthEnvironment.capturePreferences(),sense:earthSense.getStatus(),continentFollow,lunar:moonPhases.getStatus(),earthExperience,earthRoamSnapshot,lastSenseSection,roamAction,blackholes:state.mode==='blackholes'?blackHoleUI?.captureState():null,constellation:state.mode==='constellation'?constellationUI?.captureState():null};
}
function restoreView(snapshot){
  if(!snapshot)return;state.elapsed=snapshot.elapsed;state.solarNearOrbit=Boolean(snapshot.solarNearOrbit&&state.mode==='earth');solarRoot.visible=state.mode==='solar'||state.solarNearOrbit;
  if(typeof snapshot.deepSpaceCraft==='boolean')state.deepSpaceCraft=snapshot.deepSpaceCraft;
  if(snapshot.blackholes)blackHoleUI?.restoreState(snapshot.blackholes);
  if(snapshot.constellation)constellationUI?.restoreState(snapshot.constellation);
  earthExperience=snapshot.earthExperience||'roam';earthRoamSnapshot=snapshot.earthRoamSnapshot||null;syncEarthNavigation();
  earthEnvironment.restorePreferences(snapshot.environment);explorerUI.restorePreferences(snapshot.preferences);
  if(snapshot.sense){
    if(snapshot.sense.selectedLocation)earthSense.selectLocation(snapshot.sense.selectedLocation,{focus:false,lock:Boolean(snapshot.sense.lockedLocation)});
    if(snapshot.sense.continent)earthSense.selectContinent(snapshot.sense.continent,{focus:false});
    earthSense.selectTab(snapshot.sense.activeTab);earthSense.setVisible(snapshot.sense.visible,{preserveLock:true});
    continentFollow=snapshot.sense.visible&&snapshot.sense.activeTab==='continents'?snapshot.continentFollow||null:null;
  }
  if(snapshot.lunar){moonPhases.setPhase(snapshot.lunar.angle);moonPhases.setView(snapshot.lunar.view);moonPhases.setAutoPlay(snapshot.lunar.autoPlay);moonPhases.setVisible(snapshot.lunar.visible);}
  updateMotion(0);if(deepUniverse.root.visible)deepUniverse.update(0,state.elapsed,{paused:state.paused,speed:state.speed,orbits:state.orbits});scene.updateMatrixWorld(true);
  flight=null;controls.enabled=true;following=getFollowObject();const anchor=following?.getWorldPosition(new THREE.Vector3())||new THREE.Vector3();
  camera.position.fromArray(snapshot.position).add(anchor);controls.target.fromArray(snapshot.target).add(anchor);
  if(typeof snapshot.compact==='boolean'&&snapshot.compact!==mobile()&&state.mode==='earth'){
    if(moonPhases.isVisible())frameMoonLesson();
    else{
      const normalDistance=compact=>state.target==='earth'?(compact?24.5:state.solarNearOrbit?16.8:15.6):state.target==='moon'?(compact?5.8:3.4):nearEarth.getCameraOffset(state.target,compact).length();
      const scale=normalDistance(mobile())/normalDistance(snapshot.compact);
      camera.position.sub(controls.target).multiplyScalar(scale).add(controls.target);
    }
  }
  lastSenseSection=snapshot.lastSenseSection||lastSenseSection;roamAction=snapshot.roamAction||roamAction;
  if(earthExperience==='sense'&&!moonPhases.isVisible()){controls.minDistance=3.45;controls.maxDistance=32;}
  if(snapshot.sense&&typeof snapshot.sense.gridEnabled==='boolean')earthSense.setGridEnabled(snapshot.sense.gridEnabled);
  controls.update();rememberFollowFrame();showObjectInfo(state.target);syncEarthNavigation();composition();invalidate();
}
function nightOffset(distance){return earthSunDirection.clone().negate().multiplyScalar(distance);}
function earthEntryOffset(distance){
  // Look mainly into the night hemisphere, keeping a lit crescent at the limb.
  const tangent=new THREE.Vector3(earthSunDirection.z,0,-earthSunDirection.x).normalize();
  return earthSunDirection.clone().multiplyScalar(-.5).addScaledVector(tangent,.82).add(new THREE.Vector3(0,.22,0)).normalize().multiplyScalar(distance);
}
const tour=createGuide({state,goTo,composition,syncToggles,toast,reducedMotion,captureView,restoreView,observe(kind){
  if(kind==='night')startFlight(earth,nightOffset(mobile()?22.5:15.2),1800);
  else if(kind==='moon-close')startFlight(moon,new THREE.Vector3(1.8,.5,mobile()?5.8:3.4).multiplyScalar(.78),1400);
}});
const factsButton=$('toggle-facts');
function setFactsExpanded(expanded){factsButton.setAttribute('aria-expanded',String(expanded));factsButton.setAttribute('aria-label',expanded?'收起资料':'展开资料');factsButton.querySelector('.card-fold-action').textContent=expanded?'收起':'展开';$('facts-content').hidden=!expanded;$('facts-panel').classList.toggle('collapsed',!expanded);if(!expanded)explorerUI?.stopCardNarration();composition();}
factsButton.addEventListener('click',()=>setFactsExpanded(factsButton.getAttribute('aria-expanded')!=='true'));
setFactsExpanded(innerWidth>1100);
document.querySelectorAll('#mode-nav [data-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
$('toggle-orbits').addEventListener('click',()=>{state.orbits=!state.orbits;syncToggles();});
$('toggle-labels').addEventListener('click',()=>{state.labels=!state.labels;syncToggles();});
$('toggle-pause').addEventListener('click',()=>{state.paused=!state.paused;syncToggles();});
$('speed-select').addEventListener('change',e=>{state.speed=Number(e.target.value);toast(`演示时间流速 ${state.speed}×`);});
$('zoom-in').addEventListener('click',()=>zoom(.82));$('zoom-out').addEventListener('click',()=>zoom(1.22));
$('reset-view').addEventListener('click',()=>state.guide?tour.reset():state.mode==='blackholes'?resetBlackHoleView():state.mode==='constellation'?resetConstellationView():earthExperience==='sense'?resetEarthSenseView():goTo(state.target));
$('night-view').addEventListener('click',()=>{goTo('earth',{mode:'earth'});controls.minDistance=3.45;startFlight(earth,nightOffset(mobile()?24.5:15.6),1800);showObjectInfo('earth');toast('地球夜半球 · 看见城市的微光');});
$('earth-craft-view').addEventListener('click',()=>selectEarthFeature('spacecraft'));
const pageFullscreen=createPageFullscreen({document,window,isPhone:mobile,onMessage:toast});
$('toggle-fullscreen').addEventListener('click',pageFullscreen.toggle);
$('help-button').addEventListener('click',()=>$('help-dialog').showModal());$('close-help').addEventListener('click',()=>$('help-dialog').close());
$('source-button').addEventListener('click',()=>$('source-dialog').showModal());$('close-source').addEventListener('click',()=>$('source-dialog').close());
$('author-statement-button').addEventListener('click',()=>{
  $('author-statement-dialog').showModal();
  $('author-statement-button').setAttribute('aria-expanded','true');
});
$('close-author-statement').addEventListener('click',()=>$('author-statement-dialog').close());
$('author-statement-dialog').addEventListener('close',()=>{
  $('author-statement-button').setAttribute('aria-expanded','false');
  (mobile()?$('mobile-tools-toggle'):$('author-statement-button'))?.focus({preventScroll:true});
});
document.querySelectorAll('dialog:not(#cinema-dialog)').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
$('toggle-ui').addEventListener('click',toggleUI);canvas.addEventListener('dblclick',()=>{if(!state.ui)toggleUI();});
canvas.addEventListener('pointerdown',cancelFlight,{capture:true});canvas.addEventListener('wheel',cancelFlight,{capture:true,passive:true});
window.addEventListener('keydown',e=>{
  if(/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)||document.querySelector('dialog[open]'))return;
  if(e.code==='Space'){if(document.activeElement.closest('button,a,[contenteditable]'))return;e.preventDefault();state.paused=!state.paused;syncToggles();}
  else if(e.key==='+'||e.key==='=')zoom(.82);else if(e.key==='-')zoom(1.22);
  else if(e.key.toLowerCase()==='h'){if(state.guide)tour.exit();setMode('earth');}else if(e.key.toLowerCase()==='i')toggleUI();
  else if(e.key==='Escape'&&state.guide){if(!state.ui)toggleUI();tour.exit();}
  else if(e.key.toLowerCase()==='f')$('toggle-fullscreen').click();else if(e.key==='?')$('help-dialog').showModal();
});
// Click picking uses the visible objects, never invisible scene layers.
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),activePointers=new Set();let downAt=null,multiPointerGesture=false;
canvas.addEventListener('pointerdown',e=>{
  activePointers.add(e.pointerId);
  if(activePointers.size>1){multiPointerGesture=true;downAt=null;return;}
  downAt=e.button===0?{id:e.pointerId,x:e.clientX,y:e.clientY,dragged:false}:null;
});
canvas.addEventListener('pointermove',e=>{if(downAt?.id===e.pointerId&&Math.hypot(e.clientX-downAt.x,e.clientY-downAt.y)>5){downAt.dragged=true;continentFollow=null;earthSense.clearLocationLock();}});
canvas.addEventListener('pointercancel',e=>{activePointers.delete(e.pointerId);downAt=null;if(!activePointers.size)multiPointerGesture=false;});
canvas.addEventListener('pointerup',e=>{
  const isClick=downAt?.id===e.pointerId&&!downAt.dragged&&!multiPointerGesture&&activePointers.size===1&&Math.hypot(e.clientX-downAt.x,e.clientY-downAt.y)<=5;
  activePointers.delete(e.pointerId);downAt=null;if(!activePointers.size)multiPointerGesture=false;
  if(!isClick||!state.ui||state.guide||moonPhases.isVisible())return;
  if(state.mode==='blackholes')return;
  if(state.mode==='constellation'){constellationScene.handlePointer(e);return;}
  const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);
  const list=state.mode==='solar'?Object.values(solarBodies).map(b=>b.mesh):state.mode==='earth'?[earth,...(moon.visible?[moon]:[]),...earthSense.getPickables(),...(continentOverlay?.getPickables()||[]),...(nearEarth.root.visible?nearEarth.getPickables():[]),...(deepSpaceOverview?.getPickables()||[])]:deepUniverse.getPickables();
  if(state.solarNearOrbit)list.push(...Object.entries(solarBodies).filter(([id])=>id!=='earth'&&id!=='moon').map(([,body])=>body.mesh));
  const hits=raycaster.intersectObjects(list,state.mode!=='earth');if(hits.length){
    if(continentOverlay?.pick(hits[0].object))return;
    if(earthSense.pick(hits[0].object))return;
    if(hits[0].object===earth&&earthExperience==='sense'&&state.target==='earth'&&!earthEnvironment.isVisible()&&(!earthSense.isVisible()||earthSense.isSurfacePicking())){
      const point=surfaceCoordinates(hits[0].point,earth);
      if(point){const wasClosed=!earthSense.isVisible();if(wasClosed)earthSense.selectTab('places');openEarthSense();earthSense.pickSurfaceLocation(point.lat,point.lon,{force:wasClosed});return;}
    }
    let obj=hits[0].object;while(obj&&!obj.userData.id&&obj!==earth&&obj!==moon)obj=obj.parent;const id=obj===earth?'earth':obj===moon?'moon':obj?.userData.id;if(id&&state.target!==id)goTo(id);
  }
  downAt=null;
});
let wasMobile=mobile();
window.addEventListener('resize',()=>{
  renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(qualityMode==='auto'?Math.min(qualityRatio,mobile()?1.5:1.75):qualityRatio);composition();
  if(wasMobile!==mobile()){
    wasMobile=mobile();
    if(state.guide)tour.reframe();else if(moonPhases.isVisible())frameMoonLesson();
    else if(earthExperience==='sense'){
      const place=earthSense.getLockedLocation();
      if(continentFollow)focusContinent(continentFollow);else if(place)focusLocation(place.lat,place.lon);else startFlight(earth,new THREE.Vector3(0,1.3,mobile()?24.5:15.6),700);
    }else goTo(state.target);
  }
  invalidate();
});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();toast('图形上下文已暂停，请刷新页面重新进入星空。');});
camera.position.copy(earthEntryOffset(mobile()?24.5:15.6));controls.target.copy(earth.position);controls.update();
composition();showObjectInfo('earth');syncToggles();
$('quality-label').textContent=`${mobile()?'自适应':'高清'}画质 · 本地预览`;
state.loaded=true;
$('loading').classList.add('loaded');setTimeout(()=>$('loading').hidden=true,650);
if(state.textureFailures.length)toast('部分贴图下载较慢或未能加载，先使用备用外观；下载完成后会自动补上。');

function updateLabels() {
  const blockers=explorerUI?.getOcclusionRects()||[],placed=[];let nearbyLabels=0;
  if(mobile()&&state.ui)for(const node of document.querySelectorAll('.site-header,.mode-nav,.earth-navigation,.solar-navigation,.playback-controls,.mobile-menu')){
    const css=getComputedStyle(node);if(!node.hidden&&css.display!=='none'&&css.visibility!=='hidden')blockers.push(node.getBoundingClientRect());
  }
  const galaxyDock=['galaxy','atlas'].includes(state.mode)?explorerUI?.getLayoutBounds().dock:null;
  const labelBottom=galaxyDock?galaxyDock.top-32:innerHeight-(mobile()?172:195);
  const occluders=state.mode==='earth'?[{object:earth,radius:3.03},{object:moon,radius:.78}]:state.mode==='solar'?Object.values(solarBodies).map(b=>({object:b.mesh,radius:b.baseRadius})):deepUniverse.getOccluders?.()||[];
  const spheres=occluders.map(o=>({object:o.object,radius:o.radius*o.object.getWorldScale(new THREE.Vector3()).x,center:o.object.getWorldPosition(new THREE.Vector3())}));
  // Reserve the Galaxy's Solar System locator before ordinary star labels,
  // and the selected planet before background labels in the Solar System.
  const items=[...labelItems].sort((a,b)=>(b.priority||0)-(a.priority||0)||(state.mode==='solar'?Number(b.target===state.target)-Number(a.target===state.target):0));
  // Keep names and orbit notes clear of the three miniature spacecraft, even
  // after the camera rotates and their projected positions move together.
  const craftAreas=[];
  if(state.labels&&state.ui)for(const item of items){
    if(!item.deepSpace||item.annotation)continue;
    let visible=true;for(let node=item.object;node;node=node.parent)if(!node.visible)visible=false;
    if(!visible)continue;
    const position=item.object.getWorldPosition(new THREE.Vector3()),distance=position.distanceTo(camera.position);
    if(distance<=item.min||distance>=item.max||item.target===state.target)continue;
    const direction=position.clone().sub(camera.position).normalize();
    if(spheres.some(sphere=>{const ray=sphere.center.clone().sub(camera.position),along=ray.dot(direction);return along>0&&along<distance-.01&&ray.lengthSq()-along*along<sphere.radius*sphere.radius;}))continue;
    const projected=position.clone().project(camera);if(projected.z<-1||projected.z>1||Math.abs(projected.x)>1||Math.abs(projected.y)>1)continue;
    const x=(projected.x*.5+.5)*innerWidth,y=(-projected.y*.5+.5)*innerHeight;
    const depth=Math.max(.1,-position.applyMatrix4(camera.matrixWorldInverse).z);
    const radius=Math.max(mobile()?20:28,Math.min(mobile()?50:80,innerHeight*.5*Math.abs(camera.projectionMatrix.elements[5])*(item.avoidRadius||1.3)/depth));
    craftAreas.push({item,radius,left:x-radius,right:x+radius,top:y-radius,bottom:y+radius});
  }
  items.forEach(item=>{
    if(item.leader)item.leader.hidden=true;
    const selected=state.mode==='solar'&&!state.guide&&!!item.solarBody&&item.target===state.target;
    item.element.classList.toggle('solar-selected',selected);
    item.element.disabled=state.guide;
    let parent=item.object,visible=state.labels&&state.ui;while(parent){if(!parent.visible)visible=false;parent=parent.parent;}
    if(item.nearEarth&&nearbyLabels>=(mobile()?3:5))visible=false;
    if(visible){item.object.getWorldPosition(worldPos);const distance=worldPos.distanceTo(camera.position);visible=distance>item.min&&distance<item.max&&(selected||item.target!==state.target);
      const direction=worldPos.clone().sub(camera.position).normalize();
      for(const sphere of spheres){let o=sphere.object,own=false;while(o){if(o===item.object){own=true;break;}o=o.parent;}if(own||sphere.object.userData.id===item.target)continue;const ray=sphere.center.clone().sub(camera.position);const along=ray.dot(direction);if(along>0&&along<distance-.01&&ray.lengthSq()-along*along<sphere.radius*sphere.radius){visible=false;break;}}
      temp.copy(worldPos).project(camera);if(temp.z>1||temp.z<-1)visible=false;
      const x=(temp.x*.5+.5)*innerWidth,y=(-temp.y*.5+.5)*innerHeight;
      const labelWidth=mobile()?Math.min(148,Math.max(64,item.element.textContent.length*11+14)):Math.max(64,item.element.textContent.length*11+24);
      const labelHeight=mobile()?Math.max(27,Math.ceil(item.element.textContent.length*11/(labelWidth-14))*16+8):27;
      let box={left:x,top:y,right:x+labelWidth,bottom:y+labelHeight};
      if(item.priority){
        const width=item.element.offsetWidth||item.element.textContent.length*(item.deepSpace?(mobile()?10:12):(mobile()?13:15))+28,height=item.element.offsetHeight||(item.deepSpace?30:34);
        const craftName=item.deepSpace&&!item.annotation,gap=craftName?(mobile()?10:14):7;
        let candidates=[[x+18,y-height/2],[x-width-18,y-height/2],[x-width/2,y-height-20],[x-width/2,y+20]];
        if(craftName){
          const clearance=(craftAreas.find(area=>area.item===item)?.radius||(mobile()?20:28))+10;
          const centered=Math.max(12,Math.min(innerWidth-width-12,x-width/2));
          candidates=[];
          for(const step of [0,1,2]){
            const shift=step*(height+gap);
            for(const dy of step?[-shift,shift]:[0])candidates.push([x+clearance,y-height/2+dy],[x-width-clearance,y-height/2+dy]);
            candidates.push([centered,y-clearance-height-shift],[centered,y+clearance+shift]);
          }
        }
        const fits=candidate=>candidate.left>=12&&candidate.right<=innerWidth-12&&candidate.top>=(mobile()?145:115)&&candidate.bottom<=labelBottom&&![...blockers,...placed].some(r=>candidate.left<r.right+gap&&candidate.right>r.left-gap&&candidate.top<r.bottom+gap&&candidate.bottom>r.top-gap)&&(!item.deepSpace||!craftAreas.some(r=>candidate.left<r.right+4&&candidate.right>r.left-4&&candidate.top<r.bottom+4&&candidate.bottom>r.top-4));
        const candidate=candidates.map(([left,top])=>({left,top,right:left+width,bottom:top+height})).find(fits);
        if(candidate)box=candidate;else visible=false;
      }else{
        if(x<12||box.right>innerWidth-12||y<(mobile()?145:115)||y>labelBottom)visible=false;
        const overlaps=r=>box.left<r.right+5&&box.right>r.left-5&&box.top<r.bottom+5&&box.bottom>r.top-5;
        if(visible&&(blockers.some(overlaps)||placed.some(overlaps)))visible=false;
      }
      if(visible){placed.push(box);if(item.nearEarth)nearbyLabels++;}
      item.element.style.transform=`translate(${Math.round(box.left)}px,${Math.round(box.top)}px)`;
      if(visible&&item.leader){
        const endX=Math.max(box.left,Math.min(box.right,x)),endY=Math.max(box.top,Math.min(box.bottom,y));
        const dx=endX-x,dy=endY-y,length=Math.hypot(dx,dy);
        item.leader.style.width=`${Math.max(0,length-4)}px`;
        item.leader.style.transform=`translate(${Math.round(x)}px,${Math.round(y)}px) rotate(${Math.atan2(dy,dx)}rad)`;
        item.leader.hidden=length<8;
      }
    }
    item.element.hidden=!visible;
  });
}
function updateMotion(dt) {
  const t=state.elapsed;
  deepSpaceOverview?.update(t,{visible:Boolean(state.deepSpaceCraft&&isDeepSpaceOverview()),orbits:state.orbits,selected:state.target,nearOrbit:state.solarNearOrbit});
  if(detailRoot.visible){
    earthEnvironment?.update(t);
    const lunarLesson=moonPhases?.isVisible()||false;
    earth.visible=clouds.visible=earthAtmosphere.visible=sunlight.visible=!lunarLesson;
    if(lunarLesson)moonPhases.update(t,{orbits:state.orbits,labels:state.labels});
    const earthLesson=earthExperience==='sense'||earthSense?.isVisible()||earthEnvironment?.isVisible()||lunarLesson;
    moon.visible=!earthLesson;moonOrbit.visible=state.orbits&&!earthLesson;
    const orbitTime=t+(earthEnvironment?.getStatus().rotationOffset||0)/EARTH_ROTATION_RATE;
    const ma=orbitTime*.017+.63;moon.position.set(Math.cos(ma)*10.8,0,-Math.sin(ma)*10.8).applyQuaternion(moonOrbit.quaternion);moon.lookAt(earth.position);
    nearEarth.update(orbitTime,{orbits:state.orbits,selected:state.target,visible:!earthLesson,loadModels:secondarySceneReady});
  }
  if(solarRoot.visible){
    const referenceView=state.mode==='solar'&&!state.guide;
    for(const [id,b] of Object.entries(solarBodies)){
      const view=SOLAR_VIEW.bodies[id];
      b.radius=referenceView?view.radius*SOLAR_VIEW.scale:b.baseRadius;
      b.orbit=referenceView?view.orbit*SOLAR_VIEW.scale:b.baseOrbit;
      const theta=referenceView?-view.start-t*view.rate*.22:b.angle+t*b.rate;
      b.group.position.set(Math.cos(theta)*b.orbit,0,Math.sin(theta)*b.orbit);
      b.visual.scale.setScalar(b.radius/b.baseRadius);
      b.visual.rotation.set(0,referenceView?-theta:0,referenceView?view.tilt:0,'YXZ');
      b.mesh.rotation.set(0,t*(referenceView?view.spin:.06),!referenceView&&id==='uranus'?1.7:0);
      if(b.ring)b.ring.rotation.set(referenceView?Math.PI/2:-Math.PI/2+.3,referenceView?0:.12,0);
      if(b.frame){
        const earthView=SOLAR_VIEW.bodies.earth;
        b.frame.rotation.set(0,referenceView?earthView.start+t*earthView.rate*.22:0,referenceView?earthView.tilt:0,'YXZ');
      }
      b.labelItem.min=referenceView?0:b.baseRadius*3;
      if(b.orbitLine){
        b.orbitLine.scale.setScalar(b.orbit/b.baseOrbit);
        const selected=referenceView&&state.target===id;
        b.orbitLine.material.color.setHex(selected?0x8feaff:referenceView?0x2e9cff:id==='moon'?0x8d9da9:0x66828e);
        b.orbitLine.material.opacity=selected?.57+(state.paused?0:.09*(.5+.5*Math.sin(t*2.1))):referenceView?.20:id==='moon'?.15:.27;
        b.orbitLine.visible=state.orbits;
      }
    }
    solarBodies.earth.mesh.material.uniforms.sunDirection.value.copy(solarBodies.earth.group.position).negate().normalize();
  }
  // The solar context and detailed Earth share one simulation clock. Express
  // solar positions in an Earth-centred frame, without rendering a second Earth.
  if(state.solarNearOrbit){
    const towardSun=solarBodies.earth.group.position.clone().negate().normalize();
    solarRoot.quaternion.setFromUnitVectors(towardSun,earthSunDirection);
    solarRoot.scale.setScalar(3);
    solarRoot.position.copy(solarBodies.earth.group.position).applyQuaternion(solarRoot.quaternion).multiplyScalar(-3);
  }else{solarRoot.position.set(0,0,0);solarRoot.quaternion.identity();solarRoot.scale.setScalar(1);}
  solarBodies.earth.group.visible=!state.solarNearOrbit;
}
function keepCameraOutsideEarth(){
  if(state.mode==='earth'&&camera.position.length()<3.3){camera.position.setLength(3.3);controls.update();}
}
function updateCamera(now) {
  if(moonPhases?.isVisible()){controls.update();return;}
  if(flight){
    const progress=Math.min(1,(now-flight.start)/flight.duration),ease=progress<.5?4*progress*progress*progress:1-Math.pow(-2*progress+2,3)/2;
    const target=flight.object instanceof THREE.Vector3?flight.object:flight.object.getWorldPosition(new THREE.Vector3());
    const offset=flight.orbitId?nearEarth.getCameraOffset(flight.orbitId,mobile()):flight.localDirection?flight.localDirection.clone().transformDirection(earth.matrixWorld).multiplyScalar(flight.locationDistance):flight.offset;
    camera.position.lerpVectors(flight.fromPosition,target.clone().add(offset),ease);controls.target.lerpVectors(flight.fromTarget,target,ease);controls.update();keepCameraOutsideEarth();
    if(progress===1){flight=null;controls.enabled=true;following=getFollowObject();rememberFollowFrame();}
  }else{
    if(following){
      following.getWorldPosition(worldPos);
      if(catalog[state.target]?.nearEarth||(state.target==='earth'&&(earthSense?.getLockedLocation()||continentFollow))){
        following.getWorldQuaternion(currentFollowRotation);followRotationDelta.copy(lastFollowRotation).invert().premultiply(currentFollowRotation);
        camera.position.sub(lastFollowPosition).applyQuaternion(followRotationDelta).add(worldPos);
        controls.target.sub(lastFollowPosition).applyQuaternion(followRotationDelta).add(worldPos);lastFollowRotation.copy(currentFollowRotation);
      }else{temp.copy(worldPos).sub(lastFollowPosition);camera.position.add(temp);controls.target.add(temp);}
      lastFollowPosition.copy(worldPos);
    }
    controls.update();keepCameraOutsideEarth();
    const distance=camera.position.distanceTo(controls.target);
    if(state.guide||earthExperience==='sense')return;
    if(state.mode==='earth'&&state.target==='earth'&&distance>34){setMode('solar');toast('已进入太阳系 · 继续缩小，抵达银河');}
    else if(state.mode==='earth'&&state.target!=='earth'&&distance>20){goTo('earth');}
    else if(state.mode==='solar'&&state.target==='solar'&&distance>(mobile()?520:370)){setMode('galaxy');toast('已进入银河系');}
    else if(state.mode==='solar'&&state.target!=='solar'&&distance>Math.max(40,solarBodies[state.target]?.radius*28)){setMode('solar');}
    else if(state.mode==='galaxy'&&state.target==='galaxy'&&distance<26){setMode('solar');}
    else if(state.mode==='galaxy'&&distance>controls.maxDistance*.95){setMode('atlas');toast('已打开星系图鉴 · 选择下一座星系');}
  }
}
// Keep the night-side shimmer alive even when orbital time is paused. Geographic
// reading light and the separate lunar lesson do not display these city lights.
function cityLightsVisible(){
  return detailRoot.visible&&earth.visible&&earth.material.uniforms.geographicLight.value<.999;
}
function frame(now,dt,foregroundElapsed=dt) {
  const rawDt=dt;if(!state.paused)state.elapsed+=dt*state.speed;
  if(layoutDirty)composition();
  updateMotion(dt);if(deepUniverse.root.visible)deepUniverse.update(dt,state.elapsed,{paused:state.paused,speed:state.speed,orbits:state.orbits,reducedMotion:motionPreference.matches});if(earthSense.isVisible())earthSense.update(state.paused?0:dt*state.speed,state.elapsed);scene.updateMatrixWorld(true);updateCamera(now);
  if(deepUniverse.root.visible){
    deepUniverse.updatePresentation(camera);
    if(craftViewRect&&!flight)centerCraftView({THREE,camera,points:deepUniverse.getCraftPoints(),width:innerWidth,height:innerHeight,viewport:craftViewRect});
  }
  const animationStatus=detailRoot.visible?{hubbleModel:nearEarth.getModelStatus()}:deepUniverse.getAnimationStatus?.();
  explorerUI?.updateAnimationStatus(animationStatus);
  const earthLabelOptions={labels:state.labels,ui:state.ui,pixelRatio:renderer.getPixelRatio(),occlusionRects:earthExperience==='sense'&&state.ui?(explorerUI?.getOcclusionRects()||[]):[]};
  earthSense?.updateLabels(camera,earthLabelOptions);
  continentOverlay?.update(camera,earthLabelOptions);
  ambientFlybys.update(rawDt,{enabled:!flight&&earthExperience==='roam'&&!earthSense.isVisible()&&!earthEnvironment.isVisible()&&!moonPhases.isVisible()&&!state.guide&&!['trajectories','constellation','blackholes'].includes(state.mode),paused:state.paused,quality:qualityMode});
  if(state.mode==='constellation'){
    constellationScene.setUIVisible?.(state.ui);
    constellationScene.setOcclusionRects?.(state.ui?Object.values(constellationUI.getLayoutBounds()).filter(Boolean):[]);
    constellationScene.update(rawDt);
  }
  if(state.mode==='blackholes'){blackHoleScene.update(state.elapsed,{ui:state.ui,compact:mobile(),occlusion:state.ui?Object.values(blackHoleUI.getLayoutBounds()).filter(Boolean):[]});canvas.dataset.blackHole=JSON.stringify(blackHoleScene.getStatus());}else delete canvas.dataset.blackHole;
  updateCityLights(earth.material,foregroundElapsed,{enabled:cityLightsVisible(),
    reducedMotion:motionPreference.matches,quality:qualityMode,compact:mobile()});
  labelTime+=dt;if(labelTime>.08||dt===0||state.paused){labelTime=0;updateLabels();}
  if(qualityMode==='auto'&&!document.hidden&&rawDt<.3){qualityWindow+=dt;qualityFrames++;if(rawDt>1/26)slowFrames++;if(qualityWindow>5){if(slowFrames/qualityFrames>.55&&qualityRatio>.85){qualityRatio=Math.max(.85,qualityRatio-.2);renderer.setPixelRatio(qualityRatio);}slowFrames=qualityWindow=qualityFrames=0;}}
  hudTime+=dt;if(hudTime>.24||state.paused){hudTime=0;const distance=camera.position.distanceTo(controls.target);$('distance-label').textContent=state.mode==='constellation'?'恒星天球坐标 · 连线为辨认辅助':moonPhases.isVisible()?'月相教学模型 · 大小与距离不按比例':state.mode==='earth'&&state.target==='earth'?`距地表约 ${Math.round(Math.max(0,distance-3)/3*6371).toLocaleString('zh-CN')} km · 示意`:state.mode==='solar'?'行星尺寸与轨道采用视觉比例':state.mode==='galaxy'?'银河结构与太阳位置为示意':'模型尺寸与距离为示意';}
  renderer.render(scene,camera);
  canvas.dataset.renderFrames=String((Number(canvas.dataset.renderFrames)||0)+1);
  canvas.dataset.renderMode=renderScheduler?.getStatus().mode||'starting';
  canvas.dataset.placeLock=earthSense.getLockedLocation()?.id||'';
  canvas.dataset.continentFollow=continentFollow||'';
  canvas.dataset.earthExperience=earthExperience;
  canvas.dataset.solarNearOrbit=String(state.solarNearOrbit);
  canvas.dataset.deepSpaceCraft=String(Boolean(deepSpaceOverview?.root.visible));
  if(deepUniverse.root.visible||detailRoot.visible)canvas.dataset.animationStatus=JSON.stringify(animationStatus||{});else delete canvas.dataset.animationStatus;
  canvas.dataset.cityLights=earth.material.uniforms.cityLightMotion.value?'shimmer':cityLightsVisible()?'static':'hidden';
  canvas.dataset.cityLightTime=earth.material.uniforms.cityLightTime.value.toFixed(2);
  const flybyStatus=ambientFlybys.getStatus();canvas.dataset.flyby=flybyStatus.active||'';canvas.dataset.flybyEnabled=String(flybyStatus.visible);canvas.dataset.flybyProgress=flybyStatus.progress.toFixed(4);canvas.dataset.flybySpawned=String(flybyStatus.spawned);
}
renderScheduler=createRenderScheduler({draw:frame,shouldAnimate:()=>(state.mode!=='constellation'&&!state.paused)||!!flight||deepUniverse.needsAnimation?.()||(cityLightsVisible()&&!motionPreference.matches),isCompact:mobile});
controls.addEventListener('change',invalidate);
motionPreference.addEventListener('change',invalidate);
// UI changes and damping wake a settled paused scene without a permanent frame loop.
for(const event of ['click','input','change','keydown','pointerdown','pointerup','wheel'])document.addEventListener(event,invalidate,{passive:true});
const layoutObserver=new ResizeObserver(()=>{layoutDirty=true;invalidate();});
createMobileLayout({onLayout(){layoutDirty=true;invalidate();}});
createMobileWorkspace({onLayout(){layoutDirty=true;invalidate();}});
for(const el of document.querySelectorAll('.object-info,.facts-panel,.destination-dock,.earthsense-panel,.earth-environment-panel,.moon-phases-panel,.trajectory-panel,.guide-lesson,.guide-chapters,.guide-topbar,.black-hole-hero,.black-hole-card,.black-hole-dock'))layoutObserver.observe(el);
let hiddenAt=0;
document.addEventListener('visibilitychange',()=>{
  document.body.classList.toggle('page-idle',document.hidden);
  if(document.hidden)hiddenAt=performance.now();else if(hiddenAt){if(flight)flight.start+=performance.now()-hiddenAt;hiddenAt=0;}
  renderScheduler.visibilityChanged();
});
updateMotion(0);renderScheduler.start();
window.EXPLORE_UNIVERSE={goTo,setMode,getState:()=>({...state,cameraPosition:camera.position.toArray(),cameraTarget:controls.target.toArray(),cameraDistance:camera.position.distanceTo(controls.target),cameraEarthDistance:camera.position.length(),flight:!!flight,renderer:'Three.js r185',viewport:[innerWidth,innerHeight],textureCount:Object.keys(textures).length,catalogCount:Object.keys(catalog).length,qualityRatio,earthSense:earthSense.getStatus(),nearEarth:nearEarth.getOrbitRecords().map(r=>({id:r.id,position:r.object.position.toArray(),quaternion:r.object.quaternion.toArray(),visible:detailRoot.visible&&nearEarth.root.visible&&r.object.visible,orbitVisible:detailRoot.visible&&nearEarth.root.visible&&r.orbit.visible}))})};
