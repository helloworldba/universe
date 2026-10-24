// NASA's original Roman Observatory GLB is kept byte-for-byte on disk.
// Fetch is lazy; only the downloaded bytes are shared, never decoded GPU resources.
const modelURL = new URL('./assets/models/roman-nasa.glb', import.meta.url);
let bufferPromise;

function modelBytes() {
  if (!bufferPromise) {
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), 45000);
    const request = fetch(modelURL, {signal: abort.signal})
      .then(response => {
        if (!response.ok) throw new Error(`Roman model: HTTP ${response.status}`);
        return response.arrayBuffer();
      })
      .catch(error => {
        if (bufferPromise === request) bufferPromise = undefined;
        throw error;
      })
      .finally(() => clearTimeout(timer));
    bufferPromise = request;
  }
  return bufferPromise;
}

function resources(root) {
  const geometries = new Set(), materials = new Set(), textures = new Set();
  root.traverse(object => {
    if (object.geometry) geometries.add(object.geometry);
    for (const material of object.material ? [].concat(object.material) : []) {
      materials.add(material);
      for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
    }
  });
  return {geometries, materials, textures};
}

function ownedModel(root) {
  const owned = resources(root);
  let disposed = false;
  return {
    root, textures: owned.textures,
    dispose() {
      if (disposed) return;
      disposed = true;
      owned.geometries.forEach(geometry => geometry.dispose());
      owned.materials.forEach(material => material.dispose());
      const images = new Set();
      owned.textures.forEach(texture => {
        texture.dispose();
        if (texture.source?.data) images.add(texture.source.data);
      });
      images.forEach(image => image.close?.());
      root.removeFromParent();
    },
  };
}

function reflectionTexture(THREE) {
  // A local studio reflection makes NASA's metallic blankets legible in the
  // dark scene. Original material colors, texture maps and roughness survive.
  const width = 128, height = 64, pixels = new Uint8Array(width * height * 4);
  const angular = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const u = x / width * Math.PI * 2, t = (y / height - .5) * Math.PI;
    const horizon = Math.exp(-Math.pow(t / .35, 2));
    const broad = Math.exp(-Math.pow(angular(u, .8) / .65, 2) - Math.pow((t - .25) / .55, 2));
    const strip = Math.exp(-Math.pow(angular(u, 4.2) / .22, 2) - Math.pow(t / .8, 2));
    const brightness = .2 + .28 * horizon + .9 * broad + .65 * strip;
    const at = (y * width + x) * 4;
    pixels[at] = Math.min(255, 241 * brightness);
    pixels[at + 1] = Math.min(255, 250 * brightness);
    pixels[at + 2] = Math.min(255, 255 * brightness);
    pixels[at + 3] = 255;
  }
  const texture = new THREE.DataTexture(pixels, width, height, THREE.RGBAFormat);
  texture.name = 'roman-local-metal-reflection';
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.needsUpdate = true;
  return texture;
}

function normalize(THREE, scene, name, orientation = 0) {
  const root = new THREE.Group();
  root.name = name;
  const aligned = new THREE.Group();
  aligned.name = 'roman-aligned-geometry';
  aligned.rotation.y = orientation;
  aligned.add(scene);
  const centered = new THREE.Group();
  centered.name = 'roman-centered-geometry';
  centered.add(aligned);
  root.add(centered);
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(aligned);
  const size = box.getSize(new THREE.Vector3());
  const longest = Math.max(size.x, size.y, size.z);
  if (!Number.isFinite(longest) || longest <= 0) {
    ownedModel(root).dispose();
    throw new Error('Roman model has no finite visible geometry');
  }
  centered.position.copy(box.getCenter(new THREE.Vector3())).negate();
  root.scale.setScalar(18 / longest);
  root.updateMatrixWorld(true);
  const normalized = new THREE.Box3().setFromObject(root);
  root.userData.boundsRadius = normalized.getSize(new THREE.Vector3()).length() / 2;
  root.userData.normalizedLongestEdge = 18;
  return root;
}

export function prepareRomanModel({THREE, scene}) {
  const materials = resources(scene).materials;
  const reflective = [...materials].filter(material => material.metalness > 0);
  if (reflective.length) {
    const reflection = reflectionTexture(THREE);
    for (const material of reflective) {
      material.envMap = reflection;
      material.envMapIntensity = 1.15;
      material.needsUpdate = true;
    }
  }
  // NASA's barrel points towards -X. The standard craft entry view faces +Z;
  // keep the solar-array sunshield above the barrel (+Y) during that rotation.
  const root = normalize(THREE, scene, 'roman-nasa-model', Math.PI / 2);
  root.userData.modelSource = 'NASA Roman Observatory';
  root.userData.modelState = 'ready';
  return ownedModel(root);
}

export async function loadRomanModel({THREE}) {
  const request = modelBytes();
  try {
    const [{GLTFLoader}, bytes] = await Promise.all([
      import('./vendor/addons/loaders/GLTFLoader.js'), request,
    ]);
    const gltf = await new GLTFLoader().parseAsync(bytes, '');
    return prepareRomanModel({THREE, scene: gltf.scene});
  } catch (error) {
    if (bufferPromise === request) bufferPromise = undefined;
    throw error;
  }
}

export function createRomanPlaceholder({THREE}) {
  // A compact, explicitly identified loading illustration. This is never
  // reported as NASA's downloaded model and remains useful on a load failure.
  const scene = new THREE.Group();
  const silver = new THREE.MeshStandardMaterial({color: 0xb7c8d1, metalness: .45, roughness: .48});
  const dark = new THREE.MeshStandardMaterial({color: 0x172737, metalness: .2, roughness: .7});
  const solar = new THREE.MeshStandardMaterial({color: 0x173a63, metalness: .25, roughness: .45, side: THREE.DoubleSide});
  const body = new THREE.Mesh(new THREE.CylinderGeometry(2.15, 2.35, 8, 24, 1, true), silver);
  body.name = 'roman-placeholder-barrel';
  body.rotation.x = Math.PI / 2;
  body.position.z = .5;
  scene.add(body);
  const aperture = new THREE.Mesh(new THREE.CircleGeometry(2.05, 32), dark);
  aperture.name = 'roman-placeholder-aperture';
  aperture.position.z = 4.52;
  scene.add(aperture);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(2.12, .12, 8, 32), silver);
  rim.position.z = 4.55;
  scene.add(rim);
  const bus = new THREE.Mesh(new THREE.BoxGeometry(4.1, 3.5, 2.3), silver);
  bus.name = 'roman-placeholder-spacecraft-bus';
  bus.position.z = -4.2;
  scene.add(bus);
  const panelGeometry = new THREE.BoxGeometry(3.25, .13, 2.9);
  for (const x of [-3.3, 0, 3.3]) for (const z of [-2, 1]) {
    const panel = new THREE.Mesh(panelGeometry, solar);
    panel.name = 'roman-placeholder-solar-panel';
    panel.position.set(x, 2.65, z);
    scene.add(panel);
  }
  const root = normalize(THREE, scene, 'roman-loading-preview');
  root.userData.modelSource = 'procedural loading illustration';
  root.userData.modelState = 'placeholder';
  return ownedModel(root);
}
