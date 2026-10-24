// Only installed by the phone workspace, on a sheet heading. Body scrolling and
// scene gestures keep their own listeners. Short taps still reach native buttons.
export function installSheetGesture(heading, {window, expand, collapse}) {
  let drag=null, suppressClickUntil=0;
  const start=event=>{
    if(event.isPrimary===false){drag=null;return;}
    if(event.button!==undefined&&event.button!==0)return;
    if(event.target.closest?.('input,select,textarea,a'))return;
    drag={id:event.pointerId,x:event.clientX,y:event.clientY,moved:false};
  };
  const move=event=>{
    if(!drag||event.pointerId!==drag.id)return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if(Math.abs(dx)>14&&Math.abs(dx)>Math.abs(dy)){drag=null;return;}
    if(Math.abs(dy)>12){
      drag.moved=true;
      heading.setPointerCapture?.(event.pointerId);
      if(event.cancelable)event.preventDefault();
    }
  };
  const finish=event=>{
    if(!drag||event.pointerId!==drag.id)return;
    const current=drag;drag=null;
    if(heading.hasPointerCapture?.(event.pointerId))heading.releasePointerCapture(event.pointerId);
    if(current.moved)suppressClickUntil=Date.now()+350;
    const dy=event.clientY-current.y,dx=event.clientX-current.x;
    if(Math.abs(dy)<32||Math.abs(dy)<Math.abs(dx)*1.4)return;
    if(event.cancelable)event.preventDefault();
    if(dy<0)expand();else collapse();
  };
  const cancel=()=>{drag=null;};
  const click=event=>{
    if(event.detail!==0&&Date.now()<suppressClickUntil){event.preventDefault();event.stopImmediatePropagation();suppressClickUntil=0;}
  };
  heading.classList.add('mobile-sheet-grip');
  heading.addEventListener('pointerdown',start);
  window.addEventListener('pointermove',move,{passive:false});
  window.addEventListener('pointerup',finish);
  window.addEventListener('pointercancel',cancel);
  window.addEventListener('blur',cancel);
  heading.addEventListener('click',click,true);
  return ()=>{
    cancel();heading.classList.remove('mobile-sheet-grip');
    heading.removeEventListener('pointerdown',start);
    window.removeEventListener('pointermove',move);
    window.removeEventListener('pointerup',finish);
    window.removeEventListener('pointercancel',cancel);
    window.removeEventListener('blur',cancel);
    heading.removeEventListener('click',click,true);
  };
}
