import { getNarrationPlayer } from './local-narration.js';

export const OPENING_VIDEO_BVID = 'BV12ZHG6qEk5';

// Use the official player: no copied streams, local MP4 request or private player API.
export function createBilibiliCinema({dialog,screen,openButton,closeButton,status,music,
  narration=getNarrationPlayer(),beforeOpen=()=>{},document:doc=dialog?.ownerDocument}={}) {
  if(!dialog||!screen||!openButton||!closeButton||!status||!doc)throw new TypeError('Opening video requires its dialog and controls.');
  const narrationBlock=Symbol('opening-video');
  let opened=false,disposed=false,frame=null,backdropDown=false;
  openButton.setAttribute('aria-expanded','false');

  function removeFrame(){
    if(!frame)return;
    frame.onload=frame.onerror=null;
    frame.remove(); // Stop external playback immediately when the window closes.
    frame=null;
  }
  function open({autoplay=false}={}){
    if(disposed||opened)return;
    beforeOpen();
    if(!dialog.open)dialog.showModal();
    opened=true;
    openButton.setAttribute('aria-expanded','true');
    music?.suspend();
    narration.setBlocked(narrationBlock,true);
    status.textContent=autoplay?'自动播放默认静音，可在播放器中开启声音；若未播放，请点击播放按钮。':'若未自动播放，请点击视频中的播放按钮。';
    const next=doc.createElement('iframe');
    next.title='宇宙 · bilibili 开场视频';
    next.allow='autoplay; fullscreen; encrypted-media; picture-in-picture';
    next.allowFullscreen=true;
    next.referrerPolicy='strict-origin-when-cross-origin';
    const url=new URL('https://player.bilibili.com/player.html');
    url.search=new URLSearchParams({bvid:OPENING_VIDEO_BVID,p:'1',autoplay:'1',muted:autoplay?'1':'0',danmaku:'0',poster:'1'}).toString();
    next.src=url.href;
    // An iframe load cannot establish whether a cross-origin video actually plays.
    next.onerror=()=>{if(opened&&frame===next)status.textContent='播放器未能载入，请稍后重试，或关闭视频继续探索。';};
    frame=next;
    screen.append(next);
    closeButton.focus({preventScroll:true});
  }
  function finishClose({focus=true}={}){
    if(!opened)return;
    opened=false;
    backdropDown=false;
    if(doc.fullscreenElement&&dialog.contains(doc.fullscreenElement))doc.exitFullscreen?.()?.catch(()=>{});
    removeFrame();
    openButton.setAttribute('aria-expanded','false');
    narration.setBlocked(narrationBlock,false);
    music?.resume();
    if(focus&&openButton.getClientRects().length)openButton.focus({preventScroll:true});
  }
  function close(options){if(dialog.open)dialog.close();finishClose(options);}
  function backdrop(event){
    if(event.target!==dialog)return false;
    const r=dialog.getBoundingClientRect();
    return event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom;
  }
  const onPageHide=()=>close({focus:false});
  const listeners=[
    [openButton,'click',()=>open()],
    [closeButton,'click',()=>close()],
    [dialog,'cancel',event=>{event.preventDefault();close();}],
    [dialog,'close',()=>{if(!dialog.open)finishClose();}],
    [dialog,'pointerdown',event=>{backdropDown=backdrop(event);}],
    [dialog,'click',event=>{const dismiss=backdropDown&&backdrop(event);backdropDown=false;if(dismiss)close();}],
  ];
  for(const [node,type,listener]of listeners)node.addEventListener(type,listener);
  doc.defaultView?.addEventListener('pagehide',onPageHide);
  return {open,close,dispose(){
    if(disposed)return;
    disposed=true;
    close({focus:false});
    for(const [node,type,listener]of listeners)node.removeEventListener(type,listener);
    doc.defaultView?.removeEventListener('pagehide',onPageHide);
  }};
}
