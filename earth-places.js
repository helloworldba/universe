// Approximate city centres and landmark coordinates for an offline globe explorer.
// These points are viewing destinations, not a boundary map or a live geocoder.
import {CHINA_ADMIN_PLACES} from './china-admin-places.js';
import {ADDITIONAL_EARTH_PLACES} from './world-places.js';
const ORIGINAL_EARTH_PLACES = Object.freeze([
  {id:'beijing',name:'北京',region:'中国',lat:39.9042,lon:116.4074,aliases:'beijing peking china 中国首都'},
  {id:'shanghai',name:'上海',region:'中国',lat:31.2304,lon:121.4737,aliases:'shanghai china 魔都'},
  {id:'guangzhou',name:'广州',region:'中国',lat:23.1291,lon:113.2644,aliases:'guangzhou canton china 广东'},
  {id:'shenzhen',name:'深圳',region:'中国',lat:22.5431,lon:114.0579,aliases:'shenzhen china 广东'},
  {id:'chengdu',name:'成都',region:'中国',lat:30.5728,lon:104.0668,aliases:'chengdu china 四川'},
  {id:'chongqing',name:'重庆',region:'中国',lat:29.563,lon:106.5516,aliases:'chongqing china'},
  {id:'wuhan',name:'武汉',region:'中国',lat:30.5928,lon:114.3055,aliases:'wuhan china 湖北'},
  {id:'xian',name:'西安',region:'中国',lat:34.3416,lon:108.9398,aliases:"xian xi'an china 陕西"},
  {id:'hangzhou',name:'杭州',region:'中国',lat:30.2741,lon:120.1551,aliases:'hangzhou china 浙江'},
  {id:'nanjing',name:'南京',region:'中国',lat:32.0603,lon:118.7969,aliases:'nanjing nanking china 江苏'},
  {id:'harbin',name:'哈尔滨',region:'中国',lat:45.8038,lon:126.535,aliases:'harbin china 黑龙江'},
  {id:'urumqi',name:'乌鲁木齐',region:'中国',lat:43.8256,lon:87.6168,aliases:'urumqi urumuchi china 新疆'},
  {id:'lhasa',name:'拉萨',region:'中国',lat:29.652,lon:91.1721,aliases:'lhasa china 西藏'},
  {id:'hongkong',name:'香港',region:'中国',lat:22.3193,lon:114.1694,aliases:'hong kong hongkong china'},
  {id:'shijiazhuang',name:'石家庄',region:'中国',lat:38.03,lon:114.48,aliases:'shijiazhuang china 河北'},
  {id:'taiyuan',name:'太原',region:'中国',lat:37.87,lon:112.53,aliases:'taiyuan china 山西'},
  {id:'shenyang',name:'沈阳',region:'中国',lat:41.8,lon:123.38,aliases:'shenyang china 辽宁'},
  {id:'changchun',name:'长春',region:'中国',lat:43.88,lon:125.35,aliases:'changchun china 吉林'},
  {id:'hefei',name:'合肥',region:'中国',lat:31.86,lon:117.27,aliases:'hefei china 安徽'},
  {id:'fuzhou',name:'福州',region:'中国',lat:26.08,lon:119.3,aliases:'fuzhou china 福建'},
  {id:'nanchang',name:'南昌',region:'中国',lat:28.68,lon:115.89,aliases:'nanchang china 江西'},
  {id:'jinan',name:'济南',region:'中国',lat:36.65,lon:117,aliases:'jinan china 山东'},
  {id:'zhengzhou',name:'郑州',region:'中国',lat:34.76,lon:113.65,aliases:'zhengzhou china 河南'},
  {id:'changsha',name:'长沙',region:'中国',lat:28.21,lon:113,aliases:'changsha china 湖南'},
  {id:'haikou',name:'海口',region:'中国',lat:20.02,lon:110.35,aliases:'haikou china 海南'},
  {id:'guiyang',name:'贵阳',region:'中国',lat:26.57,lon:106.71,aliases:'guiyang china 贵州'},
  {id:'kunming',name:'昆明',region:'中国',lat:25.04,lon:102.73,aliases:'kunming china 云南'},
  {id:'lanzhou',name:'兰州',region:'中国',lat:36.03,lon:103.73,aliases:'lanzhou china 甘肃'},
  {id:'xining',name:'西宁',region:'中国',lat:36.56,lon:101.74,aliases:'xining china 青海'},
  {id:'hohhot',name:'呼和浩特',region:'中国',lat:40.82,lon:111.65,aliases:'hohhot huhehaote china 内蒙古'},
  {id:'nanning',name:'南宁',region:'中国',lat:22.84,lon:108.33,aliases:'nanning china 广西'},
  {id:'yinchuan',name:'银川',region:'中国',lat:38.47,lon:106.27,aliases:'yinchuan china 宁夏'},
  {id:'taiwan',name:'台北市',region:'中国台湾',lat:25.038,lon:121.514,placeGroup:'taiwan',continent:'亚洲',aliases:'taiwan taipei china 中国台湾 台北 臺北市 臺北 臺灣 中國臺灣'},
  {id:'macau',name:'澳门',region:'中国',lat:22.19,lon:113.54,aliases:'macau macao china 澳門'},
  {id:'tokyo',name:'东京',region:'日本',lat:35.6762,lon:139.6503,aliases:'tokyo japan'},
  {id:'seoul',name:'首尔',region:'韩国',lat:37.5665,lon:126.978,aliases:'seoul south korea'},
  {id:'singapore',name:'新加坡',region:'新加坡',lat:1.3521,lon:103.8198,aliases:'singapore'},
  {id:'bangkok',name:'曼谷',region:'泰国',lat:13.7563,lon:100.5018,aliases:'bangkok thailand'},
  {id:'newdelhi',name:'新德里',region:'印度',lat:28.6139,lon:77.209,aliases:'new delhi india'},
  {id:'dubai',name:'迪拜',region:'阿联酋',lat:25.2048,lon:55.2708,aliases:'dubai united arab emirates uae'},
  {id:'london',name:'伦敦',region:'英国',lat:51.5074,lon:-.1278,aliases:'london united kingdom britain uk england'},
  {id:'paris',name:'巴黎',region:'法国',lat:48.8566,lon:2.3522,aliases:'paris france'},
  {id:'berlin',name:'柏林',region:'德国',lat:52.52,lon:13.405,aliases:'berlin germany'},
  {id:'rome',name:'罗马',region:'意大利',lat:41.9028,lon:12.4964,aliases:'rome roma italy'},
  {id:'moscow',name:'莫斯科',region:'俄罗斯',lat:55.7558,lon:37.6173,aliases:'moscow russia'},
  {id:'reykjavik',name:'雷克雅未克',region:'冰岛',lat:64.1466,lon:-21.9426,aliases:'reykjavik iceland'},
  {id:'newyork',name:'纽约',region:'美国',lat:40.7128,lon:-74.006,aliases:'new york nyc usa united states america'},
  {id:'losangeles',name:'洛杉矶',region:'美国',lat:34.0522,lon:-118.2437,aliases:'los angeles la usa united states america'},
  {id:'sanfrancisco',name:'旧金山',region:'美国',lat:37.7749,lon:-122.4194,aliases:'san francisco usa united states america 三藩市'},
  {id:'toronto',name:'多伦多',region:'加拿大',lat:43.6532,lon:-79.3832,aliases:'toronto canada'},
  {id:'mexicocity',name:'墨西哥城',region:'墨西哥',lat:19.4326,lon:-99.1332,aliases:'mexico city mexico'},
  {id:'riodejaneiro',name:'里约热内卢',region:'巴西',lat:-22.9068,lon:-43.1729,aliases:'rio de janeiro rio brazil 里约'},
  {id:'buenosaires',name:'布宜诺斯艾利斯',region:'阿根廷',lat:-34.6037,lon:-58.3816,aliases:'buenos aires argentina'},
  {id:'lima',name:'利马',region:'秘鲁',lat:-12.0464,lon:-77.0428,aliases:'lima peru'},
  {id:'cairo',name:'开罗',region:'埃及',lat:30.0444,lon:31.2357,aliases:'cairo egypt'},
  {id:'nairobi',name:'内罗毕',region:'肯尼亚',lat:-1.2921,lon:36.8219,aliases:'nairobi kenya'},
  {id:'capetown',name:'开普敦',region:'南非',lat:-33.9249,lon:18.4241,aliases:'cape town capetown south africa'},
  {id:'sydney',name:'悉尼',region:'澳大利亚',lat:-33.8688,lon:151.2093,aliases:'sydney australia'},
  {id:'melbourne',name:'墨尔本',region:'澳大利亚',lat:-37.8136,lon:144.9631,aliases:'melbourne australia'},
  {id:'auckland',name:'奥克兰',region:'新西兰',lat:-36.8485,lon:174.7633,aliases:'auckland new zealand'},
  {id:'everest',name:'珠穆朗玛峰',region:'喜马拉雅山脉',lat:27.9881,lon:86.925,kind:'landmark',aliases:'everest qomolangma himalayas 珠峰'},
  {id:'sahara',name:'撒哈拉沙漠',region:'非洲北部',lat:23.4,lon:13,kind:'landmark',aliases:'sahara desert africa'},
  {id:'amazon',name:'亚马孙雨林',region:'南美洲',lat:-3.4653,lon:-62.2159,kind:'landmark',aliases:'amazon rainforest south america 亚马逊'},
  {id:'greatbarrierreef',name:'大堡礁',region:'澳大利亚东北海岸',lat:-18.2871,lon:147.6992,kind:'landmark',aliases:'great barrier reef australia'},
  {id:'greenwich',name:'格林尼治',region:'本初子午线',lat:51.4779,lon:0,kind:'landmark',aliases:'greenwich prime meridian london 本初子午线 0度经线'},
  {id:'northpole',name:'北极点',region:'北冰洋',lat:90,lon:0,kind:'landmark',aliases:'north pole arctic 北极'},
  {id:'southpole',name:'南极点',region:'南极洲',lat:-90,lon:0,kind:'landmark',aliases:'south pole antarctica 南极'},
  {id:'equator-zero',name:'赤道与本初子午线交点',region:'几内亚湾',lat:0,lon:0,kind:'landmark',aliases:'equator gulf guinea null island 赤道 零度'}
].map(place=>Object.freeze(place)));

// Keep existing IDs, coordinates and the original overview labels stable.
const shortName=name=>name.replace(/特别行政区$|市$/g,'');
const adminByName=new Map(CHINA_ADMIN_PLACES.map(place=>[shortName(place.fullName),place]));
const existingNames=new Set(ORIGINAL_EARTH_PLACES.map(place=>place.name));
export const EARTH_PLACE_CONTINENTS=Object.freeze(['亚洲','欧洲','非洲','北美洲','南美洲','大洋洲','南极洲','北极地区']);
const originalContinents=new Map([
  ['亚洲','tokyo seoul singapore bangkok newdelhi dubai everest'],
  ['欧洲','london paris berlin rome moscow reykjavik greenwich'],
  ['非洲','cairo nairobi capetown sahara equator-zero'],
  ['北美洲','newyork losangeles sanfrancisco toronto mexicocity'],
  ['南美洲','riodejaneiro buenosaires lima amazon'],
  ['大洋洲','sydney melbourne auckland greatbarrierreef'],
  ['南极洲','southpole'],['北极地区','northpole']
].flatMap(([continent,ids])=>ids.split(' ').map(id=>[id,continent])));
export const EARTH_PLACES=Object.freeze([
  ...ORIGINAL_EARTH_PLACES.map(place=>{
    const admin=adminByName.get(place.name);
    return Object.freeze(admin?{...admin,...place,coordinateSource:'original',aliases:`${place.aliases} ${admin.fullName} ${admin.province} ${admin.adcode}`}:{...place,continent:place.continent||originalContinents.get(place.id),coordinateSource:'original'});
  }),
  ...CHINA_ADMIN_PLACES.filter(place=>!existingNames.has(shortName(place.fullName))).map(place=>Object.freeze({
    ...place,id:`cn-${place.adcode}`,name:shortName(place.fullName),region:'中国',coordinateSource:'datav',
    aliases:`china 中国 ${place.fullName} ${place.province} ${place.adcode}`
  })),
  ...ADDITIONAL_EARTH_PLACES
]);
export const earthPlaceGroup=place=>place.provinceCode||place.placeGroup||(['greenwich','equator-zero'].includes(place.id)?'geo-reference':place.kind==='landmark'?'world-nature':'world-cities');
export const EARTH_PLACE_GROUPS=Object.freeze([
  ...[...new Map(CHINA_ADMIN_PLACES.map(place=>[place.provinceCode,{id:place.provinceCode,name:place.province}])).values()],
  {id:'taiwan',name:'中国台湾 · 城市'},
  {id:'world-cities',name:'世界城市'},{id:'world-nature',name:'世界自然地标'},
  {id:'geo-reference',name:'地理参考点'}
].map(group=>Object.freeze({...group,count:EARTH_PLACES.filter(place=>earthPlaceGroup(place)===group.id).length})));
export function filterEarthPlaces(query='',group='all'){
  return searchEarthPlaces(query).filter(place=>group==='all'||(group==='china'?Boolean(place.adcode):group==='world'?['world-cities','world-nature','geo-reference'].includes(earthPlaceGroup(place)):earthPlaceGroup(place)===group));
}

// Keep the original overview markers independent of the complete place list.
export const FEATURED_EARTH_PLACES=Object.freeze(['beijing','shanghai','chengdu','tokyo','singapore','london','newyork','sydney','capetown','everest','northpole','southpole'].map(id=>EARTH_PLACES.find(place=>place.id===id)));

const normalize=value=>String(value??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[\s’'_-]+/g,'').trim();
const searchable=EARTH_PLACES.map(place=>({place,text:normalize([place.id,place.name,place.region,place.continent,place.aliases].join(' ')),exact:[place.name,place.fullName].filter(Boolean).map(normalize)}));
export function searchEarthPlaces(query='',limit=EARTH_PLACES.length){
  const needle=normalize(query);
  const candidates=needle?searchable.filter(entry=>entry.text.includes(needle)).sort((a,b)=>Number(b.exact.includes(needle))-Number(a.exact.includes(needle))).map(entry=>entry.place):EARTH_PLACES;
  return candidates.slice(0,Math.max(0,Math.min(EARTH_PLACES.length,Number.isFinite(limit)?Math.floor(limit):EARTH_PLACES.length)));
}

// Deliberately accept one explicit format: signed decimal latitude, longitude.
// Reject partial numbers, compass letters and out-of-range values instead of guessing.
export function parseEarthCoordinates(query){
  const text=String(query??'').normalize('NFKC').trim();
  const number='[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)';
  const match=text.match(new RegExp(`^(${number})\\s*[,，]\\s*(${number})$`));
  if(!match)return null;
  const lat=Number(match[1]),lon=Number(match[2]);
  if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)return null;
  return {id:`coordinate:${lat.toFixed(5)},${lon.toFixed(5)}`,name:'自定义地点',region:'经纬度定位',kind:'coordinate',lat,lon};
}
