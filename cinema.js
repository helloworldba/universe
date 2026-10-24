import { getNarrationPlayer } from './local-narration.js';
import { createVideoControls } from './video-controls.js';

export function createCinema({dialog,video,openButton,closeButton,unmuteButton,status,music,narration=getNarrationPlayer(),beforeOpen=()=>{}}){
  if(!dialog||!video||!openButton||!closeButton||!unmuteButton||!status)throw new TypeError('Cinema requires its dialog, video, controls and status.');
  const narrationBlock=Symbol('cinema');
  let opened=false,disposed=false,version=0,backdropDown=false,policyMuted=false;
  openButton.setAttribute('aria-expanded','false');
  unmuteButton.hidden=true;

  function showStatus(message=''){
    status.textContent=message;
    status.hidden=!message;
  }
  function playbackMessage(error){
    if(error?.name==='NotAllowedError')return '浏览器暂未允许自动播放，请点击视频中的播放按钮。';
    if(video.error?.code===2)return '视频加载失败，请检查连接后关闭窗口，再重新打开重试。';
    if(video.error?.code===3)return '视频无法解码，当前浏览器可能不支持此文件。';
    if(video.error?.code===4)return '视频文件不可用或格式不受支持，请检查文件后重新打开。';
    if(error?.name==='AbortError')return '播放已中断，可点击视频中的播放按钮继续。';
    return '视频暂时无法播放，请点击视频中的播放按钮重试；若仍失败，请关闭后重新打开。';
  }
  function syncUnmute(){unmuteButton.hidden=!(opened&&policyMuted&&video.muted);}
  function play({allowMutedFallback=false}={}){
    const attempt=++version;
    function failed(error){
      if(disposed||!opened||!dialog.open||attempt!==version)return;
      // Retry only this startup policy rejection, and only once. No unrelated
      // page gesture changes the video's sound setting afterwards.
      if(allowMutedFallback&&error?.name==='NotAllowedError'){
        policyMuted=true;
        video.muted=true;
        syncUnmute();
        play();
      }else showStatus(playbackMessage(error));
    }
    try{
      Promise.resolve(video.play()).then(()=>{
        if(disposed||!opened||!dialog.open){video.pause();return;}
        if(attempt===version)showStatus();
      },failed);
    }catch(error){failed(error);}
  }
  function enableSound(){
    if(disposed||!opened||!dialog.open)return;
    policyMuted=false;
    video.muted=false;
    if(video.volume===0)video.volume=1;
    syncUnmute();
    showStatus();
    play();
  }
  function open({autoplay=false}={}){
    if(disposed)return;
    if(opened){if(!autoplay)enableSound();return;}
    beforeOpen();
    if(!dialog.open)dialog.showModal();
    opened=true;
    policyMuted=false;
    video.muted=false;
    if(video.volume===0)video.volume=1;
    syncUnmute();
    openButton.setAttribute('aria-expanded','true');
    music?.suspend();
    narration.setBlocked(narrationBlock,true);
    showStatus();
    closeButton.focus({preventScroll:true});
    try{
      if(video.error)video.load();
      else if(video.ended)video.currentTime=0;
      play({allowMutedFallback:autoplay});
    }catch(error){showStatus(playbackMessage(error));}
  }
  function finishClose({focus=true}={}){
    if(!opened)return;
    opened=false;
    version++;
    backdropDown=false;
    policyMuted=false;
    syncUnmute();
    video.pause();
    playerControls?.exitFullscreen();
    openButton.setAttribute('aria-expanded','false');
    showStatus();
    narration.setBlocked(narrationBlock,false);
    music?.resume();
    if(focus)openButton.focus({preventScroll:true});
  }
  function close(options){
    if(dialog.open)dialog.close();
    finishClose(options);
  }
  function onClose(){
    // Native close events are queued: ignore one belonging to a prior opening.
    if(!dialog.open)finishClose();
  }
  function onCancel(event){event.preventDefault();close();}
  function isBackdrop(event){
    if(event.target!==dialog)return false;
    const rect=dialog.getBoundingClientRect();
    return event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom;
  }
  function onPointerDown(event){backdropDown=isBackdrop(event);}
  function onBackdropClick(event){
    const dismiss=backdropDown&&isBackdrop(event);
    backdropDown=false;
    if(dismiss)close();
  }
  function onPlay(){
    if(disposed||!opened||!dialog.open){video.pause();return;}
    showStatus();
    syncUnmute();
  }
  function onVolumeChange(){
    // Video volume controls remain authoritative. After their unmute action,
    // later manual muting must not bring back the autoplay fallback control.
    if(policyMuted&&!video.muted){policyMuted=false;version++;}
    syncUnmute();
  }
  function onError(){if(opened)showStatus(playbackMessage(video.error));}
  const player=video.closest?.('.cinema-player');
  const playerControls=player?createVideoControls({video,player,onPlay:()=>play(),onError:showStatus}):null;
  const listeners=[
    [openButton,'click',open],[closeButton,'click',close],[unmuteButton,'click',enableSound],
    [dialog,'close',onClose],[dialog,'cancel',onCancel],
    [dialog,'pointerdown',onPointerDown],[dialog,'click',onBackdropClick],
    [video,'play',onPlay],[video,'playing',onPlay],[video,'error',onError],[video,'volumechange',onVolumeChange],
  ];
  for(const [node,type,listener]of listeners)node.addEventListener(type,listener);
  return {
    open,
    close,
    dispose(){
      if(disposed)return;
      disposed=true;
      if(dialog.open)dialog.close();
      finishClose({focus:false});
      narration.setBlocked(narrationBlock,false);
      playerControls?.dispose();
      for(const [node,type,listener]of listeners)node.removeEventListener(type,listener);
    },
  };
}
