// An illustrative Sun/Earth frame: north stays +Y while solar declination changes.
// Reference: https://science.nasa.gov/earth/facts/ and https://spaceplace.nasa.gov/seasons/en/
export const EARTH_TILT_DEGREES=23.44;
export const EARTH_DAY_RATE=.018;
// Start over Asia from the night-side entry camera; subsequent rotation is unchanged.
export const EARTH_INITIAL_ROTATION=4.25;
export const SUN_AZIMUTH=Math.atan2(-.694,-.72);
const TAU=Math.PI*2,DEG=Math.PI/180;
const wrap=(n,max)=>((n%max)+max)%max;
export const SEASONS=Object.freeze([
  {id:'spring',name:'春分',month:'3月前后',declination:0,north:'北半球春季',south:'南半球秋季',description:'太阳直射赤道附近，南北半球的白昼长度接近。'},
  {id:'summer',name:'夏至',month:'6月前后',declination:EARTH_TILT_DEGREES,north:'北半球夏季',south:'南半球冬季',description:'阳光更直接地照向北半球；北半球白昼较长，北极圈内可出现极昼。'},
  {id:'autumn',name:'秋分',month:'9月前后',declination:0,north:'北半球秋季',south:'南半球春季',description:'太阳再次直射赤道附近。春分和秋分的光照几何相近，季节进程不同。'},
  {id:'winter',name:'冬至',month:'12月前后',declination:-EARTH_TILT_DEGREES,north:'北半球冬季',south:'南半球夏季',description:'阳光更直接地照向南半球；南半球白昼较长，南极圈内可出现极昼。'}
]);

export function seasonalSunDirection(declination=0,azimuth=SUN_AZIMUTH){
  const d=declination*DEG,c=Math.cos(d);
  return {x:c*Math.cos(azimuth),y:Math.sin(d),z:-c*Math.sin(azimuth)};
}
export function hourAtRotation(rotation,azimuth=SUN_AZIMUTH){return wrap(12+(rotation-azimuth)*12/Math.PI,24);}
export function rotationAtHour(hour,azimuth=SUN_AZIMUTH){return azimuth+(wrap(hour,24)-12)*Math.PI/12;}
export function subsolarLongitude(hour){return wrap(180-hour*15+180,360)-180;}
export function daylightHours(latitude,declination){
  if(!Number.isFinite(latitude)||!Number.isFinite(declination))return NaN;
  if(Math.abs(declination)<1e-10)return 12;
  const a=Math.sin(latitude*DEG)*Math.sin(declination*DEG),b=Math.cos(latitude*DEG)*Math.cos(declination*DEG);
  if(Math.abs(b)<1e-12)return a>0?24:0;
  const cosine=-a/b;
  if(cosine<=-1)return 24;if(cosine>=1)return 0;
  return 24*Math.acos(cosine)/Math.PI;
}

// Longitude converts the illustrative Greenwich solar hour to local solar time;
// it is deliberately not a civil-time-zone or real-date sunrise calculation.
export function locationSolarStatus(latitude,longitude,declination,hour){
  if(![latitude,longitude,declination,hour].every(Number.isFinite)||Math.abs(latitude)>90||Math.abs(longitude)>180||Math.abs(declination)>90)return null;
  const localSolarHour=wrap(hour+longitude/15,24),daylight=daylightHours(latitude,declination);
  const incidence=Math.sin(latitude*DEG)*Math.sin(declination*DEG)+Math.cos(latitude*DEG)*Math.cos(declination*DEG)*Math.cos((localSolarHour-12)*Math.PI/12);
  const altitude=Math.asin(Math.max(-1,Math.min(1,incidence)))/DEG;
  const polar=daylight>=24-1e-8?'day':daylight<=1e-8?'night':null;
  return {localSolarHour,daylightHours:daylight,sunrise:polar?null:12-daylight/2,sunset:polar?null:12+daylight/2,polar,altitude,dayState:Math.abs(altitude)<.25?'terminator':altitude>0?'day':'night'};
}

export function createEarthMaterial({THREE,textures,sunDirection}){
  const direction=sunDirection||new THREE.Vector3().copy(seasonalSunDirection());direction.normalize();
  const nightImage=textures['earth-night.jpg']?.image;
  return new THREE.ShaderMaterial({
    name:'Earth unified daylight and city lights',
    uniforms:{dayMap:{value:textures['earth-day.jpg']},nightMap:{value:textures['earth-night.jpg']},sunDirection:{value:direction},geographicLight:{value:0},
      natureStyle:{value:0},natureSunDirection:{value:direction.clone()},
      nightTexel:{value:new THREE.Vector2(1/(nightImage?.width||4096),1/(nightImage?.height||2048))},
      cityLightTime:{value:0},cityLightEffect:{value:0},cityLightMotion:{value:0},cityLightHalo:{value:0}},
    vertexShader:`
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec2 vUv;varying vec3 vNormal;varying vec3 vWorld;
      void main(){vUv=uv;vNormal=normalize(mat3(modelMatrix)*normal);vec4 p=modelMatrix*vec4(position,1.);vWorld=p.xyz;gl_Position=projectionMatrix*viewMatrix*p;
      #include <logdepthbuf_vertex>
      }`,
    fragmentShader:`
      #include <logdepthbuf_pars_fragment>
      uniform sampler2D dayMap;uniform sampler2D nightMap;uniform vec3 sunDirection;uniform float geographicLight;
      uniform float natureStyle;uniform vec3 natureSunDirection;
      uniform vec2 nightTexel;uniform float cityLightTime,cityLightEffect,cityLightMotion,cityLightHalo;
      varying vec2 vUv;varying vec3 vNormal;varying vec3 vWorld;
      float citySeed(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      vec3 nightSample(vec2 uv){return texture2D(nightMap,vec2(fract(uv.x),clamp(uv.y,0.,1.))).rgb;}
      void main(){
      #include <logdepthbuf_fragment>
      vec3 n=normalize(vNormal),s=normalize(sunDirection),v=normalize(cameraPosition-vWorld);
      // Nature simulations use a deliberately illustrative dusk light, stored in
      // world space. The seasonal Sun uniform and teaching geometry stay intact.
      float nature=clamp(natureStyle,0.,1.)*(1.-clamp(geographicLight,0.,1.));
      if(nature>.001){vec3 dusk=mix(s,normalize(natureSunDirection),nature);s=dusk/max(length(dusk),.0001);}
      float incidence=dot(n,s),daylight=smoothstep(-.075,.15,incidence);
      vec3 day=texture2D(dayMap,vUv).rgb,night=texture2D(nightMap,vUv).rgb;
      vec3 col=day*(.055+.98*max(incidence,0.))*daylight+day*.019*(1.-daylight);
      // A restrained blue night floor keeps coastlines and weather legible on
      // the unlit side without replacing the existing surface texture.
      vec3 nightSurface=day*vec3(.10,.16,.29)+vec3(.003,.008,.022);
      vec3 natureSurface=day*(.12+.9*max(incidence,0.))*daylight+nightSurface*(1.-daylight);
      col=mix(col,natureSurface,nature);
      float nightMask=1.-smoothstep(-.1,.1,incidence);
      vec3 city=night*2.2;
      if(cityLightEffect>.001&&geographicLight<.999&&nightMask>.001){
        // Artistic shimmer stays on the light-map pixels, anchored to the surface.
        // Small city clusters have independent phases. A clear dim-to-bright
        // range survives tone mapping; faint texture pixels shimmer as well.
        vec2 cell=floor(vUv*vec2(512.,256.));
        float seed=citySeed(cell),other=citySeed(cell+vec2(41.,73.));
        float glimmer=pow(.5+.5*sin(cityLightTime*(2.1+seed*1.7)+other*6.2831853),5.);
        float wave=.5+.5*sin(cityLightTime*(3.4+other*1.8)+seed*6.2831853);
        float twinkle=mix(1.,.12+.38*wave+3.2*glimmer,cityLightMotion);
        float lightLevel=max(night.r,max(night.g,night.b));
        float cityMask=smoothstep(.004,.06,lightLevel);
        vec3 illuminated=night*2.9*mix(1.,twinkle,cityMask);
        // Four local taps add a small warm halo without a full-screen bloom pass.
        // Flowing clouds above this layer continue to soften the city lights.
        if(cityLightHalo>.001){
          vec2 spread=nightTexel*3.;
          vec3 halo=(nightSample(vUv+vec2(spread.x,0.))+nightSample(vUv-vec2(spread.x,0.))
            +nightSample(vUv+vec2(0.,spread.y))+nightSample(vUv-vec2(0.,spread.y)))*.25;
          float bright=smoothstep(.025,.2,max(halo.r,max(halo.g,halo.b)));
          float haloPulse=mix(.65,.12+1.45*glimmer,cityLightMotion);
          illuminated+=halo*vec3(1.,.92,.74)*bright*haloPulse*cityLightHalo;
        }
        city=mix(city,illuminated,cityLightEffect);
      }
      if(nature>.001){
        // Surface-anchored warm lights with a compact halo; no extra render pass.
        vec2 spread=nightTexel*2.;
        vec3 cityHalo=(nightSample(vUv+vec2(spread.x,0.))+nightSample(vUv-vec2(spread.x,0.))
          +nightSample(vUv+vec2(0.,spread.y))+nightSample(vUv-vec2(0.,spread.y)))*.25;
        float haloMask=smoothstep(.025,.18,max(cityHalo.r,max(cityHalo.g,cityHalo.b)));
        vec3 warmCity=city*vec3(1.17,1.09,.88)+cityHalo*vec3(.65,.52,.3)*haloMask;
        city=mix(city,warmCity,nature);
      }
      col+=city*nightMask;
      // Restrained artistic ocean sheen inferred from blue texture pixels, not a scientific water mask.
      float blueWater=smoothstep(.012,.075,day.b-max(day.r,day.g));
      vec3 halfVector=(s+v)/max(length(s+v),.0001);
      float glint=pow(max(dot(n,halfVector),0.),88.);
      col+=vec3(.8,.91,1.)*blueWater*glint*.17*max(incidence,0.);
      float fresnel=pow(1.-max(dot(n,v),0.),4.8);
      vec3 surfaceRim=vec3(.025,.1,.22)*fresnel*(.08+.58*daylight);
      vec3 natureRim=vec3(.025,.17,.45)*fresnel*(.45+.55*daylight);
      col+=mix(surfaceRim,natureRim,nature);
      float twilight=(1.-smoothstep(0.,.16,abs(incidence)))*daylight;
      col+=vec3(.06,.018,.004)*twilight*.22;
      // A camera-facing reading light for the geographic view only. It leaves
      // the Sun direction, rotation and seasonal teaching geometry untouched.
      // At 1, show the day map without city lights; at 0, preserve the original sky view.
      vec3 geography=day*(.42+.36*max(dot(n,v),0.));
      col=mix(col,geography,clamp(geographicLight,0.,1.));
      gl_FragColor=vec4(col,1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      }`
  });
}

// City lights use their own foreground clock, independent of orbital pause and
// speed. Hidden pages sleep in the shared scheduler; there is no extra timer.
export function updateCityLights(material,delta,{enabled=false,reducedMotion=false,quality='auto',compact=false}={}){
  const uniforms=material.uniforms;
  uniforms.cityLightEffect.value=enabled?1:0;
  uniforms.cityLightMotion.value=enabled&&!reducedMotion?1:0;
  uniforms.cityLightHalo.value=enabled&&quality!=='low'?(compact?.55:1):0;
  if(enabled&&!reducedMotion&&Number.isFinite(delta)&&delta>0)uniforms.cityLightTime.value+=delta;
}

export function createAtmosphere({THREE,radius,sunDirection}){
  const direction=sunDirection||new THREE.Vector3().copy(seasonalSunDirection());
  const material=new THREE.ShaderMaterial({
    name:'Thin sunlit atmosphere',uniforms:{sunDirection:{value:direction},natureStyle:{value:0},natureSunDirection:{value:direction.clone().normalize()}},
    vertexShader:`
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec3 vNormal;varying vec3 vWorld;
      void main(){vNormal=normalize(mat3(modelMatrix)*normal);vec4 p=modelMatrix*vec4(position,1.);vWorld=p.xyz;gl_Position=projectionMatrix*viewMatrix*p;
      #include <logdepthbuf_vertex>
      }`,
    fragmentShader:`
      #include <logdepthbuf_pars_fragment>
      uniform vec3 sunDirection;uniform float natureStyle;uniform vec3 natureSunDirection;varying vec3 vNormal;varying vec3 vWorld;
      void main(){
      #include <logdepthbuf_fragment>
      vec3 n=normalize(vNormal);float nature=clamp(natureStyle,0.,1.);
      float incidence=mix(dot(n,normalize(sunDirection)),dot(n,normalize(natureSunDirection)),nature);
      float rim=pow(1.-abs(dot(n,normalize(cameraPosition-vWorld))),4.8);
      float sunlit=smoothstep(-.23,.5,incidence);
      vec3 col=mix(vec3(.07,.15,.29),vec3(.09,.36,.8),sunlit);
      // Keep the same thin shell and edge falloff, but let the blue night limb
      // remain visible behind simulated cloud bands and storms.
      col=mix(col,mix(vec3(.045,.24,.72),vec3(.1,.43,1.),sunlit),nature);
      float opacity=mix(.055+.51*sunlit,.24+.42*sunlit,nature);
      gl_FragColor=vec4(col,rim*opacity);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      }`,
    transparent:true,side:THREE.BackSide,blending:THREE.AdditiveBlending,depthWrite:false
  });
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(radius*1.018,64,40),material);
  mesh.name='earth-thin-atmosphere';return mesh;
}

const hoursLabel=value=>{
  const minutes=Math.floor(wrap(value,24)*60+1e-6);
  return `${String(Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;
};
const degreeLabel=value=>Math.abs(value)<.05?'赤道':`${Math.abs(value).toFixed(1)}°${value>0?'N':'S'}`;

export function createEarthEnvironment({THREE,earth,clouds,sunlight,root,onChange=()=>{},onVisibilityChange=()=>{},onLocationFocus=()=>{},onOpenPlaces=null}){
  if(!THREE||!earth||!clouds||!sunlight||!root)throw new Error('Earth environment needs an Earth scene and sunlight');
  let visible=false,disposed=false,seasonId='spring',rotationOffset=0,elapsed=0,showGuides=true,lastMinute=-1,selectedLocation=null;
  const sunDirection=earth.material.uniforms.sunDirection.value;
  const radius=earth.geometry.parameters.radius||3;
  const guides=new THREE.Group();guides.name='earth-environment-guides';guides.visible=false;root.add(guides);
  function line(points,color,opacity=.6){
    const object=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color,transparent:true,opacity,depthWrite:false,depthTest:true}));
    guides.add(object);return object;
  }
  const circlePoints=[];for(let i=0;i<=192;i++){const a=i/192*TAU;circlePoints.push(new THREE.Vector3(Math.cos(a)*radius*1.007,0,Math.sin(a)*radius*1.007));}
  const equator=line(circlePoints,0x71c7e7,.32);equator.name='earth-equator';
  const terminator=line(circlePoints,0xffd69b,.75);terminator.name='earth-terminator';
  const axis=line([new THREE.Vector3(0,-radius*1.25,0),new THREE.Vector3(0,radius*1.25,0)],0x95dcf7,.75);axis.name='earth-polar-axis';
  const north=new THREE.Mesh(new THREE.ConeGeometry(radius*.022,radius*.1,12),new THREE.MeshBasicMaterial({color:0x95dcf7}));north.position.y=radius*1.28;guides.add(north);
  const sunArrow=new THREE.ArrowHelper(sunDirection.clone().negate(),sunDirection.clone().multiplyScalar(radius*1.85),radius*.65,0xffd69b,radius*.11,radius*.05);guides.add(sunArrow);
  sunArrow.line.material.transparent=true;sunArrow.line.material.opacity=.8;
  sunArrow.cone.material.transparent=true;sunArrow.cone.material.opacity=.8;
  const panel=document.createElement('section');panel.className='earth-environment-panel';panel.id='earth-environment-panel';panel.hidden=true;
  panel.setAttribute('aria-labelledby','earth-environment-title');
  panel.innerHTML=`<header class="earth-environment-header"><div><span class="earth-environment-kicker">SUNLIGHT & SEASONS</span><h2 id="earth-environment-title">昼夜与四季</h2></div><button type="button" class="earth-environment-close" aria-label="关闭昼夜与四季">×</button></header>
    <div class="earth-environment-body">
      <p class="earth-environment-intro">转动地球看昼夜，切换节气看所选地点的白昼变化。</p>
      <div class="earth-season-tabs" role="tablist" aria-label="四季光照示意">${SEASONS.map(s=>`<button type="button" role="tab" id="earth-season-${s.id}" data-season="${s.id}" aria-controls="earth-season-detail"><strong>${s.name}</strong><small>${s.month}</small></button>`).join('')}</div>
      <div id="earth-season-detail" role="tabpanel" tabindex="0"><div class="earth-season-hemispheres"><span data-hemisphere="north"></span><span data-hemisphere="south"></span></div><p class="earth-season-description"></p></div>
      <section class="earth-season-place" aria-label="所选地点的昼夜与四季" hidden>
        <div class="earth-season-place-heading"><div><span>已选地点</span><h3 data-place-season="name"></h3><small data-place-season="coordinates"></small></div><button type="button" class="earth-place-refocus">对准并锁定</button></div>
        <button type="button" class="earth-place-open-weather earth-season-navigation">地点与天气 ↗</button>
        <div class="earth-place-solar-clock"><span>当地太阳时示意<strong data-place-season="time"></strong></span><span class="earth-place-daystate" data-place-season="state"></span></div>
        <div class="earth-place-day-stats"><div><span>白昼约</span><strong data-place-season="daylight"></strong></div><div><span>日出 / 日落 · 太阳时</span><strong data-place-season="rise-set"></strong></div></div>
        <div class="earth-place-time-jumps" aria-label="观察地点在一天中的光照"><button type="button" data-place-hour="sunrise">观察日出</button><button type="button" data-place-hour="noon">当地正午</button><button type="button" data-place-hour="sunset">观察日落</button></div>
        <details class="earth-place-season-comparison"><summary>比较这个地点的四季白昼</summary><div>${SEASONS.map(s=>`<div data-season-comparison="${s.id}"><span>${s.name}</span><strong data-season-hours="${s.id}"></strong></div>`).join('')}</div></details>
        <p class="earth-place-solar-note">太阳时由经度换算，与当地时区钟表可能不同；下方时刻与四季仅用于光照示意。</p>
      </section>
      <div class="earth-season-place-empty"><p>在「感知地球」搜索地点，或直接点击地表选点，便可查看该地的四季白昼。</p><button type="button" class="earth-season-choose-place earth-season-navigation">选择地点 ↗</button></div>
      <div class="earth-time-heading"><label for="earth-sun-hour">UTC 示意时刻</label><output id="earth-sun-hour-value" for="earth-sun-hour">00:00</output></div>
      <input id="earth-sun-hour" class="earth-time-range" type="range" min="0" max="23.9166666667" step="0.0833333333" value="0" aria-describedby="earth-time-help">
      <div class="earth-time-ticks" aria-hidden="true"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div>
      <p id="earth-time-help" class="earth-time-help">拖动改变昼夜；动画由页面的暂停与倍速控制。此处不读取实时时间。</p>
      <div class="earth-environment-stat"><span>太阳直射纬度</span><strong data-environment-stat="latitude"></strong></div>
      <div class="earth-daylength"><div><span>示例：北京 · 白昼约</span><strong data-daylength="beijing"></strong></div><div><span>示例：悉尼 · 白昼约</span><strong data-daylength="sydney"></strong></div></div>
      <label class="earth-guides-toggle"><input type="checkbox" id="earth-environment-guides" checked><span>显示地轴、赤道与晨昏线</span></label>
      <div class="earth-environment-legend"><span class="earth-axis-key">地轴 / 赤道</span><span class="earth-sun-key">太阳光 / 晨昏线</span></div>
      <details class="earth-environment-note"><summary>为什么会有四季？</summary><p>地轴相对公转平面的法线倾斜约 23.4°。一年中，太阳直射点在南北回归线之间变化，南北半球季节相反。本图固定地轴朝上，以改变太阳光方向表达同一几何关系。</p><p>时刻、光照和白昼长度用于示意：采用圆球与平行光，不含大气折射、太阳视直径或均时差。日夜贴图和海面反光不代表实时观测。</p><span class="earth-environment-source">NASA · 四季成因</span></details>
    </div>`;
  document.body.append(panel);
  const get=s=>panel.querySelector(s),slider=get('#earth-sun-hour'),output=get('#earth-sun-hour-value'),tabs=[...panel.querySelectorAll('[data-season]')];
  const currentSeason=()=>SEASONS.find(s=>s.id===seasonId);
  const getLocationSolar=()=>selectedLocation?locationSolarStatus(selectedLocation.lat,selectedLocation.lon,currentSeason().declination,hourAtRotation(earth.rotation.y)):null;
  const placeLabel=(value,positive,negative)=>`${Math.abs(value).toFixed(2)}°${value<0?negative:positive}`;
  const daylightLabel=value=>value>=24-1e-8?'24 小时 · 极昼':value<=1e-8?'0 小时 · 极夜':`${value.toFixed(1)} 小时`;
  function updateLocation(){
    const location=selectedLocation,solar=getLocationSolar();
    get('.earth-season-place').hidden=!location;get('.earth-season-place-empty').hidden=Boolean(location);get('.earth-daylength').hidden=Boolean(location);
    panel.dataset.location=location?.id||'';
    if(!location||!solar)return;
    get('[data-place-season="name"]').textContent=location.name;
    get('[data-place-season="coordinates"]').textContent=`${placeLabel(location.lat,'N','S')} · ${placeLabel(location.lon,'E','W')}`;
    get('[data-place-season="time"]').textContent=hoursLabel(solar.localSolarHour);
    get('[data-place-season="state"]').textContent=solar.polar==='day'?'极昼':solar.polar==='night'?'极夜':solar.dayState==='terminator'?'晨昏附近':solar.dayState==='day'?'昼间':'夜间';
    get('[data-place-season="state"]').dataset.state=solar.dayState;
    get('[data-place-season="daylight"]').textContent=daylightLabel(solar.daylightHours);
    get('[data-place-season="rise-set"]').textContent=solar.polar==='day'?'太阳全天不落':solar.polar==='night'?'太阳全天不升':`${hoursLabel(solar.sunrise)} / ${hoursLabel(solar.sunset)}`;
    get('[data-place-hour="sunrise"]').disabled=Boolean(solar.polar);get('[data-place-hour="sunset"]').disabled=Boolean(solar.polar);
    for(const season of SEASONS){
      get(`[data-season-hours="${season.id}"]`).textContent=daylightLabel(daylightHours(location.lat,season.declination));
      get(`[data-season-comparison="${season.id}"]`).classList.toggle('is-current',season.id===seasonId);
    }
  }
  function setLocation(place){
    if(disposed)return false;
    if(place===null||place===undefined)selectedLocation=null;
    else{
      if(!Number.isFinite(place.lat)||!Number.isFinite(place.lon)||Math.abs(place.lat)>90||Math.abs(place.lon)>180)return false;
      selectedLocation={id:String(place.id||`surface-${place.lat.toFixed(5)}-${place.lon.toFixed(5)}`),name:String(place.name||'地表选点'),lat:place.lat,lon:place.lon};
    }
    updateLocation();onChange();return true;
  }
  function updateClock(force=false){
    const hour=hourAtRotation(earth.rotation.y),minute=Math.floor(hour*60);
    if(!visible&&!force)return;
    if(minute!==lastMinute||force){
      lastMinute=minute;output.value=hoursLabel(hour);output.textContent=hoursLabel(hour);
      slider.value=String(hour);
      slider.setAttribute('aria-valuetext',`${hoursLabel(hour)} UTC，示意时刻`);slider.style.setProperty('--day-progress',`${hour/24*100}%`);
      updateLocation();
    }
  }
  function updateSeason(){
    const s=currentSeason();sunDirection.copy(seasonalSunDirection(s.declination)).normalize();
    sunlight.position.copy(sunDirection).multiplyScalar(18);sunlight.color.set(0xfff5e9);sunlight.intensity=2.1;
    terminator.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),sunDirection);
    sunArrow.position.copy(sunDirection).multiplyScalar(radius*1.85);sunArrow.setDirection(sunDirection.clone().negate());
    tabs.forEach(tab=>{const active=tab.dataset.season===seasonId;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;});
    get('#earth-season-detail').setAttribute('aria-labelledby',`earth-season-${seasonId}`);
    get('[data-hemisphere="north"]').textContent=s.north;get('[data-hemisphere="south"]').textContent=s.south;
    get('.earth-season-description').textContent=s.description;get('[data-environment-stat="latitude"]').textContent=degreeLabel(s.declination);
    get('[data-daylength="beijing"]').textContent=`${daylightHours(39.9042,s.declination).toFixed(1)} 小时`;
    get('[data-daylength="sydney"]').textContent=`${daylightHours(-33.8688,s.declination).toFixed(1)} 小时`;
    panel.dataset.season=seasonId;updateLocation();
  }
  function update(time){
    if(disposed||!Number.isFinite(time))return;
    elapsed=time;earth.rotation.y=EARTH_INITIAL_ROTATION+elapsed*EARTH_DAY_RATE+rotationOffset;
    clouds.rotation.y=earth.rotation.y+elapsed*.003;
    guides.visible=visible&&showGuides;updateClock();
  }
  function setSeason(id){if(disposed||!SEASONS.some(s=>s.id===id))return false;seasonId=id;updateSeason();onChange();return true;}
  function setHour(hour){
    if(disposed||!Number.isFinite(Number(hour)))return false;
    const desired=rotationAtHour(Number(hour)),current=earth.rotation.y;
    const delta=wrap(desired-current+Math.PI,TAU)-Math.PI;
    rotationOffset+=delta;update(elapsed);updateClock(true);onChange();return true;
  }
  function setVisible(next){
    if(disposed)return;next=Boolean(next);if(next===visible)return;
    visible=next;panel.hidden=!visible;document.body.classList.toggle('earth-environment-active',visible);guides.visible=visible&&showGuides;
    if(visible)updateClock(true);onVisibilityChange(visible);if(visible)get('.earth-environment-close').focus({preventScroll:true});onChange();
  }
  get('.earth-environment-close').addEventListener('click',()=>{setVisible(false);document.getElementById('open-earth-environment')?.focus();});
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>setSeason(tab.dataset.season));
    tab.addEventListener('keydown',event=>{let next=index;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();tabs[next].focus();setSeason(tabs[next].dataset.season);});
  });
  slider.addEventListener('input',()=>setHour(Number(slider.value)));
  get('.earth-place-refocus').addEventListener('click',()=>{if(selectedLocation)onLocationFocus({...selectedLocation});});
  for(const selector of ['.earth-place-open-weather','.earth-season-choose-place']){
    const button=get(selector);button.hidden=typeof onOpenPlaces!=='function';
    if(!button.hidden)button.addEventListener('click',()=>onOpenPlaces());
  }
  for(const target of ['sunrise','noon','sunset'])get(`[data-place-hour="${target}"]`).addEventListener('click',()=>{
    const solar=getLocationSolar();if(!selectedLocation||!solar)return;
    const localHour=target==='noon'?12:solar[target];if(localHour===null)return;
    setHour(localHour-selectedLocation.lon/15);
  });
  get('#earth-environment-guides').addEventListener('change',event=>{showGuides=event.target.checked;guides.visible=visible&&showGuides;onChange();});
  const onKeydown=event=>{if(visible&&event.key==='Escape'){setVisible(false);document.getElementById('open-earth-environment')?.focus();}};
  panel.addEventListener('keydown',onKeydown);updateSeason();update(0);
  return {
    setVisible,isVisible:()=>visible,update,setSeason,setHour,setLocation,getSelectedLocation:()=>selectedLocation?{...selectedLocation}:null,
    getStatus:()=>({visible,season:seasonId,declination:currentSeason().declination,hour:hourAtRotation(earth.rotation.y),rotation:earth.rotation.y,rotationOffset,showGuides,sunDirection:sunDirection.toArray(),selectedLocation:selectedLocation?{...selectedLocation}:null,locationSolar:getLocationSolar(),illustrative:true}),
    capturePreferences:()=>({season:seasonId,rotationOffset,showGuides,visible}),
    restorePreferences(value={}){if(SEASONS.some(s=>s.id===value.season))seasonId=value.season;if(Number.isFinite(value.rotationOffset))rotationOffset=value.rotationOffset;if(typeof value.showGuides==='boolean')showGuides=value.showGuides;get('#earth-environment-guides').checked=showGuides;updateSeason();update(elapsed);if(typeof value.visible==='boolean')setVisible(value.visible);onChange();},
    dispose(){if(disposed)return;setVisible(false);disposed=true;panel.remove();guides.traverse(object=>{object.geometry?.dispose();if(object.material)(Array.isArray(object.material)?object.material:[object.material]).forEach(material=>material.dispose());});root.remove(guides);}
  };
}
