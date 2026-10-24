// A compact, articulated teaching model, informed by NASA's Webb component views.
// The deployment timings and dimensions remain deliberately illustrative.
export function createJWSTModel({THREE,compact=false,onPick=()=>{}}) {
  const focus=new THREE.Group();focus.name='jwst-observatory';
  const ownedTextures=[];
  const v=(x,y,z)=>new THREE.Vector3(x,y,z);
  const mesh=(geometry,material,parent)=>{const object=new THREE.Mesh(geometry,material);parent.add(object);return object;};
  const rod=(from,to,radius,material,parent)=>{
    const delta=to.clone().sub(from),object=mesh(new THREE.CylinderGeometry(radius,radius,delta.length(),6),material,parent);
    object.position.copy(from).add(to).multiplyScalar(.5);object.quaternion.setFromUnitVectors(v(0,1,0),delta.normalize());return object;
  };
  const stroke=(points,material,parent,closed=false)=>{const object=new (closed?THREE.LineLoop:THREE.Line)(new THREE.BufferGeometry().setFromPoints(points),material);parent.add(object);return object;};
  const box=(size,position,material,parent)=>{const object=mesh(new THREE.BoxGeometry(...size),material,parent);object.position.set(...position);return object;};

  // A small local reflection texture gives the metal readable light/dark reflections
  // without changing the scene background or loading an additional image.
  const width=128,height=64,pixels=new Uint8Array(width*height*4);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const u=x/width*Math.PI*2,t=(y/height-.5)*Math.PI;
    const angular=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
    const horizon=Math.exp(-Math.pow((t+.09)/.32,2));
    const broad=Math.exp(-Math.pow(angular(u,.6)/.6,2)-Math.pow((t-.2)/.55,2));
    const strip=Math.exp(-Math.pow(angular(u,4.35)/.19,2)-Math.pow((t+.1)/.75,2));
    const glint=Math.exp(-Math.pow(angular(u,2.2)/.44,2)-Math.pow((t-.7)/.3,2));
    const intensity=.12+.27*horizon+.78*broad+.65*strip+.35*glint;
    const at=(y*width+x)*4;
    pixels[at]=Math.min(255,255*(intensity*.94));pixels[at+1]=Math.min(255,255*intensity);pixels[at+2]=Math.min(255,255*(intensity*1.12));pixels[at+3]=255;
  }
  const reflection=new THREE.DataTexture(pixels,width,height,THREE.RGBAFormat);
  reflection.name='jwst-local-metal-reflection';reflection.colorSpace=THREE.SRGBColorSpace;reflection.mapping=THREE.EquirectangularReflectionMapping;reflection.needsUpdate=true;ownedTextures.push(reflection);
  const gold=new THREE.MeshPhysicalMaterial({color:0xecc779,metalness:.97,roughness:.16,clearcoat:.32,clearcoatRoughness:.2,envMap:reflection,envMapIntensity:2.2});
  const carbon=new THREE.MeshStandardMaterial({color:0x151b25,metalness:.35,roughness:.56});
  const silver=new THREE.MeshStandardMaterial({color:0xa8b6c5,metalness:.8,roughness:.3,envMap:reflection,envMapIntensity:.8});
  const blanket=new THREE.MeshStandardMaterial({color:0x8e7750,metalness:.73,roughness:.39,envMap:reflection,envMapIntensity:.65});
  const edgeMaterial=new THREE.LineBasicMaterial({color:0x674f27,transparent:true,opacity:.85});
  const mirror=new THREE.Group();mirror.name='jwst-primary-mirror';mirror.position.set(0,1.3,0);mirror.rotation.x=-.12;focus.add(mirror);
  const center=new THREE.Group(),left=new THREE.Group(),right=new THREE.Group();mirror.add(center,left,right);
  left.name='jwst-left-wing';right.name='jwst-right-wing';center.name='jwst-center-backplane';left.position.x=-1.5;right.position.x=1.5;

  // Exact pointy-top axial coordinates. Front surfaces are constructed in XY,
  // avoiding the cylinder/Euler rotation that previously tilted adjacent hexagons.
  const segments=[];let sequence=0;
  const radius=.592,curvature=.009;
  function segmentGeometry(cx,cy) {
    const positions=[],normals=[];
    const surface=(x,y)=>v(x,y,.045+curvature*((cx+x)**2+(cy+y)**2));
    const normal=(point)=>v(-2*curvature*(cx+point.x),-2*curvature*(cy+point.y),1).normalize();
    const rim=Array.from({length:6},(_,i)=>surface(Math.cos(Math.PI/6+i*Math.PI/3)*radius,Math.sin(Math.PI/6+i*Math.PI/3)*radius));
    const middle=surface(0,0);
    const triangle=(a,b,c,ns)=>{for(const [i,p] of [a,b,c].entries()){positions.push(...p.toArray());normals.push(...ns[i].toArray());}};
    for(let i=0;i<6;i++){const a=rim[i],b=rim[(i+1)%6];triangle(middle,a,b,[normal(middle),normal(a),normal(b)]);}
    for(let i=0;i<6;i++){
      const a=rim[i],b=rim[(i+1)%6],aBack=v(a.x,a.y,-.10),bBack=v(b.x,b.y,-.10);
      const side=v(b.y-a.y,a.x-b.x,0).normalize();
      triangle(a,aBack,bBack,[side,side,side]);triangle(a,bBack,b,[side,side,side]);
      const back=v(0,0,-1);triangle(v(0,0,-.10),bBack,aBack,[back,back,back]);
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
    geometry.addGroup(0,18,0);geometry.addGroup(18,positions.length/3-18,1);
    return {geometry,rim};
  }
  for(let q=-2;q<=2;q++)for(let r=-2;r<=2;r++){
    if(Math.max(Math.abs(q),Math.abs(r),Math.abs(q+r))>2||(q===0&&r===0))continue;
    const x=Math.sqrt(3)*.61*(q+r/2),y=1.5*.61*r,wing=x<-1.5?left:x>1.5?right:center;
    const {geometry,rim}=segmentGeometry(x,y),plate=mesh(geometry,[gold,carbon],wing);
    plate.name=`jwst-mirror-segment-${++sequence}`;plate.userData.primaryMirrorSegment=true;plate.position.set(x-wing.position.x,y,0);onPick(plate);
    const edge=stroke(rim.map(point=>point.clone().add(v(0,0,.002))),edgeMaterial,wing,true);edge.position.copy(plate.position);
    const local=v(x-wing.position.x,y,-.23);segments.push({x,y,wing,local});
    for(const angle of [0,Math.PI*2/3,Math.PI*4/3]){
      const anchor=local.clone().add(v(Math.cos(angle)*.24,Math.sin(angle)*.24,0));rod(anchor,anchor.clone().add(v(0,0,.13)),.027,silver,wing);
    }
  }
  for(let a=0;a<segments.length;a++)for(let b=a+1;b<segments.length;b++){
    const first=segments[a],second=segments[b];
    if(first.wing===second.wing&&Math.hypot(first.x-second.x,first.y-second.y)<1.08)rod(first.local,second.local,.048,carbon,first.wing);
  }
  for(const side of [-1,1])for(const y of [-1.15,0,1.15]){
    const hinge=mesh(new THREE.CylinderGeometry(.082,.082,.2,10),silver,mirror);hinge.position.set(side*1.5,y,-.16);
  }
  const instrument=box([1.2,1.35,.82],[0,.08,-.83],carbon,mirror);instrument.name='jwst-instrument-module';
  box([.83,1.02,.05],[0,.08,-1.27],silver,mirror);
  for(const x of [-.36,.36]){
    box([.28,.29,.36],[x,.6,-1.4],carbon,mirror);
    const lens=mesh(new THREE.CylinderGeometry(.095,.095,.04,12),silver,mirror);lens.rotation.x=Math.PI/2;lens.position.set(x,.6,-1.6);
  }
  for(const sign of [-1,1]){
    rod(v(sign*1.05,-1.6,-.25),v(sign*.45,.65,-1.2),.07,carbon,mirror);
    rod(v(sign*1.05,1.6,-.25),v(sign*.45,.65,-1.2),.06,carbon,mirror);
  }

  const secondaryAssembly=new THREE.Group();secondaryAssembly.name='jwst-secondary-assembly';mirror.add(secondaryAssembly);
  const secondary=new THREE.Group();secondary.name='jwst-secondary-mirror';secondary.position.set(0,-.25,2.6);secondaryAssembly.add(secondary);
  const shell=mesh(new THREE.CylinderGeometry(.265,.31,.17,24),carbon,secondary);shell.rotation.x=Math.PI/2;
  const face=mesh(new THREE.CircleGeometry(.25,32),gold,secondary);face.position.z=-.09;face.rotation.y=Math.PI;
  const lip=mesh(new THREE.TorusGeometry(.267,.012,5,32),silver,secondary);lip.position.z=-.085;
  // Only the mirror head turns around the upper hinge. The feet stay attached to
  // the primary structure; two articulated links follow each moving attachment.
  const supportFrame=new THREE.Group();supportFrame.name='jwst-secondary-support-frame';mirror.add(supportFrame);
  const supports=[[-1.8,-1.3,0],[1.8,-1.3,0],[0,2.1,0]],links=[];
  supports.forEach((position,index)=>{
    const from=v(...position),angle=index*Math.PI*2/3-Math.PI/2,attachment=v(Math.cos(angle)*.23,Math.sin(angle)*.23,0),to=secondary.position.clone().add(attachment);
    const joint=from.clone().lerp(to,.53),first=rod(from,joint,.033,carbon,supportFrame),second=rod(joint,to,.028,carbon,supportFrame);
    first.name=`jwst-secondary-strut-${index}-a`;second.name=`jwst-secondary-strut-${index}-b`;
    const collar=mesh(new THREE.SphereGeometry(.058,8,6),silver,supportFrame);collar.name=`jwst-secondary-joint-${index}`;collar.position.copy(joint);
    const foot=mesh(new THREE.CylinderGeometry(.095,.095,.13,10),silver,supportFrame);foot.name=index===2?'jwst-secondary-top-hinge':`jwst-secondary-lower-mount-${index}`;foot.rotation.x=Math.PI/2;foot.position.copy(from);
    if(index<2){
      // Fixed backplane brackets keep the lower feet supported when mirror wings fold.
      const bracket=rod(from.clone().add(v(0,0,-.06)),v(Math.sign(from.x)*.9,-1.3,-.28),.045,carbon,mirror);bracket.name=`jwst-secondary-fixed-bracket-${index}`;
    }
    links.push({from,attachment,to,joint,first,second,collar,firstLength:from.distanceTo(joint),secondLength:joint.distanceTo(to)});
  });
  // Positive rotation brings the head toward the front of the primary mirror.
  const secondaryFoldAngle=THREE.MathUtils.degToRad(41);
  secondaryAssembly.position.set(0,2.1,0);
  secondaryAssembly.children.forEach(child=>child.position.sub(secondaryAssembly.position));
  const linkDirection=v(0,0,0),linkAxis=v(0,1,0);
  const placeLink=(object,from,to,restLength)=>{
    linkDirection.copy(to).sub(from);object.scale.y=linkDirection.length()/restLength;
    object.position.copy(from).add(to).multiplyScalar(.5);object.quaternion.setFromUnitVectors(linkAxis,linkDirection.normalize());
  };
  const updateSecondarySupports=()=>{
    const folded=Math.min(1,Math.abs(secondaryAssembly.rotation.x)/secondaryFoldAngle);
    for(const link of links){
      link.to.copy(link.attachment).applyQuaternion(secondary.quaternion).add(secondary.position).applyQuaternion(secondaryAssembly.quaternion).add(secondaryAssembly.position);
      link.joint.copy(link.from).lerp(link.to,.53);link.joint.z+=.3*folded;
      placeLink(link.first,link.from,link.joint,link.firstLength);placeLink(link.second,link.joint,link.to,link.secondLength);link.collar.position.copy(link.joint);
    }
  };
  updateSecondarySupports();

  const shields=new THREE.Group();shields.name='jwst-sunshield';focus.add(shields);
  const corners=[[0,-6.2],[4,-1.4],[3.35,4.8],[0,6.5],[-3.35,4.8],[-4,-1.4]];
  const sides=corners.length,edgeSteps=compact?8:14,radialSteps=compact?7:11,around=sides*edgeSteps;
  const membrane=(layer)=>{
    const positions=[],uvs=[],indices=[],boundary=[],scale=.86+layer*.035;
    function point(radial,index){
      const wrapped=(index+around)%around,sector=Math.floor(wrapped/edgeSteps),t=(wrapped%edgeSteps)/edgeSteps,a=corners[sector],b=corners[(sector+1)%sides];
      const x=(a[0]*(1-t)+b[0]*t)*radial*scale,z=(a[1]*(1-t)+b[1]*t)*radial*scale,angle=Math.atan2(z,x);
      const tension=-.10*Math.sin(Math.PI*radial)*(1-radial*.4),wrinkle=.027*Math.sin(radial*31+angle*7+layer*.45)*Math.sin(Math.PI*radial)**2;
      const y=-1.8-layer*.21+tension+wrinkle+.022*Math.cos(angle*2)*radial*radial;
      return v(x,y,z);
    }
    positions.push(...point(0,0).toArray());uvs.push(.5,.5);
    for(let ring=1;ring<=radialSteps;ring++)for(let i=0;i<around;i++){
      const p=point(ring/radialSteps,i);positions.push(...p.toArray());uvs.push(p.x/8+.5,p.z/13+.5);if(ring===radialSteps)boundary.push(p);
    }
    for(let i=0;i<around;i++)indices.push(0,1+(i+1)%around,1+i);
    for(let ring=1;ring<radialSteps;ring++)for(let i=0;i<around;i++){
      const a=1+(ring-1)*around+i,b=1+(ring-1)*around+(i+1)%around,c=1+ring*around+i,d=1+ring*around+(i+1)%around;
      indices.push(a,b,c,b,d,c);
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();
    const top=new THREE.MeshStandardMaterial({color:[0xe1e2ec,0xcbd0df,0xd4cddc,0xc0bfce,0xbeb8c9][layer],metalness:.74,roughness:.32,envMap:reflection,envMapIntensity:.7,side:THREE.FrontSide});
    const back=new THREE.MeshStandardMaterial({color:[0xbca8bc,0xb8a0b2,0xc49bab,0xb88b99,0xa88392][layer],metalness:.68,roughness:.4,envMap:reflection,envMapIntensity:.55,side:THREE.BackSide});
    const face=mesh(geometry,top,shields);face.name=`jwst-membrane-layer-${layer+1}`;face.userData.membraneLayer=layer+1;
    const underside=mesh(geometry,back,shields);underside.name=`jwst-membrane-back-${layer+1}`;
    stroke(boundary,new THREE.LineBasicMaterial({color:layer===0?0xe5e5ed:0x9695ad,transparent:true,opacity:.8}),shields,true);
    if(layer===0)for(let edge=0;edge<sides;edge++){
      const seam=[];for(let i=2;i<=radialSteps;i++)seam.push(point(i/radialSteps,edge*edgeSteps).add(v(0,.005,0)));
      stroke(seam,new THREE.LineBasicMaterial({color:0xbfc4d3,transparent:true,opacity:.38}),shields);
    }
  };
  for(let layer=0;layer<5;layer++)membrane(layer);
  for(const [x,z] of corners){
    rod(v(0,-2.78,0),v(x,-2.62,z),.028,carbon,shields);
    stroke([v(x,-2.62,z),v(x*.86,-1.79,z*.86)],new THREE.LineBasicMaterial({color:0xb9b5c7,transparent:true,opacity:.65}),shields);
  }

  const bus=new THREE.Group();bus.name='jwst-spacecraft-bus';bus.position.y=-3.15;focus.add(bus);
  const chassis=mesh(new THREE.CylinderGeometry(.99,1.08,.88,8),blanket,bus);chassis.rotation.y=Math.PI/8;
  box([1.25,.08,1.25],[0,.48,0],silver,bus);
  for(const sign of [-1,1]){
    box([.08,.48,.69],[sign*.99,-.02,0],carbon,bus);
    box([.56,.43,.28],[sign*.42,-.04,1.02],blanket,bus);
    box([.56,.34,.05],[sign*.42,-.04,1.18],silver,bus);
    rod(v(sign*.25,.4,-.1),v(sign*.35,2.62,-.45),.06,silver,bus);
    const nozzle=mesh(new THREE.ConeGeometry(.12,.2,10,1,true),carbon,bus);nozzle.rotation.z=sign*Math.PI/2;nozzle.position.set(sign*1.17,-.23,-.6);
  }
  rod(v(-.35,-2.7,-.3),v(.35,.7,-.5),.035,carbon,focus);rod(v(.35,-2.7,-.3),v(-.35,.7,-.5),.035,carbon,focus);
  const antenna=new THREE.Group();antenna.name='jwst-earth-antenna';antenna.position.set(1.2,-3.62,1.5);antenna.rotation.set(.48,0,-.42);focus.add(antenna);
  rod(v(0,0,0),v(-.5,.35,-.6),.05,silver,antenna);
  const profile=[];for(let i=0;i<=12;i++){const r=i/12*.52;profile.push(new THREE.Vector2(r,r*r*.5));}
  const dish=mesh(new THREE.LatheGeometry(profile,compact?20:32),new THREE.MeshStandardMaterial({color:0xc5cbd6,metalness:.7,roughness:.34,envMap:reflection,side:THREE.DoubleSide}),antenna);
  const antennaRim=mesh(new THREE.TorusGeometry(.52,.016,5,32),silver,antenna);antennaRim.rotation.x=Math.PI/2;antennaRim.position.y=.135;
  rod(v(0,0,0),v(0,.32,0),.028,carbon,antenna);
  const receiver=mesh(new THREE.CylinderGeometry(.075,.075,.09,10),silver,antenna);receiver.position.y=.32;

  const solarAssembly=new THREE.Group();solarAssembly.name='jwst-solar-array';solarAssembly.position.set(0,-3.65,-2.3);focus.add(solarAssembly);
  const solarFrame=box([1.28,.055,4.15],[0,0,-2.02],silver,solarAssembly);
  const solarBlue=new THREE.MeshStandardMaterial({color:0x182d53,metalness:.5,roughness:.32,envMap:reflection,envMapIntensity:.5});
  const cellBlue=new THREE.MeshStandardMaterial({color:0x1c3963,metalness:.58,roughness:.28,envMap:reflection,envMapIntensity:.5});
  for(let panel=0;panel<4;panel++)box([1.19,.065,.98],[0,0,-.49-panel*1.02],panel%2?cellBlue:solarBlue,solarAssembly);
  const grid=[];for(const side of [-1,1]){
    for(let column=0;column<=4;column++){const x=-.59+column*.295;grid.push(v(x,side*.036,-.02),v(x,side*.036,-4.05));}
    for(let row=0;row<=20;row++){const z=-.02-row*.2015;grid.push(v(-.59,side*.036,z),v(.59,side*.036,z));}
  }
  solarAssembly.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(grid),new THREE.LineBasicMaterial({color:0x5a718d,transparent:true,opacity:.65})));
  for(const x of [-.45,.45])rod(v(x,0,.2),v(x,0,-.35),.045,carbon,solarAssembly);
  const flap=box([1.45,.025,.65],[0,-2.75,6.6],silver,shields);flap.rotation.x=.18;
  // Keep the packed membranes below the mirror instead of scaling their height
  // toward the observatory origin. The deployed world coordinates are unchanged.
  shields.position.y=-2.2;shields.children.forEach(child=>child.position.y+=2.2);

  focus.userData.jwstModel={mirrorSegments:18,wingSegments:3,membraneLayers:5,localReflection:true};
  return {focus,textures:ownedTextures,parts:{left,right,shields,mirror,secondaryAssembly,secondaryFoldAngle,updateSecondarySupports,solarAssembly}};
}
