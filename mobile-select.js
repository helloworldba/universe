/* Phone-only choice presentation. The original select still owns its value/events. */
export function createMobileSelect(select,{document,window,id,name,onOpen=()=>{}}) {
  if(!select)return null;
  const removers=[];
  const listen=(node,type,fn,options)=>{node.addEventListener(type,fn,options);removers.push(()=>node.removeEventListener(type,fn,options));};
  const make=(tag,cls,text)=>{const node=document.createElement(tag);node.className=cls;if(text)node.textContent=text;return node;};
  const host=make('span','mobile-select-control');
  const trigger=make('button','mobile-select-trigger'),caption=make('span','mobile-select-value'),arrow=make('span','mobile-select-arrow','⌄');
  trigger.id=id;trigger.type='button';trigger.setAttribute('aria-haspopup','listbox');trigger.setAttribute('aria-expanded','false');
  arrow.setAttribute('aria-hidden','true');trigger.append(caption,arrow);host.append(trigger);select.parentNode.append(host);
  const popup=make('div','mobile-select-options');popup.id=id+'-options';popup.hidden=true;
  popup.setAttribute('role','listbox');popup.setAttribute('aria-label',name);trigger.setAttribute('aria-controls',popup.id);document.body.append(popup);
  const options=Array.from(select.options||select.querySelectorAll('option')).map(option=>{
    const node=make('button','mobile-select-option',option.textContent);node.type='button';node.setAttribute('role','option');node.tabIndex=-1;
    node.dataset.value=option.value;popup.append(node);
    listen(node,'click',()=>{
      if(option.disabled)return;
      if(select.value!==option.value){select.value=option.value;select.dispatchEvent(new window.Event('change',{bubbles:true}));}
      sync();close(true);
    });
    return {node,option};
  });
  select.classList.add('mobile-select-native');
  function sync() {
    const selected=options.find(({option})=>option.value===select.value);
    const label=selected?.option.textContent||'';
    if(caption.textContent!==label)caption.textContent=label;
    trigger.setAttribute('aria-label',name+'：'+label);trigger.disabled=select.disabled;
    for(const {node,option}of options){const chosen=option.value===select.value;node.disabled=option.disabled;node.setAttribute('aria-selected',String(chosen));node.tabIndex=chosen?0:-1;}
  }
  function close(restoreFocus=false) {
    const wasOpen=!popup.hidden;popup.hidden=true;trigger.setAttribute('aria-expanded','false');
    if(wasOpen&&restoreFocus)trigger.focus({preventScroll:true});
  }
  function open() {
    if(select.disabled)return;
    onOpen();sync();popup.hidden=false;trigger.setAttribute('aria-expanded','true');
    const rect=trigger.getBoundingClientRect(),viewport=window.visualViewport;
    const left=viewport?.offsetLeft||0,top=viewport?.offsetTop||0,width=viewport?.width||window.innerWidth,height=viewport?.height||window.innerHeight;
    const menuWidth=Math.min(Math.max(rect.width,160),width-24);
    popup.style.width=menuWidth+'px';popup.style.maxHeight=Math.min(220,height-24)+'px';
    const menuHeight=popup.getBoundingClientRect().height;
    const below=rect.bottom+6,above=rect.top-menuHeight-6;
    popup.style.left=Math.max(left+12,Math.min(rect.left,left+width-menuWidth-12))+'px';
    popup.style.top=Math.max(top+12,Math.min(below+menuHeight<=top+height-12?below:above,top+height-menuHeight-12))+'px';
    (options.find(({option})=>option.value===select.value&&!option.disabled)||options.find(({option})=>!option.disabled))?.node.focus({preventScroll:true});
  }
  listen(trigger,'click',event=>{event.preventDefault();popup.hidden?open():close(true);});
  listen(trigger,'keydown',event=>{
    if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();event.stopPropagation();open();}
  });
  listen(popup,'click',event=>event.stopPropagation());
  listen(popup,'keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close(true);return;}
    if(event.key==='Tab'){close(true);return;}
    if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
      event.preventDefault();event.stopPropagation();
      const enabled=options.filter(({option})=>!option.disabled),index=enabled.findIndex(({node})=>node===document.activeElement);
      const next=event.key==='Home'?0:event.key==='End'?enabled.length-1:(index+(event.key==='ArrowDown'?1:-1)+enabled.length)%enabled.length;
      enabled[next]?.node.focus({preventScroll:true});
    }
    // Space chooses the focused option instead of pausing the scene underneath.
    if(event.key===' '||event.key==='Enter')event.stopPropagation();
  });
  listen(select,'change',sync);
  listen(document,'pointerdown',event=>{if(!popup.hidden&&!popup.contains(event.target)&&!host.contains(event.target))close();},true);
  listen(document,'focusin',event=>{if(!popup.hidden&&!popup.contains(event.target)&&!host.contains(event.target))close();});
  listen(document,'scroll',event=>{if(!popup.hidden&&!popup.contains(event.target))close();},true);
  listen(window,'resize',()=>close());
  if(window.visualViewport)listen(window.visualViewport,'resize',()=>close());
  sync();
  return {sync,close,dispose(){close();for(const remove of removers)remove();host.remove();popup.remove();select.classList.remove('mobile-select-native');}};
}
