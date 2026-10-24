const modelURL = new URL('./assets/models/hubble-nasa.glb', import.meta.url);
let bufferPromise;

// Cache only the original GLB bytes. Each visit owns its decoded Three.js resources.
function modelBytes() {
  if (!bufferPromise) {
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), 20000);
    const request = fetch(modelURL, {signal: abort.signal})
      .then(response => {
        if (!response.ok) throw new Error(`Hubble model: HTTP ${response.status}`);
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

function release(owned) {
  owned.geometries.forEach(geometry => geometry.dispose());
  owned.materials.forEach(material => material.dispose());
  const images = new Set();
  owned.textures.forEach(texture => {
    texture.dispose();
    if (texture.source?.data) images.add(texture.source.data);
  });
  images.forEach(image => image.close?.());
}

function metalReflection(THREE) {
  // Local reflections keep the silver blanket and solar cells readable against
  // space without changing the scene background, lights or NASA's PBR textures.
  const width = 128, height = 64, pixels = new Uint8Array(width * height * 4);
  const angular = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const u = x / width * Math.PI * 2, t = (y / height - .5) * Math.PI;
    const horizon = Math.exp(-Math.pow((t + .09) / .32, 2));
    const broad = Math.exp(-Math.pow(angular(u, .6) / .6, 2) - Math.pow((t - .2) / .55, 2));
    const strip = Math.exp(-Math.pow(angular(u, 4.35) / .19, 2) - Math.pow((t + .1) / .75, 2));
    const glint = Math.exp(-Math.pow(angular(u, 2.2) / .44, 2) - Math.pow((t - .7) / .3, 2));
    const intensity = .16 + .3 * horizon + .8 * broad + .68 * strip + .4 * glint;
    const at = (y * width + x) * 4;
    pixels[at] = Math.min(255, 255 * intensity * .94);
    pixels[at + 1] = Math.min(255, 255 * intensity);
    pixels[at + 2] = Math.min(255, 255 * intensity * 1.1);
    pixels[at + 3] = 255;
  }
  const texture = new THREE.DataTexture(pixels, width, height, THREE.RGBAFormat);
  texture.name = 'hubble-local-metal-reflection';
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.needsUpdate = true;
  return texture;
}

export function prepareHubbleModel({THREE, scene}) {
  const imported = resources(scene), placeholders = [];
  scene.traverse(object => {
    // NASA's transparent cube is an export container, not a spacecraft part.
    if (object.isMesh && object.name === '_root' && object.material?.name === 'transparent') {
      placeholders.push(object);
    }
  });
  for (const object of placeholders) {
    const group = new THREE.Group();
    group.name = 'hubble-assembly';
    group.position.copy(object.position);
    group.quaternion.copy(object.quaternion);
    group.scale.copy(object.scale);
    group.add(...object.children.slice());
    object.parent.add(group);
    object.removeFromParent();
  }
  const retained = resources(scene);
  release(Object.fromEntries(Object.entries(imported).map(([kind, entries]) => [
    kind, new Set([...entries].filter(resource => !retained[kind].has(resource))),
  ])));
  const reflectiveMaterials = [...retained.materials].filter(material => material.metalness > 0);
  if (reflectiveMaterials.length) {
    const reflection = metalReflection(THREE);
    retained.textures.add(reflection);
    for (const material of reflectiveMaterials) {
      material.envMap = reflection;
      material.envMapIntensity = 1.2;
      material.needsUpdate = true;
    }
  }

  const root = new THREE.Group();
  root.name = 'hubble-nasa-model';
  const centered = new THREE.Group();
  centered.name = 'hubble-centered-geometry';
  centered.add(scene);
  root.add(centered);
  const bounds = new THREE.Box3().setFromObject(scene);
  const size = bounds.getSize(new THREE.Vector3());
  centered.position.copy(bounds.getCenter(new THREE.Vector3())).negate();
  root.scale.setScalar(.55 / Math.max(size.x, size.y, size.z));
  // NASA's aperture faces +Y and its solar wings span X. Near-earth craft use +Z forward.
  root.rotation.x = Math.PI / 2;
  root.updateMatrixWorld(true);

  const vertex = new THREE.Vector3();
  let radiusSquared = 0;
  root.traverse(object => {
    const position = object.geometry?.attributes.position;
    if (!position) return;
    for (let index = 0; index < position.count; index++) {
      vertex.fromBufferAttribute(position, index).applyMatrix4(object.matrixWorld);
      radiusSquared = Math.max(radiusSquared, vertex.lengthSq());
    }
  });
  root.userData.boundsRadius = Math.sqrt(radiusSquared);
  let disposed = false;
  return {
    root,
    textures: retained.textures,
    dispose() {
      if (disposed) return;
      disposed = true;
      release(retained);
      root.removeFromParent();
    },
  };
}

export async function loadHubbleModel({THREE}) {
  const request = modelBytes();
  try {
    const [{GLTFLoader}, bytes] = await Promise.all([
      import('./vendor/addons/loaders/GLTFLoader.js'), request,
    ]);
    const gltf = await new GLTFLoader().parseAsync(bytes, '');
    return prepareHubbleModel({THREE, scene: gltf.scene});
  } catch (error) {
    if (bufferPromise === request) bufferPromise = undefined;
    throw error;
  }
}
