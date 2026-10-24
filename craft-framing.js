// The selected spacecraft uses the free rectangle between the UI panels.
// Other scenes retain their existing composition.
export function craftViewport({width, height, compact, ui, bounds = {}, navigation = null, header = null}) {
  const gutter = compact ? 14 : 24;
  let left = gutter, right = width - gutter, top = gutter, bottom = height - gutter;
  if (ui) {
    top = Math.max(compact ? 120 : height <= 500 ? 78 : 132, (header?.bottom || 0) + 12, (navigation?.bottom || 0) + 12);
    bottom = Math.min(height - (compact ? 90 : 92), (bounds.dock?.top ?? height) - 18);
    if (compact) {
      if (bounds.left) top = Math.max(top, bounds.left.bottom + 12);
      if (bounds.right?.height > 100) bottom = Math.min(bottom, bounds.right.top - 14);
    } else {
      if (bounds.left) left = Math.max(left, bounds.left.right + 24);
      if (bounds.right) right = Math.min(right, bounds.right.left - 24);
      if (bounds.tools) right = Math.min(right, bounds.tools.left - 12);
    }
  }
  // Very small viewports with an open sheet still get a finite, on-screen
  // rectangle. Closing the sheet restores the full viewing space.
  left = Math.min(left, Math.max(gutter, width - gutter - 96));
  right = Math.min(width - gutter, Math.max(left + 96, right));
  top = Math.min(top, Math.max(gutter, height - gutter - 96));
  bottom = Math.min(height - gutter, Math.max(top + 96, bottom));
  return {left, right, top, bottom, width:right-left, height:bottom-top, cx:(left+right)/2, cy:(top+bottom)/2};
}

function slopes(THREE, points, matrix) {
  const point = new THREE.Vector3();
  let left = Infinity, right = -Infinity, top = -Infinity, bottom = Infinity;
  for (const value of points) {
    point.copy(value).applyMatrix4(matrix);
    if (point.z >= -.01) return null;
    const x = point.x / -point.z, y = point.y / -point.z;
    left = Math.min(left, x); right = Math.max(right, x);
    top = Math.max(top, y); bottom = Math.min(bottom, y);
  }
  return Number.isFinite(left + right + top + bottom) ? {left, right, top, bottom} : null;
}

export function fitCraftView({THREE, points, offset, width, height, viewport, fillX = .86, fillY = .84}) {
  if (!points?.length) return null;
  const reference = new THREE.PerspectiveCamera();
  reference.position.copy(offset); reference.lookAt(0, 0, 0); reference.updateMatrixWorld(true);
  const extent = slopes(THREE, points, reference.matrixWorldInverse);
  if (!extent) return null;
  const tangent = Math.max(
    (extent.right - extent.left) * height / (2 * viewport.width * fillX),
    (extent.top - extent.bottom) * height / (2 * viewport.height * fillY),
  );
  const fov = THREE.MathUtils.clamp(THREE.MathUtils.radToDeg(2 * Math.atan(tangent)), 12, 135);
  const focal = height / (2 * Math.tan(THREE.MathUtils.degToRad(fov) / 2));
  return {fov, offsetX:width/2-viewport.cx+(extent.left+extent.right)*focal/2,
    offsetY:height/2-viewport.cy-(extent.top+extent.bottom)*focal/2};
}

export function centerCraftView({THREE, camera, points, width, height, viewport}) {
  if (!points?.length || !viewport) return;
  camera.updateMatrixWorld(true);
  const extent = slopes(THREE, points, camera.matrixWorldInverse);
  if (!extent) return;
  const focal = height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
  camera.setViewOffset(width, height,
    width/2-viewport.cx+(extent.left+extent.right)*focal/2,
    height/2-viewport.cy-(extent.top+extent.bottom)*focal/2, width, height);
  // OrbitControls owns camera distance and angle. Recentring never resets zoom.
}
