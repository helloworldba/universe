// One pending frame at a time. Hidden pages sleep; settled paused views render on demand.
export function createRenderScheduler({draw,shouldAnimate,isHidden=()=>document.hidden,isCompact=()=>false,requestFrame=requestAnimationFrame,cancelFrame=cancelAnimationFrame}) {
  let handle=0,drawing=false,dirty=true,last=null,lastDraw=null,disposed=false,frames=0;
  function request(){if(!disposed&&!isHidden()&&!handle&&!drawing)handle=requestFrame(tick);}
  function invalidate(){if(drawing&&shouldAnimate())return;dirty=true;request();}
  function tick(now){
    handle=0;if(disposed||isHidden()){last=lastDraw=null;return;}
    const moving=shouldAnimate(),interval=isCompact()?1000/30:0;
    if(moving&&!dirty&&lastDraw!==null&&now-lastDraw<interval-1){request();return;}
    const elapsed=last===null?0:Math.max(0,(now-last)/1000),delta=Math.min(.05,elapsed);
    last=now;lastDraw=now;dirty=false;drawing=true;
    // Physics stays bounded after a slow frame; decorative light cycles use
    // foreground wall time so lower frame rates do not turn shimmer into a crawl.
    try{draw(now,delta,elapsed);frames++;}finally{drawing=false;}
    if(shouldAnimate()||dirty)request();else last=null;
  }
  function visibilityChanged(){
    if(handle)cancelFrame(handle);handle=0;last=lastDraw=null;
    if(!isHidden()){dirty=true;request();}
  }
  return {invalidate,visibilityChanged,getStatus:()=>({frames,pending:!!handle,hidden:isHidden(),mode:isHidden()?'background':shouldAnimate()?(isCompact()?'30fps':'adaptive'):'on-demand'}),dispose(){disposed=true;if(handle)cancelFrame(handle);handle=0;},start:invalidate};
}
