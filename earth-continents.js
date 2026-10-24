import { EARTH_PLACES } from './earth-places.js';

// This is a collection of educational destinations, not a boundary dataset.
// lat/lon on a continent are hand-selected camera anchors, not geographic centres.
// Place coordinates are approximate browsing destinations, not navigation fixes.
export const CONTINENT_DATA_NOTE = '按常见七大洲分法浏览；大洋洲含澳大利亚、新西兰及太平洋岛屿。底部“范围示意”显示所选洲的淡色陆地区域，分界与海岸经过简化，部分小岛省略。定位点仅为代表位置，不表示洲界或国界。';

const placesById = new Map(EARTH_PLACES.map(place => [place.id, place]));
function place(id) {
  const item = placesById.get(id);
  if (!item) throw new Error(`Missing continent destination: ${id}`);
  return Object.freeze({ ...item, kind: item.kind || 'city' });
}
const source = (label, url) => Object.freeze({ label, url });
const geographySource = slug => source('National Geographic · 自然地理', `https://education.nationalgeographic.org/resource/${slug}/`);

const mcmurdo = Object.freeze({
  id: 'mcmurdo', name: '麦克默多站', region: '南极洲 · 罗斯岛',
  lat: -77.848167, lon: 166.6685, kind: 'landmark',
  aliases: 'mcmurdo station ross island antarctica 麦克默多 科考站',
  // NSF: 77° 50.89′ S, 166° 40.11′ E; converted to decimal degrees.
  source: source('NSF · 麦克默多站', 'https://www.nsf.gov/od/opp/ail/mcmurdo-station')
});
const rothera = Object.freeze({
  id: 'rothera', name: '罗瑟拉站', region: '南极半岛西侧 · 阿德莱德岛',
  lat: -67.568889, lon: -68.1248, kind: 'landmark',
  aliases: 'rothera station antarctic peninsula adelaide island 罗瑟拉 南极半岛 科考站',
  source: source('BAS · 罗瑟拉站', 'https://www.bas.ac.uk/polar-operations/sites-and-facilities/facility/rothera/')
});

export const EARTH_CONTINENTS = Object.freeze([
  {
    id: 'asia', name: '亚洲', en: 'ASIA', lat: 35, lon: 95, color: '#eac789',
    tagline: '从雪山之巅到热带雨林',
    summary: '面积最大的洲。高山、高原、平原与群岛相连，从寒冷的北方一直延展到赤道附近。',
    facts: ['喜马拉雅山脉由印度板块与欧亚板块碰撞抬升形成。', '亚洲与欧洲属于相连的欧亚大陆；七大洲分法将两者分别介绍。'],
    landmarks: [place('beijing'), place('everest'), place('singapore'), place('tokyo')],
    source: geographySource('asia')
  },
  {
    id: 'europe', name: '欧洲', en: 'EUROPE', lat: 52, lon: 15, color: '#b3b6fa',
    tagline: '半岛、峡湾与地中海',
    summary: '位于欧亚大陆西部。众多半岛伸向海洋，北方的峡湾、广阔平原与南部山地呈现不同的地貌。',
    facts: ['冰川曾塑造北欧的湖泊与峡湾，留下深切的海岸景观。', '从北方苔原、针叶林到地中海植被，欧洲的自然环境随纬度变化。'],
    landmarks: [place('paris'), place('rome'), place('reykjavik'), place('greenwich')],
    source: geographySource('europe-physical-geography')
  },
  {
    id: 'africa', name: '非洲', en: 'AFRICA', lat: 4, lon: 20, color: '#f2b87d',
    tagline: '赤道横贯，沙漠与草原相逢',
    summary: '赤道穿过非洲中部。北部沙漠、热带草原、赤道雨林与高地共同组成丰富的自然景观。',
    facts: ['撒哈拉是世界最大的热沙漠，包含沙丘、砾石平原和岩石高地。', '赤道两侧的地点可用来比较南北半球的季节与日照变化。'],
    landmarks: [place('sahara'), place('cairo'), place('nairobi'), place('capetown')],
    source: geographySource('africa-physical-geography')
  },
  {
    id: 'north-america', name: '北美洲', en: 'NORTH AMERICA', lat: 44, lon: -102, color: '#8bcae9',
    tagline: '冰原、山脉与开阔平原',
    summary: '从北极附近向南延伸至中美洲。西部山地、中部大平原和东部地区拥有不同的地形与生态。',
    facts: ['落基山脉是北美洲西部大型山系的重要部分。', '北美洲拥有苔原、草原、沙漠和珊瑚礁等多种生态环境。'],
    landmarks: [place('newyork'), place('sanfrancisco'), place('toronto'), place('mexicocity')],
    source: geographySource('north-america-physical-geography')
  },
  {
    id: 'south-america', name: '南美洲', en: 'SOUTH AMERICA', lat: -17, lon: -60, color: '#99d5aa',
    tagline: '安第斯山脉与亚马孙雨林',
    summary: '西部高山沿大陆延伸，北部大片热带雨林与河流交织，南方则可看到高原和冰川景观。',
    facts: ['安第斯山脉沿南美洲西侧绵延，是大陆最鲜明的地形骨架。', '亚马孙流域的热带雨林拥有丰富的动植物，与河流共同维持当地生态。'],
    landmarks: [place('amazon'), place('lima'), place('riodejaneiro'), place('buenosaires')],
    source: geographySource('south-america-physical-geography')
  },
  {
    id: 'oceania', name: '大洋洲', en: 'OCEANIA', lat: -24, lon: 150, color: '#89d7d0',
    tagline: '海洋之间的大陆与岛屿',
    summary: '这里将澳大利亚、新西兰和太平洋诸多岛屿一起介绍。沙漠、珊瑚礁、高山与火山岛相映成趣。',
    facts: ['大洋洲不只指澳大利亚，还包括新西兰与美拉尼西亚、密克罗尼西亚、波利尼西亚等岛屿区域。', '大陆岛、火山岛与珊瑚岛有不同的形成过程，塑造了多样的岛屿景观。'],
    landmarks: [place('sydney'), place('auckland'), place('greatbarrierreef')],
    source: geographySource('oceania-physical-geography')
  },
  {
    id: 'antarctica', name: '南极洲', en: 'ANTARCTICA', lat: -78, lon: 0, color: '#d0e5fb',
    tagline: '冰盖之下，是一片大陆',
    summary: '围绕南极点、被南大洋包围的大陆，大片陆地覆盖着厚冰。科学家在这里研究冰雪、海洋与地球气候。',
    facts: ['南极洲内陆降水很少，广大的冰雪地区也属于极地荒漠。', '南极洲是大陆；北极点位于北冰洋，北极不是另一个洲。'],
    landmarks: [place('southpole'), mcmurdo, rothera],
    source: source('BAS · 认识南极洲', 'https://www.bas.ac.uk/about/where-we-work/antarctica/')
  }
].map(continent => Object.freeze({
  ...continent,
  facts: Object.freeze(continent.facts),
  landmarks: Object.freeze(continent.landmarks)
})));

const continentsById = new Map(EARTH_CONTINENTS.map(continent => [continent.id, continent]));
export function getContinent(id) {
  return continentsById.get(id) || null;
}
