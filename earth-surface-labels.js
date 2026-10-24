// Screen-space names anchored to Earth-local coordinates. Positions and labels
// are observation aids, never administrative boundaries or live hazard extents.
export function createEarthSurfaceLabels({THREE,earth,onSelect=()=>{}}){
  const layer=document.createElement('div');layer.className='earth-surface-label-layer';layer.hidden=true;
  layer.setAttribute('aria-label','地球表面名称');document.body.append(layer);
  const radius=earth.geometry?.parameters?.radius||3;
  const cameraLocal=new THREE.Vector3(),world=new THREE.Vector3(),projected=new THREE.Vector3();
  let records=[],selectedId='',visible=false,enabled=true,disposed=false;
  const overlap=(a,b,gap=7)=>a.left<b.right+gap&&a.right>b.left-gap&&a.top<b.bottom+gap&&a.bottom>b.top-gap;
  const normalAt=(lat,lon)=>{const a=lat*Math.PI/180,b=lon*Math.PI/180;return new THREE.Vector3(Math.cos(a)*Math.cos(b),Math.sin(a),-Math.cos(a)*Math.sin(b));};
  function setRecords(items=[]){
    if(disposed)return;
    const old=new Map(records.map(record=>[record.item.id,record]));
    records=[];
    for(const item of items){
      if(!item?.id||records.some(record=>record.item.id===item.id)||!Number.isFinite(item.lat)||!Number.isFinite(item.lon)||Math.abs(item.lat)>90||Math.abs(item.lon)>180)continue;
      let record=old.get(item.id);old.delete(item.id);
      if(!record){
        const button=document.createElement('button');button.type='button';button.className='earth-surface-label';button.hidden=true;
        const title=document.createElement('strong'),detail=document.createElement('span');button.append(title,detail);
        record={button,title,detail};
        button.addEventListener('click',event=>{event.stopPropagation?.();if(!disposed&&visible&&enabled&&!button.hidden)onSelect(record.item);});
        layer.append(button);
      }
      record.item={...item};record.normal=normalAt(item.lat,item.lon);record.box=null;
      record.title.textContent=item.title||item.name||'所选位置';record.detail.textContent=item.subtitle||'';
      record.button.dataset.locationId=item.id;record.button.setAttribute('aria-label',`定位${record.title.textContent}${item.subtitle?'，'+item.subtitle:''}`);
      records.push(record);
    }
    old.forEach(record=>record.button.remove());select(selectedId);
  }
  function select(id){
    selectedId=String(id||'');
    for(const record of records)record.button.setAttribute('aria-pressed',String(record.item.id===selectedId));
  }
  function setVisible(value){visible=Boolean(value);layer.hidden=!visible||!enabled;if(!visible)records.forEach(record=>{record.button.hidden=true;record.box=null;});}
  function setEnabled(value){enabled=Boolean(value);layer.hidden=!visible||!enabled;if(!enabled)records.forEach(record=>{record.button.hidden=true;record.box=null;});}
  function update(camera,{labels=enabled,ui=true,occlusionRects=[],width=globalThis.innerWidth||1200,height=globalThis.innerHeight||800}={}){
    if(disposed)return;
    records.forEach(record=>{record.shown=false;record.box=null;});
    let ancestor=earth,earthVisible=true;while(ancestor){if(!ancestor.visible)earthVisible=false;ancestor=ancestor.parent;}
    const show=visible&&enabled&&labels&&ui&&earthVisible&&camera;
    layer.hidden=!show;if(!show){records.forEach(record=>record.button.hidden=true);return;}
    earth.updateWorldMatrix(true,false);camera.updateWorldMatrix(true,false);
    camera.getWorldPosition(cameraLocal);earth.worldToLocal(cameraLocal);
    const blockers=occlusionRects.filter(box=>box&&[box.left,box.top,box.right,box.bottom].every(Number.isFinite)&&box.right>box.left&&box.bottom>box.top);
    const compact=width<=760,margin=12,candidates=[],fontSize=compact?12:14,maxWidth=Math.min(compact?200:264,width-margin*2);
    for(const record of records){
      const facing=record.normal.dot(cameraLocal)-radius;
      if(facing<=radius*.012)continue; // Hide the far hemisphere and grazing edge.
      world.copy(record.normal).multiplyScalar(radius*1.018);earth.localToWorld(world);projected.copy(world).project(camera);
      if(projected.z<=-1||projected.z>=1)continue;
      const x=(projected.x+1)*width*.5,y=(1-projected.y)*height*.5;
      if(x<margin||x>width-margin||y<margin||y>height-margin)continue;
      const units=text=>Array.from(String(text)).reduce((sum,char)=>sum+(/[\u0000-\u00ff]/.test(char)?.56:1),0);
      const textWidth=Math.max(units(record.title.textContent)*fontSize,units(record.detail.textContent)*(fontSize-2));
      const labelWidth=Math.min(maxWidth,Math.max(compact?112:132,Math.ceil(textWidth+26))),labelHeight=record.detail.textContent?(compact?48:54):(compact?32:36);
      record.button.style.width=`${labelWidth}px`;record.button.style.height=`${labelHeight}px`;
      candidates.push({record,x,y,labelWidth,labelHeight,facing});
    }
    candidates.sort((a,b)=>Number(b.record.item.id===selectedId)-Number(a.record.item.id===selectedId)||b.facing-a.facing);
    const occupied=[],limit=compact?4:7;
    for(const candidate of candidates){
      if(occupied.length>=limit)break;
      const {record,x,y,labelWidth:w,labelHeight:h}=candidate;
      // Put names beside a point, including alternate sides to avoid the facts
      // panel. A selected item is placed first instead of covering other names.
      const gap=record.item.cloud?32:15;
      const positions=[[x+gap,y-h/2],[x-gap-w,y-h/2],[x-w/2,y-gap-h],[x-w/2,y+gap]];
      const box=positions.map(([left,top])=>({left,top,right:left+w,bottom:top+h})).find(box=>
        box.left>=margin&&box.right<=width-margin&&box.top>=margin&&box.bottom<=height-margin&&
        !blockers.some(other=>overlap(box,other))&&!occupied.some(other=>overlap(box,other)));
      if(!box)continue;
      record.box=box;record.button.style.transform=`translate3d(${Math.round(box.left)}px,${Math.round(box.top)}px,0)`;
      record.shown=true;occupied.push(box);
    }
    // Avoid briefly hiding every button on every frame: that would blur a
    // keyboard-focused label even when its final projected position is visible.
    records.forEach(record=>{if(record.button.hidden===record.shown)record.button.hidden=!record.shown;});
  }
  function dispose(){if(disposed)return;disposed=true;visible=false;records=[];layer.remove();}
  return {setRecords,select,setVisible,setEnabled,update,dispose,getStatus:()=>({visible,enabled,selectedId,disposed,count:records.length,
    labels:records.map(record=>({id:record.item.id,title:record.title.textContent,subtitle:record.detail.textContent,visible:!layer.hidden&&!record.button.hidden,selected:record.item.id===selectedId,box:record.box?{...record.box}:null}))})};
}
