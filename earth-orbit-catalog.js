// Educational Earth-orbit destinations. Positions are not based on live TLE data.
// ISS intentionally retains its existing ID so saved navigation and guide links work.
const source = (label, url) => ({ label, url });
const ORBIT_MODEL = '轨道形状、倾角、位置、模型大小与动画速度均为科普示意；距离经过压缩，不代表实时轨道位置。';
const TYPE_MODEL = '卫星类型示意，不对应某颗实际卫星。' + ORBIT_MODEL;
const SOURCES = {
  iss: source('国际空间站 · NASA', 'https://www.nasa.gov/reference/international-space-station/'),
  tiangong: source('中国空间站 · 中国载人航天', 'https://www.cmse.gov.cn/hdjl/bszjhd/bjzl/202211/t20221107_51360.html'),
  hubble: source('哈勃太空望远镜 · NASA', 'https://science.nasa.gov/mission/hubble/observatory/'),
  orbits: source('地球卫星轨道 · NASA', 'https://science.nasa.gov/earth/earth-observatory/catalog-of-earth-satellite-orbits/'),
  navigation: source('卫星定位原理 · GPS.gov', 'https://www.gps.gov/systems/gps/index.php'),
  communications: source('空间通信原理 · NASA', 'https://www.nasa.gov/missions/tech-demonstration/space-communications-7-things-you-need-to-know/'),
  weather: source('气象卫星与轨道 · NOAA', 'https://www.nesdis.noaa.gov/about/k-12-education/satellites-technology/why-do-satellites-have-different-orbits'),
};

function craft(id, name, en, classification, task, region, color, description, facts, citation, generic = false) {
  return {
    id, name, en, kind: 'craft', parent: 'earth', parentGalaxy: 'galaxy', nearEarth: true,
    ...(id === 'hubble' ? { aliases: ['哈勃望远镜', '哈勃空间望远镜'] } : {}),
    type: `地球轨道 / ${classification}`, description,
    size: task, period: region, statLabels: ['任务类型', '运行区域'], color,
    modelStatus: generic ? TYPE_MODEL : id === 'hubble' ? `采用 NASA 官方三维结构模型。${ORBIT_MODEL}` : `真实航天器；结构为简化模型。${ORBIT_MODEL}`,
    source: citation, facts,
  };
}

export const EARTH_ORBIT_CATALOG = [
  craft('iss', '国际空间站', 'ISS · INTERNATIONAL SPACE STATION', '载人空间站',
    '载人空间实验室', '近地轨道', '#b5d7f4',
    '展开的太阳翼与长桁架，连接着宇航员生活和工作的舱段。这座环绕地球的实验室，让我们研究微重力中的生命与物质。',
    ['多个舱段在轨道上逐步组装，形成可供宇航员生活与开展实验的空间站。',
      '太阳翼把阳光转化为电能，为舱内设备和科学实验提供能源。'], SOURCES.iss),
  craft('tiangong', '天宫空间站', 'TIANGONG · CHINA SPACE STATION', '载人空间站',
    '载人空间实验室', '近地轨道', '#e9c493',
    '天和核心舱与问天、梦天实验舱组成醒目的 T 字基本构型。航天员在这里生活、工作，开展空间科学实验与技术试验。',
    ['天和核心舱负责空间站平台的统一管理和控制，问天与梦天是两个实验舱。',
      '三舱的功能相互补充，支持航天员驻留以及舱内、舱外的科学实验。'], SOURCES.tiangong),
  craft('hubble', '哈勃太空望远镜', 'HUBBLE SPACE TELESCOPE', '空间望远镜',
    '天文观测', '近地轨道', '#b9cafa',
    '这座环绕地球的天文台把镜头朝向宇宙。银色镜筒汇集遥远天体的光，让我们看见恒星、星云与星系的细节。',
    ['在地球大气主要干扰之上观测，有助于获得清晰图像并观察部分地面难以接收的波段。',
      '哈勃曾由航天飞机宇航员在轨维修和升级；选中后可近看 NASA 官方三维模型。'], SOURCES.hubble),
  craft('earth-observer', '遥感卫星', 'EARTH OBSERVATION · TYPE MODEL', '遥感卫星 · 类型示意',
    '对地观测', '低地轨道示意', '#8fdbb6',
    '把传感器指向地表，观察陆地、海洋与环境的变化。这里用一颗科普卫星，演示对地观测航天器绕行的样子。',
    ['对地观测卫星利用不同传感器记录地球信息，并不都使用普通相机。',
      '轨道会影响能够看见的区域，以及再次经过同一区域的机会。'], SOURCES.orbits, true),
  craft('navigation-sat', '导航卫星', 'NAVIGATION SATELLITE · TYPE MODEL', '导航卫星 · 类型示意',
    '定位与授时', '中地轨道示意', '#e6cf80',
    '把位置与时间信息通过无线电信号送向地球。接收设备综合多颗卫星的信号，计算自己的位置和时间。',
    ['卫星定位依靠信号中的时间和卫星位置信息，不是从太空拍照识别你的位置。',
      '这里展示导航卫星这一类型，不代表某一导航系统的真实星座配置。'], SOURCES.navigation, true),
  craft('comms-sat', '通信卫星', 'COMMUNICATIONS SATELLITE · TYPE MODEL', '通信卫星 · 类型示意',
    '信号中继', '高轨道示意', '#d9a4e8',
    '展开太阳翼和天线，在地面设备与远方的通信端之间转发信息。轨道选择会影响覆盖范围和通信方式。',
    ['通信卫星可以转发无线电或光通信信号，帮助数据在相隔遥远的终端之间传递。',
      '一些任务借助中继卫星与地面通信；本模型用于说明中继任务，不对应具体通信网络。'], SOURCES.communications, true),
  craft('weather-sat', '气象卫星', 'WEATHER SATELLITE · TYPE MODEL', '气象卫星 · 类型示意',
    '天气与环境观测', '地球轨道示意', '#85cce8',
    '从太空观察云系、大气和环境变化，为认识天气提供数据。这里的绕行用于展示卫星观测，不代表实时天气图像。',
    ['气象任务会使用不同轨道：静止轨道适合持续关注同一区域，极轨卫星则能观察更广范围。',
      '不同卫星的数据相互补充，帮助科学家了解大气状态和天气变化。'], SOURCES.weather, true),
  craft('polar-sat', '极轨卫星', 'POLAR ORBITER · TYPE MODEL', '极轨卫星 · 类型示意',
    '全球巡测', '近极轨道示意', '#94b8f3',
    '沿着接近南北方向的轨道绕行，飞越高纬度地区。地球在卫星下方转动，让它逐渐观察不同的地表区域。',
    ['“极轨”描述轨道方向，而不是一种单独的载荷；遥感和气象卫星都可能采用近极轨道。',
      '卫星每次绕行与地球自转共同改变地面覆盖区域，便于开展较大范围的观测。'], SOURCES.weather, true),
];
