import {CONTINENT_MASK_WIDTH, CONTINENT_MASK_HEIGHT, CONTINENT_MASK_CODES, CONTINENT_MASK_RLE} from './assets/geography/continent-mask.js';

// Physical continent regions intersected with real land, not country ownership.
// The compact local mask avoids triangulating large geographic polygons across
// oceans, the date line or the south pole. It needs no runtime data request.
export function decodeContinentMask(encoded = CONTINENT_MASK_RLE, width = CONTINENT_MASK_WIDTH, height = CONTINENT_MASK_HEIGHT) {
  const binary = atob(encoded), pixels = new Uint8Array(width * height);
  if (binary.length % 3) throw new Error('Invalid continent mask encoding');
  let offset = 0;
  for (let index = 0; index < binary.length; index += 3) {
    const count = binary.charCodeAt(index) | (binary.charCodeAt(index + 1) << 8);
    const value = binary.charCodeAt(index + 2);
    if (!count || value > 7 || offset + count > pixels.length) throw new Error('Invalid continent mask run');
    pixels.fill(value, offset, offset + count); offset += count;
  }
  if (offset !== pixels.length) throw new Error('Incomplete continent mask');
  return pixels;
}

export function continentRegionAt(latitude, longitude, pixels) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90) return '';
  const u = (((longitude + 180) % 360) + 360) % 360 / 360;
  const x = Math.min(CONTINENT_MASK_WIDTH - 1, Math.floor(u * CONTINENT_MASK_WIDTH));
  const y = Math.min(CONTINENT_MASK_HEIGHT - 1, Math.floor((latitude + 90) / 180 * CONTINENT_MASK_HEIGHT));
  const code = pixels[y * CONTINENT_MASK_WIDTH + x];
  return Object.keys(CONTINENT_MASK_CODES).find(id => CONTINENT_MASK_CODES[id] === code) || '';
}

export function createContinentRegions({THREE, radius = 3, enabled = true} = {}) {
  const pixels = decodeContinentMask();
  const texture = new THREE.DataTexture(pixels, CONTINENT_MASK_WIDTH, CONTINENT_MASK_HEIGHT, THREE.RedFormat, THREE.UnsignedByteType);
  texture.name = 'natural-earth-physical-continent-mask';
  texture.colorSpace = THREE.NoColorSpace;
  texture.minFilter = THREE.NearestFilter; texture.magFilter = THREE.NearestFilter;
  texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = false; texture.flipY = false; texture.unpackAlignment = 1; texture.needsUpdate = true;
  const material = new THREE.ShaderMaterial({
    name: 'continent-range-fill-and-outline', transparent: true, depthTest: true, depthWrite: false,
    side: THREE.FrontSide, toneMapped: false,
    uniforms: {
      regionMask: {value: texture}, selectedRegion: {value: 0},
      // A common cyan selection tint contrasts with desert, forest and ice.
      regionColor: {value: new THREE.Color('#16bddd')},
      outlineColor: {value: new THREE.Color('#c2faff')},
      rimColor: {value: new THREE.Color('#063544')},
      pixelRatio: {value: 1},
      fillOpacity: {value: .32}, outlineOpacity: {value: .96}
    },
    vertexShader: `
      varying vec2 vRegionUv;
      #include <common>
      #include <logdepthbuf_pars_vertex>
      void main() {
        vRegionUv = uv;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <logdepthbuf_vertex>
      }`,
    fragmentShader: `
      uniform sampler2D regionMask;
      uniform float selectedRegion;
      uniform vec3 regionColor;
      uniform vec3 outlineColor;
      uniform vec3 rimColor;
      uniform float pixelRatio;
      uniform float fillOpacity;
      uniform float outlineOpacity;
      varying vec2 vRegionUv;
      #include <common>
      #include <logdepthbuf_pars_fragment>
      float selectedAt(vec2 p) {
        float code = texture2D(regionMask, vec2(fract(p.x), clamp(p.y, 0.0, 1.0))).r * 255.0;
        return 1.0 - step(.5, abs(code - selectedRegion));
      }
      float insideAround(vec2 dx, vec2 dy, float width) {
        return min(min(selectedAt(vRegionUv + dx * width), selectedAt(vRegionUv - dx * width)),
                   min(selectedAt(vRegionUv + dy * width), selectedAt(vRegionUv - dy * width)));
      }
      void main() {
        // Evaluate derivatives before discard. One step is one CSS pixel,
        // including when adaptive quality changes the drawing-buffer scale.
        vec2 dx = dFdx(vRegionUv) * pixelRatio;
        vec2 dy = dFdy(vRegionUv) * pixelRatio;
        if (selectedRegion < .5 || selectedAt(vRegionUv) < .5) discard;
        // Outline stays on the selected land pixels; it never bridges an ocean.
        float edge = 1.0 - insideAround(dx, dy, 1.8);
        float rim = max(edge, 1.0 - insideAround(dx, dy, 3.5));
        vec3 color = mix(mix(regionColor, rimColor, rim), outlineColor, edge);
        float opacity = mix(mix(fillOpacity, .72, rim), outlineOpacity, edge);
        gl_FragColor = vec4(color, opacity);
        #include <logdepthbuf_fragment>
        #include <colorspace_fragment>
      }`
  });
  // Small offset exceeds the mesh's chord sag, without floating above the globe.
  const geometry = new THREE.SphereGeometry(radius * 1.003, 128, 64);
  const mesh = new THREE.Mesh(geometry, material); mesh.name = 'selected-continent-region';
  mesh.visible = false; mesh.renderOrder = 2;
  // This visual layer must never intercept the existing globe/marker picking.
  mesh.raycast = () => {};
  let visible = Boolean(enabled), selectedId = '', disposed = false;
  function select(id) {
    if (disposed) return;
    selectedId = Object.hasOwn(CONTINENT_MASK_CODES, id) ? id : '';
    material.uniforms.selectedRegion.value = CONTINENT_MASK_CODES[selectedId] || 0;
    mesh.visible = visible && Boolean(selectedId);
  }
  function setVisible(value) {if (!disposed) {visible = Boolean(value); mesh.visible = visible && Boolean(selectedId);}}
  function setPixelRatio(value) {
    if (!disposed && Number.isFinite(value) && value > 0) material.uniforms.pixelRatio.value = value;
  }
  function dispose() {
    if (disposed) return;
    disposed = true; mesh.visible = false; mesh.removeFromParent();
    geometry.dispose(); material.dispose(); texture.dispose();
  }
  return {
    mesh, select, setVisible, setPixelRatio, dispose,
    getStatus: () => ({enabled: visible, selectedId, visible: !disposed && mesh.visible, maskWidth: CONTINENT_MASK_WIDTH, maskHeight: CONTINENT_MASK_HEIGHT, textureBytes: pixels.byteLength, disposed})
  };
}
