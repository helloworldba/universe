// Compressed science illustrations, plus the credited NASA Voyager spacecraft model.
// All geometry is owned by this scene. Shared glow and star textures remain owned by app.js.
import { createNebulaModel } from './nebula-model.js';
import { createJWSTModel } from './jwst-model.js';
import { loadVoyagerModel } from './voyager-model.js';
import { loadRomanModel } from './roman-model.js';
import { createGalaxyModel } from './galaxy-model.js';
import { createCraftPresentation } from './craft-presentation.js';

export function createDeepUniverse({ THREE, glow, starMap, mobile, catalog, textures = {}, loadVoyager = loadVoyagerModel, loadRoman = loadRomanModel, onChange = () => {} }) {
  const root = new THREE.Group();
  root.name = 'deep-universe';
  root.visible = false;
  const values = Object.values(catalog);
  const galaxies = values.filter(item => item.kind === 'galaxy');
  const isMobile = () => typeof mobile === 'function' ? mobile() : !!mobile;
  const TAU = Math.PI * 2;
  let pickables = [], labels = [], occluders = [], orbitLines = [], animators = [], galaxyRigs = [];
  let activeId = null, activeFocus = null, deploy = 1, deployProgress = 1, deployParts = null, trajectory = null;
  let reducedMotion = false;
  const deploymentDuration = 8, trailStep = .14, maximumTrailPoints = 480, frameTransitionDuration = .4;
  let trajectoryOptions = { frame: 'galaxy', length: 'short' };
  const ownedTextures = new Set();
  let sceneGeneration = 0, voyagerModel = null, voyagerModelStatus = null;
  let romanModel = null, romanModelStatus = null;
  let craftPresentation = null;

  function hash(text) {
    let value = 2166136261;
    for (const character of text) { value ^= character.charCodeAt(0); value = Math.imul(value, 16777619); }
    return value >>> 0;
  }
  function randomFor(text) {
    let seed = hash(text);
    return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  }
  function disposeChildren() {
    sceneGeneration++;
    craftPresentation?.dispose(); craftPresentation = null;
    // Imported assets own their resources and are detached before the generic cleanup.
    voyagerModel?.root.removeFromParent(); voyagerModel?.dispose(); voyagerModel = null; voyagerModelStatus = null;
    romanModel?.root.removeFromParent(); romanModel?.dispose(); romanModel = null; romanModelStatus = null;
    const geometrySet = new Set(), materialSet = new Set();
    root.traverse(object => {
      if (object.geometry) geometrySet.add(object.geometry);
      if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => materialSet.add(material));
    });
    geometrySet.forEach(geometry => geometry.dispose());
    materialSet.forEach(material => material.dispose());
    ownedTextures.forEach(texture => texture.dispose());ownedTextures.clear();
    root.clear();
    pickables = []; labels = []; occluders = []; orbitLines = []; animators = []; galaxyRigs = [];
    deployParts = null; trajectory = null; activeFocus = null;
  }
  function addLight() {
    root.add(new THREE.HemisphereLight(0xc9e8ff, 0x161522, 1.1));
    const light = new THREE.DirectionalLight(0xffe8c9, 2.7);
    light.position.set(-12, 20, 18); root.add(light);
  }
  function mesh(geometry, material, parent = root) {
    const object = new THREE.Mesh(geometry, material); parent.add(object); return object;
  }
  function sphere(radius, color, parent, basic = false) {
    return mesh(new THREE.SphereGeometry(radius, isMobile() ? 24 : 40, isMobile() ? 16 : 28),
      basic ? new THREE.MeshBasicMaterial({ color }) : new THREE.MeshStandardMaterial({ color, roughness: .88 }), parent);
  }
  function label(object, entry, radius = 0, options = {}) {
    labels.push({ object, id: entry.id, name: entry.name, color: entry.color || '#b8e2e0', radius, ...options });
  }
  function clickable(object, id, radius) {
    object.userData.id = id; pickables.push(object);
    if (radius) occluders.push({ object, radius });
    return object;
  }
  function hitTarget(parent, id, radius) {
    const target = sphere(radius, 0xffffff, parent, true);
    target.material.transparent = true; target.material.opacity = 0; target.material.depthWrite = false;
    clickable(target, id); return target;
  }
  function circle(radius, parent, color = 0x7ed9ce, opacity = .24) {
    const points = [];
    for (let index = 0; index <= 128; index++) {
      const angle = index / 128 * TAU; points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }));
    parent.add(line); orbitLines.push(line); return line;
  }
  function pointsCloud(positions, colors, size, opacity, parent) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const object = new THREE.Points(geometry, new THREE.PointsMaterial({ size, map: starMap, vertexColors: true, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false }));
    parent.add(object); return object;
  }
  function jet(parent, size, color = 0x7dafff) {
    const positions = [], colors = [], random = randomFor('jet' + size), tint = new THREE.Color(color);
    for (let i = 0; i < 180; i++) {
      const along = random(), side = i % 5 === 0 ? -1 : 1;
      positions.push((random() - .5) * size * .12 * along, side * along * size, (random() - .5) * size * .12 * along);
      colors.push(tint.r, tint.g, tint.b);
    }
    pointsCloud(positions, colors, size * .018, .9, parent);
    const beam = mesh(new THREE.CylinderGeometry(size * .003, size * .026, size, 12, 1, true), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .13, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false }), parent);
    beam.position.y = size * .5;
  }

  function galaxyModel(entry, radius, count, parent, atlas = false) {
    return createGalaxyModel({ THREE, entry, radius, count, parent, glow, starMap, atlas });
  }

  function marker(entry, parent, position, radius = .5) {
    const group = new THREE.Group(); group.position.copy(position); parent.add(group);
    const core = sphere(radius, entry.color || '#c8e6f1', group, true); clickable(core, entry.id);
    group.add(glow(entry.color || '#b8e2e0', radius * 7, .65)); hitTarget(group, entry.id, radius * 2.7);
    label(group, entry, radius); return group;
  }
  function solarLocationMarker(parent) {
    // A locator in the illustrated spiral-arm region, not a physical size or a
    // precise galactic coordinate. Keep every part attached to the rotating rig.
    const position = new THREE.Vector3(29, .8, 17), color = '#ffe3a0';
    const group = new THREE.Group(); group.name = 'galaxy-solar-location';
    group.position.copy(position); group.userData.id = 'solar'; parent.add(group);
    const core = sphere(.58, color, group, true); core.name = 'solar-location-core';
    core.material.toneMapped = false; clickable(core, 'solar');
    const halo = glow(color, 5.8, .85); halo.name = 'solar-location-halo';
    halo.material.depthWrite = false; halo.material.toneMapped = false; group.add(halo);
    const ring = mesh(new THREE.RingGeometry(1.55, 1.73, 64),
      new THREE.MeshBasicMaterial({ color, transparent:true, opacity:.82, side:THREE.DoubleSide, depthWrite:false, depthTest:false, toneMapped:false }), group);
    ring.name = 'solar-location-ring'; ring.rotation.x = -Math.PI / 2; ring.renderOrder = 4;
    const target = hitTarget(group, 'solar', 2.6); target.name = 'solar-location-hit-target';
    label(group, { id:'solar', name:'太阳系 · 我们在这里', color }, 1.73,
      { priority:100, className:'galaxy-solar-location-label', description:'太阳系在银河旋臂区域的位置示意，点击进入太阳系' });
    let phase = 0;
    animators.push(dt => {
      if (reducedMotion || dt <= 0) return;
      phase += dt * 1.6;
      ring.scale.setScalar(1 + Math.sin(phase) * .08);
    });
    return group;
  }
  function animateGalaxy(model, rig, rate) {
    rig.userData.rotationSpeed = rate;
    galaxyRigs.push({model,rig});
    animators.push(dt => {
      if (reducedMotion || dt <= 0) return;
      rig.rotation.y += dt * rate;
      model.userData.animate?.(dt);
    });
  }
  function buildAtlas() {
    // Exploration composition adapted from ORBIT's local-group atlas. Distances
    // and sizes are compressed artwork, not a map of physical separations.
    const layout = {
      galaxy:       { p:[-4.5,0,0],       r:9.5, tilt:[.13,0,0],          compact:[0,0] },
      andromeda:    { p:[60,8.75,-45],    r:11,  tilt:[.34,.18,-.26],     compact:[19,-33] },
      triangulum:   { p:[-52.5,-4.5,-52.5],r:7,  tilt:[-.2,.7,.17],      compact:[-18,-27] },
      lmc:          { p:[25,-16.25,20],   r:4.6, tilt:[.16,-.35,.31],     compact:[-6,49] },
      smc:          { p:[40,-23.75,27.5], r:3.6, tilt:[-.24,.2,-.3],      compact:[-20,72] },
      m32:          { p:[71,4,-37.75],    r:3.4, tilt:[.2,-.15,.42],      compact:[27,-13] },
      m110:         { p:[50.75,19,-55],   r:4.3, tilt:[-.22,.3,-.48],     compact:[13,-59] },
      'barnard-galaxy':{ p:[-22.5,16.25,38.75],r:4,tilt:[.2,.1,-.4],    compact:[-27,3] },
      whirlpool:    { p:[-71.25,36.25,16.25],r:8,tilt:[.18,-.3,-.18],   compact:[-26,-62] },
      bode:         { p:[-43.75,-21.25,76.25],r:9,tilt:[.4,.4,-.3],     compact:[-22,29] },
      cigar:        { p:[-57.5,-11.25,88.75],r:5.8,tilt:[.1,.1,.13],    compact:[-17,-47] },
      sombrero:     { p:[70,27.5,58.75],  r:8.5, tilt:[-.37,.2,-.12],   compact:[25,44] },
      'centaurus-a':{ p:[8.75,-41.25,-81.25],r:8,tilt:[.3,.1,.38],      compact:[21,19] },
      m87:          { p:[96.25,-11.25,13.75],r:10,tilt:[.22,.1,-.3],    compact:[17,78] },
    };
    const compact=isMobile(), focus=new THREE.Object3D(), framingPoints=[]; root.add(focus);
    focus.position.set(...(compact?[0,0,6]:[12.5,-7,7.5]));
    const offset=compact?[0,140,135]:[20,124,248];
    galaxies.forEach((entry,index) => {
      const arrangement=layout[entry.id], anchor=new THREE.Group();
      anchor.name='atlas-galaxy-'+entry.id;anchor.userData.galaxyId=entry.id;
      const radius=arrangement.r*(compact?.6:1);
      anchor.userData.radius=radius;
      anchor.position.set(...(compact?[arrangement.compact[0],0,arrangement.compact[1]]:arrangement.p));root.add(anchor);
      const tilt=new THREE.Group();tilt.rotation.fromArray(arrangement.tilt);anchor.add(tilt);
      const spin=new THREE.Group();spin.name='galaxy-spin-'+entry.id;tilt.add(spin);
      const model=galaxyModel(entry,radius,compact?2800:7500,spin,true);
      if(compact){
        // Fixed entry bounds include each galaxy's full model, not its label.
        model.updateWorldMatrix(true,true);
        const box=new THREE.Box3().setFromObject(model);
        for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z])
          framingPoints.push(new THREE.Vector3(x,y,z).sub(focus.position));
      }
      animateGalaxy(model,spin,.016+(index%5)*.002);
      hitTarget(anchor,entry.id,radius*1.12);label(anchor,entry,0);
    });
    root.userData.galaxyLayout='spatial';
    return {focus,distance:Math.hypot(...offset),minDistance:28,maxDistance:420,offset,
      framing:compact?{width:85,height:148,points:framingPoints}:{width:202,height:126}};
  }
  function buildGalaxy(entry) {
    const rig=new THREE.Group();rig.name='galaxy-spin-'+entry.id;root.add(rig);
    const galaxy=galaxyModel(entry,53,isMobile()?36000:85000,rig);
    const focus=new THREE.Object3D();root.add(focus);
    const destinations=values.filter(item=>item.parent===entry.id&&['star','blackhole','nebula','cluster'].includes(item.kind));
    destinations.forEach((item,index)=>{
      const random=randomFor(item.id),center=item.kind==='blackhole'&&!/-x-?[17]$/.test(item.id);
      const radius=center?0:16+random()*31, angle=index*2.39996+.4;
      marker(item,rig,new THREE.Vector3(Math.cos(angle)*radius,.55+random()*.6,Math.sin(angle)*radius*.8),item.kind==='blackhole'?.22:.17);
    });
    if(entry.id==='galaxy')solarLocationMarker(rig);
    animateGalaxy(galaxy,rig,.025);
    const edge=entry.id==='sombrero'||entry.id==='cigar', elliptical=['elliptical','jet'].includes(entry.shape)||entry.id==='centaurus-a';
    const offset=edge?[5,22,138]:[2,52,127];
    return {focus,distance:Math.hypot(...offset),minDistance:12,maxDistance:350,offset,
      framing:{width:122,height:edge?50:elliptical?100:64}};
  }

  function buildNebula(entry) {
    addLight();
    const model=createNebulaModel({THREE,entry,starMap,mobile:isMobile(),ownedTextures});root.add(model);
    hitTarget(model,entry.id,entry.id==='eagle-nebula'?1:9);label(model,entry,10);
    if(entry.id==='eagle-nebula'){
      const anchor=new THREE.Group();anchor.position.set(-2,-1,2);root.add(anchor);hitTarget(anchor,'pillars-of-creation',3);label(anchor,catalog['pillars-of-creation'],1.8,{priority:90});
    }
    return {focus:model,distance:49,minDistance:15,maxDistance:110,offset:[0,2,49],framing:{width:35,height:30}};
  }

  function planetSurface(radius, entry, parent) {
    const geometry = new THREE.SphereGeometry(radius, isMobile() ? 32 : 48, isMobile() ? 20 : 32);
    const position = geometry.attributes.position, colors = [], base = new THREE.Color(entry.color || '#8ba5b8');
    const gas = entry.planetClass === 'gas-giant' || /hr-?8799|giant/.test(entry.id);
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i) / radius, y = position.getY(i) / radius, z = position.getZ(i) / radius;
      const pattern = gas ? Math.sin(y * 39 + Math.sin(x * 5 + z * 3) * 1.8) * .13 : Math.sin(x * 8 + y * 9) * Math.cos(z * 11 - x * 2) * .2;
      const color = base.clone().multiplyScalar(.78 + pattern);
      if (!gas && pattern > .11) color.lerp(new THREE.Color(0xb1a080), .28);
      colors.push(color.r, color.g, color.b);
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const object = mesh(geometry, new THREE.MeshStandardMaterial({ vertexColors:true, roughness:.9, metalness:0 }), parent);
    clickable(object, entry.id, radius); return object;
  }
  function starRadius(entry) {
    return entry.starClass === 'white-dwarf' ? 1.15 : entry.starClass === 'red-dwarf' ? 1.8 : /supergiant/.test(entry.starClass || '') ? 4.7 : entry.starClass === 'giant' ? 3.8 : 2.9;
  }
  function starBody(entry, parent, radius) {
    const group = new THREE.Group(); parent.add(group);
    const core = sphere(radius, entry.color || '#ffcf8b', group, true); clickable(core, entry.id, radius);
    group.add(glow(entry.color || '#ffd8a3', radius * 5.8, .64));
    group.add(new THREE.PointLight(entry.color || '#fff1dc', 35, 0, 1));
    label(core, entry, radius); return group;
  }
  function buildStarSystem(selected) {
    const host = selected.kind === 'planet' ? catalog[selected.parentStar || selected.parent] : selected;
    if (!host) throw new Error(`Missing host star for ${selected.id}`);
    addLight();
    const hostRadius = starRadius(host), star = starBody(host, root, hostRadius);
    const planets = values.filter(item => item.kind === 'planet' && (item.parentStar === host.id || item.parent === host.id));
    let focus = star, radius = hostRadius;
    planets.forEach((entry, index) => {
      const distance = hostRadius + 8 + index * 7;
      const group = new THREE.Group(); root.add(group);
      const planetRadius = entry.planetClass === 'gas-giant' ? 1.85 : entry.planetClass === 'super-earth' ? 1.3 : .95;
      const planet = planetSurface(planetRadius, entry, group);
      circle(distance, root, entry.color || 0x7ed9ce);
      const phase = hash(entry.id) / 4294967296 * TAU, rate = .1 / Math.sqrt(index + 1);
      group.position.set(Math.cos(phase) * distance, 0, Math.sin(phase) * distance);
      label(planet, entry, planetRadius);
      animators.push((dt, elapsed) => { const angle = phase + elapsed * rate; group.position.set(Math.cos(angle) * distance, 0, Math.sin(angle) * distance); planet.rotation.y += dt * .15; });
      if (entry.id === selected.id) { focus = group; radius = planetRadius; }
    });
    // A few well-known binaries are shown as separate clickable stars, not invented planets.
    const companionPairs = [['sirius-a','sirius-b'],['alpha-centauri-a','alpha-centauri-b']];
    for (const pair of companionPairs) {
      if (!pair.includes(host.id)) continue;
      const other = catalog[pair.find(id => id !== host.id)];
      if (!other) continue;
      const companion = starBody(other, root, starRadius(other) * .7); companion.position.set(hostRadius + 11, 0, -3);
      circle(hostRadius + 11, root, 0xaca4e1, .16);
    }
    const selectedPlanet = selected.kind === 'planet';
    const overviewDistance = planets.length ? (hostRadius + 8 + (planets.length - 1) * 7) * 2.6 : hostRadius * 6;
    const distance = selectedPlanet ? radius * (isMobile() ? 9 : 6.8) : overviewDistance;
    const offset = [distance * .13, distance * (selectedPlanet ? .28 : .55), distance * .88];
    return { focus, distance: Math.hypot(...offset), minDistance: radius * 1.3, maxDistance: 240, offset };
  }

  function buildBlackHole(entry) {
    const focus = new THREE.Group(); root.add(focus);
    const core = sphere(2.7, 0x000003, focus, true); clickable(core, entry.id, 2.7); label(core, entry, 2.7);
    const disk = new THREE.Group(); disk.rotation.z = .17; focus.add(disk);
    const diskVertex = `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec2 vDisk;
      void main(){
        vDisk=position.xy;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
        #include <logdepthbuf_vertex>
      }`;
    const diskMaterial = new THREE.ShaderMaterial({
      uniforms:{uTime:{value:0}}, vertexShader:diskVertex,
      fragmentShader:`
        #include <logdepthbuf_pars_fragment>
        varying vec2 vDisk;
        uniform float uTime;
        float grain(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float noise(vec2 p){
          vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
          return mix(mix(grain(i),grain(i+vec2(1.,0.)),f.x),mix(grain(i+vec2(0.,1.)),grain(i+vec2(1.,1.)),f.x),f.y);
        }
        void main(){
          #include <logdepthbuf_fragment>
          float radius=length(vDisk), angle=atan(vDisk.y,vDisk.x);
          float radial=clamp((radius-3.05)/7.35,0.0,1.0);
          float edge=smoothstep(3.05,3.48,radius)*(1.0-smoothstep(7.2,10.4,radius));
          float spiral=angle-uTime*.18+log(max(radius,1.0))*3.7;
          float wisps=.84+.12*sin(spiral*3.0+radius*.7)+.045*sin(radius*24.0+spiral*2.0);
          float turbulence=noise(vec2(cos(spiral),sin(spiral))*radius*2.6)*.24+.8;
          float hot=exp(-(radius-3.15)*.48);
          vec3 color=mix(vec3(1.0,.24,.035),vec3(1.0,.88,.62),pow(hot,.65));
          float brightness=(.65+hot*2.8)*wisps*turbulence*(.87+.22*cos(angle-.6));
          float alpha=edge*(.8-radial*.47);
          gl_FragColor=vec4(color*brightness,alpha);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
      transparent:true, side:THREE.DoubleSide, blending:THREE.AdditiveBlending, depthWrite:false
    });
    const accretion = mesh(new THREE.RingGeometry(3.05,10.4,192),diskMaterial,disk);
    accretion.rotation.x=Math.PI/2;
    // Soft radial falloff, rather than solid tubes, suggests photon and lensing light.
    function lightArc(radius,spread,opacity,arc=TAU){
      const material=new THREE.ShaderMaterial({
        uniforms:{uRadius:{value:radius},uSpread:{value:spread},uOpacity:{value:opacity},uHalf:{value:arc===TAU?0:1}},
        vertexShader:diskVertex,
        fragmentShader:`
          #include <logdepthbuf_pars_fragment>
          varying vec2 vDisk;
          uniform float uRadius,uSpread,uOpacity,uHalf;
          void main(){
            #include <logdepthbuf_fragment>
            float distanceToRing=(length(vDisk)-uRadius)/uSpread;
            float glow=exp(-distanceToRing*distanceToRing*2.2);
            float taper=mix(1.0,smoothstep(0.0,.22,vDisk.y/uRadius),uHalf);
            gl_FragColor=vec4(vec3(1.8,1.05,.4),glow*uOpacity*taper);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`,
        transparent:true,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false
      });
      return mesh(new THREE.RingGeometry(Math.max(2.71,radius-spread*2),radius+spread*2,160,1,0,arc),material,focus);
    }
    for(const [spread,opacity] of [[.45,.13],[.12,.48]]){
      const photonRing=lightArc(2.96,spread,opacity);photonRing.rotation.x=.17;
    }
    for(const [spread,opacity] of [[.46,.1],[.16,.28]]){
      const upperArc=lightArc(4.1,spread,opacity,Math.PI);upperArc.scale.y=.8;upperArc.position.z=-.4;
    }
    const random = randomFor(entry.id), positions = [], colors = [];
    for (let i = 0; i < 240; i++) {
      const r = 3.5 + random() * 6, a = random() * TAU;
      positions.push(Math.cos(a) * r, (random() - .5) * .12, Math.sin(a) * r);
      colors.push(1, .38 + random() * .4, .12);
    }
    const streams = pointsCloud(positions, colors, .065, .34, disk);
    animators.push((dt,elapsed) => { streams.rotation.y += dt * .18;diskMaterial.uniforms.uTime.value=elapsed; });
    if (/-x-?[17]$/.test(entry.id)) {
      const companion = starBody({ id:entry.id, name:'伴星 · 位置示意', color:'#a6d6ff' }, root, 2.3); companion.position.set(18, 1, -3);
      // The companion is contextual; clicking it keeps the named binary destination.
    }
    const distance = /-x-?[17]$/.test(entry.id) ? 42 : 31;
    return { focus, distance, minDistance:7, maxDistance:120, offset:[0, distance * .23, distance * .97] };
  }

  function cylinderBetween(from, to, radius, material, parent) {
    const delta = to.clone().sub(from);
    const object = mesh(new THREE.CylinderGeometry(radius, radius, delta.length(), 8), material, parent);
    object.position.copy(from).add(to).multiplyScalar(.5);
    object.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), delta.normalize()); return object;
  }
  function buildJWST(entry) {
    craftPresentation=createCraftPresentation({THREE,parent:root,id:entry.id});
    const model=createJWSTModel({THREE,compact:isMobile(),onPick:object=>clickable(object,entry.id)});
    const {focus,parts}=model;root.add(focus);model.textures.forEach(texture=>ownedTextures.add(texture));
    craftPresentation.attach(focus);
    hitTarget(focus,entry.id,3.4);label(focus,entry,0);
    deployParts=parts;deployProgress=deploy;applyDeployment();
    const offset=[10.8,8.4,18];
    return {focus,distance:Math.hypot(...offset),minDistance:7,maxDistance:65,offset,craft:true};
  }
  function buildVoyagerPreview(entry, focus) {
    const white = new THREE.MeshStandardMaterial({ color:0xe7e1d6, metalness:.28, roughness:.56, side:THREE.DoubleSide });
    const metal = new THREE.MeshStandardMaterial({ color:0x747f8a, metalness:.8, roughness:.35 });
    const black = new THREE.MeshStandardMaterial({ color:0x22212a, metalness:.45, roughness:.57 });
    const gold = new THREE.MeshStandardMaterial({ color:0xa87d2b, metalness:.65, roughness:.38 });
    const profile=[];
    for(let index=0;index<=28;index++){const radius=index/28*2.55;profile.push(new THREE.Vector2(radius,radius*radius*.145));}
    const dish=mesh(new THREE.LatheGeometry(profile,80),white,focus);dish.rotation.x=Math.PI/2;clickable(dish,entry.id);
    const rim=mesh(new THREE.TorusGeometry(2.55,.035,8,100),metal,focus);rim.position.z=.943;
    const receiver=sphere(.15,0xd7d9dc,focus);receiver.position.z=1.6;
    for(let index=0;index<3;index++){const angle=index/3*TAU;cylinderBetween(new THREE.Vector3(Math.cos(angle)*2.2,Math.sin(angle)*2.2,.7),receiver.position,.035,metal,focus);}
    const bus=mesh(new THREE.CylinderGeometry(.76,.76,.85,10),gold,focus);bus.rotation.x=Math.PI/2;bus.position.z=-.9;
    const boomEnd=new THREE.Vector3(-7.7,.7,-1.4);cylinderBetween(new THREE.Vector3(-.5,0,-1),boomEnd,.055,metal,focus);
    const magnetometer=sphere(.13,0xbcc4cd,focus);magnetometer.position.copy(boomEnd);
    const rtgEnd=new THREE.Vector3(4.7,-1.2,-1.7);cylinderBetween(new THREE.Vector3(.5,-.3,-1),rtgEnd,.08,metal,focus);
    for(let i=0;i<3;i++){const rtg=mesh(new THREE.CylinderGeometry(.34,.34,.95,12),black,focus);rtg.rotation.z=Math.PI/2;rtg.position.set(3.05+i*.72,-.85-i*.14,-1.6);for(let f=0;f<5;f++){const fin=mesh(new THREE.TorusGeometry(.37,.032,5,12),metal,rtg);fin.rotation.x=Math.PI/2;fin.position.y=-.35+f*.17;}}
    const cameraEnd=new THREE.Vector3(2.9,2.4,-1);cylinderBetween(new THREE.Vector3(.4,.4,-1),cameraEnd,.09,metal,focus);
    const camera=mesh(new THREE.BoxGeometry(.85,.65,.6),black,focus);camera.position.copy(cameraEnd);
    const lens=mesh(new THREE.CylinderGeometry(.18,.18,.6,16),metal,focus);lens.rotation.x=Math.PI/2;lens.position.copy(cameraEnd).add(new THREE.Vector3(0,0,.5));
    const record=mesh(new THREE.CylinderGeometry(.34,.34,.025,48),gold,focus);record.rotation.x=Math.PI/2;record.position.set(.45,-.25,-1.35);
  }
  function buildVoyager(entry) {
    craftPresentation=createCraftPresentation({THREE,parent:root,id:entry.id});
    const focus = new THREE.Group(), preview = new THREE.Group();
    focus.name = 'voyager-focus'; preview.name = 'voyager-loading-preview';
    root.add(focus); focus.add(preview); buildVoyagerPreview(entry, preview);
    label(focus,entry,0);
    const token = sceneGeneration;
    voyagerModelStatus = { state:'loading', source:'NASA VTAD' };
    Promise.resolve().then(() => loadVoyager({THREE})).then(model => {
      if (token !== sceneGeneration) { model.dispose(); return; }
      const geometries = new Set(), materials = new Set();
      preview.traverse(object => {
        if(object.geometry)geometries.add(object.geometry);
        if(object.material)[].concat(object.material).forEach(material=>materials.add(material));
      });
      geometries.forEach(geometry=>geometry.dispose()); materials.forEach(material=>material.dispose());
      preview.removeFromParent(); pickables = [];
      voyagerModel = model; focus.add(model.root);
      craftPresentation.attach(model.root);
      model.root.traverse(object=>{if(object.isMesh)clickable(object,entry.id);});
      root.updateMatrixWorld(true);
      voyagerModelStatus = { state:'ready', source:'NASA VTAD' }; onChange();
    }).catch(() => {
      if(token !== sceneGeneration)return;
      voyagerModelStatus = { state:'error', source:'NASA VTAD' }; onChange();
    });
    const offset = [21,12,17].map(value=>value*(isMobile()?1.3:1));
    return {focus,distance:Math.hypot(...offset),minDistance:5,maxDistance:80,offset,craft:true};
  }

  function buildRoman(entry) {
    craftPresentation=createCraftPresentation({THREE,parent:root,id:entry.id});
    const focus = new THREE.Group(); focus.name = 'roman-focus'; root.add(focus);
    // Keep the scene empty while loading; a simplified stand-in flashes at this scale.
    label(focus,entry,0);
    const token = sceneGeneration;
    romanModelStatus = {state:'loading',source:'NASA Goddard'};
    Promise.resolve().then(()=>loadRoman({THREE})).then(model=>{
      if(token!==sceneGeneration){model.dispose();return;}
      romanModel=model; focus.add(model.root); pickables=[];
      craftPresentation.attach(model.root);
      model.root.traverse(object=>{if(object.isMesh)clickable(object,entry.id);});
      root.updateMatrixWorld(true);
      romanModelStatus={state:'ready',source:'NASA Goddard'};onChange();
    }).catch(()=>{
      if(token!==sceneGeneration)return;
      romanModelStatus={state:'error',source:'NASA Goddard'};onChange();
    });
    const offset=[21,12,17].map(value=>value*(isMobile()?1.3:1));
    return {focus,distance:Math.hypot(...offset),minDistance:5,maxDistance:80,offset,craft:true};
  }

  function buildTrajectories() {
    addLight();
    const ids=['sun','mercury','venus','earth','mars','jupiter','saturn','uranus','neptune'];
    const palette=['#ffd18b','#b5aaa1','#dcc490','#7cc8ff','#e8a080','#dcbfa4','#e2cfa1','#9fd8d9','#759bff'];
    const bodies=[], trails=[], focus=new THREE.Object3D();root.add(focus);
    focus.name='trajectory-window-center';
    ids.forEach((id,index)=>{
      const entry=catalog[id]||{id,name:id,color:palette[index]}, group=new THREE.Group();root.add(group);
      group.name=`trajectory-body-${id}`;
      const radius=index===0?2.5:index<5?.55:index<7?1.25:.9;
      const texture=textures[entry.texture||(id==='earth'?'earth-day.jpg':`${id}.jpg`)];
      const body=texture?mesh(new THREE.SphereGeometry(radius,isMobile()?24:40,isMobile()?16:28),index===0?new THREE.MeshBasicMaterial({map:texture}):new THREE.MeshStandardMaterial({map:texture,roughness:.94}),group):index===0?sphere(radius,palette[index],group,true):planetSurface(radius,{...entry,color:palette[index]},group);
      if(texture||index===0)clickable(body,id,radius);
      if(index===0){group.add(glow(palette[index],12,.6));group.add(new THREE.PointLight(0xffe8c8,32,0,1));}
      if(id==='saturn'){
        const geometry=new THREE.RingGeometry(radius*1.3,radius*2.25,64,1),position=geometry.attributes.position,uv=geometry.attributes.uv;
        for(let i=0;i<position.count;i++)uv.setXY(i,(Math.hypot(position.getX(i),position.getY(i))-radius*1.3)/(radius*.95),.5);
        const ring=mesh(geometry,new THREE.MeshBasicMaterial({map:textures['saturn-ring.png']||null,color:0xd9c8a0,side:THREE.DoubleSide,transparent:true,opacity:.8,depthWrite:false}),group);
        ring.rotation.set(-Math.PI/2+.42,0,.15);
      }
      label(body,entry,radius);
      const orbit=index===0?null:circle(5+index*4,root,palette[index],.14);
      if(orbit)orbit.rotation.z=Math.PI/2;
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(maximumTrailPoints*3),3));geometry.setAttribute('color',new THREE.BufferAttribute(new Float32Array(maximumTrailPoints*3),3));
      const line=new THREE.Line(geometry,new THREE.LineBasicMaterial({color:palette[index],vertexColors:true,transparent:true,opacity:index===0?.85:.8,depthWrite:false}));line.name=`trajectory-trail-${id}`;line.frustumCulled=false;root.add(line);
      bodies.push({id,group,body,orbit,index,phase:index*.92,rate:index===0?0:.82/Math.sqrt(index)});trails.push({line});
    });
    trajectory={bodies,trails,focus,pointCount:0,span:0,orbits:true,frameBlend:trajectoryOptions.frame==='galaxy'?1:0};
    updateTrajectories(0,true,true);
    // Leave room for the longest mature paths and labels before a length switch.
    const framing=isMobile()?1.8:1.3,offset=[65*framing,38*framing,110*framing];
    return {focus,distance:Math.hypot(...offset),minDistance:12,maxDistance:400,offset};
  }
  function trajectoryPosition(body,age,span,target) {
    // A moving, centered observation window retains the same past interval.
    // Only bounded ages and orbital phases enter geometry; no absolute position drifts.
    // Deliberately turn the orbital plane perpendicular to the demonstration's
    // forward axis so the two reference-frame paths can be compared clearly.
    // This is a teaching orientation, not the real Solar System velocity vector.
    const x=(span*.5-age)*trajectory.frameBlend*1.5;
    if(body.index===0)return target.set(x,0,0);
    const radius=5+body.index*4,angle=body.phase-age*body.rate;
    return target.set(x,Math.cos(angle)*radius,Math.sin(angle)*radius);
  }
  function updateTrajectories(motion,orbits,force=false) {
    if(!trajectory)return;
    trajectory.orbits=orbits;
    const count=trajectoryOptions.length==='long'?maximumTrailPoints:120,span=(count-1)*trailStep;
    const refresh=force||motion!==0||trajectory.pointCount!==count;
    const recolor=force||trajectory.pointCount!==count;
    trajectory.pointCount=count;trajectory.span=span;
    const sunPosition=trajectoryPosition(trajectory.bodies[0],0,span,new THREE.Vector3()),point=new THREE.Vector3();
    trajectory.bodies.forEach(record=>{
      const {group,body,orbit,index}=record;
      if(motion){record.phase=(record.phase+motion*record.rate)%TAU;body.rotation.y=(body.rotation.y+motion*.1)%TAU;}
      trajectoryPosition(record,0,span,group.position);
      if(orbit){orbit.position.copy(sunPosition);orbit.visible=orbits;}
      if(!refresh)return;
      const {line}=trajectory.trails[index],attribute=line.geometry.attributes.position,color=line.geometry.attributes.color;
      for(let i=0;i<count;i++){
        trajectoryPosition(record,(count-1-i)*trailStep,span,point);attribute.setXYZ(i,point.x,point.y,point.z);
        if(recolor){const fade=.12+.88*Math.pow(i/(count-1),1.35);color.setXYZ(i,fade,fade,fade);}
      }
      attribute.needsUpdate=true;if(recolor)color.needsUpdate=true;line.geometry.setDrawRange(0,count);
    });
  }
  function setTrajectoryOptions(options={}) {
    const next={frame:options.frame==='galaxy'?'galaxy':options.frame==='sun'?'sun':trajectoryOptions.frame,length:options.length==='long'?'long':options.length==='short'?'short':trajectoryOptions.length};
    const changed=next.frame!==trajectoryOptions.frame||next.length!==trajectoryOptions.length;
    trajectoryOptions=next;if(changed&&trajectory){if(reducedMotion)trajectory.frameBlend=next.frame==='galaxy'?1:0;updateTrajectories(0,trajectory.orbits,true);root.updateMatrixWorld(true);}
  }
  function setDeploy(value) {
    deploy=THREE.MathUtils.clamp(Number(value)||0,0,1);
    if(!deployParts||reducedMotion){deployProgress=deploy;applyDeployment();}
  }
  function applyDeployment() {
    if(!deployParts)return;
    const stage=(from,to)=>{const t=THREE.MathUtils.clamp((deployProgress-from)/(to-from),0,1);return t*t*(3-2*t);};
    const shield=stage(0,.45);
    deployParts.solarAssembly.rotation.x=(1-stage(0,.2))*Math.PI*.48;
    deployParts.shields.scale.set(.22+shield*.78,.4+shield*.6,.28+shield*.72);
    deployParts.mirror.position.y=.8+stage(.25,.60)*.5;
    deployParts.secondaryAssembly.rotation.x=(1-stage(.50,.80))*deployParts.secondaryFoldAngle;
    deployParts.updateSecondarySupports();
    deployParts.left.rotation.y=-(1-stage(.72,.95))*Math.PI*.77;
    deployParts.right.rotation.y=(1-stage(.72,1))*Math.PI*.77;
  }
  function updateDeployment(dt) {
    if(!deployParts)return;
    if(reducedMotion)deployProgress=deploy;
    else if(deployProgress!==deploy){
      const step=Math.max(0,Number.isFinite(dt)?dt:0)/deploymentDuration;
      deployProgress+=Math.sign(deploy-deployProgress)*Math.min(step,Math.abs(deploy-deployProgress));
      if(Math.abs(deploy-deployProgress)<1e-8)deployProgress=deploy;
    }
    applyDeployment();
  }
  function needsAnimation() {
    return root.visible&&!reducedMotion&&(!!deployParts&&deployProgress!==deploy||!!trajectory&&trajectory.frameBlend!==(trajectoryOptions.frame==='galaxy'?1:0));
  }
  function getAnimationStatus() {
    return {activeId,needsAnimation:needsAnimation(),voyagerModel:voyagerModelStatus,romanModel:romanModelStatus,deployment:deployParts?{progress:deployProgress,target:deploy,animating:needsAnimation(),duration:deploymentDuration,stage:deployProgress===0?'stowed':deployProgress<.45?'sunshield':deployProgress<.60?'tower':deployProgress<.80?'secondary-mirror':deployProgress<1?'primary-mirror-wings':'deployed'}:null,
      galaxies:galaxyRigs.map(({model,rig})=>({id:model.name.replace('galaxy-model-',''),particles:model.userData.particleCount,rotation:Number(rig.rotation.y.toFixed(6))})),
      trajectory:trajectory?{frame:trajectoryOptions.frame,frameBlend:trajectory.frameBlend,transitioning:trajectory.frameBlend!==(trajectoryOptions.frame==='galaxy'?1:0),length:trajectoryOptions.length,pointCount:trajectory.pointCount,totalPointCount:trajectory.pointCount*trajectory.trails.length,span:trajectory.span,center:trajectory.focus.position.toArray(),bodyPositions:trajectory.bodies.map(({id,group})=>({id,position:group.position.toArray()}))}:null};
  }
  function show(id) {
    const entry=catalog[id];
    if(!entry&&id!=='atlas'&&id!=='trajectories')throw new Error(`Unknown deep destination: ${id}`);
    disposeChildren();activeId=id;root.visible=true;
    let result;
    if(id==='atlas')result=buildAtlas();
    else if(id==='trajectories'||entry.kind==='trajectory')result=buildTrajectories();
    else if(entry.kind==='galaxy')result=buildGalaxy(entry);
    else if(entry.kind==='blackhole')result=buildBlackHole(entry);
    else if(entry.kind==='nebula'||entry.kind==='cluster')result=buildNebula(entry);
    else if(entry.kind==='craft')result=id==='jwst'?buildJWST(entry):id==='roman'?buildRoman(entry):buildVoyager(entry);
    else if(entry.kind==='star'||entry.kind==='planet')result=buildStarSystem(entry);
    else throw new Error(`Unsupported deep destination: ${id}`);
    activeFocus=result.focus;root.updateMatrixWorld(true);return result;
  }
  function update(dt,elapsed,options={}) {
    if('reducedMotion' in options)reducedMotion=!!options.reducedMotion;
    updateDeployment(dt);
    if(!root.visible)return;
    const speed=Number.isFinite(Number(options.speed))?THREE.MathUtils.clamp(Number(options.speed),0,100):1;
    const motion=options.paused?0:Math.max(0,Math.min(Number.isFinite(dt)?dt:0,.1))*speed;
    orbitLines.forEach(line=>line.visible=options.orbits!==false);
    animators.forEach(animate=>animate(motion,elapsed));
    if(trajectory){
      const target=trajectoryOptions.frame==='galaxy'?1:0,previous=trajectory.frameBlend;
      const step=Math.max(0,Number.isFinite(dt)?dt:0)/frameTransitionDuration;
      trajectory.frameBlend=reducedMotion?target:previous+Math.sign(target-previous)*Math.min(step,Math.abs(target-previous));
      if(Math.abs(trajectory.frameBlend-target)<1e-8)trajectory.frameBlend=target;
      updateTrajectories(motion,options.orbits!==false,previous!==trajectory.frameBlend);
    }
    root.updateMatrixWorld(true);
  }
  return {
    root,show,update,setTrajectoryOptions,setDeploy,needsAnimation,getAnimationStatus,
    getPickables:()=>pickables,getLabels:()=>labels,getOccluders:()=>occluders,
    getActiveId:()=>activeId,getFocus:()=>activeFocus,
    getCraftReferencePoints:()=>craftPresentation?.getReferencePoints(),
    getCraftPoints:()=>craftPresentation?.getPoints(),
    updatePresentation:camera=>craftPresentation?.update(camera),
    dispose(){disposeChildren();root.visible=false;activeId=null;}
  };
}

