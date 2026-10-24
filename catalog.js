import {NEBULA_DESTINATIONS} from './nebula-data.js';
import {BLACK_HOLE_CATALOG} from './black-hole-data.js';
// Curated educational destinations. Geometry, separation and animation are illustrative.
import { EARTH_ORBIT_CATALOG } from './earth-orbit-catalog.js';
// Qualitative values deliberately avoid implying precision that the visual model cannot provide.
const source = (label, url) => ({ label, url });
const SOURCES = {
  galaxies: source('星系知识 · NASA', 'https://science.nasa.gov/universe/galaxies/'),
  galaxyTypes: source('星系形态 · NASA', 'https://science.nasa.gov/universe/galaxies/types/'),
  stars: source('恒星知识 · NASA', 'https://science.nasa.gov/universe/stars/'),
  planets: source('系外行星目录 · NASA', 'https://science.nasa.gov/exoplanets/exoplanet-catalog/'),
  blackholes: source('黑洞知识 · NASA', 'https://science.nasa.gov/universe/black-holes/'),
  localGroup: source('本星系群 · NASA', 'https://imagine.gsfc.nasa.gov/features/cosmic/local_group_info.html'),
  trappist: source('TRAPPIST-1 · NASA', 'https://science.nasa.gov/exoplanets/trappist1/'),
  proxima: source('比邻星 b · NASA', 'https://science.nasa.gov/universe/exoplanets/eso-discovers-earth-size-planet-in-habitable-zone-of-nearest-star/'),
  kepler186: source('开普勒-186 f · NASA', 'https://science.nasa.gov/exoplanets/immersive/exoplanet-travel-bureau/kepler-186-f-explore-the-surface/'),
  kepler22: source('开普勒-22 b · NASA', 'https://science.nasa.gov/exoplanet-catalog/kepler-22b/'),
  hr8799: source('HR 8799 · NASA', 'https://science.nasa.gov/missions/webb/nasas-webb-images-young-giant-exoplanets-detects-carbon-dioxide/'),
  illustrative: source('系外行星的探测方法 · NASA', 'https://science.nasa.gov/exoplanets/how-we-find-and-characterize/'),
};
const GALAXY_MODEL = '形态与颜色为科普示意；星点不对应逐颗恒星，场景位置不按真实距离排列。';
const STAR_MODEL = '真实天体；表面、大小、颜色与位置为科普示意，不是望远镜近照。';
const PLANET_MODEL = '已确认系外行星；表面和云层为艺术示意，不代表已观测到海洋或生命。';
const galaxyNames = {
  galaxy:'银河系', andromeda:'仙女座星系', triangulum:'三角座星系', lmc:'大麦哲伦星云',
  smc:'小麦哲伦星云', m32:'M32 星系', m110:'M110 星系', 'barnard-galaxy':'巴纳德星系',
  whirlpool:'旋涡星系', bode:'波德星系', cigar:'雪茄星系', sombrero:'草帽星系', 'centaurus-a':'半人马座 A', m87:'M87 星系',
};
function galaxy(id, en, shape, classification, neighborhood, color, description, facts, citation=SOURCES.galaxyTypes) {
  return { id, name:galaxyNames[id], en, kind:'galaxy', parent:'atlas', parentGalaxy:id,
    description, size:classification, period:neighborhood, statLabels:['形态','所在区域'], color, shape,
    modelStatus:GALAXY_MODEL, source:citation, facts };
}

export const GALAXIES = [
  galaxy('galaxy','MILKY WAY','barred','棒旋星系','本星系群','#a0c9ff',
    '太阳所在的星系。恒星、气体与尘埃围绕共同的引力中心运动，我们就在其中一条旋臂附近。',
    ['太阳位于银河盘中，并不在银河中心。','从地球看到的银河光带，是我们从星系内部望向密集恒星的视线。','银河中心的人马座 A* 是超大质量黑洞。'], SOURCES.galaxies),
  galaxy('andromeda','ANDROMEDA · M31','spiral','旋涡星系','本星系群','#b2caff',
    '与银河系相邻的大型星系。明亮的中心外侧，尘埃带和恒星旋臂铺展成宽阔的星盘。',
    ['M31 是仙女座星系的梅西耶编号。','M32 与 M110 是它的伴星系。','这里的 AF And 与 AE And 是研究大质量恒星演化的目标。'],
    source('仙女座星系 · NASA','https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-31/')),
  galaxy('triangulum','TRIANGULUM · M33','spiral','旋涡星系','本星系群','#91dedb',
    '一座富含恒星形成区的旋涡星系。疏朗的旋臂中，年轻恒星把周围的气体照亮。',
    ['M33 是本星系群的主要成员之一。','罗马诺之星位于这座星系中。','M33 X-7 是恒星级黑洞双星，并非星系中央黑洞。'], SOURCES.localGroup),
  galaxy('lmc','LARGE MAGELLANIC CLOUD','irregular','不规则星系','银河系近邻','#7edcd3',
    '南半球天空中云朵般的光斑，其实是一整座星系。年轻星团和明亮星云让它充满活力。',
    ['名字中虽有“星云”，它实际是一座星系。','蜘蛛星云中的 R136 星团包含极高质量的恒星。','WOH G64 和黑洞双星 LMC X-1 也位于这里。'], SOURCES.localGroup),
  galaxy('smc','SMALL MAGELLANIC CLOUD','irregular','不规则星系','银河系近邻','#a7b6ff',
    '另一座伴随银河系的近邻星系。不规则的轮廓，记录着气体、恒星与引力之间的相互作用。',
    ['小麦哲伦星云也是星系，不是银河内的一团气体。','它与大麦哲伦星云是两个不同的星系。','HD 5980 是这里的大质量多星系统。'], SOURCES.localGroup),
  galaxy('m32','MESSIER 32 · NGC 221','elliptical','致密椭圆星系','仙女座的伴星系','#f0d0a1',
    '仙女座身旁一座紧凑的椭圆星系。大量恒星聚集在明亮中心，外形柔和而圆润。',
    ['M32 没有像典型旋涡星系那样清晰的旋臂。','它与 M110 都属于仙女座的伴星系。','恒星运动能帮助天文学家研究其中央黑洞。'],
    source('M32 · NASA','https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-32/')),
  galaxy('m110','MESSIER 110 · NGC 205','elliptical','矮椭圆星系','仙女座的伴星系','#d4dbeb',
    '仙女座另一侧的淡淡椭圆光晕。与明亮紧凑的 M32 相比，它显得更加舒展。',
    ['M110 也被编号为 NGC 205。','它是仙女座星系的伴星系。','椭圆外观不意味着所有恒星都沿一个椭圆轨道运动。'], SOURCES.localGroup),
  galaxy('barnard-galaxy','BARNARD’S GALAXY · NGC 6822','irregular','矮不规则星系','本星系群','#9cc7df',
    '一座疏松而不规则的矮星系。明亮气体云散落其中，揭示着新的恒星正在形成。',
    ['巴纳德星系的编号是 NGC 6822。','它与银河内的“巴纳德星”是不同的天体。','矮星系帮助我们研究较小规模的恒星系统。'], SOURCES.localGroup),
  galaxy('whirlpool','WHIRLPOOL · M51','spiral','旋涡星系','猎犬座方向','#93cfff',
    '两条清晰旋臂围绕中心展开，邻近伴星系的引力让这座星系成为研究相互作用的经典目标。',
    ['M51 也称旋涡星系。','它的伴星系 NGC 5195 会影响旋臂中的气体。','明亮旋臂是恒星形成活跃的区域。'],
    source('M51 · NASA','https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-51/')),
  galaxy('bode','BODE’S GALAXY · M81','spiral','旋涡星系','M81 星系群','#d2d6ff',
    '明亮的中央核球与柔和旋臂相互映衬。它与附近的雪茄星系一起展示星系相遇的影响。',
    ['M81 常被称为波德星系。','它与 M82 是相邻的两个星系。','星系间的引力能改变气体分布与恒星形成。']),
  galaxy('cigar','CIGAR GALAXY · M82','edge-on','星暴星系','M81 星系群','#e4a89f',
    '狭长星盘像一支雪茄，中心活跃的恒星形成驱动气体向外流动。',
    ['“星暴”描述一段格外活跃的恒星形成时期。','它的狭长外观与我们观看星系的方向有关。','模型中的两侧光羽表现气体外流，并非银河旋臂。'],
    source('M82 · NASA','https://science.nasa.gov/asset/hubble/nucleus-of-m82/')),
  galaxy('sombrero','SOMBRERO · M104','edge-on','带显著尘埃环的星系','室女座方向','#e6d3b3',
    '明亮核球外，一条深色尘埃带勾出帽檐般的轮廓。观看角度让它有了“草帽”的名字。',
    ['M104 的暗带来自遮挡背景星光的尘埃。','中央核球明显高出薄薄的盘面。','星系的外观同时受到结构与观看方向影响。'],
    source('M104 · NASA','https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-104/')),
  galaxy('centaurus-a','CENTAURUS A · NGC 5128','jet','活动星系','半人马座方向','#d6afda',
    '一道宽阔尘埃带横过恒星光晕，中心活动产生遥远的喷流，展示星系合并留下的痕迹。',
    ['弯曲的尘埃结构与过去的星系相互作用有关。','中心有超大质量黑洞。','模型把尘埃和喷流合并展示，实际观测常需不同波段。'],
    source('半人马座 A · NASA','https://science.nasa.gov/asset/hubble/active-galaxy-centaurus-a/')),
  galaxy('m87','MESSIER 87 · VIRGO A','jet','巨椭圆星系','室女座星系团','#bfc6f5',
    '巨大而平滑的恒星光晕中，中央黑洞驱动一束喷流。这里也是黑洞成像的重要观测目标。',
    ['M87 是巨椭圆星系，并非旋涡星系。','中心黑洞 M87* 的图像由事件视界望远镜合作组织公布。','喷流来自黑洞附近的高能物质，不是黑洞内部发出的光。'],
    source('M87 · NASA','https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-87/')),
];

function star(id, name, en, parentGalaxy, starClass, classification, color, description, facts, citation=SOURCES.stars) {
  return { id, name, en, kind:'star', parent:parentGalaxy, parentGalaxy, starClass,
    description, size:classification, period:galaxyNames[parentGalaxy], statLabels:['天体类型','所属星系'],
    color, modelStatus:STAR_MODEL, source:citation, facts };
}
const STARS = [
  star('proxima','比邻星','PROXIMA CENTAURI','galaxy','red-dwarf','红矮星','#ff9c75',
    '太阳最近的恒星邻居。它比太阳暗弱得多，却拥有值得探索的行星世界。',
    ['比邻星是南门二多星系统的成员。','比邻星 b 围绕这颗恒星运行。','红矮星较冷，肉眼并不能看到所有近邻恒星。'], SOURCES.proxima),
  star('alpha-centauri-a','南门二 A','ALPHA CENTAURI A','galaxy','main-sequence','类太阳恒星','#ffe0a6',
    '距离太阳很近的一颗恒星，与南门二 B 组成紧密的双星。',
    ['南门二 A 与 B 围绕共同的质心运动。','比邻星是这一多星系统的另一位成员。']),
  star('alpha-centauri-b','南门二 B','ALPHA CENTAURI B','galaxy','main-sequence','橙色主序星','#ffbf83',
    '南门二双星中较冷、较暗的一员。与伴星一起，它提醒我们恒星不总是独自诞生。',
    ['它与南门二 A 是两颗不同的恒星。','双星的运动帮助测量恒星质量。']),
  star('sirius-a','天狼星 A','SIRIUS A','galaxy','main-sequence','蓝白色主序星','#d3eaff',
    '夜空中最明亮恒星系统的主要成员，明亮外观来自自身光度和相对较近的距离。',
    ['它的伴星天狼星 B 是白矮星。','视亮度同时取决于恒星本身有多亮以及离我们有多远。']),
  star('sirius-b','天狼星 B','SIRIUS B','galaxy','white-dwarf','白矮星','#d9edff',
    '一颗恒星演化后留下的致密核心。它很小，却保留着可观的质量。',
    ['白矮星不是仍在进行常规核心氢聚变的主序星。','它与天狼星 A 组成双星。','本场景放大了白矮星，便于观察。']),
  star('vega','织女星','VEGA','galaxy','main-sequence','蓝白色主序星','#c9ddff',
    '夏夜醒目的蓝白色恒星，也是研究恒星周围尘埃盘的重要目标。',
    ['织女星位于天琴座方向。','它与牛郎星、天津四组成夏季大三角。']),
  star('pollux','北河三','POLLUX','galaxy','giant','橙色巨星','#ffbb7e',
    '双子座中的一颗橙色巨星，膨胀的外层揭示着与太阳不同的演化阶段。',
    ['北河三是双子座的明亮恒星之一。','巨星的“巨大”主要描述半径，不等同于极高质量。']),
  star('rigel','参宿七','RIGEL','galaxy','supergiant','蓝色超巨星','#b4d7ff',
    '猎户座一端的蓝白色灯塔。高温与巨大的发光面积让它十分明亮。',
    ['它与红色的参宿四在猎户座形成鲜明色彩对比。','蓝色恒星通常比红色恒星表面更热。']),
  star('betelgeuse','参宿四','BETELGEUSE','galaxy','supergiant','红超巨星','#ff8c65',
    '猎户座中的红超巨星，庞大的外层和变化的亮度，让我们得以研究恒星晚年的活动。',
    ['它的亮度会发生变化。','恒星颜色反映表面温度，红色并不表示更热。','无法仅凭一次变暗准确预报它何时爆发超新星。']),
  star('trappist-1','TRAPPIST-1','TRAPPIST-1','galaxy','red-dwarf','超冷矮星','#ff9672',
    '七颗已知行星紧密围绕着这颗小而冷的恒星，本图鉴选取其中 e、f、g 三颗。',
    ['这个系统的行星轨道十分紧凑。','适居带只描述潜在的温度条件，不证明存在生命。'], SOURCES.trappist),
  star('kepler-186','开普勒-186','KEPLER-186','galaxy','red-dwarf','红矮星','#f5ad85',
    '开普勒望远镜研究过的行星宿主星，其中的 f 行星是探索地球大小世界的重要目标。',
    ['行星经过恒星前方时会造成微弱变暗。','这类凌日信号帮助天文学家寻找系外行星。'], SOURCES.kepler186),
  star('kepler-22','开普勒-22','KEPLER-22','galaxy','main-sequence','类太阳恒星','#ffe0aa',
    '一颗拥有已确认系外行星的类太阳恒星。开普勒-22 b 的发现拓宽了对行星世界的想象。',
    ['开普勒-22 b 的发现采用了凌日法。','知道行星大小，并不等于知道它表面的真实景象。'], SOURCES.kepler22),
  star('hr-8799','HR 8799','HR 8799','galaxy','main-sequence','行星宿主星','#d5e5ff',
    '四颗巨行星围绕它运行，是通过直接成像研究多行星系统的经典目标。',
    ['本图鉴包含 b、c、d、e 四颗巨行星。','直接成像需要设法压制明亮的恒星光。'], SOURCES.hr8799),
  star('af-and','仙女座 AF','AF ANDROMEDAE','andromeda','supergiant','高光度蓝变星','#b7d8ff',
    '仙女座星系中一颗明亮而多变的恒星。研究它的光谱和亮度变化，有助于理解大质量恒星的失质。',
    ['AF And 位于银河系之外的仙女座星系。','这里附带的“仙女巨行星”仅为虚构科普演示。'],
    source('AF And 研究论文','https://arxiv.org/abs/1908.01893')),
  star('ae-and','仙女座 AE','AE ANDROMEDAE','andromeda','supergiant','高光度蓝变星','#c4e1ff',
    '仙女座的另一颗高光度蓝变星。变化的光谱为恒星外层和恒星风提供线索。',
    ['它与 AF And 是不同的恒星。','高光度蓝变星是研究大质量恒星演化的重要对象。'],
    source('M31 蓝变星研究论文','https://arxiv.org/abs/1412.5319')),
  star('romano','罗马诺之星','ROMANO’S STAR · GR 290','triangulum','supergiant','大质量变星','#bedcff',
    '三角座星系中的著名变星。它长期的亮度和光谱变化，记录着大质量恒星的演化。',
    ['它也被称为 GR 290。','本场景围绕它安排的“三角巨行星”为虚构展示。'],
    source('GR 290 研究论文','https://doi.org/10.1088/0004-6256/141/1/18')),
  star('r136a1','R136a1','R136a1','lmc','supergiant','极高质量恒星','#b2d2ff',
    '蜘蛛星云年轻星团中的耀眼成员，是研究恒星质量上限的重要目标。',
    ['它位于大麦哲伦星云的 R136 星团。','极高质量与极大半径并不是同一个概念。','“麦哲伦巨行星”是演示对象，不是它的已确认行星。'],
    source('R136 星团 · ESO','https://www.hq.eso.org/public/news/eso1030/')),
  star('woh-g64','WOH G64','WOH G64','lmc','supergiant','尘埃包围的演化恒星','#ff996c',
    '大麦哲伦星云中被尘埃包围的巨型恒星。它的变化为研究恒星晚期演化提供了难得窗口。',
    ['ESO 的干涉观测揭示了它周围的尘埃结构。','这里的红色球体为简化示意，不能代替观测图像。'],
    source('WOH G64 · ESO','https://www.hq.eso.org/public/news/eso2417/')),
  star('hd5980','HD 5980','HD 5980','smc','supergiant','大质量多星系统','#c1d8ff',
    '小麦哲伦星云中耀眼的多星系统。强烈恒星风的碰撞，能够产生高温气体和 X 射线。',
    ['这不是一颗孤立恒星，而是多星系统。','本图鉴以一个导航节点代表整个系统。','“小麦哲伦巨行星”是虚构演示目标。'],
    source('HD 5980 · ESA','https://www.esa.int/Science_Exploration/Space_Science/First_X-ray_detection_of_a_colliding-wind_binary_beyond_the_Milky_Way')),
  star('polaris','北极星 A','POLARIS A','galaxy','supergiant','造父变星','#ffe6bf',
    '靠近北天极的明亮恒星，多年来为北半球的观测者指示北方。',
    ['北极星并不位于天空中完全不动的一点。','造父变星的亮度周期可用于研究宇宙距离。']),
  star('altair','牛郎星','ALTAIR','galaxy','main-sequence','白色主序星','#e1ebff',
    '夏季大三角的一角。快速自转使它成为研究恒星形状与自转的有趣对象。',
    ['牛郎星位于天鹰座方向。','快速自转会让恒星赤道鼓起，偏离完美球体。']),
  star('arcturus','大角星','ARCTURUS','galaxy','giant','橙色巨星','#ffbb79',
    '牧夫座方向明亮的橙色巨星，温暖的色彩在夜空中很容易辨认。',
    ['它的演化阶段与太阳不同。','恒星的表面温度较低，也可能因体积庞大而十分明亮。']),
  star('aldebaran','毕宿五','ALDEBARAN','galaxy','giant','橙色巨星','#ffab79',
    '金牛座方向醒目的橙色恒星，常被想象成金牛的一只眼睛。',
    ['从地球看它靠近毕星团，但视线接近不等于实际相邻。','它是一颗已经膨胀的巨星。']),
  star('deneb','天津四','DENEB','galaxy','supergiant','白色超巨星','#cce0ff',
    '天鹅座尾部的白色超巨星，与织女星、牛郎星共同勾勒夏季大三角。',
    ['天空中的星座连线不代表恒星实际相连。','高光度让遥远的恒星也能成为夜空亮星。']),
  star('canopus','南船二','CANOPUS','galaxy','supergiant','明亮巨型恒星','#fff0c8',
    '南方夜空中的明亮灯塔，也曾成为航天器星敏感器参考的重要恒星。',
    ['它位于船底座方向。','能否看到南船二，取决于观测者所在的纬度。']),
  star('antares','心宿二 A','ANTARES A','galaxy','supergiant','红超巨星','#ff815f',
    '天蝎座心脏般的红色亮星。巨大的外层与较低表面温度，让它显出鲜明的暖色。',
    ['心宿二是双星系统。','本节点展示其中明亮的红超巨星 A。']),
  star('barnard-star','巴纳德星','BARNARD’S STAR','galaxy','red-dwarf','红矮星','#ed9c78',
    '太阳附近一颗暗弱的红矮星。它在天空背景中明显的位置变化，使它成为研究恒星自行的经典目标。',
    ['恒星自行是天体在天空中随时间的位置变化。','巴纳德星与遥远的巴纳德星系不是同一个对象。']),
];
const starNames = Object.fromEntries(STARS.map(item=>[item.id,item.name]));
function planet(id, name, en, parentStar, planetClass, classification, color, description, facts, citation=SOURCES.planets, fictional=false) {
  const host = STARS.find(item=>item.id===parentStar);
  return { id, name, en, kind:'planet', parent:parentStar, parentStar, parentGalaxy:host.parentGalaxy,
    planetClass, fictional, description, size:classification, period:starNames[parentStar],
    statLabels:['天体类型','宿主恒星'], color, modelStatus:fictional
      ? '虚构科普示意；没有观测发现依据，名称、表面和轨道均为创作。'
      : PLANET_MODEL, source:citation, facts };
}
const PLANETS = [
  planet('proxima-b','比邻星 b','PROXIMA CENTAURI b','proxima','rocky','系外行星','#b7b09a',
    '围绕最近恒星邻居运行的已确认行星。它让探索系外世界的想象，有了一个格外亲近的起点。',
    ['行星存在已获确认，但表面海洋和生命尚未证实。','红矮星的活动会影响对其行星环境的判断。'], SOURCES.proxima),
  planet('trappist-1-e','TRAPPIST-1 e','TRAPPIST-1 e','trappist-1','rocky','地球大小的行星','#8faeae',
    '紧凑的 TRAPPIST-1 系统成员之一，是研究岩石行星大气的目标。',
    ['适居带不是“已经适合居住”的结论。','模型中的地貌与颜色只是想象。'], SOURCES.trappist),
  planet('trappist-1-f','TRAPPIST-1 f','TRAPPIST-1 f','trappist-1','rocky','地球大小的行星','#9cb5c6',
    '比 e 更靠外的行星。相同宿主星下的不同轨道，提供了比较行星环境的机会。',
    ['它与 e、g 围绕同一颗恒星。','温度不仅取决于轨道，还与大气等条件有关。'], SOURCES.trappist),
  planet('trappist-1-g','TRAPPIST-1 g','TRAPPIST-1 g','trappist-1','rocky','地球大小的行星','#aebbc7',
    'TRAPPIST-1 系统较外侧的成员之一。它与邻居共同组成研究多行星系统的天然实验室。',
    ['这里展示的 e、f、g 并非这个系统的全部行星。','明暗与冰雪外观不表示已经拍到其表面。'], SOURCES.trappist),
  planet('kepler-186-f','开普勒-186 f','KEPLER-186 f','kepler-186','rocky','地球大小的行星','#9ca488',
    '位于宿主星适居带的地球大小行星。它说明与地球大小相近的世界也存在于其他恒星周围。',
    ['开普勒通过恒星亮度变化发现这类行星。','相似大小不意味着相同的大气、海洋或生态。'], SOURCES.kepler186),
  planet('kepler-22-b','开普勒-22 b','KEPLER-22 b','kepler-22','super-earth','超级地球','#7daebb',
    '比地球更大的已确认行星。它位于宿主星的适居带，而真实表面和内部组成仍需研究。',
    ['“超级地球”是大小或质量类别，不代表超级宜居。','模型中的蓝色外观不证明它拥有海洋。'], SOURCES.kepler22),
  ...[
    ['b','#cfaa9b','四颗已知巨行星中最外侧的一颗。'],
    ['c','#d6b28c','外侧与内侧行星之间的一颗巨行星。'],
    ['d','#bca2c5','围绕宿主星运行的年轻巨行星之一。'],
    ['e','#d5a67c','四颗已知巨行星中最内侧的一颗。'],
  ].map(([letter,color,text])=>planet(`hr-8799-${letter}`,`HR 8799 ${letter}`,`HR 8799 ${letter}`,'hr-8799','gas-giant','气态巨行星',color,
    `${text}这个系统让天文学家能够通过直接成像研究行星的运动和大气。`,
    ['实际观测中的行星远小于这里展示的视觉比例。','云带与颜色为艺术示意，不是已解析出的表面照片。'], SOURCES.hr8799)),
  ...[
    ['andromeda-demo','仙女巨行星 · 示意','ANDROMEDA DEMO','af-and','#c6a2d2'],
    ['triangulum-demo','三角巨行星 · 示意','TRIANGULUM DEMO','romano','#90c8c4'],
    ['lmc-demo','麦哲伦巨行星 · 示意','LMC DEMO','r136a1','#dab38e'],
    ['smc-demo','小麦哲伦巨行星 · 示意','SMC DEMO','hd5980','#a1b5da'],
  ].map(([id,name,en,host,color])=>planet(id,name,en,host,'gas-giant','虚构演示行星',color,
    '这是一颗为科普探索创作的虚构行星，用来演示从星系、恒星进入行星视角的过程，并非天文发现。',
    ['没有证据表明这颗演示行星真实存在。','它与宿主星的关联是交互设计，不是观测结论。'], SOURCES.illustrative,true)),
];
const BLACKHOLES = BLACK_HOLE_CATALOG;
export const DEEP_OBJECTS = [...STARS,...PLANETS,...BLACKHOLES];

export const EXTRA_DESTINATIONS = [
  {id:'atlas',name:'星系图鉴',en:'GALAXY ATLAS',kind:'overview',parent:null,parentGalaxy:null,
    description:'从银河系出发，探索 14 座形态各异的星系。选择一座星系，再进入其中的恒星、行星或黑洞。',
    size:'14 座星系',period:'分层探索',statLabels:['目的地','探索方式'],color:'#a8d6e7',modelStatus:GALAXY_MODEL,source:SOURCES.galaxies,
    facts:['图鉴排列用于导航，不是星系真实空间分布。','每座星系中的可访问对象是精选内容，并非完整天体普查。']},
  {id:'solar',name:'太阳系',en:'SOLAR SYSTEM',kind:'overview',parent:'galaxy',parentGalaxy:'galaxy',
    description:'以太阳为中心的行星家族。探索八大行星，观察轨道，并跟随航天器走向更远的空间。',
    size:'太阳与八大行星',period:'银河系',statLabels:['主要成员','所属星系'],color:'#ffc16b',modelStatus:'大小、距离与时间均经过压缩，便于观察。',
    source:source('太阳系 · NASA','https://science.nasa.gov/solar-system/'),facts:['太阳系位于银河系内部。','行星轨道在这里用圆轨道近似，真实轨道为椭圆。']},
  {id:'iss',name:'国际空间站',en:'INTERNATIONAL SPACE STATION',kind:'craft',parent:'earth',parentGalaxy:'galaxy',
    description:'在近地轨道上运行的载人实验室。展开的太阳能电池阵，为长期科学研究提供电力。',
    size:'载人空间实验室',period:'近地轨道',statLabels:['任务类型','运行区域'],color:'#a8c8eb',modelStatus:'结构与轨道为简化示意，不提供实时轨道位置。',
    source:source('国际空间站 · NASA','https://www.nasa.gov/international-space-station/'),facts:['空间站不断绕地球运行。','在轨实验帮助研究微重力对材料和生命的影响。']},
  {id:'jwst',name:'詹姆斯·韦伯太空望远镜',aliases:['韦布望远镜','韦布太空望远镜','韦伯望远镜','韦伯太空望远镜','韦布空间望远镜','詹姆斯韦伯太空望远镜'],en:'JAMES WEBB SPACE TELESCOPE',kind:'craft',parent:'solar',parentGalaxy:'galaxy',
    description:'金色分段主镜与多层遮阳板组成这座红外天文台。查看展开过程，理解它为何需要保持低温。',
    size:'红外空间望远镜',period:'日地 L2 附近',statLabels:['任务类型','运行区域'],color:'#e8c77b',modelStatus:'结构和展开顺序为科普简化，位置不采用实时星历。',
    source:source('詹姆斯·韦伯太空望远镜 · NASA','https://science.nasa.gov/mission/webb/'),facts:['韦布在日地 L2 附近的轨道上运行，并非绕地球近轨飞行。','遮阳板帮助冷却红外仪器，分段镜面收集来自遥远宇宙的光。']},
  {id:'roman',name:'南希·格蕾丝·罗曼太空望远镜',aliases:['罗曼望远镜','罗曼太空望远镜','罗曼空间望远镜','南希罗曼','南希·罗曼','Nancy Grace Roman','WFIRST'],en:'NANCY GRACE ROMAN SPACE TELESCOPE',kind:'craft',parent:'solar',parentGalaxy:'galaxy',
    description:'以宽广视场巡天的红外天文台。通过大量星系与恒星的观测，研究暗能量、暗物质和系外行星。',
    size:'广视场红外太空望远镜',period:'日地 L2 附近',statLabels:['任务类型','目标工作区域'],color:'#c8b0ee',modelStatus:'结构、位置与转移路径为科普示意；L2 晕轨道是目标工作区域，不显示实时位置或飞行进度。',
    source:source('南希·格蕾丝·罗曼太空望远镜 · NASA','https://science.nasa.gov/mission/roman-space-telescope/'),facts:['主镜直径为 2.4 米，广角仪器的视场至少是哈勃的 100 倍。','目标轨道位于日地 L2 附近，不是地球低轨道。','任务阶段说明依据 NASA 2026 年 10 月 14 日的仪器测试、校准与对焦进展，不提供实时追踪。']},
  {id:'voyager',name:'旅行者 1 号',en:'VOYAGER 1',kind:'craft',parent:'solar',parentGalaxy:'galaxy',
    description:'从行星飞掠走向星际空间的探测器。高增益天线把极其微弱的信号，送回遥远的地球。',
    size:'深空探测器',period:'日球层之外',statLabels:['任务类型','探索区域'],color:'#d9c5aa',modelStatus:'采用 NASA 官方结构模型；场景比例为示意，不显示实时距离或通信状态。',
    source:source('旅行者 · NASA','https://science.nasa.gov/mission/voyager/'),facts:['旅行者 1 号已经穿越日球层顶。','进入星际介质，不等于已经离开太阳的全部引力影响范围。']},
  {id:'trajectories',name:'运动轨迹',en:'MOTION LAB',kind:'trajectory',parent:'solar',parentGalaxy:'galaxy',
    description:'观察同一段运动在不同参照系中留下的轨迹。切换太阳与银河参照系，比较轨道和空间路径。',
    size:'太阳 / 银河参照系',period:'短 / 长轨迹',statLabels:['观察视角','记录范围'],color:'#85d7d0',modelStatus:'教学用运动模型；速度、尺度、太阳路径均经过简化，不是实时星历。',
    source:source('太阳系运动 · NASA','https://science.nasa.gov/solar-system/'),facts:['轨道与运动轨迹不是同一概念。','物体的轨迹形状会随所选参照系改变。']},
];

export const CATALOG = Object.fromEntries([...EXTRA_DESTINATIONS,...GALAXIES,...DEEP_OBJECTS,...NEBULA_DESTINATIONS,...EARTH_ORBIT_CATALOG].map(item=>[item.id,item]));
// Solar bodies retain their detailed texture/stat records in app.js. These minimal
// navigation aliases allow breadcrumbs to work without duplicating that catalog.
const SOLAR_NAV = {
  sun:{id:'sun',name:'太阳',parent:'solar'},earth:{id:'earth',name:'地球',parent:'solar'},moon:{id:'moon',name:'月球',parent:'earth'},
  mercury:{id:'mercury',name:'水星',parent:'solar'},venus:{id:'venus',name:'金星',parent:'solar'},mars:{id:'mars',name:'火星',parent:'solar'},
  jupiter:{id:'jupiter',name:'木星',parent:'solar'},saturn:{id:'saturn',name:'土星',parent:'solar'},uranus:{id:'uranus',name:'天王星',parent:'solar'},neptune:{id:'neptune',name:'海王星',parent:'solar'},
};
export function childrenOf(parent) {
  const id = typeof parent === 'string' ? parent : parent?.id;
  return Object.values(CATALOG).filter(item=>item.parent===id);
}
export function breadcrumbsFor(id) {
  const path=[],seen=new Set();
  let item=CATALOG[id]||SOLAR_NAV[id];
  while(item&&!seen.has(item.id)) {
    seen.add(item.id);path.unshift(item);item=CATALOG[item.parent]||SOLAR_NAV[item.parent];
  }
  return path;
}


