import {BLACK_HOLE_COMPARISON,blackHoleById} from './black-hole-data.js';

// Qualitative geometry, not a relativistic ray tracer. The spherical mask,
// emissive gas disk and camera-facing lensed light are separate layers.
export function createBlackHoleScene({THREE,scene,camera}){
  const root=new THREE.Group();root.name='black-hole-exploration';root.visible=false;scene.add(root);
  const single=new THREE.Group(),comparison=new THREE.Group();root.add(single,comparison);
  const uniforms={time:{value:0},tint:{value:new THREE.Color(0xffb766)}};
  const vertex=`varying vec2 p;
    #include <common>
    #include <logdepthbuf_pars_vertex>
    void main(){p=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
    #include <logdepthbuf_vertex>
    }`;
  const material=new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,toneMapped:false,vertexShader:vertex,
    fragmentShader:`uniform float time;uniform vec3 tint;varying vec2 p;
    #include <common>
    #include <logdepthbuf_pars_fragment>
    float hash(vec2 v){return fract(sin(dot(v,vec2(127.1,311.7)))*43758.5453);}
    float noise(vec2 v){vec2 a=floor(v),b=fract(v);b=b*b*(3.0-2.0*b);return mix(mix(hash(a),hash(a+vec2(1,0)),b.x),mix(hash(a+vec2(0,1)),hash(a+vec2(1,1)),b.x),b.y);}
    void main(){
      #include <logdepthbuf_fragment>
      float r=length(p),a=atan(p.y,p.x),t=time*.24;
      float grain=noise(vec2(r*13.,sin(a-t)*9.))+noise(vec2(r*34.,cos(a-t*.8)*17.))*.4;
      float bands=.55+.28*sin(r*35.+sin(a*8.-t)*1.4)+.17*sin(r*81.-a*3.+t);
      float edge=smoothstep(2.9,3.15,r)*(1.-smoothstep(5.4,9.5,r));
      float heat=exp(-(r-3.)*.55);
      float bright=.35+.65*pow(.5+.5*cos(a-.4),2.);
      vec3 color=mix(tint*vec3(1.,.48,.16),vec3(1.,.86,.63),heat);
      gl_FragColor=vec4(color*(.55+heat*1.3),edge*(.34+grain*.4+bands*.36)*bright);
    }`});
  const disk=new THREE.Mesh(new THREE.RingGeometry(2.9,9.5,192,12),material);disk.rotation.x=-Math.PI/2;single.add(disk);
  const core=new THREE.Mesh(new THREE.SphereGeometry(2.65,64,40),new THREE.MeshBasicMaterial({color:0x000000,toneMapped:false}));single.add(core);
  const lensUniforms={time:uniforms.time,tint:uniforms.tint,inclination:{value:1}};
  const lens=new THREE.Mesh(new THREE.RingGeometry(2.68,4.6,192,8),new THREE.ShaderMaterial({uniforms:lensUniforms,transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,toneMapped:false,vertexShader:vertex,
    fragmentShader:`uniform float time;uniform vec3 tint;uniform float inclination;varying vec2 p;
    #include <common>
    #include <logdepthbuf_pars_fragment>
    void main(){
      #include <logdepthbuf_fragment>
      float r=length(p),a=atan(p.y,p.x);
      float fine=exp(-pow((r-2.77)/.065,2.));
      float broad=exp(-pow((r-3.25)/.42,2.));
      float arc=pow(abs(sin(a)),.6)*mix(.3,1.,step(0.,p.y));
      float bands=.72+.28*sin(r*72.+sin(a*5.-time*.2)*1.1);
      float alpha=fine*.8+broad*arc*bands*.83*inclination;
      gl_FragColor=vec4(mix(tint,vec3(1.,.92,.75),fine*.8),alpha);
    }`}));single.add(lens);
  const compareMeshes=[];
  for(const item of BLACK_HOLE_COMPARISON){
    const radius=.65+Math.log10(item.mass)*.24;
    const group=new THREE.Group();comparison.add(group);
    const sphere=new THREE.Mesh(new THREE.SphereGeometry(radius,48,32),new THREE.MeshBasicMaterial({color:0x000000,toneMapped:false}));group.add(sphere);
    const rim=new THREE.Mesh(new THREE.RingGeometry(radius*1.01,radius*1.035,128),new THREE.MeshBasicMaterial({color:item.color,side:THREE.DoubleSide,transparent:true,opacity:.9,toneMapped:false}));group.add(rim);
    compareMeshes.push({group,rim,item,radius});
  }
  const labels=document.createElement('div');labels.className='black-hole-labels';labels.hidden=true;document.body.append(labels);
  const annotations=[['中央暗区',new THREE.Vector3(0,-3.1,0)],['吸积盘',new THREE.Vector3(6,0,0)],['弯曲的光 · 示意',new THREE.Vector3(0,4.3,0)]];
  const nodes=[...annotations.map(([name,position])=>({name,position,kind:'single'})),...compareMeshes.map(({item})=>({name:item.name,position:new THREE.Vector3(),kind:'compare'}))].map(item=>{const node=document.createElement('span');node.textContent=item.name;labels.append(node);return {...item,node};});
  const cellWidth=8.6,cellHeight=9.2;
  let comparisonColumns=0;
  function layoutComparison(aspect=2){
    const columns=aspect>3.5?8:aspect>1.3?4:2,rows=Math.ceil(compareMeshes.length/columns);
    if(columns!==comparisonColumns){
      comparisonColumns=columns;
      compareMeshes.forEach(({group},i)=>{
        group.position.set((i%columns-(columns-1)/2)*cellWidth,((rows-1)/2-Math.floor(i/columns))*cellHeight+.5,0);
        nodes[annotations.length+i].position.copy(group.position).y-=4;
      });
    }
    return {width:columns*cellWidth,height:rows*cellHeight};
  }
  layoutComparison();
  let id='sgr-a',diskEnabled=true,names=true,structure=false;
  const projected=new THREE.Vector3(),relative=new THREE.Vector3();
  function refresh(){const compare=id==='compare';single.visible=!compare;comparison.visible=compare;disk.visible=lens.visible=diskEnabled;}
  function update(elapsed,{ui=true,compact=false,occlusion=[]}={}){
    if(!root.visible){labels.hidden=true;return;}
    uniforms.time.value=elapsed;
    lens.quaternion.copy(camera.quaternion);
    lensUniforms.inclination.value=1.-Math.min(1,Math.abs(relative.copy(camera.position).sub(root.position).normalize().y))*.8;
    for(const item of compareMeshes)item.rim.lookAt(camera.position);
    labels.hidden=!ui||!names;
    for(const item of nodes){
      let show=ui&&names&&(id==='compare'?item.kind==='compare':item.kind==='single'&&(structure||item===nodes[0]))&&(!compact||id==='compare'||item===nodes[structure?1:0]);
      if(!diskEnabled&&item.kind==='single'&&item!==nodes[0])show=false;
      projected.copy(item.position).project(camera);
      const x=(projected.x*.5+.5)*innerWidth,y=(-projected.y*.5+.5)*innerHeight;
      if(projected.z<-1||projected.z>1||x<55||x>innerWidth-55||y<30||y>innerHeight-40)show=false;
      if(occlusion.some(r=>x>r.left-55&&x<r.right+55&&y>r.top-16&&y<r.bottom+16))show=false;
      item.node.hidden=!show;
      if(show)item.node.style.transform=`translate(${x}px,${y}px) translate(-50%,-50%)`;
    }
  }
  return {root,
    select(next){id=next==='compare'?next:blackHoleById(next).id;uniforms.tint.value.setHex(blackHoleById(id).color);nodes[0].node.textContent=structure?'中央暗区':blackHoleById(id).name;refresh();},
    setVisible(value){root.visible=value;labels.hidden=!value;},
    setDisk(value){diskEnabled=Boolean(value);refresh();},
    setNames(value){names=Boolean(value);},
    setStructure(value){structure=Boolean(value);nodes[0].node.textContent=structure?'中央暗区':blackHoleById(id).name;},
    getExtent:(aspect=2)=>id==='compare'?layoutComparison(aspect):{width:19,height:11},
    getCameraView:(compact=false)=>({position:new THREE.Vector3(0,id==='compare'?0:compact?7.8:4.8,26),target:new THREE.Vector3(),minDistance:13,maxDistance:65}),
    getStatus:()=>({id,visible:root.visible,disk:diskEnabled,names,structure,time:uniforms.time.value,comparison:id==='compare'}),
    update,
    dispose(){root.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});scene.remove(root);labels.remove();}
  };
}
