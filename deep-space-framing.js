// Frame the illustrative deep-space objects without changing their Earth/Sun
// relationship. This uses the entry direction, so resizing never follows a
// transient camera flight or undoes the user's zoom.
export function fitDeepSpaceFov({THREE,points,offset,width,height,availableWidth,availableHeight,baseFov}) {
  const view=new THREE.PerspectiveCamera();
  view.position.copy(offset);view.lookAt(0,0,0);view.updateMatrixWorld(true);
  const inverse=view.matrixWorldInverse;
  const safeWidth=Math.max(90,availableWidth-96),safeHeight=Math.max(90,availableHeight-70);
  let tangent=Math.tan(THREE.MathUtils.degToRad(baseFov)/2);
  for(const point of points){
    const local=point.clone().applyMatrix4(inverse),depth=Math.max(1,-local.z);
    tangent=Math.max(tangent,Math.abs(local.x)*height/(safeWidth*depth),Math.abs(local.y)*height/(safeHeight*depth));
  }
  return Math.min(115,THREE.MathUtils.radToDeg(2*Math.atan(tangent)));
}
