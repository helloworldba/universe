import { getNarrationPlayer } from './local-narration.js';

// Optional interaction gating defers the first download until a real page gesture.
// A browser may still require a real user gesture before allowing playback.
export function createBackgroundMusic({audio,button,tracks=[],autoplay=true,requireInteraction=false,narration=getNarrationPlayer()}){
  if(!audio||!button)throw new TypeError('Background music requires an audio element and a button.');
  const doc=button.ownerDocument;
  const playlist=tracks.length?[...tracks]:[audio.getAttribute('src')||audio.src].filter(Boolean);
  const labels={loading:'正在加载背景音乐，点击取消',playing:'暂停背景音乐',paused:'播放背景音乐',blocked:'点击播放背景音乐',error:'背景音乐加载失败，点击重试'};
  let state='paused',wantsPlay=true,version=0,pending=null,disposed=false,reloadNeeded=false,gestureArmed=false,gestureUsed=false,trackIndex=0;
  let suspended=false,suspendedState='paused',sourceAssigned=false;
  let interactionReceived=!requireInteraction;
  // Native looping would repeat just one source and prevent the ended event.
  audio.loop=false;
  audio.volume=.25;
  audio.preload='none';

  function render(next){
    state=next;
    button.dataset.state=next;
    button.setAttribute('aria-pressed',String(next==='playing'&&!audio.paused));
    button.setAttribute('aria-label',labels[next]);
    button.setAttribute('title',labels[next]);
    button.setAttribute('aria-busy',String(next==='loading'));
  }
  function removeInteraction(){
    doc?.removeEventListener('click',onFirstInteraction,true);
    doc?.removeEventListener('keydown',onFirstInteraction,true);
  }
  function acceptInteraction(event){
    if(interactionReceived)return true;
    if(!event?.isTrusted||event.defaultPrevented||event.repeat)return false;
    if(event.type==='keydown'&&!['Enter',' ','Spacebar','Escape'].includes(event.key))return false;
    interactionReceived=true;
    removeInteraction();
    return true;
  }
  function onFirstInteraction(event){
    if(disposed||!acceptInteraction(event))return;
    // A close-button gesture unlocks music here; resume() starts it only after
    // the video has closed. The music button keeps ownership of its own click.
    if(!suspended&&wantsPlay&&!button.contains(event.target))requestPlay();
  }
  function removeGesture(){
    if(!gestureArmed)return;
    doc.removeEventListener('pointerdown',onGesture,true);
    doc.removeEventListener('keydown',onGesture,true);
    gestureArmed=false;
  }
  function armGesture(){
    if(disposed||suspended||gestureUsed||gestureArmed||!doc)return;
    gestureArmed=true;
    doc.addEventListener('pointerdown',onGesture,true);
    doc.addEventListener('keydown',onGesture,true);
  }
  function onGesture(event){
    if(suspended)return;
    if(!event.isTrusted||event.defaultPrevented||event.repeat)return;
    if(event.type==='keydown'&&!['Enter',' ','Spacebar'].includes(event.key))return;
    // The button's click handler owns its gesture, avoiding pointerdown + click
    // immediately starting and then pausing the same playback attempt.
    if(button.contains(event.target))return;
    gestureUsed=true;
    removeGesture();
    if(state==='blocked'&&wantsPlay)requestPlay();
  }
  function failed(error,attempt){
    if(disposed||attempt!==version)return;
    pending=null;
    if(!wantsPlay)return;
    if(!audio.paused&&!audio.error){render('playing');return;}
    if(error?.name==='NotAllowedError'){
      render('blocked');
      armGesture();
    }else if(error?.name==='AbortError')render('paused');
    else{
      reloadNeeded=true;
      render('error');
      removeGesture();
    }
  }
  function requestPlay({advance=false}={}){
    if(disposed||suspended||!interactionReceived)return;
    wantsPlay=true;
    const attempt=++version;
    pending=attempt;
    render('loading');
    try{
      if(!sourceAssigned){
        if(playlist.length)audio.src=playlist[trackIndex];
        sourceAssigned=true;
      }
      if(advance){
        if(playlist.length){
          trackIndex=(trackIndex+1)%playlist.length;
          audio.src=playlist[trackIndex];
          reloadNeeded=true;
        }else audio.currentTime=0;
      }
      if(reloadNeeded||audio.error){reloadNeeded=false;audio.load();}
      const result=audio.play();
      Promise.resolve(result).then(()=>{
        // A late play promise must never undo an explicit pause. Conversely an
        // older completion must not pause a newer, intentional play request.
        if(disposed||suspended||!wantsPlay){audio.pause();return;}
        if(attempt!==version)return;
        pending=null;
        if(audio.error){onError();return;}
        render(audio.paused?'paused':'playing');
        removeGesture();
      },error=>failed(error,attempt));
    }catch(error){failed(error,attempt);}
  }
  function pause(){
    wantsPlay=false;
    version++;
    pending=null;
    gestureUsed=true;
    removeGesture();
    audio.pause();
    render('paused');
  }
  function onClick(event){
    if(suspended||!acceptInteraction(event))return;
    gestureUsed=true;
    removeGesture();
    if(state==='error')requestPlay();
    else if(!audio.paused||(pending!==null&&wantsPlay))pause();
    else requestPlay();
  }
  function onPlay(){
    if(disposed||suspended||!wantsPlay){audio.pause();return;}
    if(audio.error){onError();return;}
    render('playing');
    removeGesture();
  }
  function onPause(){
    if(disposed)return;
    if(suspended){render('paused');return;}
    if(audio.error){onError();return;}
    if(state==='blocked'||state==='error')return;
    render(pending!==null&&wantsPlay?'loading':'paused');
  }
  function onEnded(){
    // A queued ended event after pause must not restart music. Checking ended
    // also ignores an old event after the next source has already been loaded.
    if(disposed||suspended||!wantsPlay||!audio.ended||pending!==null||state==='error')return;
    requestPlay({advance:true});
  }
  function onError(){
    if(disposed)return;
    version++;
    pending=null;
    reloadNeeded=true;
    removeGesture();
    render('error');
  }
  function suspend(){
    if(disposed||suspended)return;
    suspendedState=state;
    suspended=true;
    version++;
    pending=null;
    removeGesture();
    audio.pause();
    render('paused');
  }
  function resume(){
    if(disposed||!suspended)return;
    suspended=false;
    if(!wantsPlay){render('paused');return;}
    if(!interactionReceived){render('paused');return;}
    // A failed file still needs an explicit music-button retry. Temporary
    // suspension must not silently turn a loading failure into an auto-retry.
    if(suspendedState==='error'||state==='error'||audio.error){render('error');return;}
    requestPlay({advance:audio.ended});
  }
  const mediaListeners={play:onPlay,playing:onPlay,pause:onPause,ended:onEnded,error:onError};
  for(const [name,listener]of Object.entries(mediaListeners))audio.addEventListener(name,listener);
  button.addEventListener('click',onClick);

  // All narration owners (including dynamically created constellation cards)
  // share this state. Changing volume never overrides the user's play intent.
  const unsubscribeNarration=narration.subscribe(({active})=>{audio.volume=active ? .03 : .25;});
  if(!interactionReceived){
    render('paused');
    doc?.addEventListener('click',onFirstInteraction,true);
    doc?.addEventListener('keydown',onFirstInteraction,true);
  }else if(autoplay)requestPlay();else render('paused');

  return {
    getState:()=>state,
    suspend,
    resume,
    dispose(){
      if(disposed)return;
      disposed=true;
      removeInteraction();
      pause();
      unsubscribeNarration();
      button.removeEventListener('click',onClick);
      for(const [name,listener]of Object.entries(mediaListeners))audio.removeEventListener(name,listener);
    },
  };
}
