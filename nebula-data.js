// Distances are approximate literature values. These targets are inside the Milky Way.
const messier=n=>`https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-${n}/`;
const source=(label,url)=>({label,url});
const eagle=source('NASA / Hubble · M16 鹰状星云',messier(16));
const pillars=source('NASA / Webb · 创生之柱','https://science.nasa.gov/missions/webb/nasas-webb-takes-star-filled-portrait-of-pillars-of-creation/');
const crab=source('NASA / Hubble · M1 蟹状星云',messier(1));
const crabWebb=source('NASA / Webb · 红外波段的蟹状星云','https://science.nasa.gov/missions/webb/the-crab-nebula-seen-in-new-light-by-nasas-webb/');
const cluster=source('NASA / Hubble · M13 武仙座球状星团',messier(13));
const horse=source('NASA / Webb · 马头星云顶部近红外影像','https://science.nasa.gov/asset/webb/horsehead-nebula-nircam-image/');
const horseGallery=source('NASA · 马头星云观测影像','https://www.nasa.gov/universe/nebulae/horsehead-nebula/');
const note='三维形态、颜色、星点和距离为教学示意，不是望远镜照片或精确三维测绘。各目标独立缩放。';
export const NEBULA_DESTINATIONS=[
  {id:'pillars-of-creation',name:'创生之柱',en:'PILLARS OF CREATION',kind:'nebula',parent:'eagle-nebula',parentGalaxy:'galaxy',shape:'pillars',color:'#d8ad79',aliases:['Pillars of Creation','M16 创生之柱'],size:'恒星形成区',period:'约 6500—7000 光年',statLabels:['天体类型','距地距离'],description:'鹰状星云中由气体和尘埃组成的柱状结构。年轻恒星在其中诞生，周围恒星的辐射也在雕刻这些云柱。',source:pillars,modelStatus:note,
    metrics:[{label:'所在星云',value:'鹰状星云 · M16'},{label:'所在天区',value:'巨蛇座'}],sections:[{title:'它属于哪一片星云',text:'创生之柱是鹰状星云中的一小部分，并不是独立的星系。可以返回鹰状星云，观察局部云柱与周围恒星形成区的关系。'},{title:'诞生与侵蚀同时发生',text:'较冷、较密的气体和尘埃可以孕育恒星。附近大质量恒星的辐射照亮并逐渐侵蚀云柱，留下不规则的边缘。'}],sources:[pillars,eagle]},
  {id:'eagle-nebula',name:'鹰状星云（M16）',en:'EAGLE NEBULA · M16',kind:'nebula',parent:'galaxy',parentGalaxy:'galaxy',shape:'eagle',color:'#79c6c7',aliases:['鹰星云','M16','IC 4703','NGC 6611'],size:'发射星云与疏散星团',period:'约 6500—7000 光年',statLabels:['天体类型','距地距离'],description:'银河系巨蛇座方向的恒星形成区。发光气体、年轻星团与深色尘埃云交织，著名的创生之柱就在其中。',source:eagle,modelStatus:note,
    metrics:[{label:'发射星云编号',value:'IC 4703'},{label:'年轻星团编号',value:'NGC 6611'}],sections:[{title:'星云与星团相伴',text:'M16 常用来指这片星云与星团区域；发射星云和疏散星团也分别有 IC 4703 与 NGC 6611 的编号。年轻恒星的辐射让周围气体发光。'},{title:'进入创生之柱',text:'创生之柱只是整片鹰状星云中的局部结构。点击创生之柱入口，可以单独观察云柱的轮廓与恒星形成环境。'}],sources:[eagle,pillars]},
  {id:'crab-nebula',name:'蟹状星云',en:'CRAB NEBULA · M1',kind:'nebula',parent:'galaxy',parentGalaxy:'galaxy',shape:'crab',color:'#e7ac83',aliases:['M1','NGC 1952'],size:'超新星遗迹',period:'约 6500 光年',statLabels:['天体类型','距地距离'],description:'一颗恒星爆发后留下的云团，位于金牛座方向。丝状气体包围着中心脉冲星，记录恒星生命末期的剧烈变化。',source:crab,modelStatus:note,
    metrics:[{label:'对应历史记录',value:'公元 1054 年客星'},{label:'中心天体',value:'快速旋转的中子星'}],sections:[{title:'从客星到星云',text:'中国古代天文学家在 1054 年记录了一颗明亮的客星。今天观测到的蟹状星云，是这次超新星爆发留下的遗迹。'},{title:'中心仍在输送能量',text:'中心脉冲星是一颗快速旋转的中子星。它推动高能粒子与周围物质相互作用；不同波段显示出不同的结构。'}],sources:[crab,crabWebb]},
  {id:'m13-cluster',name:'M13 武仙座球状星团',en:'HERCULES GLOBULAR CLUSTER · M13',kind:'cluster',parent:'galaxy',parentGalaxy:'galaxy',shape:'globular',color:'#d7dfff',aliases:['M13','NGC 6205','武仙座星团'],size:'球状星团',period:'约 2.5 万光年',statLabels:['天体类型','距地距离'],description:'武仙座方向的一团密集恒星。大量恒星聚集成近似球形，中心明亮，向外逐渐疏朗。',source:cluster,modelStatus:note,
    metrics:[{label:'组成',value:'十万颗以上恒星'},{label:'所在天区',value:'武仙座'}],sections:[{title:'星团不是气体云',text:'M13 的朦胧外观来自大量难以逐一分辨的恒星。它是球状星团，和以气体、尘埃为主的星云不同。'},{title:'由密到疏的星光',text:'中心恒星在视线上非常拥挤，外围更容易分辨单颗恒星。画面只用部分星点示意这种密度变化，不对应真实恒星的逐颗位置。'}],sources:[cluster]},
  {id:'horsehead-nebula',name:'猎户座马头星云',en:'HORSEHEAD NEBULA · BARNARD 33',kind:'nebula',parent:'galaxy',parentGalaxy:'galaxy',shape:'horsehead',color:'#c68591',aliases:['马头星云','B33','Barnard 33','猎户座 B 分子云'],size:'暗星云',period:'约 1300 光年',statLabels:['天体类型','距地距离'],description:'猎户座方向的浓密气体与尘埃云，轮廓像一匹马的头部。它遮挡背景光线，也被附近年轻恒星的辐射雕刻。',source:horse,modelStatus:note,
    metrics:[{label:'目录编号',value:'Barnard 33'},{label:'所属环境',value:'猎户座 B 分子云'}],sections:[{title:'暗色轮廓从哪里来',text:'浓密尘埃遮挡可见光，使马头轮廓显得幽暗。它不是黑洞，也不是猎户座大星云 M42。'},{title:'换个波段看云边',text:'红外观测可以揭示部分被尘埃遮挡的结构。韦伯望远镜研究了马头顶部受恒星照射的边缘，帮助理解辐射与星际物质的相互作用。'}],sources:[horse,horseGallery]},
];
export const NEBULA_KNOWLEDGE=Object.fromEntries(NEBULA_DESTINATIONS.map(r=>[r.id,{metrics:r.metrics,sections:r.sections,sources:r.sources}]));
