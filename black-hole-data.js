import {DEEP_KNOWLEDGE} from './knowledge-deep.js';
// Approximate reference values, not live measurements. Sources retained for offline attribution.
export const BLACK_HOLE_SOURCES = [
  {name:'ESO / EHT · 人马座 A* 首张图像（2022）',url:'https://www.eso.org/public/news/eso2208-eht-mw/'},
  {name:'NASA Science · 黑洞与结构',url:'https://science.nasa.gov/universe/black-holes/'},
  {name:'NASA Science · 黑洞结构',url:'https://science.nasa.gov/universe/black-holes/anatomy/'},
  {name:'NASA · M87 与 EHT 质量估计',url:'https://www.nasa.gov/missions/spitzer/the-giant-galaxy-around-the-giant-black-hole/'},
  {name:'NASA / IXPE · 天鹅座 X-1',url:'https://www.nasa.gov/universe/nasas-ixpe-reveals-shape-orientation-of-hot-matter-around-black-hole/'},
];


export const BLACK_HOLES = [
  {id:'sgr-a',name:'人马座 A*',en:'SAGITTARIUS A*',spoken:'人马座 A 星',kind:'超大质量黑洞',location:'银河系中心',mass:4e6,massLabel:'约 400 万个太阳',color:0xffb766,
    summary:'在银河系中心，恒星正围绕一个看不见的致密天体运行。人马座 A* 就是我们银河系的中央黑洞。',
    facts:[['恒星的轨道','天文学家跟踪银心附近恒星的运动，从轨道推算出中心存在质量极大、体积极小的天体。'],['看见黑洞的“影子”','事件视界望远镜在 2022 年发布人马座 A* 的首张图像。明亮环状结构来自周围的辐射，中央暗区与黑洞阴影有关。'],['我们的银河邻居','它距离我们约 2.6 万光年。银河中的恒星有各自的轨道，并不会自动被中央黑洞吞没。']],
    source:'NASA Science · Black Holes；EHT 银心图像（2022）',
    narration:'在银河系中心，藏着人马座 A 星，一颗质量约为太阳四百万倍的超大质量黑洞。科学家长年跟踪附近恒星的轨道，发现它们围绕一个极其致密的天体运行。二零二二年，事件视界望远镜发布了它的首张图像。图像中发亮的是黑洞周围的辐射，中央暗区与黑洞阴影有关，不能把亮环当成黑洞的表面。黑洞也不是宇宙吸尘器，在安全距离外，恒星可以沿轨道运行。转动眼前的教学模型，看看发光的吸积盘与中央暗区。这里的颜色、大小和运动经过简化，不是真实照片。'},
  {id:'m87',name:'M87*',en:'MESSIER 87*',spoken:'M 八十七星',kind:'超大质量黑洞',location:'室女座 · M87 星系中心',mass:6.5e9,massLabel:'约 65 亿个太阳',color:0xff9c44,
    summary:'M87 星系中心的庞然大物，是人类首张黑洞图像的主角。它让遥远的引力边界第一次有了可辨认的轮廓。',
    facts:[['第一张黑洞图像','2019 年，事件视界望远镜合作组织发布 M87* 图像。观测使用地球不同地点的射电望远镜，合成极高分辨率的观测能力。'],['一束很长的喷流','M87 的中心向外喷出高速物质。喷流来自黑洞外部、与吸积及磁场有关，不是物质从事件视界内逃出来。'],['与银心黑洞比较','这里采用 EHT 的约 65 亿太阳质量参考值，约为本页人马座 A* 参考质量的 1600 倍。不同观测方法会得到有差异的估计。']],
    source:'NASA / Spitzer · M87；EHT 质量估计（2019）',
    narration:'M 八十七星位于 M 八十七星系的中心，是一颗超大质量黑洞。二零一九年，事件视界望远镜发布了人类第一张黑洞图像，主角就是它。分布在世界各地的射电望远镜协同观测，描绘出发光物质围绕中央暗区的轮廓。本页采用约六十五亿个太阳质量的参考估计，大约是人马座 A 星的一千六百倍。这个星系中心还有很长的高速喷流。喷流的物质来自黑洞外部，与吸积和磁场有关，并不是从事件视界内部逃出。当前模型只演示黑洞周围的结构，不复原这次射电观测。'},
  {id:'cyg-x1',name:'天鹅座 X-1',en:'CYGNUS X-1',spoken:'天鹅座 X 一',kind:'恒星级黑洞',location:'银河系 · 双星系统',mass:21,massLabel:'约 21 个太阳',color:0xffd19a,
    summary:'它与一颗大质量恒星相伴。流向黑洞的物质被加热并发出强烈 X 射线，让看不见的黑洞留下可测量的线索。',
    facts:[['从伴星寻找线索','观测伴星的运动、距离和系统的其他性质，可以估计不可见伴侣的质量。约 21 个太阳质量是更新后的参考估计。'],['为何会发出 X 射线','气体在黑洞附近形成高温吸积流及日冕。明亮的 X 射线主要来自这些外部的高温区域，而不是黑洞内部。'],['两种规模的黑洞','天鹅座 X-1 属于恒星级黑洞。它比人马座 A* 和 M87* 小得多；切换目标时，模型会独立缩放以方便观察。']],
    source:'NASA / IXPE · Cygnus X-1（2022）',
    narration:'天鹅座 X 一是一套双星系统，其中一颗是大质量恒星，另一颗是质量约为太阳二十一倍的恒星级黑洞。来自伴星的物质向黑洞流动，在附近形成高温吸积流和日冕，产生强烈的 X 射线。科学家结合伴星的运动等观测线索，推算不可见天体的质量。发光的是黑洞外部的物质，黑洞本身并没有发光的表面。它的质量远小于人马座 A 星和 M 八十七星。页面会为每个目标单独调整显示尺度，因此它们在屏幕上看起来相近，不代表真实大小相近。'},
  ...[
  {
    "id": "m31-blackhole",
    "catalogId": "m31-blackhole",
    "name": "仙女座中央黑洞",
    "en": "M31 CENTRAL BLACK HOLE",
    "kind": "超大质量黑洞",
    "location": "仙女座星系",
    "mass": 140000000,
    "massLabel": "约 1.4 亿个太阳",
    "color": 16760190,
    "summary": "仙女座星系中心的致密引力源。天文学家通过附近恒星和气体的运动研究它。",
    "facts": [
      [
        "蓝色恒星盘围绕核心",
        "哈勃发现仙女座中心存在由蓝色恒星组成的致密盘，外面还有较老恒星构成的结构。它们的运动帮助研究中心不可见的集中质量，而不是直接拍到黑洞内部。"
      ],
      [
        "中心亮点需要拆开解释",
        "星系核区的光可能同时包含不同年龄恒星和周围物质的贡献。把亮度分布与光谱速度结合，可以区分这些结构，并检验超大质量黑洞主导的引力环境。"
      ]
    ],
    "metrics": [
      {
        "label": "参考质量",
        "value": "约 1.4 亿个太阳"
      },
      {
        "label": "所在位置",
        "value": "仙女座星系中心"
      },
      {
        "label": "关键观测对象",
        "value": "核心附近的恒星盘"
      }
    ],
    "sources": [
      {
        "name": "仙女座黑洞附近的蓝色恒星盘 · NASA",
        "url": "https://science.nasa.gov/missions/hubble/hubble-finds-mysterious-disk-of-blue-stars-around-black-hole/"
      }
    ],
    "source": "仙女座黑洞附近的蓝色恒星盘 · NASA",
    "narrationKey": "facts/m31-blackhole"
  },
  {
    "id": "m32-blackhole",
    "catalogId": "m32-blackhole",
    "name": "M32 中央黑洞",
    "en": "M32 CENTRAL BLACK HOLE",
    "kind": "超大质量黑洞",
    "location": "M32 星系",
    "mass": 2500000,
    "massLabel": "约 250 万个太阳",
    "color": 16760190,
    "summary": "致密椭圆星系 M32 中心的黑洞，是研究星系核心与黑洞联系的目标。",
    "facts": [
      [
        "恒星替看不见的质量作证",
        "M32 的中心恒星高度集中，越靠近核心，恒星运动越快。天文学家把这些观测与引力模型比较，推断核心存在数百万太阳质量量级的超大质量黑洞。"
      ],
      [
        "模型估计保留不确定性",
        "黑洞质量需要结合距离、恒星分布与轨道模型推算。本页采用 SAURON 研究中约 250 万太阳质量的参考估计；该研究给出的误差约为正负 50 万太阳质量，不同模型也可能得到不同结果。"
      ]
    ],
    "metrics": [
      {
        "label": "参考质量",
        "value": "约 250 万个太阳"
      },
      {
        "label": "所在位置",
        "value": "M32 星系核心"
      },
      {
        "label": "主要证据",
        "value": "恒星密度与轨道速度"
      }
    ],
    "sources": [
      {
        "name": "M32 核心的黑洞证据 · NASA",
        "url": "https://science.nasa.gov/missions/hubble/nasas-hubble-space-telescope-images-the-dense-nucleus-of-galaxy-m32/"
      },
      {
        "name": "M32 黑洞质量的 SAURON 测量 · Verolme 等（2002）",
        "url": "https://arxiv.org/abs/astro-ph/0201086"
      }
    ],
    "source": "M32 核心的黑洞证据 · NASA；SAURON 质量测量 · Verolme 等（2002）",
    "narrationKey": "facts/m32-blackhole"
  },
  {
    "id": "m33-x7",
    "catalogId": "m33-x7",
    "name": "M33 X-7 黑洞",
    "en": "M33 X-7",
    "kind": "恒星级黑洞双星",
    "location": "三角座星系",
    "mass": 15.65,
    "massLabel": "约 16 个太阳",
    "color": 16760190,
    "summary": "三角座星系中的黑洞双星。伴星的物质流向黑洞附近，产生可被 X 射线望远镜研究的辐射。",
    "facts": [
      [
        "不是三角座的中央黑洞",
        "M33 X-7 位于三角座星系内，由一颗恒星级黑洞和大质量伴星组成。伴星的恒星风向黑洞附近输送物质，吸积环境能产生高能辐射，供 X 射线望远镜观测。"
      ],
      [
        "利用遮掩测量系统",
        "伴星会遮挡来自黑洞附近的 X 射线。结合这种食现象和伴星光谱中的轨道运动，可以约束两者的尺寸与质量；图中的吸积盘属于物理过程示意。"
      ]
    ],
    "metrics": [
      {
        "label": "参考质量",
        "value": "约 16 个太阳"
      },
      {
        "label": "目标类型",
        "value": "恒星级黑洞双星"
      }
    ],
    "sources": [
      {
        "name": "M33 X-7 的双星观测 · NASA/Chandra",
        "url": "https://chandra.harvard.edu/photo/2007/m33x7/"
      }
    ],
    "source": "M33 X-7 的双星观测 · NASA/Chandra",
    "narrationKey": "facts/m33-x7"
  },
  {
    "id": "lmc-x1",
    "catalogId": "lmc-x1",
    "name": "LMC X-1 黑洞",
    "en": "LMC X-1",
    "kind": "恒星级黑洞双星",
    "location": "大麦哲伦星云",
    "mass": 10.91,
    "massLabel": "约 10.9 个太阳",
    "color": 16760190,
    "summary": "大麦哲伦星云中的黑洞双星。来自伴星的物质，使黑洞附近区域在高能波段中显现。",
    "facts": [
      [
        "大麦哲伦中的黑洞双星",
        "LMC X-1 是大麦哲伦星云中的恒星级黑洞双星，不能当作整座星系的中央黑洞。光学伴星的运动与 X 射线观测互相补充，帮助确定系统的轨道和性质。"
      ],
      [
        "把多个观测拼在一起",
        "研究者将测光、光谱和动力学模型结合，估算黑洞及伴星的质量。X 射线主要来自黑洞附近的高温吸积环境，亮度变化并不等于黑洞内部有光逃出。"
      ]
    ],
    "metrics": [
      {
        "label": "参考质量",
        "value": "约 10.9 个太阳"
      },
      {
        "label": "目标类型",
        "value": "大质量 X 射线双星"
      },
      {
        "label": "双星轨道周期",
        "value": "约 3.91 天"
      }
    ],
    "sources": [
      {
        "name": "LMC X-1 的动力学模型 · 研究论文",
        "url": "https://arxiv.org/abs/0810.3447"
      }
    ],
    "source": "LMC X-1 的动力学模型 · 研究论文",
    "narrationKey": "facts/lmc-x1"
  }
],
  {id:'ton618',name:'TON 618',en:'TON 618',spoken:'T O N 六一八',kind:'超大质量黑洞',location:'遥远类星体 TON 618 的中心',hostGalaxyName:'TON 618 宿主星系',mass:6.6e10,massLabel:'约 660 亿个太阳',color:0xffc77d,
    summary:'遥远类星体 TON 618 的中央黑洞，质量估计达到数百亿个太阳。周围炽热的吸积物质让它所在的星系核心异常明亮。',
    facts:[['黑洞与类星体','TON 618 是类星体的名称；这里展示它中心的超大质量黑洞。类星体的强烈光芒来自黑洞附近的吸积物质，不是从事件视界内部射出的光。'],['数百亿个太阳的质量','本页采用 NASA 科普资料中约 660 亿太阳质量的参考估计，约为 M87* 本页参考质量的 10 倍。质量估计依赖观测与模型，不能把这个数值当作精确测量。'],['位于遥远的宿主星系','它位于银河系之外的类星体宿主星系中心。这里的模型独立缩放，展示黑洞周围的结构；切换目标时画面大小相近，不代表真实质量与尺度相同。']],
    sources:[BLACK_HOLE_SOURCES[1],{name:'NASA / Webb · 类星体与黑洞吸积',url:'https://science.nasa.gov/mission/webb/science-overview/science-explainers/how-do-we-know-there-are-black-holes/'}],
    source:'NASA Science · Black Holes；NASA / Webb · How Do We Know There Are Black Holes?',
    narration:'T O N 六一八，是一个遥远类星体的名字。我们正在观察的教学模型，表示它中心的超大质量黑洞。本页采用美国航天局科普资料中，约六百六十亿个太阳质量的参考估计，大约是 M 八十七星参考质量的十倍。这个数字依赖观测和模型，并不是没有误差的精确常数。类星体为什么如此明亮？发光的是黑洞附近炽热的吸积物质，并不是光从事件视界内部逃了出来。它位于银河系之外的宿主星系中心。页面为每颗黑洞单独调整显示尺度，所以画面中大小相近，并不代表它们的真实大小相同。你可以拖动模型，观察吸积盘与中央暗区的关系。'},
];

// One registry feeds the atlas and the dedicated explorer. Historical scene IDs
// remain aliases so saved targets and existing videos continue to resolve.
const originalCatalog = {
  "sagittarius-a": {
    "id": "sagittarius-a",
    "name": "人马座 A*",
    "en": "SAGITTARIUS A*",
    "kind": "blackhole",
    "parent": "galaxy",
    "parentGalaxy": "galaxy",
    "blackholeClass": "supermassive",
    "description": "银河系中心的超大质量黑洞。周围恒星的轨道，是测量其质量和研究强引力的重要线索。",
    "size": "超大质量黑洞",
    "period": "银河系",
    "statLabels": [
      "天体类型",
      "所属星系"
    ],
    "color": "#ffbd7e",
    "modelStatus": "黑洞与吸积盘为科普示意；光环、喷流和背景弯曲不代表实时观测或精确相对论模拟。",
    "source": {
      "label": "黑洞知识 · NASA",
      "url": "https://science.nasa.gov/universe/black-holes/"
    },
    "facts": [
      "黑洞本身不会发出可见光；周围物质可以辐射。",
      "吸积盘是附近物质形成的结构，不是黑洞的固体表面。"
    ]
  },
  "m31-blackhole": {
    "id": "m31-blackhole",
    "name": "仙女座中央黑洞",
    "en": "M31 CENTRAL BLACK HOLE",
    "kind": "blackhole",
    "parent": "andromeda",
    "parentGalaxy": "andromeda",
    "blackholeClass": "supermassive",
    "description": "仙女座星系中心的致密引力源。天文学家通过附近恒星和气体的运动研究它。",
    "size": "超大质量黑洞",
    "period": "仙女座星系",
    "statLabels": [
      "天体类型",
      "所属星系"
    ],
    "color": "#ffbd7e",
    "modelStatus": "黑洞与吸积盘为科普示意；光环、喷流和背景弯曲不代表实时观测或精确相对论模拟。",
    "source": {
      "label": "黑洞知识 · NASA",
      "url": "https://science.nasa.gov/universe/black-holes/"
    },
    "facts": [
      "“中央黑洞”描述它在星系中的位置。",
      "显示中的明亮吸积盘是一种解释性图像。"
    ]
  },
  "m32-blackhole": {
    "id": "m32-blackhole",
    "name": "M32 中央黑洞",
    "en": "M32 CENTRAL BLACK HOLE",
    "kind": "blackhole",
    "parent": "m32",
    "parentGalaxy": "m32",
    "blackholeClass": "supermassive",
    "description": "致密椭圆星系 M32 中心的黑洞，是研究星系核心与黑洞联系的目标。",
    "size": "超大质量黑洞",
    "period": "M32 星系",
    "statLabels": [
      "天体类型",
      "所属星系"
    ],
    "color": "#ffbd7e",
    "modelStatus": "黑洞与吸积盘为科普示意；光环、喷流和背景弯曲不代表实时观测或精确相对论模拟。",
    "source": {
      "label": "黑洞知识 · NASA",
      "url": "https://science.nasa.gov/universe/black-holes/"
    },
    "facts": [
      "它与仙女座中央黑洞是两个不同对象。",
      "恒星速度的变化能够揭示看不见的中心质量。"
    ]
  },
  "m33-x7": {
    "id": "m33-x7",
    "name": "M33 X-7 黑洞",
    "en": "M33 X-7",
    "kind": "blackhole",
    "parent": "triangulum",
    "parentGalaxy": "triangulum",
    "blackholeClass": "stellar",
    "description": "三角座星系中的黑洞双星。伴星的物质流向黑洞附近，产生可被 X 射线望远镜研究的辐射。",
    "size": "恒星级黑洞双星",
    "period": "三角座星系",
    "statLabels": [
      "天体类型",
      "所属星系"
    ],
    "color": "#ffbd7e",
    "modelStatus": "黑洞与吸积盘为科普示意；光环、喷流和背景弯曲不代表实时观测或精确相对论模拟。",
    "source": {
      "label": "M33 X-7 · NASA / Chandra",
      "url": "https://chandra.harvard.edu/photo/2007/m33x7/"
    },
    "facts": [
      "它不是三角座星系的中央黑洞。",
      "伴星的轨道和掩食可帮助测量这个系统。"
    ]
  },
  "lmc-x1": {
    "id": "lmc-x1",
    "name": "LMC X-1 黑洞",
    "en": "LMC X-1",
    "kind": "blackhole",
    "parent": "lmc",
    "parentGalaxy": "lmc",
    "blackholeClass": "stellar",
    "description": "大麦哲伦星云中的黑洞双星。来自伴星的物质，使黑洞附近区域在高能波段中显现。",
    "size": "恒星级黑洞双星",
    "period": "大麦哲伦星云",
    "statLabels": [
      "天体类型",
      "所属星系"
    ],
    "color": "#ffbd7e",
    "modelStatus": "黑洞与吸积盘为科普示意；光环、喷流和背景弯曲不代表实时观测或精确相对论模拟。",
    "source": {
      "label": "黑洞 X 射线源表 · NASA Swift",
      "url": "https://swift.gsfc.nasa.gov/results/transients/BlackHoles.html"
    },
    "facts": [
      "它是恒星级黑洞，不是整个星系的中央黑洞。",
      "X 射线来自黑洞附近的高温物质。"
    ]
  }
};
const originalMetadata = {
  'sgr-a': {catalogId:'sagittarius-a',parentGalaxy:'galaxy',sourceIndex:0},
  'm87': {catalogId:'m87-blackhole',parentGalaxy:'m87',sourceIndex:3},
  'cyg-x1': {catalogId:'cyg-x1',parentGalaxy:'galaxy',sourceIndex:4},
  'ton618': {catalogId:'ton618',parentGalaxy:null,sourceIndex:1},
};
const galaxyNames={galaxy:'银河系',m87:'M87 星系'};
export const BLACK_HOLE_CATALOG=BLACK_HOLES.map(record=>{
  const meta=originalMetadata[record.id];
  if(meta){record.catalogId=meta.catalogId;record.narrationKey='blackholes/'+record.id;record.sources??=[BLACK_HOLE_SOURCES[meta.sourceIndex]];}
  const original=originalCatalog[record.catalogId];
  const object=original||{
    id:record.catalogId,name:record.name,en:record.en,kind:'blackhole',parent:meta.parentGalaxy||'atlas',parentGalaxy:meta.parentGalaxy,hostGalaxyName:record.hostGalaxyName,
    blackholeClass:record.kind.includes('恒星级')?'stellar':'supermassive',description:record.summary,
    size:record.kind,period:galaxyNames[meta.parentGalaxy]||record.hostGalaxyName,statLabels:['天体类型','所属星系'],color:'#ffbd7e',
    modelStatus:'黑洞与吸积盘为科普示意；光环、喷流和背景弯曲不代表实时观测或精确相对论模拟。',
    source:{label:record.sources[0].name,url:record.sources[0].url},facts:record.facts.map(item=>item[1]),narration:record.narration,
  };
  record.parentGalaxy=object.parentGalaxy;
  return {...object,name:record.name,en:record.en,blackHoleId:record.id};
});
export const BLACK_HOLE_KNOWLEDGE=Object.fromEntries(BLACK_HOLES.map(record=>[record.catalogId,
  DEEP_KNOWLEDGE[record.catalogId]||{
    metrics:[{label:'参考质量',value:record.massLabel},{label:'所在位置',value:record.location}],
    sections:record.facts.map(([title,text])=>({title,text})),sources:record.sources.map(s=>({label:s.name,url:s.url})),
  }
]));
export const findBlackHole=id=>BLACK_HOLES.find(item=>item.id===id||item.catalogId===id)||null;
export const BLACK_HOLE_COMPARISON=[...BLACK_HOLES].sort((a,b)=>a.mass-b.mass);
export const BLACK_HOLE_COMPARISON_SOURCES=[...new Map(BLACK_HOLE_COMPARISON.flatMap(item=>item.sources).map(source=>[source.url,source])).values()];

export const BLACK_HOLE_LESSONS = {
  structure:{title:'结构示意',intro:'把亮环、暗区和边界分开看，就更容易理解黑洞。',sections:[
    ['事件视界','这是光也无法向外逃逸的边界，并不是固体表面。本模型的中央暗球用于表示黑洞位置，不能直接把它的边缘当作观测到的事件视界。'],
    ['吸积盘','围绕黑洞旋转的气体形成盘状结构，气体被加热并发出辐射。黑洞未必都有明亮吸积盘。'],
    ['光线弯曲与阴影','强引力会改变光线路径，盘的远侧可能出现在黑洞上方和下方。观测中的黑洞阴影一般大于事件视界的投影。亮弧在这里是定性的视觉示意。'],
    ['旋转看一看','拖动改变观察角度，比较盘的正面与侧面。可关闭吸积盘或名称，单独观察暗区；运动可以暂停。']],
    narration:'认识黑洞结构，可以先分清三个概念。第一是事件视界，它是光也无法向外逃逸的边界，不是一层固体外壳。第二是吸积盘，这是黑洞外部旋转的气体，气体被加热后产生辐射，但并不是每颗黑洞都有明亮的吸积盘。第三是光线弯曲与黑洞阴影。强引力会改变光线的路径，使吸积盘远侧的光出现在黑洞上方和下方。观测到的阴影通常比事件视界的投影更大。眼前的暗球和亮弧只是教学示意，没有进行精确的相对论光线追踪。你可以旋转模型，或关闭吸积盘，比较不同部分。'},
  detection:{title:'如何发现',intro:'黑洞本身不发光，我们从它对周围环境的影响寻找证据。',sections:[
    ['恒星轨道','测量恒星绕不可见天体运行的速度与轨迹，估计中心质量及其集中程度。'],
    ['高能辐射','落向黑洞的气体可变得非常炽热，发出 X 射线等辐射。这是周围物质的信号。'],
    ['引力波','两个黑洞合并会产生时空涟漪。引力波观测提供了与电磁波不同的探测途径。'],
    ['射电成像','事件视界望远镜把多座望远镜的观测结合起来，获得黑洞周围明亮辐射与中央暗区的图像。']],
    narration:'黑洞本身不发光，我们怎样发现它呢？第一种方法是跟踪恒星轨道，看看是什么让恒星绕行，并推算中心天体的质量。第二种方法是观测高能辐射。落向黑洞的气体被加热，能够发出强烈的 X 射线。第三种方法是探测引力波。两个黑洞合并时，会在时空中产生涟漪。第四种方法是射电成像。事件视界望远镜结合分布在地球上的多座望远镜，记录黑洞周围的辐射和中央暗区。这些方法相互补充，让看不见的黑洞留下可以检验的证据。'},
  compare:{title:'大小对比',intro:'8 个黑洞按参考质量从小到大排列：从左到右，再从上到下。',sections:[
    ['比较的是什么','以下采用不旋转黑洞的史瓦西半径近似：每个太阳质量约对应 2.95 千米。真实黑洞的自旋会影响事件视界尺度。'],
    ['从恒星级到超大质量','LMC X-1、M33 X-7 和天鹅座 X-1 的参考质量约为 10.9、16 和 21 个太阳。随后是 M32 中央黑洞、人马座 A*、仙女座中央黑洞、M87* 和 TON 618。'],
    ['数量级差距','LMC X-1 的参考半径约 32 千米，人马座 A* 约 1180 万千米，TON 618 约 1950 亿千米。按这里采用的质量估计，最大与最小相差约 60 亿倍。'],
    ['为什么不按真实比例画','真实差距巨大，放在同一比例下，小黑洞几乎看不见。画面用对数压缩后的圆球表示顺序，数值才是尺度对比依据。']],
    narration:'这八颗黑洞按参考质量从小到大排列，从左向右，再从上到下阅读。最先是恒星级的 L M C X 一、M 三十三 X 七和天鹅座 X 一，质量约为太阳的十点九倍、十六倍和二十一倍。接着是 M 三十二中央黑洞、人马座 A 星、仙女座中央黑洞、M 八十七星，最后是 T O N 六一八。它的参考质量约为六百六十亿个太阳。为了比较尺度，我们采用不旋转黑洞的史瓦西半径近似，每个太阳质量约对应二点九五千米。最小的参考半径约三十二千米，最大的约一千九百五十亿千米，相差约六十亿倍。质量估计存在不确定性，自旋也会影响事件视界尺度。图中圆球使用统一的对数压缩，便于同时看清八个目标。真实差距请以右侧数值为准。'},
};
export const blackHoleById=id=>findBlackHole(id)||BLACK_HOLES[0];
export const BLACK_HOLE_NARRATIONS=[...BLACK_HOLES.filter(item=>item.narration).map(item=>({key:`blackholes/${item.id}`,title:item.name,text:item.narration})),...Object.entries(BLACK_HOLE_LESSONS).map(([id,item])=>({key:`blackholes/${id}`,title:item.title,text:item.narration}))];
export function schwarzschildRadiusKm(mass){return mass*2.95;}
