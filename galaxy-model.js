// Procedural science illustration. Population distributions are informed by
// ORBIT's src/universe/galaxy.js and nearby-galaxies.js (Apache-2.0).
// Particle buffers/materials belong to the caller; supplied glow textures do not.
const TAU = Math.PI * 2;

function seeded(text) {
  let state = 2166136261;
  for (const character of text) state = Math.imul(state ^ character.charCodeAt(0), 16777619);
  return () => { state = Math.imul(state, 1664525) + 1013904223 | 0; return (state >>> 0) / 4294967296; };
}

const VERTEX = `
attribute vec3 aColor;
attribute float aSize;
attribute float aPhase;
attribute float aTwinkle;
uniform float uTime;
uniform float uHeight;
uniform float uRatio;
uniform float uSoft;
varying vec3 vColor;
varying float vShimmer;
#include <common>
#include <logdepthbuf_pars_vertex>
void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  float projected = aSize * uHeight * projectionMatrix[1][1] / max(0.2, -2.0 * mvPosition.z);
  gl_PointSize = clamp(projected, mix(0.65, 1.0, uSoft) * uRatio, mix(5.2, 32.0, uSoft) * uRatio);
  vColor = aColor;
  vShimmer = 1.0 + aTwinkle * (sin(uTime * (0.53 + fract(aPhase) * 0.49) + aPhase * 12.0)
    + 0.32 * sin(uTime * 1.47 + aPhase * 31.0));
  #include <logdepthbuf_vertex>
}`;

const FRAGMENT = `
uniform float uOpacity;
uniform float uSoft;
varying vec3 vColor;
varying float vShimmer;
#include <common>
#include <logdepthbuf_pars_fragment>
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  if (d > 1.0) discard;
  float edge = 1.0 - smoothstep(0.55, 1.0, d);
  float profile = exp(-d * d * mix(3.6, 4.6, uSoft)) * edge;
  gl_FragColor = vec4(vColor * vShimmer, profile * uOpacity);
  #include <logdepthbuf_fragment>
  #include <colorspace_fragment>
}`;

/** Build a bounded, deterministic star population without opaque dust billboards. */
export function createGalaxyModel({ THREE, entry, radius, count, parent, glow, starMap, atlas = false }) {
  const group = new THREE.Group();
  group.name = `galaxy-model-${entry.id}`;
  if (parent) parent.add(group);
  const budget = Math.max(256, Math.floor(count || 5000));
  const random = seeded(`${entry.id}-stellar-populations-v2`);
  const normal = () => Math.max(-3.2, Math.min(3.2,
    Math.sqrt(-2 * Math.log(Math.max(1e-8, random()))) * Math.cos(TAU * random())));
  const id = entry.id;
  const milky = id === 'galaxy', andromeda = id === 'andromeda';
  const cigar = id === 'cigar', sombrero = id === 'sombrero';
  const centaurus = id === 'centaurus-a', giant = id === 'm87';
  const elliptical = ['m32', 'm110', 'm87', 'centaurus-a'].includes(id) || entry.shape === 'elliptical';
  const compact = id === 'm32', diffuse = id === 'm110';
  const irregular = ['lmc', 'smc', 'barnard-galaxy'].includes(id) || entry.shape === 'irregular';
  const arms = milky ? 4 : id === 'triangulum' ? 3 : 2;
  const twist = andromeda ? 2.05 : id === 'bode' ? 1.88 : id === 'whirlpool' ? 1.58 : 1.67;
  const warm = new THREE.Color(elliptical ? 0xffdfb5 : 0xffce94);
  const blue = new THREE.Color(id === 'triangulum' ? 0x90cfe7 : 0x8abaff);
  const white = new THREE.Color(0xe5efff), pink = new THREE.Color(0xe5a1bd);
  const color = new THREE.Color();
  const cloudKnots = id === 'lmc'
    ? [[-.49, -.12, .12], [.44, .24, .085], [.1, -.32, .15], [-.22, .31, .15]]
    : id === 'smc' ? [[-.36, -.13, .16], [.12, .10, .14], [.51, .23, .12]]
      : [[-.47, -.16, .12], [.38, .24, .16], [.13, -.39, .09], [-.2, .32, .11], [.55, -.21, .07]];

  // Each sample is a physical 3D location, including the spheroidal bulge.
  // A low emissivity at the midplane describes extinction, never a black disk.
  function sample() {
    const population = random();
    let x = 0, y = 0, z = 0, r = 0, core = false, knot = false, dust = 1, feature = '';
    if ((giant || centaurus) && population < (giant ? .018 : .009)) {
      const h = .14 + Math.pow(random(), .76) * (giant ? 1.35 : 1.05);
      const width = .003 + h * .025;
      x = normal() * width; y = h * (random() < .91 ? 1 : -1); z = normal() * width;
      r = h; dust = .65 * (1 - h * .35); feature = 'jet';
    } else if (cigar) {
      if (population < .12) {
        const h = .13 + Math.pow(random(), .9) * .79;
        x = normal() * (.025 + h * .16); y = h * (random() < .5 ? -1 : 1); z = normal() * .036;
        r = h; feature = 'outflow'; dust = .45 * (1 - h * .5);
      } else {
        x = (random() * 2 - 1) * .92; y = normal() * .045; z = normal() * (.03 + .07 * (1 - Math.abs(x)));
        if (population < .56) { x *= .45; core = true; knot = true; }
        r = Math.hypot(x, z); dust = Math.abs(y + Math.sin(x * 11) * .015) < .009 ? .12 : 1;
      }
    } else if (sombrero) {
      core = population < .59;
      if (core) {
        r = Math.pow(random(), 1.1) * .54;
        const a = random() * TAU, h = random() * 2 - 1, q = Math.sqrt(1 - h * h);
        x = Math.cos(a) * q * r; z = Math.sin(a) * q * r; y = h * r * .72;
        dust = Math.abs(y) < .028 ? .025 : 1;
      } else {
        r = .24 + Math.pow(random(), .7) * .75;
        const a = random() * TAU;
        x = Math.cos(a) * r; z = Math.sin(a) * r;
        y = (random() < .5 ? -1 : 1) * (.024 + Math.abs(normal()) * .009);
        dust = .72;
      }
    } else if (elliptical) {
      core = population < (compact ? .46 : diffuse ? .07 : .32);
      r = core ? Math.pow(random(), 1.5) * (compact ? .19 : .26)
        : Math.pow(random(), compact ? 1.12 : diffuse ? .66 : .8) * .98;
      const a = random() * TAU, h = random() * 2 - 1, q = Math.sqrt(1 - h * h);
      x = Math.cos(a) * q * r; y = h * r * (diffuse ? .43 : .74); z = Math.sin(a) * q * r * (diffuse ? .6 : .84);
      if (centaurus) dust = Math.abs(y + Math.sin(x * 3.4) * .024) < .042 + Math.abs(x) * .03 ? .025 : .93;
      if (diffuse) dust *= .72;
    } else if (irregular) {
      if (id === 'lmc' && population < .36) {
        x = (random() - .5) * 1.42; z = normal() * .066 + x * .14; y = normal() * .04;
        core = true;
      } else if (population < (id === 'lmc' ? .79 : .74)) {
        const clump = cloudKnots[Math.floor(random() * cloudKnots.length)];
        x = clump[0] + normal() * clump[2]; z = clump[1] + normal() * clump[2] * .72; y = normal() * clump[2] * .45;
        knot = true;
      } else {
        const a = random() * TAU;
        r = Math.sqrt(random()); x = Math.cos(a) * r * .84 + Math.sin(a * 2) * .10;
        z = Math.sin(a) * r * .54 + x * .18; y = normal() * .06; dust = .45;
      }
      r = Math.hypot(x, z);
    } else if (id === 'whirlpool' && population > .925) {
      if (population > .944) {
        r = Math.pow(random(), 1.3) * .14;
        const a = random() * TAU;
        x = .87 + Math.cos(a) * r; z = .35 + Math.sin(a) * r; y = normal() * .045;
        core = true; feature = 'companion';
      } else {
        const t = random();
        x = .49 + .38 * t + normal() * .025;
        z = .5 - .15 * t + Math.sin(t * Math.PI) * .10 + normal() * .022;
        y = normal() * .015; r = Math.hypot(x, z); dust = .65;
      }
    } else {
      const bulgeFraction = milky ? .19 : andromeda ? .27 : id === 'bode' ? .27 : id === 'triangulum' ? .065 : .13;
      const barFraction = milky ? .055 : 0;
      const diskFraction = id === 'triangulum' ? .23 : andromeda ? .13 : .095;
      if (population < bulgeFraction) {
        r = Math.pow(random(), 1.38) * (id === 'triangulum' ? .14 : .23);
        const a = random() * TAU;
        x = Math.cos(a) * r; z = Math.sin(a) * r;
        y = normal() * (milky ? .085 : andromeda ? .072 : .049) * Math.max(.15, 1 - r / .28);
        core = true;
      } else if (population < bulgeFraction + barFraction) {
        x = (random() * 2 - 1) * .30; z = normal() * (.018 + .023 * (1 - Math.abs(x) / .3));
        y = normal() * .022; r = Math.hypot(x, z); core = true;
      } else {
        r = .14 + Math.pow(random(), .72) * .85;
        const inDisk = population < bulgeFraction + barFraction + diskFraction;
        let arm = Math.floor(random() * arms);
        if (milky && random() < .6) arm = random() < .5 ? 0 : 2;
        const spread = andromeda ? .115 : id === 'triangulum' ? .22 : .13;
        const offset = normal() * (spread + r * .025);
        const a = inDisk ? random() * TAU : arm * TAU / arms + Math.log(r / .16) * twist + offset + Math.sin(r * 25 + arm) * .025;
        x = Math.cos(a) * r + normal() * .009; z = Math.sin(a) * r + normal() * .009;
        y = normal() * (.004 + r * .016);
        if (inDisk) dust = .22;
        else {
          // Broken knots and spurs keep the arms from reading as four wires.
          knot = random() < .12 && Math.sin(r * 47 + arm * 1.7) > -.15;
          dust = offset > -.12 && offset < -.035 ? .27 : .83 + Math.sin(r * 39 + arm) * .17;
          if (milky && arm % 2) dust *= .75;
        }
      }
    }
    return { x, y, z, r, core, knot, dust, feature };
  }

  const mistCount = Math.min(atlas ? 240 : 2200, Math.floor(budget * .055));
  const brightCount = Math.floor(budget * .018);
  const stellarCount = budget - mistCount - brightCount;
  const uniforms = [];
  const drawingSize = new THREE.Vector2();
  const layers = [
    { name:'stellar-disk-and-bulge', count:stellarCount, size:atlas ? .020 : .0047, opacity:.74, soft:0 },
    { name:'resolved-bright-stars', count:brightCount, size:atlas ? .032 : .0084, opacity:.86, soft:0 },
    { name:'diffuse-starlight', count:mistCount, size:atlas ? .105 : .059, opacity:atlas ? .029 : .023, soft:1 },
  ];
  for (const layer of layers) {
    const positions = new Float32Array(layer.count * 3), colors = new Float32Array(layer.count * 3);
    const sizes = new Float32Array(layer.count), phases = new Float32Array(layer.count), twinkles = new Float32Array(layer.count);
    for (let index = 0; index < layer.count; index++) {
      const p = sample();
      positions.set([p.x * radius, p.y * radius, p.z * radius], index * 3);
      color.copy(p.core || elliptical || sombrero ? warm : blue);
      if (p.core) color.lerp(white, .07 + random() * .11);
      else if (!elliptical && !irregular) color.lerp(warm, Math.max(0, .43 - p.r * .66));
      if (p.knot && random() < .22) color.copy(pink);
      if (random() < (p.core ? .06 : .11)) color.lerp(white, p.core ? .30 : .58);
      if (p.feature === 'outflow') color.setHex(0xf18a9d);
      if (p.feature === 'jet') color.setHex(0xb5d4ff);
      const power = (.64 + random() * .58) * p.dust * (p.core ? .66 : 1);
      colors.set([color.r * power, color.g * power, color.b * power], index * 3);
      sizes[index] = radius * layer.size * (.74 + random() * .65) * (p.core ? .91 : 1);
      phases[index] = random() * TAU;
      twinkles[index] = layer.soft ? .022 : (p.core ? .035 : .07) * (.4 + random() * .6);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute('aTwinkle', new THREE.BufferAttribute(twinkles, 1));
    geometry.computeBoundingSphere();
    const values = { uTime:{value:0}, uHeight:{value:1000}, uRatio:{value:1}, uSoft:{value:layer.soft}, uOpacity:{value:layer.opacity} };
    uniforms.push(values);
    const material = new THREE.ShaderMaterial({ uniforms:values, vertexShader:VERTEX, fragmentShader:FRAGMENT,
      transparent:true, depthWrite:false, depthTest:true, blending:THREE.AdditiveBlending, toneMapped:false });
    const points = new THREE.Points(geometry, material);
    points.name = `${entry.id}-${layer.name}`;
    points.onBeforeRender = renderer => {
      renderer.getDrawingBufferSize(drawingSize);
      values.uHeight.value = drawingSize.y;
      values.uRatio.value = renderer.getPixelRatio();
    };
    group.add(points);
  }

  function halo(color, scale, opacity, position) {
    if (!glow) return;
    const object = glow(color, radius * scale, opacity);
    object.name = `${id}-soft-nucleus`;
    if (position) object.position.set(position[0] * radius, position[1] * radius, position[2] * radius);
    object.material.toneMapped = false;
    group.add(object);
  }
  if (!irregular && !cigar && !centaurus && !sombrero) {
    halo(0xffd3a0, elliptical ? (diffuse ? .82 : .91) : .73, diffuse ? .04 : atlas ? .13 : .085);
    halo(0xffdfb8, elliptical ? .29 : .23, diffuse ? .045 : atlas ? .19 : .12);
    if (!diffuse) halo(0xffecd1, .072, atlas ? .22 : .12);
  }
  if (id === 'whirlpool') halo(0xffe5be, .24, .23, [.87, 0, .35]);
  if (irregular) for (const knot of cloudKnots.slice(0, 2)) halo(0xa2c6f0, .28, .055, [knot[0], 0, knot[1]]);
  // Wide additive glows would erase the dust lane. Both of these galaxies rely
  // entirely on volumetric star populations for their nuclei and silhouette.
  let clock = 0;
  group.userData.particleCount = budget;
  group.userData.layerCounts = Object.fromEntries(layers.map(layer => [layer.name, layer.count]));
  group.userData.animate = (dt) => {
    clock += Number.isFinite(dt) ? Math.max(0, dt) : 0;
    uniforms.forEach(values => { values.uTime.value = clock; });
  };
  group.userData.animationKind = 'illustrative-rotation-and-stellar-shimmer';
  return group;
}
