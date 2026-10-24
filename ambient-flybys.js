/**
 * Adapted from ORBIT src/universe/flybys.js (Apache-2.0).
 * Source: https://github.com/ryh842487118-bot/orbit
 * License and original notice: vendor/ORBIT-LICENSE.txt, vendor/ORBIT-NOTICE.txt.
 * EXPLORE THE UNIVERSE changes: injected dependencies, shared glow texture, low-power detail,
 * guarded delta time, lifecycle diagnostics, and explicit foreground depth tests.
 * These sparse sky visitors are decorative, not tracked astronomical events.
 */
const tailVertex = `
  varying vec2 vUv;
  uniform float uLength, uWidth, uBend;
  #include <common>
  #include <logdepthbuf_pars_vertex>
  void main() {
    vUv = uv;
    float t = uv.x;
    vec3 p = vec3(-t * uLength,
      (uv.y * 2.0 - 1.0) * uWidth * mix(0.08, 1.0, t) + t * t * uBend, 0.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    #include <logdepthbuf_vertex>
  }
`;

const tailFragment = `
  varying vec2 vUv;
  uniform vec3 uColor;
  uniform float uOpacity, uTime;
  #include <common>
  #include <logdepthbuf_pars_fragment>
  void main() {
    float t = clamp(vUv.x, 0.0, 1.0);
    float side = abs(vUv.y * 2.0 - 1.0);
    float feather = exp(-side * side * 5.0) * (1.0 - smoothstep(0.65, 1.0, side));
    float wisps = 0.92 + 0.08 * sin(vUv.x * 32.0 + side * 9.0 - uTime * 2.0);
    float alpha = feather * pow(1.0 - t, 1.7) * wisps * uOpacity;
    gl_FragColor = vec4(mix(uColor, vec3(1.5, 1.4, 1.2), pow(1.0 - t, 8.0)), alpha);
    #include <logdepthbuf_fragment>
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function createAmbientFlybys({THREE, scene, camera, glowMap, reducedMotion = false, mobile = false, random = Math.random}) {
  const root = new THREE.Group();
  root.name = 'ambient-flybys';
  root.visible = false;
  scene.add(root);
  const compact = () => Boolean(typeof mobile === 'function' ? mobile() : mobile);
  const motionQuery = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');
  const motionIsReduced = () => Boolean((typeof reducedMotion === 'function' ? reducedMotion() : reducedMotion) || motionQuery?.matches);
  const geometry = new THREE.PlaneGeometry(1, 1, compact() ? 20 : 40, 1);
  const ownGeometry = new Set([geometry]), ownMaterials = new Set();
  const ownMaterial = material => {ownMaterials.add(material); return material;};
  const makeGlow = (color, size) => {
    const sprite = new THREE.Sprite(ownMaterial(new THREE.SpriteMaterial({map:glowMap, color,
      transparent:true, opacity:0, depthTest:true, depthWrite:false, blending:THREE.AdditiveBlending})));
    sprite.scale.setScalar(size);
    return sprite;
  };
  function makeTail(color, length, width, bend, opacity) {
    const material = ownMaterial(new THREE.ShaderMaterial({
      uniforms:{uColor:{value:new THREE.Color(color)}, uLength:{value:length}, uWidth:{value:width},
        uBend:{value:bend}, uOpacity:{value:0}, uTime:{value:0}},
      vertexShader:tailVertex, fragmentShader:tailFragment, transparent:true,
      depthTest:true, depthWrite:false, blending:THREE.AdditiveBlending,
      side:THREE.DoubleSide, forceSinglePass:true,
    }));
    const tail = new THREE.Mesh(geometry, material);
    // The shader expands the source plane into a long ribbon.
    tail.frustumCulled = false;
    tail.userData.opacity = opacity;
    return tail;
  }
  function makeVisitor(kind) {
    const comet = kind === 'comet', group = new THREE.Group();
    group.name = `ambient-${kind}`;
    group.visible = false;
    const tails = comet ? [makeTail(0x8ccfee,.64,.023,-.018,.64), makeTail(0xf0d2a3,.48,.056,.075,.24)]
      : [makeTail(0xffbc79,.28,.008,.004,.85)];
    const halo = makeGlow(comet ? 0xa4e3ee : 0xffb879, comet ? .075 : .043);
    const core = makeGlow(comet ? 0xe6fcff : 0xffe4b8, comet ? .022 : .019);
    const rockGeometry = new THREE.IcosahedronGeometry(1,0);
    ownGeometry.add(rockGeometry);
    const rock = new THREE.Mesh(rockGeometry, ownMaterial(new THREE.MeshPhongMaterial({
      color:comet ? 0xacc3c6 : 0x756256, emissive:comet ? 0x7ba2b0 : 0x9c4927,
      emissiveIntensity:.6, flatShading:true, transparent:true, opacity:0, depthTest:true, depthWrite:false,
    })));
    rock.scale.set(comet ? .003 : .006,.004,.0045);
    group.add(...tails,halo,rock,core);
    root.add(group);
    return {kind,group,tails,halo,core,rock};
  }
  const visitors = ['meteor','comet'].map(makeVisitor);
  const start = new THREE.Vector3(), end = new THREE.Vector3();
  const heading = new THREE.Quaternion(), forward = new THREE.Vector3(0,0,1);
  let active = null, elapsed = 0, duration = 0, nextIn = 3 + random()*3;
  let lastKind = null, streak = 0, spawned = 0, disposed = false, detail = 'full';
  function clear() {
    if (active) active.group.visible = false;
    active = null;
    elapsed = 0;
  }
  function spawn() {
    let kind = random() < .42 ? 'comet' : 'meteor';
    if (streak >= 2 && kind === lastKind) kind = kind === 'comet' ? 'meteor' : 'comet';
    streak = kind === lastKind ? streak+1 : 1;
    lastKind = kind;
    active = visitors.find(visitor => visitor.kind === kind);
    duration = kind === 'comet' ? 8+random()*4 : 2.2+random()*1.4;
    elapsed = 0;
    spawned++;
    // Behind nearby bodies; honor the off-axis projection used by the sidebar.
    const depth = Math.min(95000,camera.far*.3);
    const projection = camera.projectionMatrix.elements;
    const halfHeight = depth/projection[5], aspect = projection[5]/projection[0];
    const direction = random()<.5 ? -1 : 1, y = .35+random()*.6;
    start.set((-direction*1.2+projection[8])*aspect,y+projection[9],-depth/halfHeight);
    end.set((direction*1.85+projection[8])*aspect,y-.45-random()*.8+projection[9],start.z);
    heading.setFromAxisAngle(forward,Math.atan2(end.y-start.y,end.x-start.x));
    root.quaternion.copy(camera.quaternion);
    root.scale.setScalar(halfHeight);
    active.group.quaternion.copy(heading);
    active.group.scale.setScalar(.85+random()*.3);
    active.group.visible = true;
  }
  function update(dt,{enabled = true, paused = false, quality = 'auto'} = {}) {
    if (disposed) return;
    const allowed = enabled && !motionIsReduced();
    root.visible = allowed;
    // Translation follows the observer. Rotation stays in the sky direction
    // captured at spawn, so dragging does not pin the tail onto the screen.
    root.position.copy(camera.position);
    detail = quality === 'low' || compact() ? 'economy' : 'full';
    for (const visitor of visitors) visitor.rock.visible = visitor.halo.visible = detail === 'full';
    if (!allowed) {
      if (active) {clear(); nextIn = 3+random()*4;}
      return;
    }
    if (paused) return;
    // Use unscaled real seconds. Hidden-page pauses cannot produce a time jump.
    const step = Number.isFinite(dt) ? Math.max(0,Math.min(dt,.05)) : 0;
    if (!step) return;
    if (!active) {
      nextIn -= step;
      if (nextIn>0) return;
      spawn();
    }
    elapsed += step;
    const progress = Math.min(elapsed/duration,1);
    if (progress>=1) {clear(); nextIn=7+random()*13; return;}
    const opacity = THREE.MathUtils.smoothstep(progress,0,.09)*(1-THREE.MathUtils.smoothstep(progress,.78,1));
    active.group.position.lerpVectors(start,end,progress);
    active.rock.rotation.x += step*.8;
    active.rock.rotation.y += step*1.3;
    active.rock.material.opacity = opacity;
    active.halo.material.opacity = opacity*(active.kind==='comet' ? .45 : .32);
    active.core.material.opacity = opacity*.9;
    for (const tail of active.tails) {
      tail.material.uniforms.uOpacity.value = opacity*tail.userData.opacity;
      tail.material.uniforms.uTime.value = elapsed;
    }
  }
  function dispose() {
    if (disposed) return;
    clear(); root.removeFromParent(); root.visible = false; disposed = true;
    ownGeometry.forEach(resource => resource.dispose());
    ownMaterials.forEach(resource => resource.dispose());
    // glowMap belongs to the app and remains available to other scene objects.
  }
  return {update,dispose,getStatus:()=>({active:active?.kind??null,progress:active ? elapsed/duration : 0,
    nextIn:active ? null : Math.max(0,nextIn),spawned,visible:root.visible,reducedMotion:motionIsReduced(),
    detail,poolSize:visitors.length,disposed})};
}
