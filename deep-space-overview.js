import {createJWSTModel} from './jwst-model.js';
import {loadVoyagerModel} from './voyager-model.js';
import {loadRomanModel,createRomanPlaceholder} from './roman-model.js';

// Earth-centred teaching overview. Distances are deliberately compressed; none
// of these display coordinates are an ephemeris or a current spacecraft fix.
export function createDeepSpaceOverview({THREE,sunDirection,onChange=()=>{},mobile=()=>false,loadVoyager=loadVoyagerModel,loadRoman=loadRomanModel}) {
  const root=new THREE.Group();root.name='deep-space-overview';root.visible=false;
  const v=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z),gold=0xe7c984,cyan=0x8bdde8,purple=0xc6b1ee;
  const sun=(sunDirection?.clone()||v(-.83,.28,.47)).normalize();
  const away=sun.clone().negate(),tangent=v(sun.z,0,-sun.x).normalize();
  const haloUp=new THREE.Vector3().crossVectors(away,tangent).normalize();
  const l2=away.clone().multiplyScalar(7.3);
  // Roman's marker shows a place on its target L2 orbit, not a live position.
  // Its taller target loop separates both miniature models throughout Webb's
  // full cycle, including when the user rotates away from the entry camera.
  const romanRadii=[1.6,3.3],romanPhase=4.7;
  const romanPosition=l2.clone().addScaledVector(tangent,Math.cos(romanPhase)*romanRadii[0]).addScaledVector(haloUp,Math.sin(romanPhase)*romanRadii[1]);
  // The outermost near-Earth satellite ring has radius 6.46. Keep the entire
  // Voyager miniature beyond it so this cannot look like another Earth orbiter.
  // The fixed lateral direction gives it visible clearance from Earth's limb
  // in both entry views, opposite the L2 telescopes, without tracking the camera.
  // The direction and compressed 8.8-unit radius are visual layout choices.
  const voyagerPosition=tangent.clone().multiplyScalar(6).addScaledVector(sun,6).add(v(0,1,0)).normalize().multiplyScalar(8.8);
  const outward=voyagerPosition.clone().normalize();
  const guides=new THREE.Group();guides.name='deep-space-position-guides';root.add(guides);
  const labels=[],pickables=[],jwstAnchor=new THREE.Group(),voyagerAnchor=new THREE.Group(),romanAnchor=new THREE.Group();
  jwstAnchor.name='overview-jwst';voyagerAnchor.name='overview-voyager';romanAnchor.name='overview-roman';
  jwstAnchor.userData.id='jwst';voyagerAnchor.userData.id='voyager';romanAnchor.userData.id='roman';
  root.add(jwstAnchor,voyagerAnchor,romanAnchor);voyagerAnchor.position.copy(voyagerPosition);romanAnchor.position.copy(romanPosition);
  let disposed=false,loadStarted=false,voyagerModel=null,modelStatus='preview',lastElapsed=0;
  let romanLoadStarted=false,romanModel=null,romanStatus='preview';
  let currentOptions={visible:false,orbits:true,selected:null,nearOrbit:false};

  function ownResources(object) {
    const geometries=new Set(),materials=new Set(),textures=new Set();
    object.traverse(item=>{
      if(item.geometry)geometries.add(item.geometry);
      for(const material of item.material?[].concat(item.material):[]){
        materials.add(material);for(const value of Object.values(material))if(value?.isTexture)textures.add(value);
      }
    });
    return {geometries,materials,textures};
  }
  function release(object) {
    const owned=ownResources(object);
    owned.geometries.forEach(item=>item.dispose());owned.materials.forEach(item=>item.dispose());
    owned.textures.forEach(item=>{item.dispose();item.source?.data?.close?.();});
    object.removeFromParent();
  }
  function mesh(geometry,material,parent){const object=new THREE.Mesh(geometry,material);parent.add(object);return object;}
  function line(points,color,parent=guides,{dashed=false,opacity=.68,name=''}={}) {
    const material=dashed?new THREE.LineDashedMaterial({color,transparent:true,opacity,dashSize:.18,gapSize:.12,depthWrite:false}):new THREE.LineBasicMaterial({color,transparent:true,opacity,depthWrite:false});
    const object=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),material);object.name=name;
    if(dashed)object.computeLineDistances();parent.add(object);return object;
  }
  function label(object,name,id,color,priority,description,extra={}) {
    const entry={object,name,id,color,priority,description,className:id?'deep-space-craft-label':'deep-space-annotation',annotation:!id,...extra};labels.push(entry);return entry;
  }
  function anchor(position,parent=root){const object=new THREE.Object3D();object.position.copy(position);parent.add(object);return object;}
  function tagMeshes(object,id) {
    object.traverse(item=>{if(item.isMesh){item.userData.id=id;pickables.push(item);}});
  }
  function removePickMeshes(object){
    for(let i=pickables.length-1;i>=0;i--){let item=pickables[i];while(item&&item!==object)item=item.parent;if(item===object)pickables.splice(i,1);}
  }
  function hitTarget(parent,id,radius) {
    const object=mesh(new THREE.SphereGeometry(radius,12,8),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,colorWrite:false}),parent);
    object.name=`overview-${id}-hit-area`;object.userData.id=id;pickables.push(object);
  }
  function rod(from,to,radius,material,parent){
    const delta=to.clone().sub(from),object=mesh(new THREE.CylinderGeometry(radius,radius,delta.length(),6),material,parent);
    object.position.copy(from).add(to).multiplyScalar(.5);object.quaternion.setFromUnitVectors(v(0,1,0),delta.normalize());return object;
  }

  const webb=createJWSTModel({THREE,compact:true});
  webb.focus.scale.setScalar(.12);
  // The sunshield's cold (+Y) side faces away from the Sun; the mirror looks
  // across that axis. This orientation is schematic, but not an Earth orbit.
  const localX=new THREE.Vector3().crossVectors(away,tangent).normalize();
  webb.focus.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(localX,away,tangent));
  jwstAnchor.add(webb.focus);tagMeshes(webb.focus,'jwst');hitTarget(jwstAnchor,'jwst',.63);
  label(jwstAnchor,'詹姆斯·韦伯太空望远镜','jwst','#e7c984',60,'詹姆斯·韦伯太空望远镜：绕日地 L2 附近运行，距地球约 150 万千米。点击近距离查看。');

  const preview=new THREE.Group();preview.name='overview-voyager-preview';preview.scale.setScalar(.12);voyagerAnchor.add(preview);
  const white=new THREE.MeshStandardMaterial({color:0xe8e4dc,metalness:.3,roughness:.46,side:THREE.DoubleSide});
  const steel=new THREE.MeshStandardMaterial({color:0x9dabb7,metalness:.7,roughness:.35});
  const blanket=new THREE.MeshStandardMaterial({color:0xb59146,metalness:.65,roughness:.4});
  const dark=new THREE.MeshStandardMaterial({color:0x292d36,metalness:.5,roughness:.5});
  const profile=[];for(let i=0;i<=18;i++){const radius=i/18*2.25;profile.push(new THREE.Vector2(radius,radius*radius*.14));}
  const dish=mesh(new THREE.LatheGeometry(profile,40),white,preview);dish.rotation.x=Math.PI/2;
  const rim=mesh(new THREE.TorusGeometry(2.25,.045,6,48),steel,preview);rim.position.z=.71;
  const bus=mesh(new THREE.CylinderGeometry(.68,.75,.85,10),blanket,preview);bus.rotation.x=Math.PI/2;bus.position.z=-.65;
  const receiver=v(0,0,1.5);mesh(new THREE.SphereGeometry(.12,10,6),steel,preview).position.copy(receiver);
  for(let i=0;i<3;i++){const angle=i/3*Math.PI*2;rod(v(Math.cos(angle)*1.95,Math.sin(angle)*1.95,.5),receiver,.035,steel,preview);}
  const boom=v(-6,.7,-1.2);rod(v(-.45,0,-.6),boom,.06,steel,preview);mesh(new THREE.SphereGeometry(.15,8,6),steel,preview).position.copy(boom);
  rod(v(.45,-.2,-.6),v(3.8,-1.1,-1.4),.08,steel,preview);
  for(let i=0;i<3;i++){
    const rtg=mesh(new THREE.CylinderGeometry(.29,.29,.65,10),dark,preview);rtg.rotation.z=Math.PI/2;rtg.position.set(2.2+i*.62,-.7-i*.12,-1.3);
    for(let k=0;k<4;k++){const fin=mesh(new THREE.TorusGeometry(.31,.035,4,12),steel,rtg);fin.rotation.x=Math.PI/2;fin.position.y=-.24+k*.16;}
  }
  rod(v(.4,.3,-.8),v(2,1.7,-.8),.08,steel,preview);mesh(new THREE.BoxGeometry(.65,.5,.55),dark,preview).position.set(2,1.7,-.8);
  tagMeshes(preview,'voyager');hitTarget(voyagerAnchor,'voyager',.65);
  label(voyagerAnchor,'旅行者 1 号','voyager','#8bdde8',50,'旅行者 1 号：已进入星际空间。位置和路线为压缩示意，不是实时位置。点击近距离查看。');
  const romanCarrier=new THREE.Group();romanCarrier.name='overview-roman-model';romanCarrier.scale.setScalar(1.6/18);romanAnchor.add(romanCarrier);
  let romanPreview=createRomanPlaceholder({THREE});romanCarrier.add(romanPreview.root);tagMeshes(romanPreview.root,'roman');hitTarget(romanAnchor,'roman',.7);
  label(romanAnchor,'南希·格蕾丝·罗曼太空望远镜','roman','#c6b1ee',55,'南希·格蕾丝·罗曼太空望远镜：图中表示目标日地 L2 轨道及转移关系，不是实时位置。点击近距离查看。');
  // The overview stays readable before the official NASA mesh has decoded.
  // These short-range lights illuminate only the miniature spacecraft.
  for(const parent of [jwstAnchor,voyagerAnchor,romanAnchor]){const fill=new THREE.PointLight(0xe0eafa,7,3.3,2);fill.position.set(1,1.6,1.8);parent.add(fill);}

  const haloPoints=[];
  for(let i=0;i<=96;i++){const phase=i/96*Math.PI*2;haloPoints.push(l2.clone().addScaledVector(tangent,Math.cos(phase)*.85).addScaledVector(haloUp,Math.sin(phase)*.50));}
  const halo=line(haloPoints,gold,guides,{opacity:.75,name:'jwst-l2-halo-orbit'});
  const l2Marker=mesh(new THREE.SphereGeometry(.055,10,6),new THREE.MeshBasicMaterial({color:gold}),guides);l2Marker.position.copy(l2);
  const l2Label=anchor(l2.clone().addScaledVector(haloUp,-1.05),guides);
  label(l2Label,'日地 L2 · 距地球约 150 万 km',null,'#e7c984',12,'日地 L2 位于地球背向太阳的一侧；詹姆斯·韦伯太空望远镜在其附近的三维轨道上运行。',{orbitAnnotation:true});
  const romanHaloPoints=[];
  for(let i=0;i<=96;i++){const phase=i/96*Math.PI*2;romanHaloPoints.push(l2.clone().addScaledVector(tangent,Math.cos(phase)*romanRadii[0]).addScaledVector(haloUp,Math.sin(phase)*romanRadii[1]));}
  line(romanHaloPoints,purple,guides,{dashed:true,opacity:.54,name:'roman-target-l2-halo-orbit'});
  label(anchor(l2.clone().addScaledVector(haloUp,1.55),guides),'罗曼目标 L2 轨道 · 示意',null,'#c6b1ee',11,'紫色虚线表示罗曼太空望远镜的目标 L2 轨道；形状、大小及标记位置为示意，不代表当前轨迹或实时位置。',{orbitAnnotation:true});

  function brokenRelation(from,to,color,name,parent=guides) {
    const delta=to.clone().sub(from),middle=from.clone().addScaledVector(delta,.54);
    const direction=delta.clone().normalize(),gap=.22;
    const first=line([from,middle.clone().addScaledVector(direction,-gap)],color,parent,{dashed:true,name:`${name}-before-break`});
    const second=line([middle.clone().addScaledVector(direction,gap),to],color,parent,{dashed:true,name:`${name}-after-break`});
    let cross=new THREE.Vector3().crossVectors(direction,v(0,1,0));if(cross.lengthSq()<.01)cross=v(1,0,0);cross.normalize();
    for(const offset of [-.11,.11]){
      const center=middle.clone().addScaledVector(direction,offset);
      line([center.clone().addScaledVector(cross,-.15).addScaledVector(direction,-.06),center.clone().addScaledVector(cross,.15).addScaledVector(direction,.06)],color,parent,{opacity:.9,name:`${name}-distance-break`});
    }
    return {first,second,middle};
  }
  brokenRelation(away.clone().multiplyScalar(3.3),l2,gold,'earth-to-l2');
  const romanTransferStart=away.clone().multiplyScalar(3.3).addScaledVector(tangent,-.6);
  const romanTransfer=new THREE.QuadraticBezierCurve3(romanTransferStart,l2.clone().multiplyScalar(.70).addScaledVector(tangent,-2.0),romanPosition);
  line(romanTransfer.getPoints(48),purple,guides,{dashed:true,opacity:.48,name:'roman-target-transfer-schematic'});
  const relationGroup=new THREE.Group();relationGroup.name='voyager-position-relation';guides.add(relationGroup);
  const relation=brokenRelation(outward.clone().multiplyScalar(3.3),voyagerPosition,cyan,'earth-to-voyager',relationGroup);
  const relationAnchor=anchor(relation.middle.clone().add(v(0,-.3,0)),relationGroup);
  label(relationAnchor,'位置关系示意 · 距离压缩',null,'#8bdde8',10,'虚线仅连接地球和旅行者的示意位置，不是旅行者的完整历史轨迹。',{orbitAnnotation:true});

  // Near-orbit mode gets a separate historical journey. These small dated
  // encounter nodes are NOT the scene's present-day Jupiter and Saturn meshes.
  const historyGroup=new THREE.Group();historyGroup.name='voyager-historical-route';historyGroup.visible=false;guides.add(historyGroup);
  const historyStart=outward.clone().multiplyScalar(3.3),journey=voyagerPosition.clone().sub(historyStart);
  const historySide=new THREE.Vector3().crossVectors(outward,v(0,1,0)).normalize();
  const encounters=[
    {name:'木星 · 1979',year:1979,fraction:.28,side:.8},
    {name:'土星 · 1980',year:1980,fraction:.62,side:.65}
  ].map(item=>({...item,position:historyStart.clone().addScaledVector(journey,item.fraction).addScaledVector(historySide,item.side)}));
  const historyCurve=new THREE.CatmullRomCurve3([historyStart,...encounters.map(item=>item.position),voyagerPosition],false,'centripetal');
  line(Array.from({length:65},(_,i)=>historyCurve.getPoint(i/64*.79)),cyan,historyGroup,{opacity:.76,name:'voyager-history-before-break'});
  line(Array.from({length:17},(_,i)=>historyCurve.getPoint(.91+i/16*.09)),cyan,historyGroup,{opacity:.76,name:'voyager-history-after-break'});
  const historyBreak=historyCurve.getPoint(.85),historyDirection=historyCurve.getTangent(.85).normalize();
  for(const offset of [-.09,.09]){
    const center=historyBreak.clone().addScaledVector(historyDirection,offset);
    line([center.clone().addScaledVector(historySide,-.14).addScaledVector(historyDirection,-.055),center.clone().addScaledVector(historySide,.14).addScaledVector(historyDirection,.055)],cyan,historyGroup,{opacity:.9,name:'voyager-history-distance-break'});
  }
  for(const encounter of encounters){
    const node=mesh(new THREE.SphereGeometry(.072,10,6),new THREE.MeshBasicMaterial({color:cyan}),historyGroup);node.position.copy(encounter.position);node.name=`voyager-encounter-${encounter.year}`;
    node.userData.historicalEncounter=true;node.userData.year=encounter.year;
    label(anchor(encounter.position.clone().addScaledVector(historySide,.16),historyGroup),encounter.name,null,'#8bdde8',9,'旅行者 1 号历史飞掠节点；这里只表示先后顺序和飞掠年份，不是该行星或航天器的当前坐标。',{orbitAnnotation:true,historical:true});
  }
  label(anchor(historyCurve.getPoint(.38).addScaledVector(historySide,.65),historyGroup),'历史飞行路径 · 距离压缩',null,'#8bdde8',10,'从地球出发，依次飞掠木星（1979）和土星（1980）后继续向外飞行；路线形状和距离为示意。',{orbitAnnotation:true,historical:true});
  const arrowStart=voyagerPosition.clone().addScaledVector(outward,.65),arrowLength=1.3;
  const arrow=new THREE.ArrowHelper(outward,arrowStart,arrowLength,cyan,.24,.15);arrow.name='voyager-open-outward-direction';guides.add(arrow);
  const outwardLabel=anchor(arrowStart.clone().addScaledVector(outward,arrowLength+.2),guides);
  label(outwardLabel,'星际空间 · 远行方向',null,'#8bdde8',11,'旅行者 1 号于 2012 年越过日球层顶进入星际空间；并非已经离开整个太阳系。',{orbitAnnotation:true});

  async function ensureVoyagerModel() {
    if(loadStarted||disposed)return;loadStarted=true;modelStatus='loading';
    try {
      const model=await loadVoyager({THREE});
      if(disposed){model.dispose();return;}
      // The loader normalises the largest NASA model dimension to 18 units.
      const carrier=new THREE.Group();carrier.name='overview-voyager-nasa';carrier.scale.setScalar(.1);carrier.add(model.root);
      removePickMeshes(preview);
      release(preview);voyagerModel=model;voyagerAnchor.add(carrier);tagMeshes(model.root,'voyager');
      modelStatus='ready';root.updateMatrixWorld(true);onChange();
    } catch {
      if(disposed)return;modelStatus='fallback';onChange();
    }
  }
  async function ensureRomanModel() {
    if(romanLoadStarted||disposed)return;romanLoadStarted=true;romanStatus='loading';
    try {
      const model=await loadRoman({THREE});
      if(disposed){model.dispose();return;}
      removePickMeshes(romanPreview.root);romanPreview.dispose();romanPreview=null;
      romanModel=model;romanCarrier.add(model.root);tagMeshes(model.root,'roman');
      romanStatus='ready';root.updateMatrixWorld(true);onChange();
    } catch {
      if(disposed)return;romanStatus='fallback';onChange();
    }
  }
  function allParentsVisible(object){for(let node=object;node;node=node.parent)if(!node.visible)return false;return true;}
  function update(elapsed,options={}) {
    if(disposed)return;
    currentOptions={...currentOptions,...options};root.visible=!!currentOptions.visible;guides.visible=!!currentOptions.orbits;
    historyGroup.visible=!!currentOptions.nearOrbit;relationGroup.visible=!currentOptions.nearOrbit;
    lastElapsed=Number.isFinite(elapsed)?elapsed:0;
    // Only Webb moves, and only around L2. Pausing the app freezes elapsed time.
    const phase=.6+lastElapsed*.065;
    jwstAnchor.position.copy(l2).addScaledVector(tangent,Math.cos(phase)*.85).addScaledVector(haloUp,Math.sin(phase)*.5);
    if(root.visible){void ensureVoyagerModel();void ensureRomanModel();}
  }
  update(0);
  root.updateMatrixWorld(true);
  const framingPoints=[];
  // Cache a swept bound for the actual deployed Webb shape, not a large cube
  // around L2. This keeps Earth prominent while fitting the full animated loop.
  // Earth uses a dense sphere with a small atmosphere/sampling allowance.
  for(let latitude=0;latitude<=16;latitude++)for(let longitude=0;longitude<32;longitude++){
    const polar=latitude/16*Math.PI,azimuth=longitude/32*Math.PI*2;
    framingPoints.push(v(Math.sin(polar)*Math.cos(azimuth),Math.cos(polar),Math.sin(polar)*Math.sin(azimuth)).multiplyScalar(3.06));
  }
  const webbBounds=new THREE.Box3().setFromObject(webb.focus);
  webbBounds.min.sub(jwstAnchor.position);webbBounds.max.sub(jwstAnchor.position);webbBounds.expandByScalar(.015);
  for(let i=0;i<64;i++){
    const phase=i/64*Math.PI*2,position=l2.clone().addScaledVector(tangent,Math.cos(phase)*.85).addScaledVector(haloUp,Math.sin(phase)*.5);
    for(const x of [webbBounds.min.x,webbBounds.max.x])for(const y of [webbBounds.min.y,webbBounds.max.y])for(const z of [webbBounds.min.z,webbBounds.max.z])framingPoints.push(position.clone().add(v(x,y,z)));
  }
  for(const x of [-.95,.95])for(const y of [-.95,.95])for(const z of [-.95,.95])framingPoints.push(voyagerPosition.clone().add(v(x,y,z)));
  for(const x of [-.85,.85])for(const y of [-.85,.85])for(const z of [-.85,.85])framingPoints.push(romanPosition.clone().add(v(x,y,z)));
  framingPoints.push(...romanHaloPoints.map(point=>point.clone()));
  framingPoints.push(arrowStart.clone().addScaledVector(outward,arrowLength+.25));
  const getFramingPoints=()=>framingPoints.map(point=>point.clone());
  return {
    root,update,getLabels:()=>labels.slice(),getPickables:()=>!disposed&&allParentsVisible(root)?pickables.slice():[],getFramingPoints,
    getDebugState:()=>({disposed,visible:root.visible,orbits:guides.visible,nearOrbit:!!currentOptions.nearOrbit,historicalVisible:allParentsVisible(historyGroup),elapsed:lastElapsed,modelStatus,romanStatus,sunDirection:sun.toArray(),l2:l2.toArray(),jwstPosition:jwstAnchor.position.toArray(),voyagerPosition:voyagerPosition.toArray(),romanPosition:romanPosition.toArray(),romanTargetOrbit:true,romanHaloRadii:romanRadii.slice(),haloBasis:[tangent.toArray(),haloUp.toArray()],haloRadii:[.85,.5],outward:outward.toArray(),arrowEnd:arrowStart.clone().addScaledVector(outward,arrowLength).toArray(),encounters:encounters.map(({name,year,position})=>({name,year,position:position.toArray()})),labels:labels.map(({name,id,annotation})=>({name,id,annotation})),pickables:pickables.length}),
    dispose(){
      if(disposed)return;disposed=true;root.visible=false;
      voyagerModel?.dispose();voyagerModel=null;romanModel?.dispose();romanModel=null;romanPreview?.dispose();romanPreview=null;release(root);pickables.length=0;labels.length=0;
    }
  };
}
