// Translate the complete atlas in screen space without changing its scale,
// camera angle, individual models, or their relative positions.
export function centerMobileAtlas({THREE, points, offset, fov, width, height, viewport}) {
  if (!points?.length) return null;
  const reference = new THREE.PerspectiveCamera(fov, width / height);
  reference.position.copy(offset);
  reference.lookAt(0, 0, 0);
  reference.updateMatrixWorld(true);
  let left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity;
  const point = new THREE.Vector3();
  for (const value of points) {
    point.copy(value).project(reference);
    const x = point.x * width / 2, y = -point.y * height / 2;
    left = Math.min(left, x); right = Math.max(right, x);
    top = Math.min(top, y); bottom = Math.max(bottom, y);
  }
  // Use the same centre between the upper controls and bottom bar as the
  // other phone scenes, including when a reading sheet reserves some space.
  const centerY = viewport.cy;
  return {offsetX: width / 2 - viewport.cx + (left + right) / 2,
    offsetY: height / 2 - centerY + (top + bottom) / 2};
}
