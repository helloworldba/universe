// Lighting belongs only to the selected observatory, never to the Earth overview.
// The source models and their texture maps remain unchanged on disk.
export function createCraftPresentation({THREE, parent, id}) {
  const rig = new THREE.Group();
  rig.name = 'craft-presentation-lights';
  parent.add(rig);
  rig.add(new THREE.HemisphereLight(0xd9e8f4, 0x394454, .85));
  for (const [name, color, intensity, position] of [
    ['key', 0xfff0dc, 3.1, [-9, 12, 16]],
    ['fill', 0xdcecff, 1.65, [12, 2, 10]],
    ['rim', 0xbcd8ff, 2.2, [6, 9, -12]],
  ]) {
    const light = new THREE.DirectionalLight(color, intensity);
    light.name = `craft-${name}-light`;
    light.position.set(...position);
    rig.add(light, light.target);
  }

  // Broad reflected softboxes, rather than emissive paint or a glow around the
  // spacecraft. This small local texture also works without network access.
  const width = 256, height = 128, pixels = new Uint8Array(width * height * 4);
  const angular = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const u = x / width * Math.PI * 2, v = (y / height - .5) * Math.PI;
    const key = Math.exp(-((angular(u, 1.1) / .7) ** 2) - ((v - .38) / .55) ** 2);
    const fill = Math.exp(-((angular(u, 4.1) / .85) ** 2) - ((v + .08) / .7) ** 2);
    const edge = Math.exp(-((angular(u, 5.5) / .2) ** 2) - (v / .8) ** 2);
    const ambient = .3 + .18 * Math.exp(-((v / .5) ** 2));
    const at = (y * width + x) * 4;
    pixels[at] = Math.min(255, 255 * (ambient + .63 * key + .3 * fill + .26 * edge));
    pixels[at + 1] = Math.min(255, 255 * (ambient + .6 * key + .34 * fill + .3 * edge));
    pixels[at + 2] = Math.min(255, 255 * (ambient + .54 * key + .4 * fill + .36 * edge));
    pixels[at + 3] = 255;
  }
  const reflection = new THREE.DataTexture(pixels, width, height, THREE.RGBAFormat);
  reflection.name = `${id}-detail-softbox-reflection`;
  reflection.mapping = THREE.EquirectangularReflectionMapping;
  reflection.colorSpace = THREE.SRGBColorSpace;
  reflection.needsUpdate = true;
  const originals = new Map(), geometry = [], points = [];
  const silhouetteCache = new WeakMap();
  const directions = [];
  // Actual support vertices avoid imaginary box corners around Voyager's long
  // diagonal booms. Sample once on load; dragging only transforms the small hull.
  for (let x = -2; x <= 2; x++) for (let y = -2; y <= 2; y++) for (let z = -2; z <= 2; z++) {
    if (Math.max(Math.abs(x), Math.abs(y), Math.abs(z)) === 2) directions.push([x, y, z]);
  }
  let referencePoints = [], disposed = false;
  const quaternion = new THREE.Quaternion();

  function silhouette(buffer) {
    if (silhouetteCache.has(buffer)) return silhouetteCache.get(buffer);
    const position = buffer.attributes.position, indices = new Set();
    for (const [dx, dy, dz] of directions) {
      let best = -Infinity, index = 0;
      for (let i = 0; i < position.count; i++) {
        const dot = position.getX(i) * dx + position.getY(i) * dy + position.getZ(i) * dz;
        if (dot > best) { best = dot; index = i; }
      }
      indices.add(index);
    }
    const vertices = [...indices].map(index => new THREE.Vector3().fromBufferAttribute(position, index));
    silhouetteCache.set(buffer, vertices);
    return vertices;
  }
  function getPoints() {
    for (const {object, corners, start} of geometry) {
      for (let i = 0; i < corners.length; i++) points[start + i].copy(corners[i]).applyMatrix4(object.matrixWorld);
    }
    return points;
  }
  function attach(model) {
    model.updateWorldMatrix(true, true);
    model.traverse(object => {
      if (!object.geometry || (!object.isMesh && !object.isLine)) return;
      const materials = [].concat(object.material || []);
      if (!materials.some(material => material.visible && material.opacity > 0)) return;
      if (!object.geometry.attributes.position?.count) return;
      const corners = silhouette(object.geometry);
      geometry.push({object, corners, start:points.length});
      points.push(...corners.map(() => new THREE.Vector3()));
      for (const material of materials) {
        if (!material.isMeshStandardMaterial || originals.has(material)) continue;
        originals.set(material, {
          envMap:material.envMap, envMapIntensity:material.envMapIntensity,
          roughness:material.roughness, rotation:material.envMapRotation?.clone(),
        });
        material.envMap = reflection;
        material.envMapIntensity = material.metalness > .4 ? (id === 'roman' ? 2.35 : id === 'jwst' ? 2.4 : 1.65) : .55;
        if (material.metalness > .4) material.roughness = THREE.MathUtils.clamp(material.roughness, .16, .62);
        material.needsUpdate = true;
      }
    });
    // Record the fully deployed envelope once. Folding Webb must not trigger
    // an automatic zoom; its current silhouette may still be re-centred.
    referencePoints = getPoints().map(point => point.clone());
  }
  function update(camera) {
    camera.getWorldQuaternion(quaternion);
    rig.quaternion.copy(quaternion);
    for (const material of originals.keys()) material.envMapRotation?.setFromQuaternion(quaternion);
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    // Restore borrowed material references before the model's owner disposes
    // them. Original reflections and this detail reflection have separate lives.
    for (const [material, original] of originals) {
      material.envMap = original.envMap;
      material.envMapIntensity = original.envMapIntensity;
      material.roughness = original.roughness;
      if (original.rotation) material.envMapRotation.copy(original.rotation);
      material.needsUpdate = true;
    }
    originals.clear(); geometry.length = points.length = referencePoints.length = 0;
    reflection.dispose(); rig.removeFromParent();
  }
  return {attach, update, getPoints, getReferencePoints:() => referencePoints, dispose};
}
