// Static UI portraits projected from the same local surface maps as the 3D scene.
// Cache the finished small PNGs, not an animated renderer or decoded full-size maps.
const SURFACES = {
  sun:{file:'sun.jpg',longitude:0,emissive:true},
  mercury:{file:'mercury.jpg',longitude:25},
  venus:{file:'venus.jpg',longitude:0},
  earth:{file:'earth-day.jpg',longitude:30,latitude:18,clouds:true},
  moon:{file:'moon.jpg',longitude:0},
  mars:{file:'mars.jpg',longitude:-50},
  jupiter:{file:'jupiter.jpg',longitude:60},
  saturn:{file:'saturn.jpg',longitude:0,rings:true},
  uranus:{file:'uranus.jpg',longitude:0},
  neptune:{file:'neptune.jpg',longitude:0},
};
const portraits=new Map(),SIZE=160,TAU=Math.PI*2;
const clamp=(v,min=0,max=1)=>Math.max(min,Math.min(max,v));

async function readMap(file){
  const image=new Image();image.decoding='async';
  image.src=new URL(`./assets/${file}`,import.meta.url).href;
  await image.decode();
  const canvas=document.createElement('canvas');
  canvas.width=Math.min(1024,image.naturalWidth);
  canvas.height=Math.max(1,Math.round(image.naturalHeight*canvas.width/image.naturalWidth));
  const context=canvas.getContext('2d',{willReadFrequently:true});
  context.drawImage(image,0,0,canvas.width,canvas.height);
  return context.getImageData(0,0,canvas.width,canvas.height);
}

function sample(map,u,v,out){
  const x=((u%1+1)%1)*map.width,y=clamp(v)*(map.height-1);
  const x0=Math.floor(x),y0=Math.floor(y),fx=x-x0,fy=y-y0;
  const a=(y0*map.width+x0)*4,b=(y0*map.width+(x0+1)%map.width)*4;
  const next=Math.min(y0+1,map.height-1)*map.width;
  const c=(next+x0)*4,d=(next+(x0+1)%map.width)*4;
  for(let channel=0;channel<4;channel++)out[channel]=
    (map.data[a+channel]*(1-fx)+map.data[b+channel]*fx)*(1-fy)+
    (map.data[c+channel]*(1-fx)+map.data[d+channel]*fx)*fy;
}

function blend(data,index,color,opacity){
  const alpha=clamp(opacity),oldAlpha=data[index+3]/255,total=alpha+oldAlpha*(1-alpha);
  if(!total)return;
  for(let channel=0;channel<3;channel++)data[index+channel]=(color[channel]*alpha+data[index+channel]*oldAlpha*(1-alpha))/total;
  data[index+3]=total*255;
}

async function renderPortrait(id){
  const config=SURFACES[id];
  const [surface,clouds,rings]=await Promise.all([
    readMap(config.file),config.clouds?readMap('earth-clouds.png'):null,
    config.rings?readMap('saturn-ring.png'):null,
  ]);
  const canvas=document.createElement('canvas');canvas.width=canvas.height=SIZE;
  const context=canvas.getContext('2d'),pixels=context.createImageData(SIZE,SIZE),data=pixels.data;
  const center=SIZE/2,radius=config.rings?38:66;
  const latitude=(config.latitude||0)*Math.PI/180,longitude=config.longitude*Math.PI/180;
  const tilt=config.rings?-.32:0,ct=Math.cos(tilt),st=Math.sin(tilt);
  const color=[0,0,0,0],cloud=[0,0,0,0];
  function drawRings(frontOnly){
    for(let py=0;py<SIZE;py++)for(let px=0;px<SIZE;px++){
      const dx=px+.5-center,dy=py+.5-center;
      const x=dx*ct+dy*st,y=-dx*st+dy*ct;
      if(frontOnly&&y<0)continue;
      const r=Math.hypot(x/76,y/27);
      if(r<.53||r>1)continue;
      sample(rings,(r-.53)/.47,.5,color);
      const light=.83+.17*clamp((-x+y+65)/130);
      const tint=[color[0]*light*1.18,color[1]*light*1.13,color[2]*light];
      const alpha=color[3]/255*.94;
      // Back half is first drawn beneath the globe; front half crosses its face.
      if(!frontOnly||Math.hypot(dx,dy)<radius+1)blend(data,(py*SIZE+px)*4,tint,alpha);
    }
  }
  if(rings)drawRings(false);
  for(let py=Math.floor(center-radius);py<center+radius;py++)for(let px=Math.floor(center-radius);px<center+radius;px++){
    const sx=(px+.5-center)/radius,sy=(center-py-.5)/radius,r2=sx*sx+sy*sy;
    if(r2>=1)continue;
    const z=Math.sqrt(1-r2),x=sx*ct-sy*st,y=sx*st+sy*ct;
    const worldY=y*Math.cos(latitude)+z*Math.sin(latitude);
    const worldZ=z*Math.cos(latitude)-y*Math.sin(latitude);
    const u=.5+(Math.atan2(x,worldZ)+longitude)/TAU,v=.5-Math.asin(clamp(worldY,-1,1))/Math.PI;
    sample(surface,u,v,color);
    if(clouds){
      sample(clouds,u,v,cloud);
      const amount=cloud[3]/255*.82;
      for(let c=0;c<3;c++)color[c]=color[c]*(1-amount)+cloud[c]*amount;
    }
    const diffuse=clamp(-sx*.38+sy*.48+z*.79);
    const light=config.emissive?.85+.15*z:.22+.84*diffuse;
    const limb=config.clouds?Math.pow(1-z,3)*.2:0;
    color[0]=color[0]*light*(1-limb);
    color[1]=color[1]*light*(1-limb)+116*limb;
    color[2]=color[2]*light*(1-limb)+230*limb;
    blend(data,(py*SIZE+px)*4,color,clamp((1-Math.sqrt(r2))*radius));
  }
  if(rings)drawRings(true);
  context.putImageData(pixels,0,0);
  if(config.emissive||config.clouds){
    context.globalCompositeOperation='destination-over';
    const glow=context.createRadialGradient(center,center,radius-1,center,center,radius+10);
    glow.addColorStop(0,config.emissive?'rgba(255,157,28,.3)':'rgba(67,153,255,.32)');
    glow.addColorStop(1,'rgba(0,0,0,0)');context.fillStyle=glow;context.fillRect(0,0,SIZE,SIZE);
  }
  return canvas.toDataURL('image/png');
}

export function applyPlanetThumbnail(element,destination){
  const id=destination==='solar'?'sun':destination;
  if(!Object.hasOwn(SURFACES,id))return false;
  element.classList.add('textured-thumbnail');element.dataset.thumbnail=id;
  element.dataset.thumbnailState='loading';
  // Keep a genuine surface-map fallback if this browser cannot export Canvas pixels.
  element.style.backgroundImage=`url("${new URL(`./assets/${SURFACES[id].file}`,import.meta.url).href}")`;
  if(!portraits.has(id))portraits.set(id,renderPortrait(id));
  portraits.get(id).then(url=>{
    element.style.backgroundImage=`url("${url}")`;element.dataset.thumbnailState='ready';
  }).catch(()=>{element.dataset.thumbnailState='fallback';});
  return true;
}
