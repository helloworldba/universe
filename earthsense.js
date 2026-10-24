// Optional public-data overlay. The local universe remains usable without these APIs.
import {EARTH_PLACES,FEATURED_EARTH_PLACES,EARTH_PLACE_GROUPS,EARTH_PLACE_CONTINENTS,earthPlaceGroup,filterEarthPlaces,parseEarthCoordinates} from './earth-places.js';
import {EARTH_CONTINENTS,getContinent,CONTINENT_DATA_NOTE} from './earth-continents.js';
import {createEarthNatureEffects} from './earth-nature-effects.js';
import {createEarthSurfaceLabels} from './earth-surface-labels.js';
const CYCLONE_DEMOS=Object.freeze([
  {id:'demo-northwest-pacific',name:'北半球 · 西北太平洋',lat:19,lon:137},
  {id:'demo-south-indian',name:'南半球 · 南印度洋',lat:-19,lon:78}
]);
const WIND_REGIONS=Object.freeze([
  {id:'wind-trades',name:'信风带',lat:18,lon:125},
  {id:'wind-westerlies',name:'中纬度西风带',lat:45,lon:130},
  {id:'wind-polar',name:'极地东风带',lat:70,lon:105}
]);
const NATURE_TABS=['lightning','typhoons','cyclone-demo','wind'];
const CITIES = Object.freeze([
  {id:'beijing',name:'北京',region:'中国',lat:39.9042,lon:116.4074},
  {id:'tokyo',name:'东京',region:'日本',lat:35.6762,lon:139.6503},
  {id:'singapore',name:'新加坡',region:'新加坡',lat:1.3521,lon:103.8198},
  {id:'sydney',name:'悉尼',region:'澳大利亚',lat:-33.8688,lon:151.2093},
  {id:'london',name:'伦敦',region:'英国',lat:51.5074,lon:-.1278},
  {id:'newyork',name:'纽约',region:'美国',lat:40.7128,lon:-74.006},
  {id:'riodejaneiro',name:'里约热内卢',region:'巴西',lat:-22.9068,lon:-43.1729},
  {id:'capetown',name:'开普敦',region:'南非',lat:-33.9249,lon:18.4241}
]);
const LIGHTNING_REGIONS = Object.freeze([
  {id:'amazon',name:'亚马孙流域',lat:-3,lon:-60},
  {id:'congo',name:'刚果盆地',lat:-1,lon:24},
  {id:'maracaibo',name:'马拉开波湖附近',lat:9.8,lon:-71.6},
  {id:'indonesia',name:'印度尼西亚群岛',lat:-2,lon:118},
  {id:'southchina',name:'中国华南',lat:23,lon:113},
  {id:'florida',name:'佛罗里达半岛',lat:28,lon:-82}
]);
const SOURCE_URLS = {weather:'https://open-meteo.com/',typhoons:'https://eonet.gsfc.nasa.gov/'};
const WEATHER_NAMES = {
  0:'晴',1:'大部晴朗',2:'局部多云',3:'阴',45:'雾',48:'雾凇',
  51:'小毛毛雨',53:'毛毛雨',55:'强毛毛雨',56:'冻毛毛雨',57:'强冻毛毛雨',
  61:'小雨',63:'中雨',65:'大雨',66:'冻雨',67:'强冻雨',71:'小雪',73:'中雪',75:'大雪',77:'雪粒',
  80:'小阵雨',81:'阵雨',82:'强阵雨',85:'阵雪',86:'强阵雪',95:'雷暴',96:'雷暴伴冰雹',99:'强雷暴伴冰雹'
};
export function weatherDescription(code){return WEATHER_NAMES[code] || '天气状态未知';}
const finite = n => typeof n === 'number' && Number.isFinite(n);
const validCoordinates = (lat,lon) => finite(lat) && finite(lon) && Math.abs(lat)<=90 && Math.abs(lon)<=180;

export function parseWeatherData(payload) {
  const records = Array.isArray(payload) ? payload : [payload];
  if(records.length !== CITIES.length) throw new Error('城市数据不完整');
  const rows = CITIES.map((city,index)=>{
    const current = records[index]?.current;
    if(!current || !finite(current.temperature_2m) || !finite(current.time)) return {...city,available:false};
    return {...city,available:true,temperature:current.temperature_2m,
      wind:finite(current.wind_speed_10m)?current.wind_speed_10m:null,
      code:current.weather_code,time:current.time*1000};
  });
  if(!rows.some(row=>row.available)) throw new Error('服务未返回有效天气');
  return rows;
}

// Current conditions are model estimates for the selected coordinates, independent
// of the teaching clock. Unix time is UTC; the returned IANA zone supplies local time.
export function selectedWeatherUrl(location){
  if(!validCoordinates(location?.lat,location?.lon))throw new Error('地点坐标无效');
  const parameters=new URLSearchParams({latitude:String(location.lat),longitude:String(location.lon),current:'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,precipitation',temperature_unit:'celsius',wind_speed_unit:'kmh',precipitation_unit:'mm',timeformat:'unixtime',timezone:'auto',forecast_days:'1',cell_selection:'nearest'});
  return `https://api.open-meteo.com/v1/forecast?${parameters}`;
}
export function parseSelectedWeather(payload,location){
  if(!validCoordinates(location?.lat,location?.lon))throw new Error('地点坐标无效');
  const record=Array.isArray(payload)&&payload.length===1?payload[0]:payload,current=record?.current;
  if(!current || !finite(current.temperature_2m) || !finite(current.time) || !Number.isFinite(new Date(current.time*1000).getTime()))throw new Error('服务未返回有效天气');
  return {...location,available:true,temperature:current.temperature_2m,
    apparent:finite(current.apparent_temperature)?current.apparent_temperature:null,
    humidity:finite(current.relative_humidity_2m)?current.relative_humidity_2m:null,
    wind:finite(current.wind_speed_10m)?current.wind_speed_10m:null,
    precipitation:finite(current.precipitation)?current.precipitation:null,
    code:current.weather_code,time:current.time*1000,
    timezone:typeof record.timezone==='string'?record.timezone:'UTC',
    utcOffsetSeconds:finite(record.utc_offset_seconds)?record.utc_offset_seconds:0};
}
export function formatWeatherTime(weather){
  const options={month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'};
  try{return `${new Intl.DateTimeFormat('zh-CN',{...options,timeZone:weather.timezone}).format(new Date(weather.time))} · ${weather.timezone}`;}
  catch{
    const offset=finite(weather.utcOffsetSeconds)?weather.utcOffsetSeconds:0;
    const hours=Math.floor(Math.abs(offset)/3600),minutes=Math.floor(Math.abs(offset)%3600/60);
    return `${new Intl.DateTimeFormat('zh-CN',{...options,timeZone:'UTC'}).format(new Date(weather.time+offset*1000))} · UTC${offset>=0?'+':'−'}${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}`;
  }
}

export function parseStormData(payload) {
  if(!Array.isArray(payload?.events)) throw new Error('风暴数据格式无效');
  return payload.events.filter(event=>
    event && event.closed == null && /typhoon|hurricane|tropical|cyclone/i.test(String(event.title || '')) &&
    event.categories?.some(category=>category.id==='severeStorms')
  ).map(event=>{
    const points = (Array.isArray(event.geometry)?event.geometry:[]).filter(geometry=>
      geometry.type==='Point' && Array.isArray(geometry.coordinates) &&
      validCoordinates(geometry.coordinates[1],geometry.coordinates[0]) && Number.isFinite(Date.parse(geometry.date))
    ).map(geometry=>({lat:geometry.coordinates[1],lon:geometry.coordinates[0],time:Date.parse(geometry.date)}))
      .sort((a,b)=>a.time-b.time);
    const latest = points.at(-1);
    if(!latest) return null;
    let source = SOURCE_URLS.typhoons;
    for(const candidate of [...(event.sources || []).map(item=>item.url),event.link]){
      try { const url = new URL(candidate); if(url.protocol==='https:'){source=url.href;break;} } catch {}
    }
    return {id:String(event.id || event.title),name:String(event.title),...latest,points,source};
  }).filter(Boolean).sort((a,b)=>b.time-a.time);
}

function formatTime(time){
  return new Intl.DateTimeFormat('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'UTC'}).format(new Date(time))+' UTC';
}
function coordinatesLabel(lat,lon){return `${Math.abs(lat).toFixed(1)}°${lat>=0?'N':'S'} · ${Math.abs(lon).toFixed(1)}°${lon>=0?'E':'W'}`;}
function createElement(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;}

export function createEarthSense({THREE,earth,root,onFocus=()=>{},onLockChange=()=>{},onSelectionChange=()=>{},onOpenEnvironment=()=>{},onContinentSelect=()=>{},onContinentVisibilityChange=()=>{},toast=()=>{}}) {
  if(!THREE || !earth || !root) throw new Error('EarthSense requires the Earth scene');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reducedMotion = motionPreference.matches;
  const natureEffects=createEarthNatureEffects({THREE,earth,reducedMotion});
  let visible=false,linkedViewVisible=false,geographyVisible=false,labelsVisible=true,activeTab='places',selectedId='',selectedPlace=null,lockedLocation=null,gridEnabled=false,surfacePicking=true,simulationTime=0,previousFocus=null,disposed=false;
  let continentId='asia',continentLayerVisible=false;
  const states={weather:{status:'idle',rows:[],fetchedAt:0,message:'',locationKey:''},typhoons:{status:'idle',rows:[],fetchedAt:0,message:''}};
  const requests={weather:{sequence:0,controller:null},typhoons:{sequence:0,controller:null}};
  const markerRoot = new THREE.Group();markerRoot.name='earthsense-markers';markerRoot.visible=false;earth.add(markerRoot);
  const gridRoot=new THREE.Group();gridRoot.name='earthsense-grid';gridRoot.visible=false;earth.add(gridRoot);
  const markerGeometries = {dot:new THREE.SphereGeometry(.043,10,8),ring:new THREE.RingGeometry(.08,.105,28),selection:new THREE.RingGeometry(.165,.181,56),cloudSelection:new THREE.RingGeometry(.515,.532,72)};
  // A dedicated marker lets the seasons lesson keep one location visible without
  // exposing the search results or weather-layer markers in the hidden panel.
  const linkedMarker=new THREE.Group();linkedMarker.name='earthsense-linked-location';linkedMarker.visible=false;linkedMarker.scale.setScalar(1.5);earth.add(linkedMarker);
  linkedMarker.add(new THREE.Mesh(markerGeometries.dot,new THREE.MeshBasicMaterial({color:0xffd396,transparent:true,opacity:.98,depthWrite:false,depthTest:true})),new THREE.Mesh(markerGeometries.ring,new THREE.MeshBasicMaterial({color:0xffd396,transparent:true,opacity:.72,side:THREE.DoubleSide,depthWrite:false,depthTest:true})));
  const markers=[];
  const expandedPlaceGroups=new Set();
  const panel=createElement('section','earthsense-panel');panel.id='earthsense-panel';panel.hidden=true;
  panel.setAttribute('aria-labelledby','earthsense-title');
  panel.innerHTML=`<header class="earthsense-header"><div><span class="earthsense-kicker">OUR LIVING PLANET</span><h2 id="earthsense-title">感知地球</h2></div><button class="earthsense-close" type="button" aria-label="关闭感知地球">×</button></header>
    <div class="earthsense-tabs" role="tablist" aria-label="地球数据图层">
      <button type="button" id="earthsense-tab-places" role="tab" data-earthsense-tab="places" aria-controls="earthsense-content">地点</button>
      <button type="button" id="earthsense-tab-continents" role="tab" data-earthsense-tab="continents" aria-controls="earthsense-content">大洲</button>
      <button type="button" id="earthsense-tab-weather" role="tab" data-earthsense-tab="weather" aria-controls="earthsense-content">天气</button>
      <button type="button" id="earthsense-tab-lightning" role="tab" data-earthsense-tab="lightning" aria-controls="earthsense-content">闪电 <small>模拟</small></button>
      <button type="button" id="earthsense-tab-typhoons" role="tab" data-earthsense-tab="typhoons" aria-controls="earthsense-content">风暴</button>
    </div><div id="earthsense-content" class="earthsense-content" role="tabpanel" tabindex="0">
      <div class="earthsense-toolbar"><span class="earthsense-status" role="status" aria-live="polite"></span><button type="button" class="earthsense-refresh">刷新数据</button></div>
      <p class="earthsense-explanation"></p>
      <div class="earthsense-places-tools">
        <form class="earthsense-place-search" role="search" aria-label="搜索内置地点">
          <label for="earthsense-query">城市、地区、国家、地标或经纬度</label>
          <div class="earthsense-query-wrap"><input id="earthsense-query" type="search" placeholder="北京 / London / 39.9, 116.4" maxlength="120" autocomplete="off" spellcheck="false" aria-describedby="earthsense-coordinate-help"><button type="submit" aria-label="定位首个搜索结果">定位</button></div>
          <p id="earthsense-coordinate-help">坐标按“纬度, 经度”输入；南纬、西经用负数。</p>
        </form>
        <div class="earthsense-region-filter"><label for="earthsense-region">浏览分组</label><select id="earthsense-region" aria-label="按省份或地区筛选地点"></select></div>
        <div class="earthsense-map-tools"><button type="button" class="earthsense-surface-toggle" aria-pressed="true">地表选点 <span>开</span></button><button type="button" class="earthsense-grid-toggle" aria-pressed="false">经纬网 <span>关</span></button></div>
        <p class="earthsense-surface-help">轻点地球表面选取任意位置；拖动只旋转地球。</p>
        <p class="earthsense-place-results" aria-live="polite"></p>
      </div>
      <div class="earthsense-place-selection" hidden>
          <div><span class="earthsense-selection-label">已选地点</span><strong class="earthsense-selected-name"></strong><small class="earthsense-selected-coordinates"></small></div>
          <button type="button" class="earthsense-lock" aria-pressed="false">锁定此地</button>
          <p class="earthsense-lock-help"></p>
          <div class="earthsense-selection-actions"><button type="button" class="earthsense-place-weather">查看此地天气</button><button type="button" class="earthsense-place-seasons">联动四季 →</button></div>
      </div>
      <div class="earthsense-list"></div><p class="earthsense-legend"></p>
    </div><footer class="earthsense-source"></footer>`;
  document.body.append(panel);
  const surfaceLabels=createEarthSurfaceLabels({THREE,earth,onSelect:item=>focusItem(item)});
  const get=selector=>panel.querySelector(selector),list=get('.earthsense-list'),status=get('.earthsense-status'),refreshButton=get('.earthsense-refresh');
  const closeButton=get('.earthsense-close'),tabs=[...panel.querySelectorAll('[role="tab"]')];
  const content=get('.earthsense-content'),explanation=get('.earthsense-explanation'),legend=get('.earthsense-legend'),source=get('.earthsense-source');
  const placeTools=get('.earthsense-places-tools'),queryInput=get('#earthsense-query'),searchForm=get('.earthsense-place-search'),gridButton=get('.earthsense-grid-toggle'),surfaceButton=get('.earthsense-surface-toggle');
  const selectionPanel=get('.earthsense-place-selection'),lockButton=get('.earthsense-lock'),resultsStatus=get('.earthsense-place-results');
  const regionSelect=get('#earthsense-region');
  for(const group of [{id:'all',name:'全部地点',count:EARTH_PLACES.length},{id:'china',name:'中国内地与港澳',count:339},...EARTH_PLACE_GROUPS]){
    const option=createElement('option','',`${group.name} · ${group.count}`);option.value=group.id;regionSelect.append(option);
  }
  regionSelect.value='all';
  function invalidate(){document.dispatchEvent(new CustomEvent('earthsense:invalidate'));}
  function locationValue(item){return item?{id:item.id,name:item.name,lat:item.lat,lon:item.lon,region:item.region||'',kind:item.kind||''}:null;}
  const locationKey=item=>item?`${item.lat},${item.lon}`:'';
  function updateLocationControls(){
    selectionPanel.hidden=!selectedPlace||!['places','weather'].includes(activeTab);
    if(selectedPlace){get('.earthsense-selected-name').textContent=selectedPlace.name;get('.earthsense-selected-coordinates').textContent=`${selectedPlace.region?selectedPlace.region+' · ':''}${coordinatesLabel(selectedPlace.lat,selectedPlace.lon)}`;}
    lockButton.setAttribute('aria-pressed',String(Boolean(lockedLocation)));lockButton.textContent=lockedLocation?'解除锁定':'锁定此地';
    get('.earthsense-selection-label').textContent=lockedLocation?'正在跟随':'已选地点';
    const coordinateNote=EARTH_PLACES.find(place=>place.id===selectedPlace?.id)?.coordinateNote;
    get('.earthsense-lock-help').textContent=(coordinateNote?coordinateNote+' ':'')+(lockedLocation?'镜头随地球自转，保持此地在视野中。拖动地球可解除。':'锁定后，镜头会随地球自转持续观察此地。');
    gridButton.setAttribute('aria-pressed',String(gridEnabled));gridButton.querySelector('span').textContent=gridEnabled?'开':'关';
    surfaceButton.setAttribute('aria-pressed',String(surfacePicking));surfaceButton.querySelector('span').textContent=surfacePicking?'开':'关';
    get('.earthsense-surface-help').textContent=surfacePicking?'轻点地球表面选取任意位置；拖动只旋转地球。':'地表选点已关闭。仍可通过搜索或已有标记选择地点。';
    get('.earthsense-place-weather').hidden=activeTab==='weather';
    updateLinkedMarker();
  }
  function updateLinkedMarker(){
    linkedMarker.visible=linkedViewVisible&&!visible&&Boolean(selectedPlace);
    if(!visible){surfaceLabels.setRecords(linkedMarker.visible?[labelData(selectedPlace,'places')]:[]);surfaceLabels.select(selectedPlace?.id);surfaceLabels.setVisible(linkedMarker.visible);}
    if(!selectedPlace)return;
    linkedMarker.position.copy(pointAt(selectedPlace.lat,selectedPlace.lon));
    linkedMarker.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),linkedMarker.position.clone().normalize());
  }
  function setLinkedViewVisible(value){
    if(disposed)return;
    linkedViewVisible=Boolean(value);updateLinkedMarker();invalidate();
  }
  function setGeographyVisible(value){
    geographyVisible=Boolean(value);gridRoot.visible=geographyVisible&&gridEnabled;
  }
  function setLabelsVisible(value){labelsVisible=Boolean(value);surfaceLabels.setEnabled(labelsVisible);invalidate();}
  // Compatibility with older callers: the global name switch controls text only.
  function setMarkersVisible(value){setLabelsVisible(value);}
  function setGridEnabled(value){
    gridEnabled=Boolean(value);gridRoot.visible=(visible||geographyVisible)&&gridEnabled;updateLocationControls();
    document.dispatchEvent(new CustomEvent('earthsense:change'));invalidate();
  }
  function setLocationLock(item){
    const next=locationValue(item);
    if(next?.id===lockedLocation?.id && locationKey(next)===locationKey(lockedLocation))return;
    lockedLocation=next;updateLocationControls();onLockChange(locationValue(lockedLocation));invalidate();
  }
  function clearLocationLock(){setLocationLock(null);}
  function selectLocation(item,{focus=true,lock}={}){
    if(disposed||!validCoordinates(item?.lat,item?.lon))return false;
    const next={...item,id:String(item.id||`location-${item.lat.toFixed(5)}-${item.lon.toFixed(5)}`),name:['surface','coordinate'].includes(item.kind)?'所选位置':String(item.name||'所选位置')};
    const changed=locationKey(next)!==locationKey(selectedPlace)||next.id!==selectedPlace?.id||next.name!==selectedPlace?.name;
    const shouldLock=lock===undefined?Boolean(lockedLocation):Boolean(lock);
    selectedPlace=next;selectedId=next.id;
    if(locationKey(next)!==states.weather.locationKey){
      cancelRequest('weather');Object.assign(states.weather,{status:'idle',rows:[],fetchedAt:0,message:'',locationKey:locationKey(next)});
    }
    if(changed)onSelectionChange(locationValue(selectedPlace));
    if(visible)render();else updateLocationControls();
    if(focus)onFocus(next.lat,next.lon,next);
    setLocationLock(shouldLock?next:null);
    if(visible&&activeTab==='weather'&&states.weather.status==='idle')load('weather');
    invalidate();return true;
  }
  function pickSurfaceLocation(lat,lon,{force=false}={}){
    if(!visible||!validCoordinates(lat,lon))return false;
    if(force){surfacePicking=true;selectTab('places');}
    if(activeTab!=='places'||!surfacePicking)return false;
    return selectLocation({id:`surface-${lat.toFixed(5)}-${lon.toFixed(5)}`,name:'所选位置',region:'自选坐标',kind:'surface',lat,lon},{focus:false});
  }

  // SphereGeometry's u=0 is longitude -180; east-positive longitude points toward -z.
  function pointAt(lat,lon,radius=3.055){
    const phi=lat*Math.PI/180,theta=lon*Math.PI/180;
    return new THREE.Vector3(Math.cos(phi)*Math.cos(theta),Math.sin(phi),-Math.cos(phi)*Math.sin(theta)).multiplyScalar(radius);
  }
  // Grid shares the Earth's transform, so it remains attached as the globe turns.
  function addGridLine(points,major=false){
    const geometry=new THREE.BufferGeometry().setFromPoints(points);
    const material=new THREE.LineBasicMaterial({color:major?0x80ddff:0x78a8cf,transparent:true,opacity:major?.42:.16,depthTest:true,depthWrite:false});
    gridRoot.add(new THREE.Line(geometry,material));
  }
  for(const lat of [-60,-30,0,30,60])addGridLine(Array.from({length:145},(_,i)=>pointAt(lat,i*2.5-180,3.026)),lat===0);
  for(let lon=0;lon<180;lon+=30){
    const points=Array.from({length:73},(_,i)=>pointAt(i*2.5-90,lon,3.026));
    points.push(...Array.from({length:73},(_,i)=>pointAt(90-i*2.5,lon-180,3.026)));
    addGridLine(points,lon===0);
  }
  function clearMarkers(){
    markerRoot.traverse(object=>{
      if(object.material){const materials=Array.isArray(object.material)?object.material:[object.material];materials.forEach(material=>material.dispose());}
      if(object.geometry && !Object.values(markerGeometries).includes(object.geometry))object.geometry.dispose();
    });
    markerRoot.clear();markers.length=0;
  }
  function addMarker(item,color,index){
    const group=new THREE.Group();group.position.copy(pointAt(item.lat,item.lon));
    group.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),group.position.clone().normalize());
    const dotMaterial=new THREE.MeshBasicMaterial({color,transparent:true,opacity:.95,depthWrite:false,depthTest:true});
    const ringMaterial=new THREE.MeshBasicMaterial({color,transparent:true,opacity:.5,side:THREE.DoubleSide,depthWrite:false,depthTest:true});
    const dot=new THREE.Mesh(markerGeometries.dot,dotMaterial),ring=new THREE.Mesh(markerGeometries.ring,ringMaterial);
    dot.userData.earthSenseId=item.id;ring.userData.earthSenseId=item.id;group.userData.earthSenseId=item.id;
    const selection=new THREE.Mesh(['lightning','cyclone-demo','typhoons'].includes(activeTab)?markerGeometries.cloudSelection:markerGeometries.selection,new THREE.MeshBasicMaterial({color:0xffdf9b,transparent:true,opacity:.9,side:THREE.DoubleSide,depthWrite:false,depthTest:true}));
    selection.visible=false;selection.userData.earthSenseId=item.id;
    group.add(dot,ring,selection);markerRoot.add(group);
    markers.push({id:item.id,item,group,dot,ring,selection,index,lightning:activeTab==='lightning'});
    if(activeTab==='typhoons' && item.points?.length>1){
      const track=[];
      for(let i=1;i<item.points.length;i++){
        const a=pointAt(item.points[i-1].lat,item.points[i-1].lon,1),b=pointAt(item.points[i].lat,item.points[i].lon,1);
        const segments=Math.max(2,Math.ceil(a.angleTo(b)*24));
        for(let k=0;k<=segments;k++)track.push(a.clone().lerp(b,k/segments).normalize().multiplyScalar(3.045));
      }
      const geometry=new THREE.BufferGeometry().setFromPoints(track);
      markerRoot.add(new THREE.Line(geometry,new THREE.LineBasicMaterial({color,transparent:true,opacity:.42,depthWrite:false,depthTest:true})));
    }
  }
  function highlightSelected(){
    natureEffects.setSelected(selectedId);
    surfaceLabels.select(selectedId);
    // Cloud meshes are their own click targets; keep locator dots out of the storm eye.
    const cloudIds=new Set(NATURE_TABS.includes(activeTab)?natureEffects.getPickables().map(mesh=>mesh.userData.earthSenseId):[]);
    markers.forEach(marker=>{
      const selected=marker.id===selectedId;
      marker.dot.scale.setScalar(selected?1.35:1);marker.selection.visible=selected;
      marker.dot.visible=marker.ring.visible=!cloudIds.has(marker.id);
    });
    list.querySelectorAll('.earthsense-row').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.id===selectedId)));
  }
  function labelData(item,tab=activeTab){
    const coordinates=`${Math.abs(item.lat).toFixed(2)}°${item.lat>=0?'N':'S'} · ${Math.abs(item.lon).toFixed(2)}°${item.lon>=0?'E':'W'}`;
    const arbitrary=['surface','coordinate'].includes(item.kind);
    const title=arbitrary?'所选位置':item.name||'所选位置';
    const subtitle=tab==='cyclone-demo'?`台风模拟 · ${item.lat>0?'逆时针':'顺时针'}`:tab==='lightning'?'闪电模拟':tab==='wind'?'风场示意':tab==='typhoons'?'风暴记录 · 云系示意':arbitrary?coordinates:item.region||coordinates;
    return {...item,title,subtitle,cloud:['lightning','cyclone-demo','typhoons'].includes(tab)};
  }
  function updateLabels(camera,options={}){
    const occlusionRects=[...(options.occlusionRects||[])];
    if(visible&&!panel.hidden&&panel.getBoundingClientRect){const box=panel.getBoundingClientRect();if(box.width>0&&box.height>0)occlusionRects.push(box);}
    surfaceLabels.update(camera,{...options,labels:labelsVisible&&options.labels!==false,occlusionRects});
  }
  function focusItem(item){
    if(activeTab==='places'||activeTab==='weather'){selectLocation(item);return;}
    selectedId=item.id;
    if(activeTab==='typhoons')natureEffects.setLayer('typhoons',[item,...states.typhoons.rows.filter(row=>row.id!==item.id).slice(0,7)]);
    highlightSelected();onFocus(item.lat,item.lon,item);invalidate();
  }
  function focusNature(){
    if(!visible||!NATURE_TABS.includes(activeTab))return false;
    const choices=activeTab==='lightning'?LIGHTNING_REGIONS:activeTab==='cyclone-demo'?CYCLONE_DEMOS:activeTab==='wind'?WIND_REGIONS:states.typhoons.rows;
    const item=choices.find(row=>row.id===selectedId)||(activeTab==='lightning'?choices.find(row=>row.id==='southchina'):choices[0]);
    if(item)focusItem(item);else onFocus(19,137);
    return true;
  }
  function rowButton(item,detail,value){
    const button=createElement('button','earthsense-row');button.type='button';button.dataset.id=item.id;button.setAttribute('aria-pressed',String(selectedId===item.id));
    const text=createElement('span','earthsense-row-copy');text.append(createElement('strong','',item.name),createElement('small','',detail));button.append(text);
    if(value)button.append(createElement('span','earthsense-row-value',value));
    button.addEventListener('click',()=>focusItem(item));return button;
  }
  function syncContinentVisibility(){
    const next=visible&&activeTab==='continents';
    if(next===continentLayerVisible)return;
    continentLayerVisible=next;onContinentVisibilityChange(next);
  }
  function selectContinent(id,{focus=true}={}){
    const continent=getContinent(id);
    if(disposed||!continent)return false;
    const focusedSelector=document.activeElement?.dataset?.continent;
    continentId=continent.id;
    if(focus)clearLocationLock();
    if(activeTab==='continents'){
      render();
      if(visible&&focusedSelector)[...list.querySelectorAll('.earthsense-continent-option')].find(button=>button.dataset.continent===focusedSelector)?.focus({preventScroll:true});
    }
    onContinentSelect(continentId,{focus:Boolean(focus)});invalidate();return true;
  }
  function renderContinents(){
    const continent=getContinent(continentId)||EARTH_CONTINENTS[0];
    status.textContent='七大洲 · 可离线';
    explanation.textContent='选择大洲，让地球转向这片陆地；也可点击球面上的洲名。';
    const selector=createElement('div','earthsense-continent-selector');selector.setAttribute('role','group');selector.setAttribute('aria-label','选择大洲');
    EARTH_CONTINENTS.forEach((item,index)=>{
      const button=createElement('button','earthsense-continent-option');button.type='button';button.dataset.continent=item.id;button.setAttribute('aria-pressed',String(item.id===continent.id));button.style.setProperty('--continent-color',item.color);
      button.append(createElement('span','earthsense-continent-number',String(index+1).padStart(2,'0')),createElement('strong','',item.name));
      button.addEventListener('click',()=>selectContinent(item.id));selector.append(button);
    });
    list.append(selector);
    const article=createElement('article','earthsense-continent-card');article.style.setProperty('--continent-color',continent.color);
    const heading=createElement('div','earthsense-continent-heading');heading.append(createElement('span','earthsense-continent-en',continent.en),createElement('h3','',continent.name));
    article.append(heading,createElement('p','earthsense-continent-tagline',continent.tagline),createElement('p','earthsense-continent-summary',continent.summary));
    const facts=createElement('ul','earthsense-continent-facts');continent.facts.forEach(fact=>facts.append(createElement('li','',fact)));article.append(facts);
    const destinations=createElement('div','earthsense-continent-destinations');destinations.append(createElement('h4','','从这里继续探索'),createElement('p','earthsense-continent-location-note','洲级浏览不代表一个地点；查看天气或联动四季，请选择下方的代表地点。'));
    continent.landmarks.forEach(place=>{
      const button=createElement('button','earthsense-continent-place');button.type='button';button.dataset.place=place.id;
      const copy=createElement('span');copy.append(createElement('strong','',place.name),createElement('small','',place.region));
      button.append(copy,createElement('span','earthsense-continent-place-arrow','→'));button.setAttribute('aria-label',`定位${place.name}，查看天气或四季`);
      button.addEventListener('click',()=>{selectTab('places');selectLocation(place,{lock:false});});destinations.append(button);
    });
    article.append(destinations);list.append(article);
    legend.textContent=CONTINENT_DATA_NOTE;
    source.textContent=`资料参考：${continent.source.label}；范围底图：Natural Earth`;
  }
  function renderSelectedWeather(){
    const state=states.weather;
    refreshButton.hidden=!selectedPlace;refreshButton.disabled=state.status==='loading';
    refreshButton.textContent=state.status==='loading'?'获取中…':state.status==='error'?'重新获取':'刷新数据';
    status.classList.add(`is-${state.status}`);
    status.textContent=!selectedPlace?'先选择一个地点':state.status==='loading'?'正在获取此地天气…':state.status==='error'?state.message:state.status==='loaded'?`获取于 ${formatTime(state.fetchedAt)}`:'准备获取此地天气';
    explanation.textContent='查询所选坐标的当前天气模式估计值。天气使用数据源的真实时间，不随四季演示或时间滑块改变。';
    if(selectedPlace){
      addMarker(selectedPlace,0x9fe6d6,0);
      if(state.status==='loaded'){
        const weather=state.rows[0],card=createElement('section','earthsense-weather-card');card.setAttribute('aria-label',`${selectedPlace.name}的天气`);
        const hero=createElement('div','earthsense-weather-hero');hero.append(createElement('strong','',`${Math.round(weather.temperature)}°C`),createElement('span','',weatherDescription(weather.code)));card.append(hero);
        const stats=createElement('dl','earthsense-weather-stats');
        for(const [name,value] of [['体感',weather.apparent===null?'暂无':`${Math.round(weather.apparent)}°C`],['风速',weather.wind===null?'暂无':`${Math.round(weather.wind)} km/h`],['相对湿度',weather.humidity===null?'暂无':`${Math.round(weather.humidity)}%`],['降水',weather.precipitation===null?'暂无':`${weather.precipitation.toFixed(1)} mm`]]){
          const cell=createElement('div');cell.append(createElement('dt','',name),createElement('dd','',value));stats.append(cell);
        }
        card.append(stats,createElement('p','earthsense-weather-time',`数据时刻（当地时间）\n${formatWeatherTime(weather)}`));list.append(card);
      }else{
        list.append(createElement('p','earthsense-empty',state.status==='loading'?'正在连接天气数据源，地球仍可拖动与缩放。':state.status==='error'?'暂时无法读取此地天气。请点击“重新获取”；离线地点与四季演示仍可使用。':'点击“刷新数据”获取此地天气。'));
      }
    }else{
      list.append(createElement('p','earthsense-empty','先在“地点”中搜索城市、输入坐标或点击地表选点，也可从下方选择城市。'));
    }
    const choose=createElement('button','earthsense-change-place','搜索 / 地表选点');choose.type='button';choose.addEventListener('click',()=>selectTab('places'));list.append(choose);
    const presets=createElement('details','earthsense-weather-presets');presets.open=!selectedPlace;presets.append(createElement('summary','',selectedPlace?'切换到常用城市':'选择一个城市'));
    CITIES.forEach(item=>presets.append(rowButton(item,`${item.region} · ${coordinatesLabel(item.lat,item.lon)}`,'查看')));list.append(presets);
    legend.textContent='青色光点：所选坐标。局部云雨按查询天气码示意，范围与动画速度为夸张展示；全球云层贴图不是实时云图。天气取最近模式网格点，可能与实测有差异。';
    source.textContent='天气数据：Open-Meteo · CC BY 4.0';
  }
  function render(){
    if(disposed)return;
    const placeSection=['places','weather'].includes(activeTab);
    const titles={places:'地点与天气',weather:'地点与天气',continents:'七大洲',lightning:'闪电模拟',typhoons:'风暴事件','cyclone-demo':'台风模拟',wind:'风场模拟'};
    get('#earthsense-title').textContent=titles[activeTab];closeButton.setAttribute('aria-label','返回感知总览');closeButton.title='返回感知总览';
    get('.earthsense-tabs').hidden=!placeSection;
    tabs.forEach(button=>{const active=button.dataset.earthsenseTab===activeTab;button.hidden=!placeSection||!['places','weather'].includes(button.dataset.earthsenseTab);button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;});
    content.setAttribute('aria-labelledby',placeSection?`earthsense-tab-${activeTab}`:'earthsense-title');panel.dataset.layer=activeTab;
    list.replaceChildren();source.replaceChildren();clearMarkers();
    refreshButton.hidden=['lightning','places','continents','cyclone-demo','wind'].includes(activeTab);refreshButton.disabled=false;placeTools.hidden=activeTab!=='places';
    gridRoot.visible=(visible||geographyVisible)&&gridEnabled;
    status.className='earthsense-status';
    if(activeTab==='places'){
      status.textContent=`${EARTH_PLACES.length} 处内置地点 · 可离线`;
      explanation.textContent='从城市与地标出发探索地球。点选后可锁定视角，持续观察同一地点。';
      const query=queryInput.value.trim(),coordinate=parseEarthCoordinates(query),rows=coordinate?[coordinate]:filterEarthPlaces(query,regionSelect.value);
      const coordinateLike=/^[\s+\-\d.,，]+$/.test(query)&&/[\d]/.test(query);
      resultsStatus.textContent=coordinate?'经纬度定位（不受分组限制）':query?`当前分组找到 ${rows.length} 处地点`:['all','china'].includes(regionSelect.value)?`${rows.length} 处地点 · 选择或展开分组`:`${rows.length} 处地点 · 点击定位`;
      const placeRow=item=>rowButton(item,`${item.province||item.region} · ${coordinatesLabel(item.lat,item.lon)}`,item.kind==='landmark'?'地标':'定位');
      const appendPlaceRows=(container,members,group)=>{
        if(!query&&['world-cities','world-nature'].includes(group)){
          for(const continent of EARTH_PLACE_CONTINENTS){
            const destinations=members.filter(item=>item.continent===continent);if(!destinations.length)continue;
            container.append(createElement('h3','earthsense-place-continent',`${continent} · ${destinations.length} 处`));
            destinations.forEach(item=>container.append(placeRow(item)));
          }
        }else members.forEach(item=>container.append(placeRow(item)));
      };
      if(query||!['all','china'].includes(regionSelect.value))appendPlaceRows(list,rows,regionSelect.value);
      else for(const group of EARTH_PLACE_GROUPS){
        const members=rows.filter(item=>earthPlaceGroup(item)===group.id);if(!members.length)continue;
        const details=createElement('details','earthsense-place-group');details.dataset.group=group.id;details.open=expandedPlaceGroups.has(group.id);
        const summary=createElement('summary','');summary.append(createElement('span','',group.name),createElement('small','',`${members.length} 处`));
        const body=createElement('div','earthsense-place-group-body');appendPlaceRows(body,members,group.id);details.append(summary,body);
        details.addEventListener('toggle',()=>{if(details.open)expandedPlaceGroups.add(group.id);else expandedPlaceGroups.delete(group.id);});list.append(details);
      }
      const markerRows=query?rows.slice(0,12):FEATURED_EARTH_PLACES;
      markerRows.forEach((item,index)=>addMarker(item,0x83ddff,index));
      if(!rows.length)list.append(createElement('p','earthsense-empty',coordinateLike?'坐标无效。请输入“纬度, 经度”，纬度 −90 至 90，经度 −180 至 180。':'当前分组没有匹配地点。可切换“全部地点”，或搜索中文全称、省份、国家及经纬度。'));
      if(selectedPlace&&!markerRows.some(item=>item.id===selectedPlace.id))addMarker(selectedPlace,0xffd396,markerRows.length);
      legend.textContent='蓝点为地点；亮线为赤道与本初子午线。城市及自然地标采用近似代表点，放大比例用于观察。';
      const provenance=createElement('details','earthsense-place-provenance');
      provenance.append(createElement('summary','','数据来源：DataV · Natural Earth · UNESCO'));
      const provenanceBody=createElement('div','earthsense-place-provenance-body');
      for(const note of [
        '阿里云 DataV GeoAtlas：内地 333 个地级行政区，加 4 个直辖市、2 个特别行政区，共 339 处。306 处采用其中心点，33 处保留原项目坐标；西藏 6 市、1 地区另据西藏自治区投资促进局资料核对。',
        'Natural Earth · Populated Places 5.1.2（公共领域）：新增世界城市 14 处、台湾城市 8 处的代表点。台北沿用原坐标，台湾城市共 9 处。Made with Natural Earth。',
        'UNESCO 世界遗产中心：新增大峡谷、黄石公园、伊瓜苏国家公园、塞伦盖蒂及加拉帕戈斯群岛的遗产区代表点。代表点不等于瀑布、景区入口或行政中心的精确位置。',
        'GeoAtlas 未提供统一版本日期；原有 68 处为项目既有离线目录，本次未逐条重新溯源。坐标不是行政边界或实时位置。完整网址与逐条记录见项目随附的 place-data-sources.json 和 world-place-sources.json。'
      ])provenanceBody.append(createElement('p','',note));
      provenance.append(provenanceBody);source.append(provenance,createElement('span','earthsense-place-source-date','近似定位点 · 可离线'));
      updateLocationControls();
    }else if(activeTab==='continents'){
      renderContinents();
    }else if(activeTab==='weather'){
      renderSelectedWeather();
    }else if(activeTab==='lightning'){
      status.textContent='模拟演示 · 可离线';status.classList.add('is-simulation');
      explanation.textContent='观察球面雷暴云团、云内闪光与分叉闪电。六处地点仅用于演示，频率、范围和亮度均为夸张展示，不代表当前雷暴。';
      LIGHTNING_REGIONS.forEach((item,index)=>{list.append(rowButton(item,coordinatesLabel(item.lat,item.lon),'模拟'));addMarker(item,0xd9d4ff,index);});
      legend.textContent='点击地点或云团定位；闪光与地球同步转动。底部暂停键可停止动画。';
      source.textContent='原创示意图层 · 无实时闪电数据';
    }else if(activeTab==='cyclone-demo'){
      status.textContent='模拟演示 · 可离线';status.classList.add('is-simulation');
      explanation.textContent='从太空观察透明风眼、眼墙与螺旋云带。北半球低层气流逆时针旋转，南半球相反；位置、云系大小和速度均为教学示意。';
      CYCLONE_DEMOS.forEach((item,index)=>{list.append(rowButton(item,coordinatesLabel(item.lat,item.lon),item.lat>0?'逆时针':'顺时针'));addMarker(item,0xb8e9ff,index);});
      legend.textContent='点击云系或地点切换半球；拖动旋转地球，滚轮放大观察。可用底部暂停键比较云带结构。';
      source.textContent='科普参考：NOAA · 热带气旋结构';
    }else if(activeTab==='wind'){
      status.textContent='模拟演示 · 可离线';status.classList.add('is-simulation');
      explanation.textContent='用贴合球面的流线和移动粒子观察主要风带。低纬信风与极地东风总体向西，中纬度西风总体向东；这是理想化环流示意。';
      WIND_REGIONS.forEach((item,index)=>{list.append(rowButton(item,coordinatesLabel(item.lat,item.lon),'定位'));addMarker(item,0x9de5f1,index);});
      legend.textContent='流线与粒子表示示意流向，不代表当前风速、实时风场或风暴预报。暂停键可停住粒子。';
      source.textContent='科普参考：NOAA · 全球风与洋流';
    }else{
      const state=states[activeTab];
      refreshButton.disabled=state.status==='loading';refreshButton.textContent=state.status==='loading'?'获取中…':'刷新数据';
      status.classList.add(`is-${state.status}`);
      status.textContent=state.status==='loading'?'正在连接公开数据源…':state.status==='error'?state.message:state.status==='loaded'?`获取于 ${formatTime(state.fetchedAt)}`:'打开图层后获取数据';
      explanation.textContent='NASA EONET 尚未关闭的热带气旋事件。地点与路径来自事件目录；旋转云系是放大的示意效果，不是实时风眼、云图或预报。';
      if(state.status==='loaded'){
        if(!state.rows.length)list.append(createElement('p','earthsense-empty','当前数据源未返回有坐标的开放热带气旋事件。这里不代表全球没有风暴。'));
        state.rows.slice(0,30).forEach((item,index)=>{
          const wrapper=createElement('div','earthsense-storm-item');
          wrapper.append(rowButton(item,`最近记录 ${formatTime(item.time)} · ${coordinatesLabel(item.lat,item.lon)}`,'定位'));
          list.append(wrapper);addMarker(item,0xffbf84,index);
        });
        legend.textContent=`橙色点：最近记录地点；橙色线：已记录路径。${state.rows.length>30?'显示最近更新的 30 个事件。':''}云系最多展示 8 处，点击其他事件可查看其云系。请按记录时间阅读。`;
      }else if(state.status==='loading'){
        list.append(createElement('p','earthsense-empty','正在获取数据，通常只需几秒。宇宙场景仍可拖动和缩放。'));
        legend.textContent='网络数据仅在打开图层或手动刷新时获取。';
      }else if(state.status==='error'){
        list.append(createElement('p','earthsense-empty','暂时没有可展示的网络数据。可稍后刷新，或切换到可离线运行的闪电模拟。'));
        legend.textContent='未使用虚构天气或风暴填充。三维地球与其余宇宙场景不受影响。';
      }else{legend.textContent='天气与事件数据需要网络连接。';}
      const demo=createElement('button','earthsense-change-place','打开离线台风模拟 →');demo.type='button';demo.addEventListener('click',()=>{selectTab('cyclone-demo');focusItem(CYCLONE_DEMOS[0]);});list.append(demo);
      source.textContent='事件记录来源：NASA EONET。位置与路径以记录时间为准，云系为示意。';
    }
    const effectItems=activeTab==='lightning'?LIGHTNING_REGIONS:activeTab==='cyclone-demo'?CYCLONE_DEMOS:activeTab==='wind'?WIND_REGIONS:activeTab==='typhoons'?states.typhoons.rows.slice(0,8):activeTab==='weather'&&states.weather.status==='loaded'?states.weather.rows:[];
    natureEffects.setLayer(activeTab,effectItems);natureEffects.setVisible(visible);
    surfaceLabels.setRecords(markers.map(marker=>labelData(marker.item)));surfaceLabels.setVisible(visible);
    updateLocationControls();highlightSelected();invalidate();
  }
  function cancelRequest(tab){
    const request=requests[tab];if(!request)return;
    request.sequence++;request.controller?.abort();request.controller=null;
    if(states[tab].status==='loading')states[tab].status='idle';
  }
  async function load(tab){
    if(!states[tab] || !visible || disposed)return;
    if(tab==='weather'&&!selectedPlace)return;
    cancelRequest(tab);
    const request=requests[tab],sequence=++request.sequence,controller=new AbortController();request.controller=controller;
    const requestedLocation=tab==='weather'?locationValue(selectedPlace):null;
    const state=states[tab];state.status='loading';state.rows=[];state.message='';
    if(activeTab===tab)render();
    let timedOut=false;
    const timeout=setTimeout(()=>{timedOut=true;controller.abort();},12000);
    try {
      if(navigator.onLine===false)throw new Error('offline');
      let url;
      if(tab==='weather'){
        url=selectedWeatherUrl(requestedLocation);
      }else url='https://eonet.gsfc.nasa.gov/api/v3/events?category=severeStorms&status=open&limit=100';
      const response=await fetch(url,{signal:controller.signal,credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer'});
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const payload=await response.json();
      const rows=tab==='weather'?[parseSelectedWeather(payload,requestedLocation)]:parseStormData(payload);
      if(disposed || request.sequence!==sequence)return;
      state.rows=rows;state.status='loaded';state.fetchedAt=Date.now();
    }catch(error){
      if(disposed || request.sequence!==sequence)return;
      state.rows=[];state.status='error';
      state.message=timedOut?'连接超时，请稍后刷新':navigator.onLine===false?'当前离线 · 网络数据不可用':'数据源暂时不可用，请稍后刷新';
    }finally{
      clearTimeout(timeout);
      if(request.sequence===sequence){request.controller=null;if(visible && activeTab===tab)render();}
    }
  }
  function selectTab(tab){
    if(disposed||!['places','continents','weather','lightning','typhoons','cyclone-demo','wind'].includes(tab))return;
    if(activeTab!==tab&&!['places','weather'].includes(tab))clearLocationLock();
    cancelRequest(activeTab);activeTab=tab;selectedId=['places','weather'].includes(tab)&&selectedPlace?selectedPlace.id:'';render();
    syncContinentVisibility();
    if(tab==='continents')onContinentSelect(continentId,{focus:visible});
    if(states[tab] && states[tab].status!=='loaded')load(tab);
    panel.dataset.activeTab=activeTab;
    document.dispatchEvent(new CustomEvent('earthsense:change'));
  }
  const onEscape=event=>{if(visible && event.key==='Escape'){event.preventDefault();setVisible(false);}};
  tabs.forEach(button=>{
    button.addEventListener('click',()=>selectTab(button.dataset.earthsenseTab));
    button.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();const choices=tabs.filter(tab=>!tab.hidden),index=choices.indexOf(button),next=event.key==='Home'?0:event.key==='End'?choices.length-1:(index+(event.key==='ArrowRight'?1:-1)+choices.length)%choices.length;
      if(choices[next]){choices[next].focus();selectTab(choices[next].dataset.earthsenseTab);}
    });
  });
  closeButton.addEventListener('click',()=>setVisible(false));refreshButton.addEventListener('click',()=>load(activeTab));
  queryInput.addEventListener('input',()=>{render();});
  regionSelect.addEventListener('change',()=>{if(activeTab==='places')render();});
  searchForm.addEventListener('submit',event=>{
    event.preventDefault();const item=parseEarthCoordinates(queryInput.value)||filterEarthPlaces(queryInput.value,regionSelect.value)[0];
    if(item){focusItem(item);queryInput.blur();}else toast('未找到地点，请检查名称或经纬度。');
  });
  lockButton.addEventListener('click',()=>{
    if(!selectedPlace)return;
    if(lockedLocation)clearLocationLock();else{onFocus(selectedPlace.lat,selectedPlace.lon,selectedPlace);setLocationLock(selectedPlace);}
  });
  gridButton.addEventListener('click',()=>setGridEnabled(!gridEnabled));
  surfaceButton.addEventListener('click',()=>{surfacePicking=!surfacePicking;updateLocationControls();invalidate();});
  get('.earthsense-place-weather').addEventListener('click',()=>selectTab('weather'));
  get('.earthsense-place-seasons').addEventListener('click',()=>{if(selectedPlace)onOpenEnvironment(locationValue(selectedPlace));});
  document.addEventListener('keydown',onEscape);
  function setVisible(value,{preserveLock=false}={}){
    if(disposed)return;
    if(visible===Boolean(value)){if(!value&&!preserveLock)clearLocationLock();return;}
    visible=Boolean(value);panel.hidden=!visible;markerRoot.visible=visible;document.body.classList.toggle('earthsense-active',visible);
    natureEffects.setVisible(visible);
    gridRoot.visible=(visible||geographyVisible)&&gridEnabled;
    updateLinkedMarker();
    if(visible){previousFocus=document.activeElement;render();closeButton.focus({preventScroll:true});if(states[activeTab] && states[activeTab].status!=='loaded')load(activeTab);}
    else {if(!preserveLock)clearLocationLock();cancelRequest('weather');cancelRequest('typhoons');if(panel.contains(document.activeElement) && previousFocus?.isConnected)previousFocus.focus({preventScroll:true});}
    syncContinentVisibility();
    document.dispatchEvent(new CustomEvent('earthsense:visibility',{detail:{visible,preserveLock}}));
    invalidate();
  }
  return {
    setVisible,
    setLinkedViewVisible,
    setGeographyVisible,setGridEnabled,setMarkersVisible,setLabelsVisible,updateLabels,
    isVisible:()=>visible,
    getSelectedLocation:()=>locationValue(selectedPlace),
    getLockedLocation:()=>locationValue(lockedLocation),
    selectLocation,
    selectTab,
    focusNature,
    selectContinent,
    isSurfacePicking:()=>visible&&activeTab==='places'&&surfacePicking,
    pickSurfaceLocation,
    clearLocationLock,
    getPickables:()=>visible?[...markers.flatMap(marker=>[marker.dot,marker.ring]).filter(mesh=>mesh.visible),...natureEffects.getPickables()]:[],
    pick(object){
      if(!visible)return false;
      let node=object;while(node&&!node.userData?.earthSenseId)node=node.parent;
      const marker=markers.find(candidate=>candidate.id===node?.userData?.earthSenseId);
      if(!marker)return false;focusItem(marker.item);return true;
    },
    needsAnimation:()=>visible&&natureEffects.needsAnimation(),
    update(dt){
      reducedMotion=motionPreference.matches;natureEffects.setReducedMotion(reducedMotion);
      natureEffects.update(dt);
      if(!visible || activeTab!=='lightning')return;
      simulationTime+=Math.min(.1,Math.max(0,Number(dt)||0));
      markers.forEach(marker=>{
        const phase=(simulationTime+marker.index*1.53)%9.5;
        const flash=reducedMotion?.15:Math.max(0,1-phase/.3);
        marker.dot.material.opacity=.35+flash*.65;marker.ring.material.opacity=.15+flash*.75;
        marker.ring.scale.setScalar(1+flash*.9);
      });
    },
    getStatus:()=>({visible,activeTab,nature:natureEffects.getStatus(),surfaceLabels:surfaceLabels.getStatus(),continent:continentId,continentLayerVisible,weather:states.weather.status,weatherCount:states.weather.rows.filter(item=>item.available).length,weatherLocation:states.weather.rows[0]?locationValue(states.weather.rows[0]):null,typhoons:states.typhoons.status,stormCount:states.typhoons.rows.length,locationCount:EARTH_PLACES.length,selectedLocation:locationValue(selectedPlace),lockedLocation:locationValue(lockedLocation),gridEnabled,gridVisible:gridRoot.visible,surfacePicking:visible&&activeTab==='places'&&surfacePicking,linkedMarkerVisible:linkedMarker.visible}),
    dispose(){setVisible(false);disposed=true;surfaceLabels.dispose();natureEffects.dispose();cancelRequest('weather');cancelRequest('typhoons');document.removeEventListener('keydown',onEscape);clearMarkers();linkedMarker.traverse(object=>object.material?.dispose());Object.values(markerGeometries).forEach(geometry=>geometry.dispose());gridRoot.traverse(object=>{object.geometry?.dispose();object.material?.dispose();});earth.remove(markerRoot,gridRoot,linkedMarker);panel.remove();}
  };
}
