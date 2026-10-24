// Ray hits are world-space; convert through the current Earth transform first.
export function surfaceCoordinates(worldPoint,earth){
  if(!worldPoint||!earth)return null;
  earth.updateWorldMatrix(true,false);
  const p=earth.worldToLocal(worldPoint.clone());
  if(![p.x,p.y,p.z].every(Number.isFinite)||p.lengthSq()<1e-12)return null;
  p.normalize();
  const lat=Math.asin(Math.max(-1,Math.min(1,p.y)))*180/Math.PI;
  const lon=Math.atan2(-p.z,p.x)*180/Math.PI;
  return {lat,lon};
}
