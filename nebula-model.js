// NASA image-informed teaching models, not a measured 3D reconstruction.
// Shape and depth remain procedural so all destinations can be orbited offline.
export function createNebulaModel({THREE,entry,starMap,mobile=false,ownedTextures}){
  const root=new THREE.Group();root.name='nebula-model-'+entry.id;
  let seed=[...entry.id].reduce((n,c)=>(Math.imul(n,31)+c.charCodeAt(0))>>>0,12345);
  const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  const gauss=()=>Math.sqrt(-2*Math.log(Math.max(.000001,rand())))*Math.cos(rand()*Math.PI*2);
  const noise=(x,y,z=0)=>Math.sin(x*1.7+y*.63+z)*.45+Math.sin(y*3.1-x*.7+z*1.4)*.3+Math.sin(x*6.7+y*4.3-z*2.1)*.16;
  const pixels=new Uint8Array(64*64*4);
  for(let y=0;y<64;y++)for(let x=0;x<64;x++){
    const r=Math.hypot((x-31.5)/32,(y-31.5)/32),i=(y*64+x)*4;
    pixels[i]=pixels[i+1]=pixels[i+2]=255;
    pixels[i+3]=Math.round(Math.pow(Math.max(0,1-r),2.2)*(.7+rand()*.3)*255);
  }
  const mist=new THREE.DataTexture(pixels,64,64,THREE.RGBAFormat);mist.needsUpdate=true;mist.magFilter=mist.minFilter=THREE.LinearFilter;ownedTextures.add(mist);
  function pointLayer(positions,colors,size,opacity,{stars=false,additive=true}={}){
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
    const points=new THREE.Points(geometry,new THREE.PointsMaterial({map:stars?starMap:mist,size,opacity,vertexColors:true,transparent:true,depthWrite:false,blending:additive?THREE.AdditiveBlending:THREE.NormalBlending}));root.add(points);return points;
  }
  function cloud(count,position,color,size=4,opacity=.07,additive=true){
    const p=[],c=[],base=new THREE.Color(color);
    for(let i=0;i<count;i++){p.push(...position(i));const tint=base.clone().multiplyScalar(.5+rand()*.65);c.push(tint.r,tint.g,tint.b);}
    return pointLayer(p,c,size,opacity,{additive});
  }
  function field(count,extent){const p=[],c=[];for(let i=0;i<count;i++){p.push(gauss()*extent,gauss()*extent*.7,(rand()-.5)*15);const tint=new THREE.Color(rand()<.22?'#ffe2ad':'#ccddff');c.push(tint.r,tint.g,tint.b);}return pointLayer(p,c,.14,.9,{stars:true});}
  const curve=points=>new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
  // Connected, tilted, knotted columns follow the Webb portrait's overall outline.
  function pillars(scale=1,offset=[0,0,0]){
    const columns=[
      {p:[[-8,-10,0],[-7,-6,0],[-5,-2,-.2],[-5.5,1,0],[-3.4,3,0],[-3.1,6,.2],[0,8.5,0],[1.2,10.3,.3],[3.5,11,.3]],r:[3.7,3.1,2.5,2.8,1.5,1.5,.85,1.25,.6]},
      {p:[[-3,-10,1],[-1,-6,1],[0,-2,1],[2,1,1.4],[4.5,3,1],[6,3.6,1]],r:[2.7,2.1,1.6,1.2,.8,1.05]},
      {p:[[2,-10,2],[3.7,-7,2],[4,-4,2],[5.4,-1.5,2.2],[7,0,2.3]],r:[1.9,1.7,1.15,.65,.75]},
    ];
    for(const column of columns){
      const path=curve(column.p),p=[],c=[],earth=new THREE.Color('#987453'),lit=new THREE.Color('#f4c791');
      function sample(surface){
        const t=rand(),a=rand()*Math.PI*2,center=path.getPoint(t),tangent=path.getTangent(t),side=new THREE.Vector3(-tangent.y,tangent.x,0).normalize();
        const index=t*(column.r.length-1),k=Math.min(column.r.length-2,Math.floor(index)),radius=(column.r[k]+(column.r[k+1]-column.r[k])*(index-k))*(1+.28*noise(t*8,a*2))*Math.sqrt(Math.min(1,(1-t)/.065));
        const r=radius*(surface ? .78+rand()*.32 : Math.sqrt(rand())*.9),x=center.x+side.x*Math.cos(a)*r,y=center.y+side.y*Math.cos(a)*r,z=center.z+Math.sin(a)*r*.72;
        return {point:[x*scale+offset[0],y*scale+offset[1],z*scale+offset[2]],x,y,z,a,t};
      }
      cloud(mobile?2300:4800,()=>sample(false).point,'#3a302c',1.7*scale,.31,false).renderOrder=1;
      for(let i=0;i<(mobile?2300:4500);i++){
        const s=sample(true),n=noise(s.x,s.y,s.z),light=Math.max(0,Math.cos(s.a)*.5+Math.sin(s.a)*.45+.2);
        p.push(...s.point);const tint=earth.clone().lerp(lit,light*.85).multiplyScalar(.55+Math.max(0,n)*.7);c.push(tint.r,tint.g,tint.b);
      }
      pointLayer(p,c,1.6*scale,.065).renderOrder=2;
      cloud(mobile?450:800,()=>sample(true).point,'#cfab7c',2.1*scale,.025).renderOrder=2;
    }
    cloud(mobile?900:1800,()=>[(-7+gauss()*4)*scale+offset[0],(-10+gauss()*1.1)*scale+offset[1],gauss()*1.5*scale+offset[2]],'#615444',3.2*scale,.16,false).renderOrder=1;
  }
  const amount=mobile?1800:3500;
  if(entry.shape==='globular'){
    const p=[],c=[],n=mobile?7000:16000;
    for(let i=0;i<n;i++){const r=Math.min(13,Math.abs(gauss())*4.8),a=rand()*Math.PI*2,z=rand()*2-1,s=Math.sqrt(1-z*z);p.push(r*s*Math.cos(a),r*z,r*s*Math.sin(a));const tint=new THREE.Color(rand()<.2?'#ffdba3':'#c7d9ff').multiplyScalar(.65+rand()*.5);c.push(tint.r,tint.g,tint.b);}
    pointLayer(p,c,mobile?.15:.12,.82,{stars:true});cloud(300,()=>[gauss()*1.4,gauss()*1.4,gauss()*1.4],'#bbcfff',2.8,.025);root.userData.starCount=n;
  }else if(entry.shape==='pillars'){
    cloud(amount,()=>[gauss()*8,gauss()*7,-5+gauss()*2],'#639aa7',6,.025);pillars();field(180,11);
  }else if(entry.shape==='eagle'){
    // A broad emission region and young cluster; the Pillars are only a small part.
    cloud(amount,()=>[gauss()*8,gauss()*5.5,-5+gauss()*2],'#648f9e',5,.026);
    for(const [x,y,sx,sy,color] of [[-9,-3,3,5,'#997457'],[-5,6,5,2,'#b98b62'],[5,6,5,2.5,'#b99b78'],[10,-3,3,5,'#7f6c5d'],[0,-7,7,1.5,'#937a63']]){
      const blobs=Array.from({length:18},()=>[x+gauss()*sx,y+gauss()*sy,gauss()*1.5-3]);
      cloud(mobile?550:1100,i=>{const b=blobs[i%blobs.length];return [b[0]+gauss()*.8,b[1]+gauss()*.8,b[2]+gauss()*.5];},color,3.4,.065);
    }
    pillars(.43,[-2,-1,2]);field(240,9);
    cloud(24,()=>[gauss()*2,3+gauss()*1.3,1+gauss()*.8],'#c9e5ff',.25,.8);
  }else if(entry.shape==='crab'){
    // Webb: red-orange filament cage, pale synchrotron wisps and mottled inner dust.
    // Curves trace a tangled ellipsoidal shell, not radial spokes from the pulsar.
    const tilt=.55,rotate=([x,y,z])=>[x*Math.cos(tilt)-y*Math.sin(tilt),x*Math.sin(tilt)+y*Math.cos(tilt),z];
    cloud(amount,()=>rotate([gauss()*4.8,gauss()*3.1,gauss()*2.4]),'#7ba5b6',3.8,.07);
    const p=[],c=[],hot=new THREE.Color('#f8dca6'),orange=new THREE.Color('#d57e5a'),cool=new THREE.Color('#b1cdd2');
    const shell=(u,v,r=1)=>{const rough=1+.075*noise(u*3,v*4);return rotate([Math.cos(u)*Math.cos(v)*11*r*rough,Math.sin(u)*Math.cos(v)*7.4*r*rough,Math.sin(v)*5*r]);};
    function filament(u,v,du,dv,r,branch=false){
      const knots=[];
      for(let j=0;j<=6;j++){const t=j/6;knots.push(shell(u+du*t+.035*gauss(),v+dv*t+.03*gauss(),r+.025*gauss()));}
      const path=curve(knots),steps=branch?28:52;
      for(let j=0;j<steps;j++){
        const t=j/(steps-1),q=path.getPoint(t),tint=(r>.92?orange:hot).clone().lerp(cool,rand()*.2).multiplyScalar(.6+rand()*.55);
        const copies=mobile?2:3;
        for(let k=0;k<copies;k++){p.push(q.x+gauss()*.1,q.y+gauss()*.1,q.z+gauss()*.1);c.push(tint.r,tint.g,tint.b);}
      }
      if(!branch&&rand()>.55)filament(u+du*.55,v+dv*.55,du*.5+.2,dv*.4-.22,r,true);
    }
    for(let i=0;i<(mobile?95:170);i++){
      const u=rand()*Math.PI*2,v=(rand()-.5)*Math.PI*.88;
      filament(u,v,(rand()-.5)*1.2,(rand()-.5)*.9,.78+rand()*.24);
    }
    pointLayer(p,c,.3,.16);pointLayer(p,c,1.1,.025);
    const wisps=[];
    for(let i=0;i<16;i++){
      const a=rand()*Math.PI*2,r=1.3+rand()*5;
      for(let j=0;j<60;j++){const t=j/59,angle=a+t*1.6;wisps.push(rotate([Math.cos(angle)*r,Math.sin(angle)*r*.48,Math.sin(angle*2)*.9]));}
    }
    cloud(wisps.length,i=>wisps[i],'#c7e0e5',1.5,.012);
    cloud(40,()=>[gauss()*.18,gauss()*.18,gauss()*.18],'#d5efff',.7,.14);field(100,14);
  }else if(entry.shape==='horsehead'){
    // Full Barnard 33 outline from Hubble, cool illuminated rim from Webb's mane close-up.
    cloud(amount,()=>[gauss()*8,gauss()*6,-4+gauss()*1.5],'#91505c',5,.022);
    const outline=curve([[-10,-10,0],[-6,-7,0],[-2,-2,0],[-1,2,0],[-4,1.6,0],[-7,2.2,0],[-6.4,4.3,0],[-4.7,5.4,0],[-3.2,8,0],[-1.8,7.6,0],[.5,7.7,0],[2.6,7.5,0],[4.4,5.9,0],[5.5,2.3,0],[6,-2.4,0],[8,-6,0],[11,-10,0]]);
    const silhouette=outline.getPoints(240).map(p=>[p.x,p.y]);
    function inside(x,y){let yes=false;for(let i=0,j=silhouette.length-1;i<silhouette.length;j=i++){const [xi,yi]=silhouette[i],[xj,yj]=silhouette[j];if(((yi>y)!==(yj>y))&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)yes=!yes;}return yes;}
    const dust=[],p=[],c=[],brown=new THREE.Color('#886c61'),blue=new THREE.Color('#a1bdc8');
    while(dust.length<(mobile?5000:10000)){
      const x=rand()*22-10,y=rand()*18-10;
      if(inside(x,y)){const z=gauss()*1.3;dust.push([x+gauss()*.1,y+gauss()*.1,z]);
        p.push(x,y,1.5+Math.abs(z)*.5);const tint=brown.clone().lerp(blue,Math.max(0,noise(x*.5,y*.5))*.45).multiplyScalar(.45+Math.max(0,noise(x,y,z))*.6);c.push(tint.r,tint.g,tint.b);}
    }
    cloud(dust.length,i=>dust[i],'#30292c',1.6,.32,false).renderOrder=1;
    pointLayer(p,c,2.5,.035).renderOrder=2;
    const rim=[];
    for(let i=0;i<(mobile?1400:2800);i++){
      const t=.16+rand()*.66,q=outline.getPoint(t);rim.push([q.x+gauss()*.23,q.y+gauss()*.23,gauss()*.55+.5]);
    }
    cloud(rim.length,i=>rim[i],'#9ec9df',1.5,.05).renderOrder=2;
    cloud(mobile?900:1800,()=>[gauss()*7,-9+gauss()*1.4,gauss()*2],'#80706d',3,.095,false).renderOrder=1;
    field(150,13);
  }
  root.userData.shape=entry.shape;root.userData.illustrative=true;
  return root;
}
