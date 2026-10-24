// NASA VTAD Voyager asset. Keep the original GLB unchanged; transforms are display-only.
const modelURL = new URL('./assets/models/voyager-nasa.glb', import.meta.url);
let bufferPromise;

function modelBytes() {
  if (!bufferPromise) {
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), 20000);
    bufferPromise = fetch(modelURL, { signal: abort.signal })
      .then(response => {
        if (!response.ok) throw new Error(`Voyager model: HTTP ${response.status}`);
        return response.arrayBuffer();
      })
      .catch(error => { bufferPromise = undefined; throw error; })
      .finally(() => clearTimeout(timer));
  }
  // Cache only bytes: every scene owns its decoded textures, materials and geometry.
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
  return { geometries, materials, textures };
}

export function prepareVoyagerModel({ THREE, scene }) {
  // NASA's exporter includes a completely transparent cube whose children are
  // the spacecraft. Replace only that mesh, retaining the transform and children.
  const placeholders = [];
  scene.traverse(object => {
    if (object.isMesh && object.name === '_root' && object.material?.name === 'clear') placeholders.push(object);
  });
  for (const object of placeholders) {
    const group = new THREE.Group();
    group.name = 'voyager-assembly';
    group.position.copy(object.position); group.quaternion.copy(object.quaternion); group.scale.copy(object.scale);
    group.add(...object.children.slice());
    object.parent.add(group); object.removeFromParent();
    object.geometry.dispose(); object.material.map?.dispose();
    object.material.map?.source?.data?.close?.(); object.material.dispose();
  }
  const root = new THREE.Group(); root.name = 'voyager-nasa-model';
  root.add(scene);
  const bounds = new THREE.Box3().setFromObject(scene);
  const size = bounds.getSize(new THREE.Vector3()), center = bounds.getCenter(new THREE.Vector3());
  const scale = 18 / Math.max(size.x, size.y, size.z);
  scene.position.sub(center); root.scale.setScalar(scale);
  // Bring the +Y-facing dish toward the viewer and lay the long +Z boom to the left.
  root.quaternion.setFromAxisAngle(new THREE.Vector3(0,0,1), -Math.PI/2)
    .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0), Math.PI/2));
  root.updateMatrixWorld(true);
  const owned = resources(root);
  let disposed = false;
  return {
    root, textures: owned.textures,
    dispose() {
      if (disposed) return;
      disposed = true;
      owned.geometries.forEach(geometry => geometry.dispose());
      owned.materials.forEach(material => material.dispose());
      owned.textures.forEach(texture => { texture.dispose(); texture.source?.data?.close?.(); });
      root.removeFromParent();
    }
  };
}

export async function loadVoyagerModel({ THREE }) {
  const request = modelBytes();
  const [{ GLTFLoader }, bytes] = await Promise.all([
    import('./vendor/addons/loaders/GLTFLoader.js'), request
  ]);
  try {
    const gltf = await new GLTFLoader().parseAsync(bytes, '');
    return prepareVoyagerModel({ THREE, scene: gltf.scene });
  } catch (error) {
    // A failed decode must be retriable, including a corrupt HTTP 200 response.
    if (bufferPromise === request) bufferPromise = undefined;
    throw error;
  }
}
