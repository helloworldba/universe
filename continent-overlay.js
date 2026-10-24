import {createContinentRegions} from './continent-regions.js';

// Observation centres and a separately switchable physical-region teaching mask.
// All geometry is local to Earth and follows the surface longitude convention.
export function continentSurfaceVector(lat, lon, radius = 1) {
  const latitude = lat * Math.PI / 180, longitude = lon * Math.PI / 180;
  return {x: radius * Math.cos(latitude) * Math.cos(longitude), y: radius * Math.sin(latitude), z: -radius * Math.cos(latitude) * Math.sin(longitude)};
}

export function createContinentOverlay({THREE, earth, continents = [], onSelect = () => {}, onChange = () => {}}) {
  const root = new THREE.Group();
  root.name = 'continent-observation-centres';
  root.visible = false;
  earth.add(root);
  const radius = earth.geometry?.parameters?.radius || 3;
  const regions = createContinentRegions({THREE, radius});
  root.add(regions.mesh);
  const records = [], byId = new Map(), geometries = new Set(), materials = new Set(), textures = new Set();
  const dotGeometry = new THREE.SphereGeometry(radius * .012, 12, 8);
  const ringGeometry = new THREE.RingGeometry(radius * .023, radius * .027, 40);
  const selectedGeometry = new THREE.RingGeometry(radius * .045, radius * .049, 48);
  [dotGeometry, ringGeometry, selectedGeometry].forEach(geometry => geometries.add(geometry));
  const cameraLocal = new THREE.Vector3(), worldPosition = new THREE.Vector3(), screenPosition = new THREE.Vector3();
  const normalAxis = new THREE.Vector3(0, 0, 1);
  let selectedId = '', visible = false, disposed = false;
  const ownMaterial = material => {materials.add(material); return material;};

  function roundedRect(context, x, y, width, height, corner) {
    context.beginPath();
    context.moveTo(x + corner, y);
    context.arcTo(x + width, y, x + width, y + height, corner);
    context.arcTo(x + width, y + height, x, y + height, corner);
    context.arcTo(x, y + height, x, y, corner);
    context.arcTo(x, y, x + width, y, corner);
    context.closePath();
  }

  function drawLabel(record, selected) {
    const {context, canvas, continent, texture} = record;
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    roundedRect(context, 3, 3, 314, 122, 28);
    context.fillStyle = selected ? 'rgba(8, 29, 48, .96)' : 'rgba(6, 16, 33, .89)';
    context.fill();
    context.lineWidth = selected ? 4 : 2;
    context.strokeStyle = selected ? record.color : 'rgba(151, 192, 216, .48)';
    context.stroke();
    context.beginPath();
    context.arc(32, 48, 7, 0, Math.PI * 2);
    context.fillStyle = record.color;
    context.fill();
    context.textBaseline = 'middle';
    context.fillStyle = '#edf6ff';
    context.font = '600 43px "Microsoft YaHei", "PingFang SC", sans-serif';
    context.fillText(continent.name, 53, 49, 246);
    context.font = '500 19px Arial, sans-serif';
    context.fillStyle = '#a8bdce';
    context.fillText(String(continent.en || '').toUpperCase(), 29, 94, 263);
    texture.needsUpdate = true;
  }

  for (const continent of continents) {
    if (!continent?.id || byId.has(continent.id) || !Number.isFinite(continent.lat) || !Number.isFinite(continent.lon) || Math.abs(continent.lat) > 90 || Math.abs(continent.lon) > 180) continue;
    const normal = new THREE.Vector3().copy(continentSurfaceVector(continent.lat, continent.lon));
    const colorObject = new THREE.Color(continent.color || '#7ed9e7');
    const color = `#${colorObject.getHexString()}`;
    const marker = new THREE.Group();
    marker.name = `continent-${continent.id}`;
    root.add(marker);
    const dot = new THREE.Mesh(dotGeometry, ownMaterial(new THREE.MeshBasicMaterial({color, depthTest: true, depthWrite: true})));
    dot.position.copy(normal).multiplyScalar(radius + radius * .014);
    dot.userData.continentId = continent.id;
    marker.add(dot);
    const ring = new THREE.Mesh(ringGeometry, ownMaterial(new THREE.MeshBasicMaterial({color, transparent: true, opacity: .55, side: THREE.DoubleSide, depthTest: true, depthWrite: false})));
    ring.position.copy(normal).multiplyScalar(radius + radius * .009);
    ring.quaternion.setFromUnitVectors(normalAxis, normal);
    marker.add(ring);
    const selection = new THREE.Mesh(selectedGeometry, ownMaterial(new THREE.MeshBasicMaterial({color, transparent: true, opacity: .82, side: THREE.DoubleSide, depthTest: true, depthWrite: false})));
    selection.position.copy(normal).multiplyScalar(radius + radius * .011);
    selection.quaternion.copy(ring.quaternion);
    selection.visible = false;
    marker.add(selection);
    const canvas = document.createElement('canvas');
    canvas.width = 320; canvas.height = 128;
    const context = canvas.getContext('2d');
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    textures.add(texture);
    const label = new THREE.Sprite(ownMaterial(new THREE.SpriteMaterial({map: texture, transparent: true, depthTest: true, depthWrite: false, sizeAttenuation: false, toneMapped: false})));
    label.position.copy(normal).multiplyScalar(radius + radius * .025);
    label.center.set(.5, -.28);
    label.scale.set(.09, .036, 1);
    label.userData.continentId = continent.id;
    marker.add(label);
    const record = {continent, normal, color, marker, dot, ring, selection, label, canvas, context, texture, facing: 0};
    records.push(record); byId.set(continent.id, record);
    drawLabel(record, false);
  }

  function setVisible(value) {
    if (disposed || visible === !!value) return;
    visible = !!value; root.visible = visible;
    onChange();
  }

  function setRegionsVisible(value) {
    if (disposed || regions.getStatus().enabled === Boolean(value)) return;
    regions.setVisible(value); onChange();
  }

  function select(id) {
    if (disposed) return false;
    const next = byId.has(id) ? id : '';
    if (next === selectedId) return !!next;
    selectedId = next;
    regions.select(next);
    for (const record of records) {
      const selected = record.continent.id === selectedId;
      record.selection.visible = selected;
      record.dot.scale.setScalar(selected ? 1.3 : 1);
      record.ring.material.opacity = selected ? .9 : .55;
      drawLabel(record, selected);
    }
    onChange();
    return !!next;
  }

  function update(camera, {labels = true, ui = true, occlusionRects = [], pixelRatio = 1} = {}) {
    if (disposed || !visible || !camera) return;
    regions.setPixelRatio(pixelRatio);
    earth.updateWorldMatrix(true, false);
    camera.getWorldPosition(cameraLocal);
    earth.worldToLocal(cameraLocal);
    const distance = cameraLocal.length();
    const viewportHeight = Math.max(1, globalThis.innerHeight || 800);
    const viewportWidth = Math.max(1, globalThis.innerWidth || 1200);
    const labelWidth = viewportWidth < 700 ? 88 : 104;
    const labelHeight = labelWidth * .4;
    // Non-attenuated sprites remain legible on phones and while zooming. The
    // current projection also accounts for the app's camera composition offset.
    const scale = labelWidth / (viewportHeight * .5 * Math.abs(camera.projectionMatrix.elements[5] || 1));
    const candidates = [];
    for (const record of records) {
      // A surface point is on the visible hemisphere only when its outward
      // normal faces the observer from that point (not merely from the centre).
      const horizon = record.normal.dot(cameraLocal) - radius;
      record.facing = horizon / Math.max(.001, distance - radius);
      record.marker.visible = horizon > radius * .006;
      record.label.visible = false;
      if (!record.marker.visible) continue;
      const alpha = THREE.MathUtils.smoothstep(record.facing, .025, .2);
      record.label.material.opacity = alpha;
      record.label.scale.set(scale, scale * .4, 1);
      if (!labels || !ui || alpha < .08) continue;
      record.label.getWorldPosition(worldPosition);
      screenPosition.copy(worldPosition).project(camera);
      if (screenPosition.z < -1 || screenPosition.z > 1) continue;
      const x = (screenPosition.x + 1) * .5 * viewportWidth;
      const bottom = (1 - screenPosition.y) * .5 * viewportHeight - .28 * labelHeight;
      const box = {left: x - labelWidth / 2, right: x + labelWidth / 2, top: bottom - labelHeight, bottom};
      if (box.left < 8 || box.right > viewportWidth - 8 || box.top < 8 || box.bottom > viewportHeight - 8) continue;
      if (occlusionRects.some(rect => box.left < rect.right + 6 && box.right > rect.left - 6 && box.top < rect.bottom + 5 && box.bottom > rect.top - 5)) continue;
      candidates.push({record, box});
    }
    // Prioritise the selected centre and the centres facing the viewer; crowded
    // labels may hide, but their small surface markers remain selectable.
    candidates.sort((a, b) => (Number(b.record.continent.id === selectedId) - Number(a.record.continent.id === selectedId)) || b.record.facing - a.record.facing);
    const occupied = [];
    for (const {record, box} of candidates) {
      const overlaps = occupied.some(other => box.left < other.right + 6 && box.right > other.left - 6 && box.top < other.bottom + 5 && box.bottom > other.top - 5);
      if (overlaps) continue;
      record.label.visible = true; occupied.push(box);
    }
  }

  function getPickables() {
    if (disposed || !visible) return [];
    return records.flatMap(record => !record.marker.visible ? [] : record.label.visible ? [record.dot, record.label] : [record.dot]);
  }

  function pick(object) {
    if (disposed || !visible || !object) return false;
    const record = byId.get(object.userData?.continentId);
    if (!record || !record.marker.visible || (object !== record.dot && object !== record.label) || !object.visible) return false;
    select(record.continent.id);
    onSelect(record.continent);
    return true;
  }

  function dispose() {
    if (disposed) return;
    disposed = true; visible = false; root.visible = false; root.removeFromParent();
    regions.dispose();
    for (const geometry of geometries) geometry.dispose();
    for (const material of materials) material.dispose();
    for (const texture of textures) texture.dispose();
    root.clear();
    records.length = 0; byId.clear(); geometries.clear(); materials.clear(); textures.clear();
  }

  return {
    root, setVisible, setRegionsVisible, isVisible: () => visible, select, update, getPickables, pick, dispose,
    getStatus: () => ({visible, selectedId, regionsEnabled: regions.getStatus().enabled, regionVisible: visible && regions.getStatus().visible, region: regions.getStatus(), count: records.length, visibleMarkers: records.filter(record => record.marker.visible && visible).map(record => record.continent.id), visibleLabels: records.filter(record => record.marker.visible && record.label.visible && visible).map(record => record.continent.id), disposed})
  };
}
