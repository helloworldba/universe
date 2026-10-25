import { loadHubbleModel } from './hubble-model.js';
// Spacecraft for a teaching illustration, not live orbital tracking.
// Distances, craft sizes and orbital speeds are compressed independently for legibility.
// GEO examples use the same rotation rate as the illustrated Earth, so their longitude holds.
export const EARTH_ROTATION_RATE = .018;
export const NEAR_EARTH_IDS = ['iss', 'tiangong', 'hubble', 'earth-observer', 'navigation-sat', 'comms-sat', 'weather-sat', 'polar-sat'];

export function createNearEarth({ THREE, earthRadius = 3, mobile = false, loadHubble = loadHubbleModel, onChange = () => {} }) {
  const root = new THREE.Group();
  root.name = 'near-earth-spacecraft';
  const objects = new Map(), pickables = [], labels = [], records = [];
  const geometryCache = new Map();
  let hubbleModel = null, hubblePromise = null, hubbleState = 'idle', disposed = false;
  const detailSegments = (typeof mobile === 'function' ? mobile() : mobile) ? 12 : 18;
  const material = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: .48, metalness: .28, ...extra });
  const materials = {
    white: material(0xdce6e9, { emissive: 0x1a2931, emissiveIntensity: .24 }),
    silver: material(0xa9c0cb, { metalness: .48, emissive: 0x16232e, emissiveIntensity: .18 }),
    dark: material(0x17283a, { roughness: .72 }),
    gold: material(0xd4ab59, { roughness: .57, metalness: .42, emissive: 0x503514, emissiveIntensity: .22 }),
    panel: material(0x244e8b, { roughness: .48, metalness: .35, emissive: 0x142f65, emissiveIntensity: .55, side: THREE.DoubleSide }),
    panelWarm: material(0x6a4735, { roughness: .54, metalness: .24, emissive: 0x362617, emissiveIntensity: .32, side: THREE.DoubleSide }),
    aperture: material(0x020710, { roughness: .97 }),
    lens: material(0x376d91, { roughness: .2, metalness: .4, emissive: 0x143f68, emissiveIntensity: .26 }),
    grid: new THREE.LineBasicMaterial({ color: 0x6085b7, transparent: true, opacity: .64, depthTest: true, depthWrite: false }),
    radiatorGrid: new THREE.LineBasicMaterial({ color: 0x9fb3bd, transparent: true, opacity: .55, depthTest: true, depthWrite: false }),
  };
  const up = new THREE.Vector3(0, 1, 0), a = new THREE.Vector3(), b = new THREE.Vector3();
  const radial = new THREE.Vector3(), tangent = new THREE.Vector3(), lateral = new THREE.Vector3(), basis = new THREE.Matrix4();
  const cameraOffset = new THREE.Vector3(), cameraRadial = new THREE.Vector3(), cameraTangent = new THREE.Vector3();
  const TAU = Math.PI * 2;

  function cached(key, construct) {
    if (!geometryCache.has(key)) geometryCache.set(key, construct());
    return geometryCache.get(key);
  }
  function box(parent, dimensions, position, mat = materials.white) {
    const [x, y, z] = dimensions;
    const mesh = new THREE.Mesh(cached(`b:${x}:${y}:${z}`, () => new THREE.BoxGeometry(x, y, z)), mat);
    mesh.position.set(...position); parent.add(mesh); return mesh;
  }
  function cylinder(parent, radius, length, position, mat = materials.white, axis = 'z', topRadius = radius) {
    const geometry = cached(`c:${radius}:${topRadius}:${length}`, () => new THREE.CylinderGeometry(topRadius, radius, length, detailSegments));
    const mesh = new THREE.Mesh(geometry, mat);
    if (axis === 'z') mesh.rotation.x = Math.PI / 2;
    else if (axis === 'x') mesh.rotation.z = Math.PI / 2;
    mesh.position.set(...position); parent.add(mesh); return mesh;
  }
  function strut(parent, start, end, thickness = .006, mat = materials.silver) {
    a.set(...start); b.set(...end).sub(a);
    const mesh = new THREE.Mesh(cached(`rod:${thickness}`, () => new THREE.CylinderGeometry(thickness, thickness, 1, 6)), mat);
    mesh.position.copy(a).addScaledVector(b, .5);
    mesh.scale.y = b.length(); mesh.quaternion.setFromUnitVectors(up, b.normalize());
    parent.add(mesh); return mesh;
  }
  function module(parent, length, radius, position, axis = 'z') {
    const group = new THREE.Group(); group.position.set(...position); parent.add(group);
    cylinder(group, radius, length, [0, 0, 0], materials.white);
    for (const sign of [-1, 1]) {
      cylinder(group, radius * .71, .026, [0, 0, sign * (length / 2 + .009)], materials.silver);
      cylinder(group, radius * 1.025, .008, [0, 0, sign * length * .35], materials.silver);
    }
    if (axis === 'x') group.rotation.y = Math.PI / 2;
    return group;
  }
  function panel(parent, width, length, position, { radiator = false, warm = false, rotation = 0 } = {}) {
    const group = new THREE.Group(); group.position.set(...position); group.rotation.z = rotation; parent.add(group);
    box(group, [width, .004, length], [0, 0, 0], radiator ? materials.white : warm ? materials.panelWarm : materials.panel);
    const geometry = cached(`grid:${width}:${length}`, () => {
      const data = [], y = .0025, halfW = width / 2, halfL = length / 2;
      for (let i = 0; i <= 2; i++) {
        const x = -halfW + width * i / 2;
        data.push(x, y, -halfL, x, y, halfL);
      }
      const rows = Math.max(3, Math.min(10, Math.round(length / .032)));
      for (let i = 0; i <= rows; i++) {
        const z = -halfL + length * i / rows;
        data.push(-halfW, y, z, halfW, y, z);
      }
      return new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(data, 3));
    });
    group.add(new THREE.LineSegments(geometry, radiator ? materials.radiatorGrid : materials.grid));
    return group;
  }
  function dish(parent, radius, position, rotationX = 0) {
    const group = new THREE.Group(); group.position.set(...position); group.rotation.x = rotationX; parent.add(group);
    // A shallow bowl, opening toward local +Y. Its center feed is supported above the rim.
    const bowl = new THREE.Mesh(cached(`dish:${radius}`, () => {
      const points = [];
      for (let i = 0; i <= 10; i++) {
        const r = radius * i / 10; points.push(new THREE.Vector2(r, r * r / radius * .32));
      }
      return new THREE.LatheGeometry(points, detailSegments);
    }), materials.white);
    bowl.material = dishMaterial; group.add(bowl);
    const feedY = radius * .72;
    cylinder(group, radius * .08, radius * .18, [0, feedY, 0], materials.gold, 'y');
    for (let i = 0; i < 3; i++) {
      const angle = i * TAU / 3;
      strut(group, [Math.cos(angle) * radius * .8, radius * .205, Math.sin(angle) * radius * .8], [0, feedY, 0], .0025);
    }
    return group;
  }
  const dishMaterial = material(0xd3dfe3, { side: THREE.DoubleSide, emissive: 0x192a33, emissiveIntensity: .18 });

  function buildISS() {
    const group = new THREE.Group(); group.name = 'ISS modules truss and eight solar wings';
    // Four pairs of photovoltaic wings span a long lattice truss.
    for (const z of [-.019, .019]) for (const y of [-.017, .017]) strut(group, [-.43, y, z], [.43, y, z], .0045);
    for (let x = -.42; x < .4; x += .105) {
      strut(group, [x, -.017, -.019], [x + .105, .017, .019], .003);
      strut(group, [x, .017, .019], [x + .105, -.017, -.019], .003);
    }
    for (const x of [-.405, -.255, .255, .405]) {
      strut(group, [x, 0, -.39], [x, 0, .39], .0045);
      for (const side of [-1, 1]) panel(group, .115, .325, [x, .012, side * .223]);
    }
    module(group, .25, .052, [0, -.055, -.014]);
    module(group, .19, .041, [0, -.055, .22]);
    module(group, .15, .036, [0, -.055, -.23]);
    module(group, .18, .042, [-.106, -.055, .066], 'x');
    module(group, .19, .043, [.105, -.055, .066], 'x');
    cylinder(group, .029, .045, [0, -.12, -.045], materials.silver, 'y');
    box(group, [.043, .018, .036], [0, -.148, -.045], materials.lens);
    for (const x of [-.16, .16]) for (const side of [-1, 1]) {
      panel(group, .065, .145, [x, -.04, side * .20], { radiator: true, rotation: side * .48 });
    }
    strut(group, [.09, -.07, .10], [.14, -.17, .14], .006);
    strut(group, [.14, -.17, .14], [.06, -.21, .21], .005);
    dish(group, .031, [.068, .043, -.07], .4);
    group.userData.boundsRadius = .58;
    return group;
  }
  function buildTiangong() {
    const group = new THREE.Group(); group.name = 'Tiangong T shaped three module station';
    module(group, .31, .047, [0, 0, 0]);
    module(group, .26, .038, [-.155, 0, .105], 'x');
    module(group, .26, .038, [.155, 0, .105], 'x');
    cylinder(group, .031, .092, [0, 0, -.19], materials.silver);
    cylinder(group, .045, .06, [0, 0, .19], materials.white);
    for (const x of [-.25, .25]) for (const side of [-1, 1]) {
      strut(group, [x, 0, .105], [x, 0, .105 + side * .25], .004);
      panel(group, .075, .18, [x, .008, .105 + side * .17]);
    }
    for (const side of [-1, 1]) {
      strut(group, [0, 0, -.15], [side * .23, 0, -.15], .004);
      panel(group, .16, .075, [side * .16, .008, -.15]);
    }
    strut(group, [.045, -.025, .04], [.09, -.105, .03], .005);
    strut(group, [.09, -.105, .03], [.15, -.10, .105], .004);
    group.userData.boundsRadius = .45; return group;
  }
  function buildHubblePreview() {
    const group = new THREE.Group(); group.name = 'Hubble optical telescope with aperture and paired panels';
    cylinder(group, .064, .29, [0, .015, 0], materials.silver);
    cylinder(group, .069, .095, [0, .015, -.15], materials.gold);
    cylinder(group, .069, .014, [0, .015, .146], materials.white);
    cylinder(group, .055, .008, [0, .015, .155], materials.aperture);
    cylinder(group, .023, .009, [0, .015, .161], materials.lens);
    const flap = new THREE.Mesh(cached('hubble-aperture-door', () => new THREE.CircleGeometry(.061, detailSegments)), materials.white);
    flap.position.set(0, .091, .14); flap.rotation.x = -.42; group.add(flap);
    strut(group, [-.265, 0, -.055], [.265, 0, -.055], .0045);
    for (const side of [-1, 1]) panel(group, .18, .11, [side * .182, 0, -.055], { warm: true });
    dish(group, .035, [.064, .048, -.12], .9);
    group.userData.boundsRadius = .32; return group;
  }
  function buildHubble() {
    const group = new THREE.Group(); group.name = 'hubble-orbital-frame';
    const preview = buildHubblePreview(); preview.name = 'hubble-loading-preview';
    group.add(preview); group.userData.boundsRadius = .32;
    return group;
  }
  function buildObserver(polar = false) {
    const group = new THREE.Group(); group.name = polar ? 'Polar research craft with sensor boom' : 'Earth observing craft with nadir optical sensor';
    box(group, [.105, .088, .12], [0, 0, 0], materials.gold);
    box(group, [.112, .012, .125], [0, .049, 0], materials.white);
    cylinder(group, .035, .055, [0, -.061, .015], materials.silver, 'y');
    cylinder(group, .026, .005, [0, -.091, .015], materials.lens, 'y');
    if (polar) {
      panel(group, .105, .30, [.13, .02, 0]); strut(group, [.045, .02, 0], [.14, .02, 0], .004);
      strut(group, [-.045, 0, 0], [-.25, 0, .055], .004);
      box(group, [.035, .032, .035], [-.25, 0, .055], materials.white);
      dish(group, .029, [0, .067, -.025]);
    } else {
      for (const side of [-1, 1]) {
        strut(group, [side * .045, 0, 0], [side * .17, 0, 0], .004);
        panel(group, .125, .14, [side * .16, .006, 0]);
      }
      strut(group, [.03, .05, -.03], [.03, .13, -.03], .0025);
    }
    group.userData.boundsRadius = .30; return group;
  }
  function buildNavigation() {
    const group = new THREE.Group(); group.name = 'Navigation craft with Earth facing antenna deck';
    box(group, [.105, .10, .105], [0, 0, 0], materials.gold);
    box(group, [.125, .018, .125], [0, -.062, 0], materials.white);
    for (const x of [-.035, .035]) for (const z of [-.035, .035]) cylinder(group, .011, .023, [x, -.081, z], materials.gold, 'y');
    for (const side of [-1, 1]) {
      strut(group, [side * .05, 0, 0], [side * .25, 0, 0], .004);
      panel(group, .165, .115, [side * .173, .006, 0]);
    }
    strut(group, [0, .045, 0], [0, .145, 0], .003);
    group.userData.boundsRadius = .30; return group;
  }
  function buildGeostationary(weather = false) {
    const group = new THREE.Group(); group.name = weather ? 'Weather imaging craft with radiometer and offset solar wing' : 'Communications craft with paired reflector dishes';
    box(group, [.11, .125, .115], [0, 0, 0], materials.gold);
    box(group, [.115, .014, .12], [0, .07, 0], materials.white);
    if (weather) {
      cylinder(group, .043, .058, [0, -.09, .02], materials.silver, 'y');
      cylinder(group, .033, .008, [0, -.122, .02], materials.lens, 'y');
      panel(group, .235, .12, [.20, .015, 0]); strut(group, [.05, .01, 0], [.20, .01, 0], .005);
      dish(group, .045, [-.10, -.025, 0], Math.PI);
      strut(group, [-.045, 0, 0], [-.10, -.025, 0], .004);
    } else {
      for (const side of [-1, 1]) {
        panel(group, .16, .15, [side * .18, .012, 0]); strut(group, [side * .05, .008, 0], [side * .18, .008, 0], .005);
        dish(group, .061, [side * .075, -.035, side * .075], Math.PI);
      }
    }
    group.userData.boundsRadius = .36; return group;
  }

  const specs = [
    { id: 'iss', name: 'ISS · 国际空间站', radius: 4.16, inclination: 51.64, node: 74, phase: 2.10, rate: .078, color: '#8dded5', build: buildISS },
    { id: 'tiangong', name: '天宫空间站', radius: 4.46, inclination: 41.5, node: 136, phase: 4.46, rate: .068, color: '#cbd7ee', build: buildTiangong },
    { id: 'hubble', name: '哈勃太空望远镜', radius: 4.74, inclination: 28.5, node: -36, phase: 1.88, rate: .060, color: '#e7c584', build: buildHubble },
    { id: 'earth-observer', name: '对地观测卫星', radius: 4.06, inclination: 97.8, node: -48, phase: 4.35, rate: .084, color: '#80b6dc', build: () => buildObserver(false) },
    { id: 'navigation-sat', name: '导航卫星', radius: 5.55, inclination: 55, node: 80, phase: 5.28, rate: .036, color: '#b5cae1', build: buildNavigation },
    { id: 'comms-sat', name: '通信卫星', radius: 6.14, inclination: 0, node: 0, phase: 3.54, rate: EARTH_ROTATION_RATE, color: '#95cbce', build: () => buildGeostationary(false), synchronous: true },
    { id: 'weather-sat', name: '气象卫星', radius: 6.46, inclination: 0, node: 0, phase: .85, rate: EARTH_ROTATION_RATE, color: '#9dbce4', build: () => buildGeostationary(true), synchronous: true },
    { id: 'polar-sat', name: '极轨科研卫星', radius: 4.94, inclination: 89, node: 57, phase: 1.08, rate: .051, color: '#b2d8c8', build: () => buildObserver(true) },
  ];
  for (const spec of specs) {
    const radius = spec.radius * earthRadius / 3;
    const quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(THREE.MathUtils.degToRad(spec.inclination), THREE.MathUtils.degToRad(spec.node), 0, 'YXZ'));
    const points = [], segments = 192;
    for (let i = 0; i < segments; i++) {
      const angle = i * TAU / segments;
      points.push(Math.cos(angle) * radius, 0, -Math.sin(angle) * radius);
    }
    const orbit = new THREE.LineLoop(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(points, 3)), new THREE.LineBasicMaterial({
      color: spec.color, transparent: true, opacity: .16, depthTest: true, depthWrite: false,
    }));
    orbit.name = `${spec.id} orbit`; orbit.quaternion.copy(quaternion); root.add(orbit);
    const object = spec.build(); object.userData.id = spec.id; object.userData.orbitRadius = radius;
    object.traverse(part => { part.userData.id = spec.id; if (part.isMesh) pickables.push(part); });
    objects.set(spec.id, object); root.add(object);
    labels.push({ object, id: spec.id, name: spec.name, color: spec.color, min: 0, max: 30, radius: object.userData.boundsRadius });
    records.push({ id: spec.id, object, orbit, radius, inclination: spec.inclination, node: spec.node, phase: spec.phase, rate: spec.rate, quaternion, synchronous: !!spec.synchronous });
  }

  function ensureHubbleModel() {
    if (disposed) return Promise.resolve(null);
    if (hubbleModel) return Promise.resolve(hubbleModel);
    if (hubblePromise) return hubblePromise;
    hubbleState = 'loading'; onChange();
    hubblePromise = Promise.resolve().then(() => loadHubble({ THREE })).then(model => {
      if (disposed) { model.dispose(); return null; }
      // The orbital frame remains stable for camera flight, labels and follow mode.
      const object = objects.get('hubble');
      object.getObjectByName('hubble-loading-preview')?.removeFromParent();
      for (let index = pickables.length - 1; index >= 0; index--) {
        if (pickables[index].userData.id === 'hubble') pickables.splice(index, 1);
      }
      model.root.traverse(part => { part.userData.id = 'hubble'; if (part.isMesh) pickables.push(part); });
      object.add(model.root); hubbleModel = model; hubbleState = 'ready'; onChange();
      return model;
    }).catch(() => {
      if (!disposed) { hubbleState = 'error'; onChange(); }
      return null;
    }).finally(() => { hubblePromise = null; });
    return hubblePromise;
  }
  function dispose() {
    if (disposed) return;
    disposed = true; hubbleModel?.dispose(); hubbleModel = null;
    // Procedural meshes share cached geometry and materials, including the detached preview.
    geometryCache.forEach(geometry => geometry.dispose());
    Object.values(materials).forEach(value => value.dispose()); dishMaterial.dispose();
    for (const record of records) { record.orbit.geometry.dispose(); record.orbit.material.dispose(); }
    pickables.length = labels.length = records.length = 0; objects.clear(); root.clear(); root.removeFromParent();
  }
  function update(elapsed, { orbits = true, selected = 'earth', visible = true } = {}) {
    if (disposed) return;
    root.visible = !!visible;
    // The overview uses the same official model as close-up observation. Load once
    // when the orbital layer is shown; a failed load waits for an explicit retry.
    if (root.visible && hubbleState === 'idle') ensureHubbleModel();
    // Time is owned by the app: pausing or restoring it always restores identical transforms.
    const time = Number.isFinite(elapsed) ? elapsed : 0;
    for (const record of records) {
      const angle = record.phase + time * record.rate;
      record.object.position.set(Math.cos(angle) * record.radius, 0, -Math.sin(angle) * record.radius).applyQuaternion(record.quaternion);
      radial.copy(record.object.position).normalize();
      tangent.set(-Math.sin(angle), 0, -Math.cos(angle)).applyQuaternion(record.quaternion).normalize();
      lateral.crossVectors(radial, tangent).normalize();
      // Local +Y points away from Earth and +Z follows the orbit: stable, no random spinning.
      basis.makeBasis(lateral, radial, tangent); record.object.quaternion.setFromRotationMatrix(basis);
      record.object.visible = true;
      record.orbit.visible = !!orbits;
      record.orbit.material.opacity = selected === record.id ? .61 : NEAR_EARTH_IDS.includes(selected) ? .09 : .16;
    }
  }
  function getCameraOffset(id, mobileView = false) {
    const object = objects.get(id); if (!object) return null;
    const record = records.find(item => item.id === id);
    const small = typeof mobileView === 'function' ? mobileView() : mobileView;
    const distance = (id === 'iss' ? 3.4 : id === 'tiangong' ? 2.3 : 1.8) * (small ? 1.32 : 1);
    cameraRadial.copy(object.position).normalize();
    cameraTangent.set(0, 0, 1).applyQuaternion(object.quaternion);
    // Outward-heavy approach keeps the destination camera clear of the Earth and its limb.
    cameraOffset.copy(cameraRadial).multiplyScalar(distance).addScaledVector(cameraTangent, distance * .48);
    if (record) cameraOffset.addScaledVector(new THREE.Vector3(0, 1, 0).applyQuaternion(record.quaternion), distance * .25);
    return cameraOffset.clone();
  }
  // Initialize transforms without downloading a model for a scene not yet shown.
  update(0, { visible: false });
  return { root, station: objects.get('iss'), getObject: id => objects.get(id) || null, getPickables: () => pickables, getLabels: () => labels, update, getCameraOffset, getOrbitRecords: () => records,
    ensureHubbleModel, getModelStatus: () => ({ state: hubbleState, source: 'NASA VTAD' }), dispose };
}
