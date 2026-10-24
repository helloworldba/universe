// Background knowledge for the eleven spacecraft entries. Orbital values are
// educational approximations, not live tracking data. Sources checked 2026-10-19.
const metric = (label, value) => ({ label, value });
const section = (title, text) => ({ title, text });
const source = (label, url) => ({ label, url });

export const CRAFT_KNOWLEDGE = {
  iss: {
    metrics: [
      metric('开始在轨组装', '1998 年'),
      metric('首次长期驻留', '2000 年 11 月'),
      metric('典型轨道高度', '约 400 km'),
      metric('轨道倾角', '约 51.6°'),
      metric('绕地一圈', '约 90 分钟'),
      metric('整体展开宽度', '约 109 m'),
    ],
    sections: [
      section('在太空中拼接的实验室', '国际空间站由多国提供的居住舱、实验舱、节点舱和长桁架逐步组装而成。太阳翼供电，机械臂协助搬运设备和接收货运飞船；庞大的外形背后，是彼此协作的能源、热控与生命保障系统。'),
      section('微重力中的科学', '空间站让研究人员在长期微重力环境下研究人体、植物、材料、燃烧和流体。地面团队与航天员共同设计、操作和分析实验，把空间中的观察与地球上的对照实验联系起来。'),
      section('绕行地球的生活节奏', '空间站约每九十分钟绕地一圈，一天可经历约十六次日出与日落。它的高度会受稀薄大气阻力等因素影响，需要适时提升轨道；这里展示的路径和位置用于讲解，不是实时飞行数据。'),
      section('长期驻留的起点', '首批长期驻留乘组在 2000 年 11 月进入空间站。此后，舱段组装、出舱维修、货物补给和乘组轮换逐步积累了长期生活与工作经验，也让空间站成为研究人体适应太空的重要平台。'),
    ],
    sources: [
      source('NASA · 国际空间站结构与研究', 'https://www.nasa.gov/reference/international-space-station/'),
      source('NASA · 国际空间站数据', 'https://www.nasa.gov/international-space-station/space-station-facts-and-figures/'),
    ],
  },
  tiangong: {
    metrics: [
      metric('核心舱发射', '2021-04-29'),
      metric('T 字构型完成', '2022-11-03'),
      metric('基本构型', '天和＋问天＋梦天'),
      metric('运行区域', '近地轨道'),
      metric('天和起飞质量', '22.5 吨'),
    ],
    sections: [
      section('三舱组成的太空家园', '天和核心舱承担空间站统一管理和控制，为航天员生活与工作提供条件。问天、梦天两个实验舱分列两侧，组成 T 字基本构型；太阳翼、机械臂及舱外设施共同支持空间站运行。'),
      section('为什么采用 T 字布局', '两个实验舱在核心舱左右对称布置，有利于姿态与轨道控制。两侧太阳翼间距较大，可减少相互遮挡；太阳翼能够调整朝向，尽可能有效地把阳光转换成站内设备所需的电能。'),
      section('可由航天员参与的实验', '空间站为航天医学、空间科学实验和技术试验提供在轨平台。航天员可以操作实验设备、检查状态与维护装置，这种有人参与的实验方式，让长期观察和复杂操作成为可能。'),
      section('从发射到完成基本构型', '2021 年 4 月 29 日，天和核心舱在文昌发射升空。2022 年 11 月 3 日，梦天实验舱完成转位，标志着三舱 T 字基本构型组装完成；这是由分次发射、交会对接和在轨转位共同实现的工程。'),
    ],
    sources: [
      source('中国载人航天 · 天和核心舱发射', 'https://www.cmse.gov.cn/fxrw/kjzthhxcrw/zhxw/202104/t20210429_47774.html'),
      source('中国载人航天 · T 字构型与设计', 'https://www.cmse.gov.cn/hdjl/bszjhd/bjzl/202211/t20221107_51360.html'),
    ],
  },
  hubble: {
    metrics: [
      metric('发射国家', '美国'),
      metric('任务合作', '美国 NASA／欧洲 ESA'),
      metric('发射地点', '佛罗里达州 · 肯尼迪航天中心'),
      metric('发射日期', '1990-04-24'),
      metric('主镜直径', '2.4 m'),
      metric('望远镜全长', '约 13.2 m'),
      metric('主要观测波段', '紫外／可见／近红外'),
      metric('运行区域', '近地轨道'),
      metric('载人维修任务', '5 次'),
    ],
    sections: [
      section('国际合作与发射', '哈勃是美国国家航空航天局（NASA）与欧洲空间局（ESA）的合作项目。1990 年 4 月 24 日，发现号航天飞机从美国佛罗里达州肯尼迪航天中心升空，将它送入近地轨道。这里的“发射国家”按发射场所在地标注。'),
      section('把光送进科学仪器', '哈勃用主镜收集遥远天体的光，再把光引导至相机和光谱仪。太阳翼供电，陀螺仪和精细导星设备帮助它稳定指向；拍摄清晰图像不仅需要镜面，也需要长时间准确地瞄准目标。'),
      section('在大气主要干扰之上', '地球大气会扰动星光，也会吸收部分波段。哈勃在轨道上观察紫外、可见光和近红外，可补充地面望远镜的观测。不同波段揭示不同的温度、气体和尘埃信息，组合起来才能更完整地认识天体。'),
      section('五次维修延续科学能力', '哈勃设计时就考虑了在轨维修。航天飞机宇航员先后五次前往哈勃，更换或修复仪器、电池和指向设备，改善光学与探测能力；最后一次载人维修任务于 2009 年执行。'),
      section('从恒星到宇宙尺度', '哈勃观测既研究恒星诞生、行星大气和星系中心，也帮助测量宇宙膨胀。深场图像在一小片天空里显示大量遥远星系，让人们借助不同距离的天体，研究星系随宇宙历史发生的变化。'),
    ],
    sources: [
      source('NASA · 哈勃天文台', 'https://science.nasa.gov/mission/hubble/observatory/'),
      source('NASA · 哈勃结构设计', 'https://science.nasa.gov/mission/hubble/observatory/design/'),
      source('NASA · 哈勃维修任务', 'https://science.nasa.gov/mission/hubble/observatory/missions-to-hubble/'),
      source('NASA · 哈勃科学成果', 'https://science.nasa.gov/mission/hubble/science/science-highlights/'),
      source('NASA · 哈勃国际合作', 'https://science.nasa.gov/mission/hubble/team/'),
      source('NASA · STS-31 发射记录', 'https://www.nasa.gov/mission/sts-31/'),
    ],
  },
  jwst: {
    metrics: [
      metric('发射国家', '法国（法属圭亚那）'),
      metric('任务合作', '美国主导 · 欧洲、加拿大合作'),
      metric('发射地点', '库鲁 · 圭亚那航天中心'),
      metric('发射日期', '2021-12-25'),
      metric('主镜最大直径', '约 6.5 m'),
      metric('主镜分块', '18 块六边形镜片'),
      metric('工作区域', '日地 L2 附近'),
      metric('距地球尺度', '约 150 万 km'),
      metric('主要观测', '近红外与中红外'),
    ],
    sections: [
      section('国际合作与发射', '韦布由美国国家航空航天局（NASA）主导，与欧洲空间局（ESA）、加拿大航天局（CSA）合作。2021 年 12 月 25 日，它由阿丽亚娜 5 号火箭从法属圭亚那库鲁发射升空。“发射国家”按发射场所在地标注为法国，与任务的主导国家和合作机构分别列出。'),
      section('会展开的分段镜面', '韦布的十八块镜片共同组成大口径主镜，收集暗弱天体的红外光。镜面和遮阳板在发射时折叠收拢，入轨途中逐步展开，再精细调整镜片，使它们协同工作，而不是十八台独立望远镜。'),
      section('为什么必须保持寒冷', '红外观测很容易受到望远镜自身热辐射干扰。大型遮阳板把镜面与仪器放在寒冷的一侧，隔离太阳、地球和设备的热量；科学仪器在低温条件下工作，才能分辨来自宇宙的微弱信号。'),
      section('它没有绕地球近轨飞行', '韦布在日地第二拉格朗日点 L2 附近绕行，并随地球共同绕太阳运行。这里距地球约一百五十万千米，方便让太阳、地球和月球位于遮阳板同一侧；它并不是静止停在 L2 点上。'),
      section('红外光带来的线索', '韦布使用相机和光谱仪研究早期星系、恒星与行星形成，以及系外行星的大气。图像告诉我们天体的形态，光谱则把光分成不同波长，帮助辨认物质成分与温度等信息。'),
    ],
    sources: [
      source('NASA · 韦布任务概览', 'https://science.nasa.gov/mission/webb/'),
      source('NASA · 韦布结构与仪器', 'https://science.nasa.gov/mission/webb/spacecraftoverview/'),
      source('NASA · 韦布的 L2 轨道', 'https://science.nasa.gov/mission/webb/orbit/'),
      source('NASA · 韦布科学目标', 'https://science.nasa.gov/mission/webb/science-overview/'),
      source('NASA · 韦布发射与发射场', 'https://science.nasa.gov/mission/webb/launch/'),
      source('NASA · 韦布参与国家', 'https://science.nasa.gov/mission/webb/faqs-full/'),
      source('ESA · 韦布国际合作', 'https://www.esa.int/Science_Exploration/Space_Science/Webb/Europe_s_role_in_Webb'),
    ],
  },
  roman: {
    metrics: [
      metric('发射国家', '美国'),
      metric('任务机构', 'NASA'),
      metric('发射地点', '肯尼迪航天中心 · LC-39A'),
      metric('发射日期', '2026-08-30'),
      metric('运载火箭', '猎鹰重型'),
      metric('主镜直径', '2.4 m'),
      metric('广角仪器视场', '至少为哈勃的 100 倍'),
      metric('目标工作区域', '日地 L2 附近晕轨道'),
      metric('地球至 L2 距离', '约 150 万 km'),
      metric('任务阶段（2026-10-14）', '仪器测试、校准与对焦'),
    ],
    sections: [
      section('以天文学先驱命名', '南希·格蕾丝·罗曼是 NASA 早期的重要天文学家，推动了太空天文学的发展。望远镜以她命名，英文名为 Nancy Grace Roman Space Telescope，早期任务名为 WFIRST；这些名称指的是同一项任务。'),
      section('广角巡天与精细研究互补', '罗曼的主镜直径为 2.4 米，与哈勃主镜直径相同；广角仪器一次覆盖的视场至少是哈勃的 100 倍。宽视场让它能高效观察大片天空，这并不表示每个天体被放大一百倍，也不意味着分辨率提高一百倍。'),
      section('从宇宙结构寻找暗宇宙线索', '罗曼将通过星系分布、引力透镜以及超新星等观测研究宇宙膨胀和结构形成，寻找暗能量与暗物质的线索。多种测量相互比较，有助于检验我们对宇宙演化的理解。'),
      section('寻找系外行星与验证新技术', '通过引力微透镜等方法，罗曼研究太阳系外的行星。它还搭载日冕仪技术验证仪器，试验压制明亮恒星光的方法，为将来直接观测更暗弱的系外行星积累经验；技术验证与广角巡天承担不同任务。'),
      section('从发射到校准', '罗曼于 2026 年 8 月 30 日搭乘猎鹰重型火箭，从美国肯尼迪航天中心 LC-39A 发射升空。NASA 在 2026 年 10 月 14 日公布的进展介绍了主仪器测试、校准与对焦。这里保留报道日期，避免把阶段性进展误认为实时运行状态。'),
      section('背太阳方向的目标轨道', '罗曼的目标工作区域是日地第二拉格朗日点 L2 附近的晕轨道，地球到 L2 的距离约为一百五十万千米。位置图展示从地球出发的转移方向与目标轨道，并不表示它已到达图中位置，也不是实时星历或精确转移轨迹。'),
    ],
    sources: [
      source('NASA · 罗曼任务概览', 'https://science.nasa.gov/mission/roman-space-telescope/'),
      source('NASA · 罗曼结构与科学目标', 'https://science.nasa.gov/mission/roman-space-telescope/introducing-the-roman-space-telescope/'),
      source('NASA · 罗曼发射与目标轨道', 'https://science.nasa.gov/mission/roman-space-telescope/roman-launch/'),
      source('NASA · 罗曼在轨调试', 'https://science.nasa.gov/missions/roman-space-telescope/roman-commissioning/'),
      source('NASA · 仪器测试与对焦进展（2026-10-14）', 'https://science.nasa.gov/blogs/roman/2026/10/14/nasa-roman-team-checks-out-main-instrument-sharpens-telescopes-focus/'),
    ],
  },
  voyager: {
    metrics: [
      metric('发射国家', '美国'),
      metric('任务机构', 'NASA／喷气推进实验室 JPL'),
      metric('发射地点', '佛罗里达州 · 卡纳维拉尔角'),
      metric('发射日期', '1977-09-05'),
      metric('木星飞掠', '1979-03-05'),
      metric('土星飞掠', '1980-11-12'),
      metric('穿越日球层顶', '2012-08-25'),
      metric('高增益天线直径', '3.7 m'),
      metric('供电方式', '放射性同位素热电'),
    ],
    sections: [
      section('从地球出发的美国探测器', '旅行者 1 号是美国 NASA 的深空探测任务，由喷气推进实验室（JPL）负责设计与管理。1977 年 9 月 5 日，它从美国佛罗里达州卡纳维拉尔角发射，开启飞掠巨行星并继续向外探索的旅程。“发射国家”按发射场所在地标注。'),
      section('为漫长旅途准备的结构', '旅行者 1 号最醒目的是用于深空通信的碟形高增益天线。仪器和磁力计分别安装在主体与伸展杆上；远离太阳时阳光很弱，它依靠放射性同位素衰变产生的热量发电，而不是太阳翼。'),
      section('飞掠巨行星的收获', '它在 1979 年飞掠木星，1980 年飞掠土星，研究两颗行星的大气、磁场、环和卫星。任务揭示了木星暗淡的环及土星环的复杂结构；旅行者 1 号没有飞掠天王星和海王星。'),
      section('星际空间不等于没有太阳引力', '2012 年，旅行者 1 号穿越日球层顶，进入太阳风主导区域之外的星际介质。这个边界描述的是等离子体环境，并非太阳引力突然消失的位置；因此不能把它简单理解为飞出了太阳的一切影响范围。'),
      section('带着地球的声音远行', '探测器携带镀金铜制唱片，收录地球的图像、自然声音、音乐与多种语言的问候。1990 年回望太阳系时拍下的地球成为著名的“暗淡蓝点”，让人们从遥远视角重新认识自己的家园。'),
    ],
    sources: [
      source('NASA · 旅行者 1 号任务历史', 'https://science.nasa.gov/mission/voyager/voyager-1/'),
      source('NASA · 旅行者航天器结构', 'https://science.nasa.gov/mission/voyager/spacecraft/'),
      source('NASA · 星际空间与太阳系边界', 'https://science.nasa.gov/mission/voyager/frequently-asked-questions/'),
    ],
  },
  'earth-observer': {
    metrics: [
      metric('展示对象', '遥感卫星类型示意'),
      metric('主要任务', '地表与环境观测'),
      metric('常见载荷', '光学／红外／雷达'),
      metric('观测方式', '被动接收或主动探测'),
      metric('常见轨道之一', '太阳同步轨道'),
    ],
    sections: [
      section('它观察的不限于照片', '遥感卫星通过反射光、热辐射或雷达回波研究地表与环境变化。本模型展示任务类型，不对应某一具体型号；不同仪器能够回答不同的科学问题。'),
      section('主动与被动传感器', '被动传感器接收自然辐射，主动传感器则先发射信号、再分析回波。夜间与云层下能否观测，取决于波段和仪器，不能用同一标准概括。'),
      section('轨道与重复观测', '不少遥感任务采用太阳同步轨道，便于在相近光照条件下比较影像。仪器一次扫过的地面宽度称为幅宽；幅宽、分辨率和重访间隔需要按任务取舍。'),
      section('读懂影像中的颜色', '遥感图像可以把不同波段组合成彩色画面，其颜色未必等同人眼所见。比较森林、冰雪等变化时，应先了解波段含义和观测时间。'),
    ],
    sources: [
      source('NASA · 遥感原理', 'https://science.nasa.gov/earth/earth-observatory/remote-sensing/'),
      source('NASA · 主动与被动传感器', 'https://www.nasa.gov/general/what-are-passive-and-active-sensors/'),
      source('ESA · 地球观测与重访设计', 'https://business.esa.int/newcomers-earth-observation-guide'),
    ],
  },
  'navigation-sat': {
    metrics: [
      metric('展示对象', '导航卫星类型示意'),
      metric('主要服务', '定位／导航／授时'),
      metric('核心时间基准', '高精度原子钟'),
      metric('基本三维定位', '通常至少 4 颗卫星'),
      metric('常用轨道', '中地轨道'),
    ],
    sections: [
      section('用时间估算距离', '卫星广播发射时刻与轨道信息，接收机由信号传播时间估算距离，再组合多颗卫星的测量求出位置。'),
      section('为什么通常需要四颗', '普通接收机要同时求解三维位置和自身时钟误差，因此基本三维定位通常需要至少四颗卫星。'),
      section('观测并非没有误差', '信号经过电离层和对流层会产生传播延迟，影响测距。本模型仅示意导航卫星类型，不复刻实时星座。'),
      section('不仅告诉你在哪里', 'GPS 卫星上的原子钟提供精确时间，接收机可据此同步。通信系统、电网和金融网络都能利用这一时间基准，因此导航系统的用途并不局限于地图定位。'),
    ],
    sources: [
      source('FAA · 卫星导航如何工作', 'https://www.faa.gov/about/office_org/headquarters_offices/ato/service_units/techops/navservices/gnss/gps/howitworks'),
      source('GPS.gov · 卫星授时', 'https://www.gps.gov/gps-and-telling-time'),
    ],
  },
  'comms-sat': {
    metrics: [
      metric('展示对象', '通信卫星类型示意'),
      metric('主要任务', '通信信号中继'),
      metric('链路形式', '无线电／部分采用光链路'),
      metric('典型轨道', '低轨、中轨或静止轨道'),
      metric('静止轨道高度', '约 35,786 km'),
    ],
    sections: [
      section('在太空中接力传递', '通信卫星接收信息后转发，连接地面站与航天器。实际通信还需要地面网络配合；这里展示中继原理，不代表具体运营商或型号。'),
      section('静止轨道为何方便', '赤道上空的圆形静止轨道与地球自转同步，卫星在地面看来近似不动。地面天线因此可以持续朝向同一区域。'),
      section('不同高度的选择', '通信任务也会使用低轨和中轨星座。高度会改变覆盖范围及传播距离，移动卫星还需要安排跟踪与连接切换，选择取决于服务需求。'),
      section('帮助航天器联系地面', '中继卫星能接力转送航天器数据，增加与地面联系的机会。不同任务可使用无线电或激光链路，通信窗口与传输能力需要专门设计。'),
    ],
    sources: [
      source('NASA · 空间通信与中继', 'https://www.nasa.gov/missions/tech-demonstration/space-communications-7-things-you-need-to-know/'),
      source('ESA · 静止轨道与轨道选择', 'https://www.esa.int/Enabling_Support/Space_Transportation/Types_of_orbits'),
    ],
  },
  'weather-sat': {
    metrics: [
      metric('展示对象', '气象卫星类型示意'),
      metric('观测重点', '云系／大气／环境'),
      metric('常见轨道', '静止轨道与近极轨道'),
      metric('静止轨道优势', '持续观察同一区域'),
      metric('极轨观测优势', '逐步覆盖全球'),
    ],
    sections: [
      section('持续关注天气的发展', '静止轨道气象卫星可反复扫描同一区域，跟踪天气系统的发展。本模型说明气象观测任务，不提供实时云图或当地天气。'),
      section('两类轨道互相补充', '近极轨道卫星借助地球自转经过不同区域，积累全球观测；静止轨道卫星则持续关注同一区域。两类观测相互补充。'),
      section('云图之外的信息', '以 GOES-R 系列的 ABI 成像仪为例，十六个可见光与红外波段帮助区分云、水汽、烟尘和火山灰。不同仪器配置不同，并非所有气象卫星都具有相同波段。'),
      section('观测如何帮助预报', '数值预报结合卫星与地面观测，通过大气数学模型估算天气演变。卫星探测仪还能提供温度和湿度随高度变化的信息，补充普通云图难以呈现的大气结构。'),
    ],
    sources: [
      source('NOAA · 气象卫星为什么采用不同轨道', 'https://www.nesdis.noaa.gov/about/k-12-education/satellites-technology/why-do-satellites-have-different-orbits'),
      source('NOAA · ABI 多波段成像仪', 'https://www.nesdis.noaa.gov/our-satellites/currently-flying/goes-east-west/advanced-baseline-imager-abi'),
      source('NOAA · 卫星资料与数值预报', 'https://www.nesdis.noaa.gov/numerical-weather-prediction-critical-weather-applications-initiative'),
    ],
  },
  'polar-sat': {
    metrics: [
      metric('展示对象', '极轨卫星类型示意'),
      metric('轨道方向', '接近南北方向'),
      metric('常见应用', '遥感／气象／全球巡测'),
      metric('覆盖方式', '绕行与地球自转配合'),
      metric('相关轨道', '部分采用太阳同步轨道'),
    ],
    sections: [
      section('极轨描述的是路径', '极轨卫星沿接近南北方向绕行，能够经过高纬度地区。“极轨”描述轨道路径，并不是某一种科学载荷或专属任务。'),
      section('为什么可以巡测全球', '地球在卫星下方不断自转，让后续绕行经过不同经度。全球巡测依靠多次过境逐步完成，并非一次飞行就能看清整个地球。'),
      section('太阳同步是特殊选择', '部分近极轨道采用太阳同步设计，使同一方向过境时的当地太阳时接近一致，便于比较影像光照；卫星并不固定在一处上空。'),
      section('同一类轨道，不同任务', '近极轨道可用于观察陆地、海洋与大气，载荷随任务而异。本模型仅示意轨道类型，没有对应某颗卫星的发射日期、质量或实时位置。'),
    ],
    sources: [
      source('ESA · 航天器的极轨路径', 'https://www.esa.int/Science_Exploration/Space_Science/Spacecraft_orbits'),
      source('NASA · 太阳同步轨道原理', 'https://science.nasa.gov/earth/earth-observatory/catalog-of-earth-satellite-orbits/'),
    ],
  },
};
