// Globe-local, illustrative weather effects. Their size and animation are not
// measurements or a forecast. No external textures or live data are fetched here.
const TAU = Math.PI * 2;
const RAD = Math.PI / 180;
const SUPPORTED = new Set(['lightning', 'cyclone-demo', 'typhoons', 'weather', 'wind']);

function seedFor(text) {
  let seed = 2166136261;
  for (const character of String(text)) seed = Math.imul(seed ^ character.charCodeAt(0), 16777619);
  return seed >>> 0;
}
function randomFor(text) {
  let value = seedFor(text);
  return () => { value = Math.imul(value, 1664525) + 1013904223 | 0; return (value >>> 0) / 4294967296; };
}
const validItem = item => item && Number.isFinite(item.lat) && Number.isFinite(item.lon) && Math.abs(item.lat) <= 90 && Math.abs(item.lon) <= 180;

const SURFACE_VERTEX = `
varying vec2 vUv;
#include <common>
#include <logdepthbuf_pars_vertex>
void main() {
  vUv = uv;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  #include <logdepthbuf_vertex>
}`;

const NOISE = `
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + 1.0), f.x), f.y);
}
float fbm(vec2 p) {
  float result = 0.0, weight = 0.5;
  for (int i = 0; i < 4; i++) {
    result += noise(p) * weight;
    p = mat2(1.6, -1.2, 1.2, 1.6) * p + 17.3;
    weight *= 0.5;
  }
  return result;
}
`;

const CYCLONE_FRAGMENT = `
uniform float uTime, uSeed, uDirection, uSelected;
varying vec2 vUv;
#include <common>
#include <logdepthbuf_pars_fragment>
${NOISE}
void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float r = length(p);
  if (r > 1.0 || r < 0.105) discard;
  float angle = atan(p.y, p.x) - uDirection * uTime * 0.13;
  vec2 rotated = vec2(cos(angle), sin(angle)) * r;
  float coarse = fbm(rotated * 12.0 + uSeed);
  float fine = fbm(rotated * 48.0 + uSeed);
  // Three trailing cloud arms meet an irregular, bright eyewall.
  float winding = angle * 3.0 + uDirection * (r * 12.8 + coarse * 1.15);
  float bands = pow(0.5 + 0.5 * cos(winding), 3.4);
  float eyeWall = exp(-pow((r - 0.21) / 0.073, 2.0));
  float arms = bands * smoothstep(0.18, 0.32, r) * (1.0 - smoothstep(0.62, 1.0, r));
  float cloud = max(arms, eyeWall * 0.88) * smoothstep(0.19, 0.7, coarse + fine * 0.33);
  float edge = (1.0 - smoothstep(0.86, 1.0, r)) * smoothstep(0.105, 0.16, r);
  float alpha = clamp(cloud * 1.7, 0.0, 0.94) * edge;
  if (alpha < 0.012) discard;
  vec3 color = mix(vec3(0.47, 0.60, 0.72), vec3(1.0, 0.99, 0.96), 0.47 + fine * 0.52);
  color += uSelected * 0.07;
  gl_FragColor = vec4(color, alpha);
  #include <logdepthbuf_fragment>
  #include <colorspace_fragment>
}`;

const CLOUD_FRAGMENT = `
uniform float uTime, uSeed, uSelected, uLightning, uDensity, uStatic;
varying vec2 vUv;
#include <common>
#include <logdepthbuf_pars_fragment>
${NOISE}
float segment(vec2 p, vec2 a, vec2 b) {
  vec2 ab = b - a;
  return length(p - a - ab * clamp(dot(p-a, ab) / dot(ab, ab), 0.0, 1.0));
}
void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float r = length(p);
  if (r > 1.0) discard;
  float coarse = fbm(p * 3.9 + uSeed + vec2(uTime * 0.012, 0.0));
  float detail = fbm(p * 24.0 + uSeed);
  float envelope = (1.0 - smoothstep(0.3, 1.0, r)) * smoothstep(0.17, 0.69, coarse + detail * 0.2);
  float cycle = mod(uTime + uSeed * 0.271, 6.4);
  float burst = exp(-pow((cycle - 0.14) / 0.065, 2.0))
              + 0.75 * exp(-pow((cycle - 0.38) / 0.045, 2.0));
  float flash = uLightning * mix(clamp(burst, 0.0, 1.0), 0.6, uStatic);
  vec2 q = p + vec2(sin(uSeed) * 0.07, cos(uSeed) * 0.07);
  float bolt = segment(q, vec2(-0.22,0.44), vec2(-0.08,0.15));
  bolt = min(bolt, segment(q,vec2(-0.08,0.15),vec2(-0.19,0.03)));
  bolt = min(bolt, segment(q,vec2(-0.19,0.03),vec2(0.11,-0.17)));
  bolt = min(bolt, segment(q,vec2(0.11,-0.17),vec2(0.01,-0.45)));
  bolt = min(bolt, segment(q,vec2(-0.08,0.15),vec2(0.19,0.21)));
  bolt = min(bolt, segment(q,vec2(0.19,0.21),vec2(0.36,0.04)));
  bolt = min(bolt, segment(q,vec2(0.11,-0.17),vec2(0.34,-0.24)));
  float strokes = exp(-bolt * 200.0) + 0.3 * exp(-bolt * 35.0);
  float illumination = flash * (0.38 * exp(-r*r*4.0) + strokes);
  float alpha = clamp(envelope * uDensity + illumination, 0.0, 0.96);
  if (alpha < 0.012) discard;
  vec3 color = mix(vec3(0.35,0.45,0.59), vec3(0.94,0.97,1.0), detail * 0.6 + coarse * 0.5);
  color = mix(color, vec3(0.87,0.83,1.0), clamp(illumination * 1.7, 0.0, 1.0));
  color += uSelected * 0.06;
  gl_FragColor = vec4(color, alpha);
  #include <logdepthbuf_fragment>
  #include <colorspace_fragment>
}`;

const WIND_VERTEX = `
attribute float aFade;
varying float vFade;
#include <common>
#include <logdepthbuf_pars_vertex>
void main() {
  vFade = aFade;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  #include <logdepthbuf_vertex>
}`;
const WIND_FRAGMENT = `
varying float vFade;
#include <common>
#include <logdepthbuf_pars_fragment>
void main() {
  gl_FragColor = vec4(0.43, 0.83, 0.96, vFade * 0.43);
  #include <logdepthbuf_fragment>
  #include <colorspace_fragment>
}`;
const PARTICLE_VERTEX = `
#include <common>
#include <logdepthbuf_pars_vertex>
void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = clamp(17.0 / max(1.0, -mvPosition.z), 1.5, 4.0);
  #include <logdepthbuf_vertex>
}`;
const PARTICLE_FRAGMENT = `
#include <common>
#include <logdepthbuf_pars_fragment>
void main() {
  float r = length(gl_PointCoord - 0.5) * 2.0;
  if (r > 1.0) discard;
  gl_FragColor = vec4(0.70,0.95,1.0,(1.0-smoothstep(0.1,1.0,r))*0.9);
  #include <logdepthbuf_fragment>
  #include <colorspace_fragment>
}`;

export function createEarthNatureEffects({ THREE, earth, reducedMotion = false }) {
  if (!THREE || !earth?.add) throw new Error('Earth nature effects require THREE and an Earth mesh.');
  const radius = Number(earth.geometry?.parameters?.radius) || 3;
  const root = new THREE.Group();
  root.name = 'earth-nature-effects';
  root.visible = false;
  earth.add(root);
  let layer = null, selectedId = null, time = 0, disposed = false;
  let records = [], pickables = [], wind = null;

  function directionAt(lat, lon) {
    const p = lat * RAD, t = lon * RAD;
    return new THREE.Vector3(Math.cos(p) * Math.cos(t), Math.sin(p), -Math.cos(p) * Math.sin(t));
  }
  function basisAt(item) {
    const normal = directionAt(item.lat, item.lon);
    const east = new THREE.Vector3(-Math.sin(item.lon * RAD), 0, -Math.cos(item.lon * RAD));
    return { normal, east, north: normal.clone().cross(east).normalize() };
  }
  function surfacePoint(basis, x, y, angularRadius, height = 0.035) {
    return basis.normal.clone().addScaledVector(basis.east, x * Math.tan(angularRadius))
      .addScaledVector(basis.north, y * Math.tan(angularRadius)).normalize().multiplyScalar(radius + height);
  }
  function patchGeometry(basis, angularRadius) {
    const positions = [], uvs = [], indices = [], rings = 20, segments = 80;
    const put = (x, y) => { const p = surfacePoint(basis, x, y, angularRadius); positions.push(p.x, p.y, p.z); uvs.push(x * 0.5 + 0.5, y * 0.5 + 0.5); };
    put(0, 0);
    for (let ring = 1; ring <= rings; ring++) for (let j = 0; j < segments; j++) {
      const angle = j / segments * TAU;
      put(Math.cos(angle) * ring / rings, Math.sin(angle) * ring / rings);
    }
    for (let j = 0; j < segments; j++) indices.push(0, 1 + j, 1 + (j + 1) % segments);
    for (let ring = 1; ring < rings; ring++) for (let j = 0; j < segments; j++) {
      const a = 1 + (ring - 1) * segments + j, b = 1 + (ring - 1) * segments + (j + 1) % segments;
      const c = a + segments, d = b + segments;
      indices.push(a, c, d, a, d, b);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices); geometry.computeBoundingSphere();
    return geometry;
  }
  function addPatch(item, kind, density = 0.7, thunder = false) {
    const basis = basisAt(item), seed = seedFor(item.id) % 10000 / 137;
    const cyclone = kind === 'cyclone';
    const angularRadius = cyclone ? 0.145 : 0.087;
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: time }, uSeed: { value: seed }, uSelected: { value: item.id === selectedId ? 1 : 0 },
        uDirection: { value: item.lat < 0 ? -1 : 1 }, uDensity: { value: density },
        uLightning: { value: thunder ? 1 : 0 }, uStatic: { value: reducedMotion ? 1 : 0 }
      },
      vertexShader: SURFACE_VERTEX, fragmentShader: cyclone ? CYCLONE_FRAGMENT : CLOUD_FRAGMENT,
      transparent: true, depthTest: true, depthWrite: false, side: THREE.FrontSide, toneMapped: false
    });
    const mesh = new THREE.Mesh(patchGeometry(basis, angularRadius), material);
    mesh.name = `earth-${kind}-${item.id}`;
    mesh.userData = { earthSenseId: item.id, effectKind: kind, illustrative: true };
    mesh.renderOrder = 4;
    root.add(mesh); pickables.push(mesh);
    const record = { id: item.id, mesh, basis, angularRadius, rain: null };
    records.push(record);
    return record;
  }
  function addRain(record) {
    const random = randomFor(record.id + '-rain');
    const drops = Array.from({ length: 30 }, () => ({ x: (random() - 0.5) * 1.35, y: (random() - 0.5) * 1.35, phase: random() }));
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(drops.length * 6), 3));
    geometry.getAttribute('position').setUsage(THREE.DynamicDrawUsage);
    const mesh = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: 0x9bcde7, transparent: true, opacity: 0.62, depthWrite: false, depthTest: true }));
    mesh.name = `earth-rain-${record.id}`;
    mesh.userData = { earthSenseId: record.id, effectKind: 'rain', illustrative: true };
    mesh.renderOrder = 5;
    root.add(mesh);
    record.rain = { mesh, drops };
    updateRain(record);
  }
  function updateRain(record) {
    if (!record.rain) return;
    const attribute = record.rain.mesh.geometry.getAttribute('position');
    record.rain.drops.forEach((drop, i) => {
      const phase = (drop.phase + time * 0.8) % 1;
      const height = 0.025 + (1 - phase) * 0.095;
      const p = surfacePoint(record.basis, drop.x, drop.y, record.angularRadius, height);
      const q = surfacePoint(record.basis, drop.x, drop.y, record.angularRadius, Math.max(0.02, height - 0.024));
      attribute.setXYZ(i * 2, p.x, p.y, p.z); attribute.setXYZ(i * 2 + 1, q.x, q.y, q.z);
    });
    attribute.needsUpdate = true;
    record.rain.mesh.geometry.computeBoundingSphere();
  }
  function windPoint(flow, fraction) {
    const lon = flow.lon + flow.direction * (fraction - 0.5) * 46;
    const lat = flow.lat + Math.sin(fraction * Math.PI) * flow.bend;
    return directionAt(lat, lon).multiplyScalar(radius + 0.048);
  }
  function addWind(items) {
    const flows = [];
    for (const lat of [-67, -43, -18, 18, 43, 67]) for (let column = 0; column < 10; column++) {
      flows.push({ lat, lon: column * 36 + (lat < 0 ? 14 : 0), direction: Math.abs(lat) > 30 && Math.abs(lat) < 60 ? 1 : -1, bend: lat < 0 ? 5.2 : -5.2, phase: (column * 0.173 + Math.abs(lat) * 0.019) % 1 });
    }
    const positions = [], fades = [];
    for (const flow of flows) for (let index = 0; index < 38; index++) for (const k of [index, index + 1]) {
      const t = k / 38, point = windPoint(flow, t);
      positions.push(point.x, point.y, point.z); fades.push(Math.sin(t * Math.PI));
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('aFade', new THREE.Float32BufferAttribute(fades, 1));
    const lines = new THREE.LineSegments(geometry, new THREE.ShaderMaterial({ vertexShader: WIND_VERTEX, fragmentShader: WIND_FRAGMENT, transparent: true, depthWrite: false, depthTest: true, toneMapped: false }));
    lines.name = 'earth-wind-flow-lines';
    root.add(lines);
    // Small surface arrows preserve flow direction when motion is paused. Their
    // category IDs also make the flow illustration usable as a click target.
    const arrowGroups = new Map();
    for (const flow of flows) {
      const category = Math.abs(flow.lat) < 30 ? 'wind-trades' : Math.abs(flow.lat) < 60 ? 'wind-westerlies' : 'wind-polar';
      const matched = items.find(item => item.id === category);
      const id = matched?.id || category;
      if (!arrowGroups.has(id)) arrowGroups.set(id, []);
      const buffer = arrowGroups.get(id), base = windPoint(flow, 0.70), tip = windPoint(flow, 0.765);
      const sideways = base.clone().normalize().cross(tip.clone().sub(base).normalize()).normalize().multiplyScalar(0.014);
      const left = base.clone().add(sideways).normalize().multiplyScalar(radius + 0.049);
      const right = base.clone().sub(sideways).normalize().multiplyScalar(radius + 0.049);
      buffer.push(tip.x,tip.y,tip.z,left.x,left.y,left.z,right.x,right.y,right.z);
    }
    for (const [id, positions] of arrowGroups) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      const material = new THREE.MeshBasicMaterial({ color: 0x9adfed, transparent: true, opacity: 0.57, depthWrite: false, depthTest: true, side: THREE.DoubleSide });
      const arrows = new THREE.Mesh(geometry, material);
      arrows.name = `earth-wind-arrows-${id}`;
      arrows.userData = { earthSenseId: id, effectKind: 'wind', illustrative: true };
      root.add(arrows); pickables.push(arrows);
    }
    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(flows.length * 3), 3));
    particlesGeometry.getAttribute('position').setUsage(THREE.DynamicDrawUsage);
    const particles = new THREE.Points(particlesGeometry, new THREE.ShaderMaterial({ vertexShader: PARTICLE_VERTEX, fragmentShader: PARTICLE_FRAGMENT, transparent: true, depthWrite: false, depthTest: true, toneMapped: false }));
    particles.name = 'earth-wind-flow-particles'; root.add(particles);
    wind = { flows, particles };
    updateWind();
  }
  function updateWind() {
    if (!wind) return;
    const attribute = wind.particles.geometry.getAttribute('position');
    wind.flows.forEach((flow, i) => { const p = windPoint(flow, (flow.phase + time * 0.075) % 1); attribute.setXYZ(i, p.x, p.y, p.z); });
    attribute.needsUpdate = true; wind.particles.geometry.computeBoundingSphere();
  }
  function clear() {
    root.traverse(object => { object.geometry?.dispose(); if (object.material) object.material.dispose(); });
    root.clear(); records = []; pickables = []; wind = null;
  }
  function setLayer(nextLayer, items = []) {
    if (disposed) return;
    clear(); layer = SUPPORTED.has(nextLayer) ? nextLayer : null;
    if (layer === 'wind') { addWind(items); return; }
    if (!layer) return;
    for (const item of items.filter(validItem)) {
      if (layer === 'cyclone-demo' || layer === 'typhoons') addPatch(item, 'cyclone');
      else if (layer === 'lightning') addPatch(item, 'lightning', 0.3, true);
      else if (layer === 'weather') {
        const code = Number(item.code ?? item.weather_code);
        const precipitation = Number(item.precipitation) || 0;
        const thunder = code >= 95 && code <= 99;
        const rain = (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || thunder || precipitation > 0 && !(code >= 71 && code <= 77 || code === 85 || code === 86);
        const cloudy = code >= 1 && code <= 99 || precipitation > 0;
        if (!cloudy) continue;
        const density = code === 1 ? 0.37 : code === 2 ? 0.57 : 0.8;
        const record = addPatch(item, thunder ? 'lightning' : 'cloud', density, thunder);
        if (rain) addRain(record);
      }
    }
  }
  function setSelected(id) {
    if (disposed) return;
    selectedId = id ?? null;
    for (const record of records) record.mesh.material.uniforms.uSelected.value = record.id === selectedId ? 1 : 0;
  }
  function setVisible(value) { if (!disposed) root.visible = Boolean(value); }
  function setReducedMotion(value) {
    if (disposed) return;
    reducedMotion = Boolean(value);
    for (const record of records) record.mesh.material.uniforms.uStatic.value = reducedMotion ? 1 : 0;
  }
  function needsAnimation() { return !disposed && root.visible && !reducedMotion && (records.length > 0 || Boolean(wind)); }
  function update(dt) {
    if (!needsAnimation() || !Number.isFinite(dt) || dt <= 0) return;
    time += Math.min(dt, 0.25);
    for (const record of records) { record.mesh.material.uniforms.uTime.value = time; updateRain(record); }
    updateWind();
  }
  function getStatus() {
    return { layer, visible: !disposed && root.visible, selectedId, effectCount: records.length, windFlowCount: wind?.flows.length || 0, pickableCount: pickables.length, time, reducedMotion: Boolean(reducedMotion), disposed };
  }
  function dispose() { if (disposed) return; clear(); root.removeFromParent(); root.visible = false; disposed = true; layer = null; }
  return { setLayer, setVisible, setSelected, setReducedMotion, getPickables: () => disposed || !root.visible ? [] : pickables.slice(), update, needsAnimation, getStatus, dispose };
}
