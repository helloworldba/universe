import * as THREE from 'three';
import { CONSTELLATIONS } from './constellation-data.js';

// A north-up chart seen from inside the celestial sphere: increasing right
// ascension is to the left. Positions use a gnomonic projection of J2000 star
// directions, not physical stellar distances or an observer's current sky.
const DEG = Math.PI / 180;
const finite = Number.isFinite;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
const unit = vector => {
  const length = Math.hypot(vector.x, vector.y, vector.z) || 1;
  return {x: vector.x / length, y: vector.y / length, z: vector.z / length};
};
const direction = star => {
  const ra = star.ra * 15 * DEG, dec = star.dec * DEG;
  return {x: Math.cos(dec) * Math.cos(ra), y: Math.sin(dec), z: Math.cos(dec) * Math.sin(ra)};
};

export function projectConstellation(constellation) {
  const stars = (constellation?.stars || []).filter(star => star?.id && finite(star.ra) && finite(star.dec) && Math.abs(star.dec) <= 90);
  if (!stars.length) return {stars: [], width: 0, height: 0, center: {ra: 0, dec: 0}};
  const vectors = stars.map(direction);
  const center = unit(vectors.reduce((sum, value) => ({x: sum.x + value.x, y: sum.y + value.y, z: sum.z + value.z}), {x: 0, y: 0, z: 0}));
  const centerRA = Math.atan2(center.z, center.x);
  const east = {x: -Math.sin(centerRA), y: 0, z: Math.cos(centerRA)};
  const north = {x: -center.y * Math.cos(centerRA), y: Math.hypot(center.x, center.z), z: -center.y * Math.sin(centerRA)};
  const projected = stars.map((star, index) => {
    const denominator = Math.max(.08, dot(vectors[index], center));
    return {...star, x: -dot(vectors[index], east) / denominator, y: dot(vectors[index], north) / denominator, z: 0};
  });
  const xs = projected.map(star => star.x), ys = projected.map(star => star.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const width = Math.max(.001, maxX - minX), height = Math.max(.001, maxY - minY);
  // Preserve the projected aspect ratio; a wide constellation stays wide.
  const scale = 1 / Math.max(width / 10.5, height / 7.4);
  for (const star of projected) {
    star.x = (star.x - (minX + maxX) / 2) * scale;
    star.y = (star.y - (minY + maxY) / 2) * scale;
  }
  return {stars: projected, width: width * scale, height: height * scale, center: {ra: ((centerRA / DEG / 15) + 24) % 24, dec: Math.asin(center.y) / DEG}};
}

export function createConstellationScene({scene, camera, renderer, onSelectStar = () => {}, invalidate = () => {}}) {
  const root = new THREE.Group();
  root.name = 'constellation-explorer';
  root.visible = false;
  scene.add(root);
  const pattern = new THREE.Group();
  root.add(pattern);
  const catalog = Array.isArray(CONSTELLATIONS) ? CONSTELLATIONS : Object.values(CONSTELLATIONS);
  const byId = new Map(catalog.map(item => [item.id, item]));
  const overlay = document.createElement('div');
  overlay.id = 'constellation-scene-labels';
  overlay.setAttribute('aria-label', '星图亮星');
  overlay.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:6;overflow:hidden;display:none;';
  document.body.append(overlay);
  let visible = false, uiVisible = true, linesVisible = true, labelsVisible = true, disposed = false;
  let selected = null, selectedStarId = '', records = [], segments = null, blockers = [];
  let extent = {width: 10.5, height: 7.4};
  const world = new THREE.Vector3(), projected = new THREE.Vector3();
  const ownedMaterials = new Set(), ownedGeometries = new Set();
  const ownMaterial = material => {ownedMaterials.add(material); return material;};
  const ownGeometry = geometry => {ownedGeometries.add(geometry); return geometry;};

  function makeTexture(draw) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const context = canvas.getContext('2d');
    draw(context);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }
  const glowTexture = makeTexture(context => {
    const glow = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    glow.addColorStop(0, 'rgba(255,255,255,1)');
    glow.addColorStop(.06, 'rgba(255,255,255,.96)');
    glow.addColorStop(.13, 'rgba(255,255,255,.44)');
    glow.addColorStop(.32, 'rgba(255,255,255,.12)');
    glow.addColorStop(.68, 'rgba(255,255,255,.025)');
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = glow; context.fillRect(0, 0, 128, 128);
  });
  const coreTexture = makeTexture(context => {
    const glow = context.createRadialGradient(64, 64, 0, 64, 64, 56);
    glow.addColorStop(0, 'rgba(255,255,255,1)');
    glow.addColorStop(.18, 'rgba(255,255,255,1)');
    glow.addColorStop(.35, 'rgba(255,255,255,.8)');
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = glow; context.fillRect(0, 0, 128, 128);
    context.strokeStyle = 'rgba(255,255,255,.24)'; context.lineWidth = 1.6;
    context.beginPath(); context.moveTo(5, 64); context.lineTo(123, 64); context.moveTo(64, 5); context.lineTo(64, 123); context.stroke();
  });
  const ringTexture = makeTexture(context => {
    context.strokeStyle = 'rgba(232,207,147,.88)'; context.lineWidth = 2;
    context.beginPath(); context.arc(64, 64, 47, 0, Math.PI * 2); context.stroke();
    context.strokeStyle = 'rgba(232,207,147,.25)'; context.lineWidth = 1;
    context.beginPath(); context.arc(64, 64, 57, 0, Math.PI * 2); context.stroke();
  });

  function clearPattern() {
    pattern.clear();
    for (const material of ownedMaterials) material.dispose();
    for (const geometry of ownedGeometries) geometry.dispose();
    ownedMaterials.clear(); ownedGeometries.clear();
    records = []; segments = null;
    overlay.replaceChildren();
  }

  function makeSprite(texture, color, size, opacity = 1) {
    const material = ownMaterial(new THREE.SpriteMaterial({map: texture, color, transparent: true, opacity, depthWrite: false, depthTest: false, toneMapped: false, blending: THREE.AdditiveBlending}));
    const sprite = new THREE.Sprite(material);
    sprite.scale.setScalar(size);
    return sprite;
  }

  function select(id) {
    if (disposed || !byId.has(id)) return null;
    selected = byId.get(id); selectedStarId = '';
    clearPattern();
    const chart = projectConstellation(selected);
    extent = {width: chart.width + 1.25, height: chart.height + 1.05};
    const positions = new Map(chart.stars.map(star => [star.id, star]));
    const coordinates = [];
    for (const [fromId, toId] of selected.lines || []) {
      const from = positions.get(fromId), to = positions.get(toId);
      if (from && to) coordinates.push(from.x, from.y, 0, to.x, to.y, 0);
    }
    const geometry = ownGeometry(new THREE.BufferGeometry());
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(coordinates, 3));
    segments = new THREE.LineSegments(geometry, ownMaterial(new THREE.LineBasicMaterial({color: '#8fd0e0', transparent: true, opacity: .48, depthWrite: false, depthTest: false, toneMapped: false})));
    segments.name = 'constellation-recognition-lines';
    segments.visible = linesVisible;
    segments.renderOrder = 1;
    pattern.add(segments);
    const featured = (selected.featured || []).map(value => typeof value === 'string' ? value : value.id);
    chart.stars.forEach(star => {
      const size = .19 + clamp((3.3 - (finite(star.mag) ? star.mag : 3)) / 4.5, 0, 1) * .22;
      const color = star.color || '#d7eaff';
      const halo = makeSprite(glowTexture, color, size * 4.1, .72);
      halo.position.set(star.x, star.y, .01); halo.renderOrder = 2; pattern.add(halo);
      const core = makeSprite(coreTexture, color, size, 1);
      core.position.set(star.x, star.y, .02); core.renderOrder = 3;
      core.userData.constellationStarId = star.id; pattern.add(core);
      const ring = makeSprite(ringTexture, '#ffffff', size * 2.05, .9);
      ring.position.set(star.x, star.y, .03); ring.visible = false; ring.renderOrder = 4; pattern.add(ring);
      const label = document.createElement('button');
      label.type = 'button'; label.className = 'constellation-star-label';
      label.dataset.starId = star.id;
      label.textContent = star.name || star.id;
      label.setAttribute('aria-label', `了解${star.name || star.id}`);
      label.style.cssText = 'position:absolute;display:none;pointer-events:auto;cursor:pointer;color:#d8edf6;font:500 12px/1.3 "Microsoft YaHei","PingFang SC",sans-serif;letter-spacing:.03em;white-space:nowrap;padding:5px 9px;border:1px solid rgba(136,192,212,.22);border-radius:6px;background:rgba(5,17,32,.7);text-shadow:0 1px 5px #020713;';
      label.addEventListener('pointerdown', event => event.stopPropagation());
      label.addEventListener('click', event => {event.stopPropagation(); chooseStar(star.id);});
      overlay.append(label);
      records.push({star, core, halo, ring, label, featured: featured.includes(star.id), screen: {x: -9999, y: -9999, inside: false}, labelVisible: false});
    });
    root.updateMatrixWorld(true);
    update(); invalidate();
    return selected;
  }

  function focusStar(id) {
    if (disposed) return null;
    const focused = records.find(record => record.star.id === id);
    selectedStarId = focused ? id : '';
    for (const record of records) {
      const active = record.star.id === selectedStarId;
      record.ring.visible = active;
      record.label.setAttribute('aria-pressed', String(active));
      record.label.style.color = active ? '#f5dfac' : '#d8edf6';
      record.label.style.borderColor = active ? 'rgba(233,205,139,.7)' : 'rgba(136,192,212,.22)';
    }
    update(); invalidate();
    return focused?.star || null;
  }

  function chooseStar(id) {
    const star = focusStar(id);
    if (star) onSelectStar({...star, constellationId: selected.id});
    return !!star;
  }

  function screenBounds() {
    const canvas = renderer?.domElement;
    const rect = canvas?.getBoundingClientRect();
    return rect?.width && rect?.height ? rect : {left: 0, top: 0, width: innerWidth, height: innerHeight, right: innerWidth, bottom: innerHeight};
  }

  function projectRecords() {
    const bounds = screenBounds();
    root.updateWorldMatrix(true, true);
    camera.updateMatrixWorld();
    for (const record of records) {
      record.core.getWorldPosition(world);
      projected.copy(world).project(camera);
      record.screen.x = bounds.left + (projected.x + 1) * .5 * bounds.width;
      record.screen.y = bounds.top + (1 - projected.y) * .5 * bounds.height;
      record.screen.inside = projected.z >= -1 && projected.z <= 1 && Math.abs(projected.x) <= 1 && Math.abs(projected.y) <= 1;
    }
    return bounds;
  }

  const overlaps = (a, b, pad = 5) => a.left < b.right + pad && a.right > b.left - pad && a.top < b.bottom + pad && a.bottom > b.top - pad;
  function update(_dt, options = {}) {
    if (disposed || !visible) return;
    if (typeof options.ui === 'boolean') uiVisible = options.ui;
    if (Array.isArray(options.blockers)) blockers = options.blockers;
    overlay.style.display = uiVisible && labelsVisible ? '' : 'none';
    const bounds = projectRecords();
    for (const record of records) {record.labelVisible = false; record.label.style.display = 'none';}
    if (!uiVisible || !labelsVisible) return;
    const compact = bounds.width < 760;
    const candidates = records.filter(record => record.screen.inside && (record.featured || record.star.id === selectedStarId));
    candidates.sort((a, b) => Number(b.star.id === selectedStarId) - Number(a.star.id === selectedStarId) || (a.star.mag ?? 5) - (b.star.mag ?? 5));
    const occupied = blockers.filter(rect => rect && finite(rect.left) && finite(rect.top) && finite(rect.right) && finite(rect.bottom));
    let shown = 0;
    for (const record of candidates) {
      if (shown >= (compact ? 3 : 5)) break;
      const {x, y} = record.screen;
      const labelWidth = Math.max(46, (record.star.name || record.star.id).length * 12.5 + 20), labelHeight = 28;
      const directions = x < bounds.left + bounds.width / 2 ? [1, -1] : [-1, 1];
      let accepted = null;
      for (const vertical of [-1, 1, 0]) {
        for (const horizontal of directions) {
          const left = horizontal > 0 ? x + 15 : x - labelWidth - 15;
          const top = vertical < 0 ? y - labelHeight - 12 : vertical > 0 ? y + 12 : y - labelHeight / 2;
          const box = {left, right: left + labelWidth, top, bottom: top + labelHeight};
          if (box.left < bounds.left + 8 || box.right > bounds.left + bounds.width - 8 || box.top < bounds.top + 8 || box.bottom > bounds.top + bounds.height - 8) continue;
          if (occupied.some(other => overlaps(box, other))) continue;
          if (records.some(other => other !== record && other.screen.inside && other.screen.x > box.left - 8 && other.screen.x < box.right + 8 && other.screen.y > box.top - 8 && other.screen.y < box.bottom + 8)) continue;
          accepted = box; break;
        }
        if (accepted) break;
      }
      if (!accepted) continue;
      record.label.style.left = `${accepted.left}px`; record.label.style.top = `${accepted.top}px`;
      record.label.style.display = ''; record.labelVisible = true;
      occupied.push(accepted); shown++;
    }
  }

  function pick(event) {
    if (disposed || !visible || !event || !finite(event.clientX) || !finite(event.clientY)) return null;
    projectRecords();
    const threshold = event.pointerType === 'touch' || innerWidth < 760 ? 22 : 14;
    let closest = null, distance = threshold;
    for (const record of records) {
      if (!record.screen.inside) continue;
      const delta = Math.hypot(record.screen.x - event.clientX, record.screen.y - event.clientY);
      if (delta < distance) {distance = delta; closest = record.star;}
    }
    return closest;
  }

  function setVisible(value) {
    if (disposed) return;
    const next = !!value;
    if (visible === next) return;
    visible = next; root.visible = visible;
    overlay.style.display = visible && uiVisible && labelsVisible ? '' : 'none';
    if (visible) update();
    invalidate();
  }

  function setUIVisible(value) {if (uiVisible === !!value || disposed) return; uiVisible = !!value; overlay.style.display = visible && uiVisible && labelsVisible ? '' : 'none'; if (visible) update(); invalidate();}
  function setLines(value) {if (linesVisible === !!value || disposed) return; linesVisible = !!value; if (segments) segments.visible = linesVisible; invalidate();}
  function setLabels(value) {if (labelsVisible === !!value || disposed) return; labelsVisible = !!value; overlay.style.display = visible && uiVisible && labelsVisible ? '' : 'none'; if (visible) update(); invalidate();}
  function setOcclusionRects(rectangles = []) {blockers = Array.isArray(rectangles) ? rectangles : [];}
  function dispose() {
    if (disposed) return;
    disposed = true; visible = false;
    clearPattern(); glowTexture.dispose(); coreTexture.dispose(); ringTexture.dispose(); overlay.remove(); root.removeFromParent();
  }

  return {
    root, select, setVisible, setUIVisible, setLines, setLabels, setOcclusionRects, focusStar, update,
    resize: () => {if (visible) update();}, pick,
    handlePointer: event => {const star = pick(event); return star ? chooseStar(star.id) : false;},
    getExtent: () => ({...extent}),
    getCameraView: () => ({position: new THREE.Vector3(0, 0, 16), target: new THREE.Vector3(), minDistance: 6, maxDistance: 60}),
    getStatus: () => ({visible, selectedId: selected?.id || '', selectedStarId, stars: records.length, linesVisible, labelsVisible, uiVisible, labels: records.filter(record => record.labelVisible && visible && uiVisible && labelsVisible).map(record => record.star.id), extent: {...extent}}),
    dispose
  };
}
