/**
 * EXPLORE THE UNIVERSE curated constellation learning data — 12 introductory constellations.
 * Stellar astrometry, visual magnitudes and approximate distances are an adapted
 * subset of HYG v4.1 by David Nash (Astronexus), licensed CC BY-SA 4.0:
 * https://github.com/astronexus/HYG-Database/tree/main/hyg/CURRENT
 * https://creativecommons.org/licenses/by-sa/4.0/
 * The derived stellar records retain that license. This does not relicense the
 * independent application. Changes: selected records, translated display names,
 * parsecs converted to rounded light years, B-V grouped into a display palette.
 * Positions: ICRS/J2000; RA in hours, declination in degrees. These are educational
 * fixed-epoch charts, not an observing forecast. Distances are catalog estimates,
 * especially uncertain for distant bright/variable stars; not current precision.
 * Recognition lines are original simplified teaching sketches, not IAU boundaries.
 * Cultural stories describe traditions, not physical connections between stars.
 */

export const CONSTELLATION_DATA_NOTE = "首批收录 12 个星座。星位来自 HYG v4.1（J2000）；连线是辨认简图，不是 IAU 天区边界。距离为星表估计值，恒星大小与颜色作视觉提示。当前星图不代表某地点的实时天空。";

export const CONSTELLATIONS = [
  {
    "id": "orion",
    "name": "猎户座",
    "latin": "Orion",
    "abbr": "Ori",
    "region": "equatorial",
    "zodiac": false,
    "tagline": "把星光连起来，读懂夜空。",
    "recognition": "先找几乎排成直线的腰带三星，再向两侧寻找参宿四与参宿七。四颗肩、脚亮星围出醒目的沙漏轮廓。",
    "story": "古希腊把这组星光想象成猎人俄里翁。不同文化为同一片天空讲述过不同故事；这里的连线只是帮助记忆的画法。",
    "fact": "看起来挨在一起的恒星，实际距离可以相差很大。参宿四偏橙红，参宿七偏蓝白；颜色的差异与恒星表面温度有关。",
    "source": {
      "label": "NASA · 从猎户座认识宇宙",
      "url": "https://science.nasa.gov/universe/stories/quick-reads/discovering-the-universe-through-the-constellation-orion/"
    },
    "stars": [
      {
        "id": "betelgeuse",
        "name": "参宿四",
        "englishName": "Betelgeuse",
        "hip": 27989,
        "ra": 5.919529,
        "dec": 7.407063,
        "mag": 0.45,
        "color": "#ffb783",
        "distanceLy": 500
      },
      {
        "id": "bellatrix",
        "name": "参宿五",
        "englishName": "Bellatrix",
        "hip": 25336,
        "ra": 5.418851,
        "dec": 6.349702,
        "mag": 1.64,
        "color": "#aacfff",
        "distanceLy": 250
      },
      {
        "id": "rigel",
        "name": "参宿七",
        "englishName": "Rigel",
        "hip": 24436,
        "ra": 5.242298,
        "dec": -8.20164,
        "mag": 0.18,
        "color": "#dae9ff",
        "distanceLy": 860
      },
      {
        "id": "saiph",
        "name": "参宿六",
        "englishName": "Saiph",
        "hip": 27366,
        "ra": 5.795941,
        "dec": -9.669605,
        "mag": 2.07,
        "color": "#aacfff",
        "distanceLy": 650
      },
      {
        "id": "alnitak",
        "name": "参宿一",
        "englishName": "Alnitak",
        "hip": 26727,
        "ra": 5.679313,
        "dec": -1.942572,
        "mag": 1.74,
        "color": "#aacfff",
        "distanceLy": 740
      },
      {
        "id": "alnilam",
        "name": "参宿二",
        "englishName": "Alnilam",
        "hip": 26311,
        "ra": 5.603559,
        "dec": -1.20192,
        "mag": 1.69,
        "color": "#aacfff",
        "distanceLy": 1980
      },
      {
        "id": "mintaka",
        "name": "参宿三",
        "englishName": "Mintaka",
        "hip": 25930,
        "ra": 5.533445,
        "dec": -0.299092,
        "mag": 2.25,
        "color": "#aacfff",
        "distanceLy": 690
      },
      {
        "id": "meissa",
        "name": "觜宿一",
        "englishName": "Meissa",
        "hip": 26207,
        "ra": 5.585633,
        "dec": 9.934158,
        "mag": 3.39,
        "color": "#aacfff",
        "distanceLy": 1100
      },
      {
        "id": "hatysa",
        "name": "伐三",
        "englishName": "Hatysa",
        "hip": 26241,
        "ra": 5.590551,
        "dec": -5.909901,
        "mag": 2.75,
        "color": "#aacfff",
        "distanceLy": 2330
      }
    ],
    "lines": [
      [
        "betelgeuse",
        "meissa"
      ],
      [
        "meissa",
        "bellatrix"
      ],
      [
        "bellatrix",
        "mintaka"
      ],
      [
        "mintaka",
        "alnilam"
      ],
      [
        "alnilam",
        "alnitak"
      ],
      [
        "alnitak",
        "betelgeuse"
      ],
      [
        "mintaka",
        "rigel"
      ],
      [
        "alnitak",
        "saiph"
      ],
      [
        "rigel",
        "saiph"
      ],
      [
        "alnilam",
        "hatysa"
      ]
    ],
    "featured": [
      "betelgeuse",
      "rigel",
      "alnilam"
    ]
  },
  {
    "id": "ursa-major",
    "name": "大熊座",
    "latin": "Ursa Major",
    "abbr": "UMa",
    "region": "north",
    "zodiac": false,
    "tagline": "从一柄星勺，找到北方的方向。",
    "recognition": "这张辨认图先画出北斗七星：四颗星围成斗口，三颗星弯出斗柄。天璇与天枢是斗口外侧的两颗指极星。",
    "story": "Ursa Major 意为“大熊”。中国传统星官中的北斗七星，与西方大熊座的一部分相重合；不同文化把同一组星点连成了不同图形。",
    "fact": "北斗七星是大熊座内的星群，并不是一个独立的现代星座。沿天璇指向天枢的方向继续延伸，可帮助寻找小熊座内的北极星。",
    "source": {
      "label": "NASA · 观星常见问题",
      "url": "https://science.nasa.gov/skywatching/faq/"
    },
    "stars": [
      {
        "id": "dubhe",
        "name": "天枢",
        "englishName": "Dubhe",
        "hip": 54061,
        "ra": 11.062155,
        "dec": 61.751033,
        "mag": 1.81,
        "color": "#ffd89e",
        "distanceLy": 120
      },
      {
        "id": "merak",
        "name": "天璇",
        "englishName": "Merak",
        "hip": 53910,
        "ra": 11.030677,
        "dec": 56.382427,
        "mag": 2.34,
        "color": "#dae9ff",
        "distanceLy": 79.7
      },
      {
        "id": "phecda",
        "name": "天玑",
        "englishName": "Phecda",
        "hip": 58001,
        "ra": 11.897168,
        "dec": 53.69476,
        "mag": 2.41,
        "color": "#dae9ff",
        "distanceLy": 83.2
      },
      {
        "id": "megrez",
        "name": "天权",
        "englishName": "Megrez",
        "hip": 59774,
        "ra": 12.257086,
        "dec": 57.032617,
        "mag": 3.32,
        "color": "#dae9ff",
        "distanceLy": 80.5
      },
      {
        "id": "alioth",
        "name": "玉衡",
        "englishName": "Alioth",
        "hip": 62956,
        "ra": 12.900472,
        "dec": 55.959821,
        "mag": 1.76,
        "color": "#dae9ff",
        "distanceLy": 82.6
      },
      {
        "id": "mizar",
        "name": "开阳",
        "englishName": "Mizar",
        "hip": 65378,
        "ra": 13.398747,
        "dec": 54.925362,
        "mag": 2.23,
        "color": "#dae9ff",
        "distanceLy": 85.8
      },
      {
        "id": "alkaid",
        "name": "摇光",
        "englishName": "Alkaid",
        "hip": 67301,
        "ra": 13.792354,
        "dec": 49.313265,
        "mag": 1.85,
        "color": "#aacfff",
        "distanceLy": 100
      }
    ],
    "lines": [
      [
        "dubhe",
        "merak"
      ],
      [
        "merak",
        "phecda"
      ],
      [
        "phecda",
        "megrez"
      ],
      [
        "megrez",
        "dubhe"
      ],
      [
        "megrez",
        "alioth"
      ],
      [
        "alioth",
        "mizar"
      ],
      [
        "mizar",
        "alkaid"
      ]
    ],
    "featured": [
      "dubhe",
      "merak",
      "alkaid"
    ]
  },
  {
    "id": "cassiopeia",
    "name": "仙后座",
    "latin": "Cassiopeia",
    "abbr": "Cas",
    "region": "north",
    "zodiac": false,
    "tagline": "五颗亮星，在北天写下一个 W。",
    "recognition": "把五颗主要亮星依次相连，可以看到折线形的 W。随着观看方向改变，它也会像一个 M。",
    "story": "希腊神话中的卡西奥佩娅是一位王后，古老星图常把她画在王座上。文化故事赋予图案名字，现代天文学则用星座划分天区。",
    "fact": "仙后座位于北天，但能否整夜看到它，仍取决于所在地的纬度。这里呈现的是辨认星图，不代表某个地点此刻的天空。",
    "source": {
      "label": "Chandra · 仙后座的故事",
      "url": "https://chandra.si.edu/photo/constellations/cassiopeia.html"
    },
    "stars": [
      {
        "id": "caph",
        "name": "王良一",
        "englishName": "Caph",
        "hip": 746,
        "ra": 0.152887,
        "dec": 59.14978,
        "mag": 2.28,
        "color": "#fff3d2",
        "distanceLy": 54.7
      },
      {
        "id": "schedar",
        "name": "王良四",
        "englishName": "Schedar",
        "hip": 3179,
        "ra": 0.675116,
        "dec": 56.537331,
        "mag": 2.24,
        "color": "#ffd89e",
        "distanceLy": 230
      },
      {
        "id": "cih",
        "name": "策",
        "englishName": "Cih",
        "hip": 4427,
        "ra": 0.945143,
        "dec": 60.71674,
        "mag": 2.15,
        "color": "#aacfff",
        "distanceLy": 550
      },
      {
        "id": "ruchbah",
        "name": "阁道三",
        "englishName": "Ruchbah",
        "hip": 6686,
        "ra": 1.430216,
        "dec": 60.235283,
        "mag": 2.66,
        "color": "#dae9ff",
        "distanceLy": 99.4
      },
      {
        "id": "segin",
        "name": "阁道二",
        "englishName": "Segin",
        "hip": 8886,
        "ra": 1.906584,
        "dec": 63.670101,
        "mag": 3.35,
        "color": "#aacfff",
        "distanceLy": 410
      }
    ],
    "lines": [
      [
        "caph",
        "schedar"
      ],
      [
        "schedar",
        "cih"
      ],
      [
        "cih",
        "ruchbah"
      ],
      [
        "ruchbah",
        "segin"
      ]
    ],
    "featured": [
      "caph",
      "cih",
      "segin"
    ]
  },
  {
    "id": "cygnus",
    "name": "天鹅座",
    "latin": "Cygnus",
    "abbr": "Cyg",
    "region": "north",
    "zodiac": false,
    "tagline": "沿着银河，展开一双星光翅膀。",
    "recognition": "先找到明亮的天津四，再沿长轴连向天津一与天鹅座 β；两侧的亮星伸展开来，形成“北十字”星群。",
    "story": "Cygnus 的名字意为天鹅。人们把长轴看作天鹅的颈与身躯，把横向的星链看作展开的双翼。",
    "fact": "天津四与天琴座的织女星、天鹰座的牛郎星组成夏季大三角。它跨越三个星座，是星群而不是第 89 个星座。",
    "source": {
      "label": "NASA · 夏季大三角：天津四",
      "url": "https://science.nasa.gov/solar-system/skywatching/night-sky-network/summer-triangle-corner-deneb/"
    },
    "stars": [
      {
        "id": "deneb",
        "name": "天津四",
        "englishName": "Deneb",
        "hip": 102098,
        "ra": 20.690532,
        "dec": 45.280338,
        "mag": 1.25,
        "color": "#dae9ff",
        "distanceLy": 1410
      },
      {
        "id": "sadr",
        "name": "天津一",
        "englishName": "Sadr",
        "hip": 100453,
        "ra": 20.370473,
        "dec": 40.256679,
        "mag": 2.23,
        "color": "#fff3d2",
        "distanceLy": 1830
      },
      {
        "id": "albireo",
        "name": "天鹅座 β",
        "englishName": "Albireo",
        "hip": 95947,
        "ra": 19.512023,
        "dec": 27.959681,
        "mag": 3.05,
        "color": "#ffd89e",
        "distanceLy": 430
      },
      {
        "id": "hip-98110",
        "name": "天鹅座 η",
        "englishName": "Eta Cyg",
        "hip": 98110,
        "ra": 19.938438,
        "dec": 35.083424,
        "mag": 3.89,
        "color": "#ffd89e",
        "distanceLy": 130
      },
      {
        "id": "fawaris",
        "name": "天鹅座 δ",
        "englishName": "Fawaris",
        "hip": 97165,
        "ra": 19.749574,
        "dec": 45.13081,
        "mag": 2.86,
        "color": "#dae9ff",
        "distanceLy": 160
      },
      {
        "id": "aljanah",
        "name": "天鹅座 ε",
        "englishName": "Aljanah",
        "hip": 102488,
        "ra": 20.770178,
        "dec": 33.970256,
        "mag": 2.48,
        "color": "#ffd89e",
        "distanceLy": 72.7
      },
      {
        "id": "hip-104732",
        "name": "天鹅座 ζ",
        "englishName": "Zet Cyg",
        "hip": 104732,
        "ra": 21.215607,
        "dec": 30.226916,
        "mag": 3.21,
        "color": "#ffd89e",
        "distanceLy": 140
      }
    ],
    "lines": [
      [
        "deneb",
        "sadr"
      ],
      [
        "sadr",
        "hip-98110"
      ],
      [
        "hip-98110",
        "albireo"
      ],
      [
        "fawaris",
        "sadr"
      ],
      [
        "sadr",
        "aljanah"
      ],
      [
        "aljanah",
        "hip-104732"
      ]
    ],
    "featured": [
      "deneb",
      "sadr",
      "albireo"
    ]
  },
  {
    "id": "lyra",
    "name": "天琴座",
    "latin": "Lyra",
    "abbr": "Lyr",
    "region": "north",
    "zodiac": false,
    "tagline": "从织女星，发现一架小小的天琴。",
    "recognition": "织女星是这幅图里最醒目的亮星。找到它之后，再辨认旁边四颗较暗恒星组成的小平行四边形。",
    "story": "Lyra 意为里拉琴。传统西方星图把这片小巧的星空与弦乐器联系起来；中国的织女星也位于这片天区。",
    "fact": "织女星是夏季大三角的一角，距离我们约 25 光年。星图上的光点大小表示视觉亮暗，并不等于恒星的真实直径。",
    "source": {
      "label": "NASA · 夏季大三角：织女星",
      "url": "https://science.nasa.gov/solar-system/skywatching/night-sky-network/summer-triangle-corner-vega/"
    },
    "stars": [
      {
        "id": "vega",
        "name": "织女星",
        "englishName": "Vega",
        "hip": 91262,
        "ra": 18.61564,
        "dec": 38.783692,
        "mag": 0.03,
        "color": "#dae9ff",
        "distanceLy": 25.0
      },
      {
        "id": "hip-91971",
        "name": "天琴座 ζ",
        "englishName": "Zet-1 Lyr",
        "hip": 91971,
        "ra": 18.746209,
        "dec": 37.605115,
        "mag": 4.34,
        "color": "#dae9ff",
        "distanceLy": 160
      },
      {
        "id": "hip-92791",
        "name": "天琴座 δ",
        "englishName": "Del-2 Lyr",
        "hip": 92791,
        "ra": 18.908412,
        "dec": 36.898613,
        "mag": 4.22,
        "color": "#ffb783",
        "distanceLy": 740
      },
      {
        "id": "sulafat",
        "name": "天琴座 γ",
        "englishName": "Sulafat",
        "hip": 93194,
        "ra": 18.982395,
        "dec": 32.689557,
        "mag": 3.25,
        "color": "#aacfff",
        "distanceLy": 620
      },
      {
        "id": "sheliak",
        "name": "天琴座 β",
        "englishName": "Sheliak",
        "hip": 92420,
        "ra": 18.834665,
        "dec": 33.362667,
        "mag": 3.52,
        "color": "#dae9ff",
        "distanceLy": 960
      }
    ],
    "lines": [
      [
        "vega",
        "hip-91971"
      ],
      [
        "hip-91971",
        "hip-92791"
      ],
      [
        "hip-92791",
        "sulafat"
      ],
      [
        "sulafat",
        "sheliak"
      ],
      [
        "sheliak",
        "hip-91971"
      ]
    ],
    "featured": [
      "vega",
      "sulafat",
      "sheliak"
    ]
  },
  {
    "id": "scorpius",
    "name": "天蝎座",
    "latin": "Scorpius",
    "abbr": "Sco",
    "region": "south",
    "zodiac": true,
    "tagline": "一颗红色的心，接着弯曲的长尾。",
    "recognition": "先找橙红色的心宿二。沿一串亮星向下追踪，再顺着弯钩形尾巴找到末端的天蝎座 λ 与 υ。",
    "story": "许多文化把这片星空看作蝎子；一些波利尼西亚传统则把相同的星形看成毛伊的鱼钩。星光相同，讲述它的方法各不相同。",
    "fact": "心宿二是一颗偏红的超巨星。天蝎座靠近银河中心所在的方向，背景中还藏着许多星团与星云。",
    "source": {
      "label": "NASA · 认识天蝎座",
      "url": "https://science.nasa.gov/solar-system/skywatching/night-sky-network/july2025-night-sky-notes/"
    },
    "stars": [
      {
        "id": "acrab",
        "name": "天蝎座 β",
        "englishName": "Acrab",
        "hip": 78820,
        "ra": 16.09062,
        "dec": -19.805453,
        "mag": 2.56,
        "color": "#aacfff",
        "distanceLy": 400
      },
      {
        "id": "dschubba",
        "name": "天蝎座 δ",
        "englishName": "Dschubba",
        "hip": 78401,
        "ra": 16.005557,
        "dec": -22.62171,
        "mag": 2.29,
        "color": "#aacfff",
        "distanceLy": 490
      },
      {
        "id": "fang",
        "name": "天蝎座 π",
        "englishName": "Fang",
        "hip": 78265,
        "ra": 15.980865,
        "dec": -26.114105,
        "mag": 2.89,
        "color": "#aacfff",
        "distanceLy": 590
      },
      {
        "id": "alniyat",
        "name": "天蝎座 σ",
        "englishName": "Alniyat",
        "hip": 80112,
        "ra": 16.353143,
        "dec": -25.592796,
        "mag": 2.9,
        "color": "#dae9ff",
        "distanceLy": 700
      },
      {
        "id": "antares",
        "name": "心宿二",
        "englishName": "Antares",
        "hip": 80763,
        "ra": 16.490128,
        "dec": -26.432002,
        "mag": 1.06,
        "color": "#ffb783",
        "distanceLy": 550
      },
      {
        "id": "paikauhale",
        "name": "天蝎座 τ",
        "englishName": "Paikauhale",
        "hip": 81266,
        "ra": 16.598043,
        "dec": -28.216016,
        "mag": 2.82,
        "color": "#aacfff",
        "distanceLy": 470
      },
      {
        "id": "larawag",
        "name": "天蝎座 ε",
        "englishName": "Larawag",
        "hip": 82396,
        "ra": 16.83608,
        "dec": -34.293232,
        "mag": 2.29,
        "color": "#ffd89e",
        "distanceLy": 63.7
      },
      {
        "id": "xamidimura",
        "name": "天蝎座 μ",
        "englishName": "Xamidimura",
        "hip": 82514,
        "ra": 16.864509,
        "dec": -38.04738,
        "mag": 3.0,
        "color": "#aacfff",
        "distanceLy": 500
      },
      {
        "id": "hip-82729",
        "name": "天蝎座 ζ",
        "englishName": "Zet-2 Sco",
        "hip": 82729,
        "ra": 16.909731,
        "dec": -42.361313,
        "mag": 3.62,
        "color": "#ffd89e",
        "distanceLy": 130
      },
      {
        "id": "hip-84143",
        "name": "天蝎座 η",
        "englishName": "Eta Sco",
        "hip": 84143,
        "ra": 17.202552,
        "dec": -43.239189,
        "mag": 3.32,
        "color": "#fff3d2",
        "distanceLy": 73.5
      },
      {
        "id": "sargas",
        "name": "天蝎座 θ",
        "englishName": "Sargas",
        "hip": 86228,
        "ra": 17.62198,
        "dec": -42.997824,
        "mag": 1.86,
        "color": "#fff3d2",
        "distanceLy": 300
      },
      {
        "id": "hip-87073",
        "name": "天蝎座 ι",
        "englishName": "Iot-1 Sco",
        "hip": 87073,
        "ra": 17.793078,
        "dec": -40.126997,
        "mag": 2.99,
        "color": "#fff3d2",
        "distanceLy": 1930
      },
      {
        "id": "hip-86670",
        "name": "天蝎座 κ",
        "englishName": "Kap Sco",
        "hip": 86670,
        "ra": 17.708132,
        "dec": -39.029983,
        "mag": 2.39,
        "color": "#aacfff",
        "distanceLy": 480
      },
      {
        "id": "shaula",
        "name": "天蝎座 λ",
        "englishName": "Shaula",
        "hip": 85927,
        "ra": 17.560145,
        "dec": -37.103821,
        "mag": 1.62,
        "color": "#aacfff",
        "distanceLy": 570
      },
      {
        "id": "lesath",
        "name": "天蝎座 υ",
        "englishName": "Lesath",
        "hip": 85696,
        "ra": 17.512732,
        "dec": -37.295811,
        "mag": 2.7,
        "color": "#aacfff",
        "distanceLy": 580
      }
    ],
    "lines": [
      [
        "acrab",
        "dschubba"
      ],
      [
        "dschubba",
        "fang"
      ],
      [
        "dschubba",
        "alniyat"
      ],
      [
        "alniyat",
        "antares"
      ],
      [
        "antares",
        "paikauhale"
      ],
      [
        "paikauhale",
        "larawag"
      ],
      [
        "larawag",
        "xamidimura"
      ],
      [
        "xamidimura",
        "hip-82729"
      ],
      [
        "hip-82729",
        "hip-84143"
      ],
      [
        "hip-84143",
        "sargas"
      ],
      [
        "sargas",
        "hip-87073"
      ],
      [
        "hip-87073",
        "hip-86670"
      ],
      [
        "hip-86670",
        "shaula"
      ],
      [
        "shaula",
        "lesath"
      ]
    ],
    "featured": [
      "antares",
      "sargas",
      "shaula"
    ]
  },
  {
    "id": "taurus",
    "name": "金牛座",
    "latin": "Taurus",
    "abbr": "Tau",
    "region": "north",
    "zodiac": true,
    "tagline": "从红色牛眼，追踪 V 字形星群。",
    "recognition": "毕宿五像一只橙红色的牛眼。它附近的亮星排成 V 字形，两条较长的连线向外伸展，勾出牛角。",
    "story": "Taurus 的名字意为公牛。牛头的图案让人容易记住毕宿五及周围星群的位置；这是一种星空辨认的文化传统。",
    "fact": "毕宿五看起来位于毕星团中，却是一颗更靠近我们的前景恒星。金牛座里还有昴星团；星团与星座是两种不同的概念。",
    "source": {
      "label": "NASA · 毕星团与昴星团",
      "url": "https://science.nasa.gov/solar-system/skywatching/night-sky-network/spot-the-young-stars-of-the-hyades-and-pleiades/"
    },
    "stars": [
      {
        "id": "aldebaran",
        "name": "毕宿五",
        "englishName": "Aldebaran",
        "hip": 21421,
        "ra": 4.598677,
        "dec": 16.509301,
        "mag": 0.87,
        "color": "#ffb783",
        "distanceLy": 66.6
      },
      {
        "id": "chamukuy",
        "name": "金牛座 θ",
        "englishName": "Chamukuy",
        "hip": 20894,
        "ra": 4.477705,
        "dec": 15.870883,
        "mag": 3.4,
        "color": "#dae9ff",
        "distanceLy": 150
      },
      {
        "id": "prima-hyadum",
        "name": "金牛座 γ",
        "englishName": "Prima Hyadum",
        "hip": 20205,
        "ra": 4.329889,
        "dec": 15.627642,
        "mag": 3.65,
        "color": "#ffd89e",
        "distanceLy": 160
      },
      {
        "id": "secunda-hyadum",
        "name": "金牛座 δ",
        "englishName": "Secunda Hyadum",
        "hip": 20455,
        "ra": 4.382247,
        "dec": 17.542514,
        "mag": 3.77,
        "color": "#ffd89e",
        "distanceLy": 160
      },
      {
        "id": "ain",
        "name": "金牛座 ε",
        "englishName": "Ain",
        "hip": 20889,
        "ra": 4.476943,
        "dec": 19.180431,
        "mag": 3.53,
        "color": "#ffd89e",
        "distanceLy": 150
      },
      {
        "id": "elnath",
        "name": "五车五",
        "englishName": "Elnath",
        "hip": 25428,
        "ra": 5.438198,
        "dec": 28.60745,
        "mag": 1.65,
        "color": "#aacfff",
        "distanceLy": 130
      },
      {
        "id": "tianguan",
        "name": "天关",
        "englishName": "Tianguan",
        "hip": 26451,
        "ra": 5.627413,
        "dec": 21.142549,
        "mag": 2.97,
        "color": "#aacfff",
        "distanceLy": 440
      },
      {
        "id": "alcyone",
        "name": "昴宿六",
        "englishName": "Alcyone",
        "hip": 17702,
        "ra": 3.79141,
        "dec": 24.105137,
        "mag": 2.85,
        "color": "#aacfff",
        "distanceLy": 400
      }
    ],
    "lines": [
      [
        "aldebaran",
        "chamukuy"
      ],
      [
        "chamukuy",
        "prima-hyadum"
      ],
      [
        "prima-hyadum",
        "secunda-hyadum"
      ],
      [
        "secunda-hyadum",
        "ain"
      ],
      [
        "ain",
        "elnath"
      ],
      [
        "aldebaran",
        "tianguan"
      ]
    ],
    "featured": [
      "aldebaran",
      "elnath",
      "alcyone"
    ]
  },
  {
    "id": "gemini",
    "name": "双子座",
    "latin": "Gemini",
    "abbr": "Gem",
    "region": "north",
    "zodiac": true,
    "tagline": "两颗相伴的亮星，两个不同的世界。",
    "recognition": "先辨认相邻的北河二与北河三，它们像两个人影的头部。再沿两条较暗的星链向下，寻找双子的身体与足部。",
    "story": "Gemini 意为“双子”。古希腊用卡斯托耳与波吕丢刻斯兄弟为它命名；NASA 的双子座载人航天计划也借用了这个名字。",
    "fact": "北河二与北河三看起来相邻，却不是彼此束缚的一对伴星。北河三稍亮、偏暖，北河二偏白，可以试着比较两者。",
    "source": {
      "label": "NASA · 寻找双子座",
      "url": "https://science.nasa.gov/solar-system/skywatching/night-sky-network/gemini-constellation/"
    },
    "stars": [
      {
        "id": "castor",
        "name": "北河二",
        "englishName": "Castor",
        "hip": 36850,
        "ra": 7.576634,
        "dec": 31.888276,
        "mag": 1.58,
        "color": "#dae9ff",
        "distanceLy": 50.9
      },
      {
        "id": "pollux",
        "name": "北河三",
        "englishName": "Pollux",
        "hip": 37826,
        "ra": 7.755277,
        "dec": 28.026199,
        "mag": 1.16,
        "color": "#ffd89e",
        "distanceLy": 33.8
      },
      {
        "id": "mebsuta",
        "name": "双子座 ε",
        "englishName": "Mebsuta",
        "hip": 32246,
        "ra": 6.732202,
        "dec": 25.131124,
        "mag": 3.06,
        "color": "#ffd89e",
        "distanceLy": 840
      },
      {
        "id": "tejat",
        "name": "双子座 μ",
        "englishName": "Tejat",
        "hip": 30343,
        "ra": 6.382673,
        "dec": 22.513586,
        "mag": 2.87,
        "color": "#ffb783",
        "distanceLy": 230
      },
      {
        "id": "propus",
        "name": "双子座 η",
        "englishName": "Propus",
        "hip": 29655,
        "ra": 6.247961,
        "dec": 22.506799,
        "mag": 3.31,
        "color": "#ffb783",
        "distanceLy": 380
      },
      {
        "id": "wasat",
        "name": "双子座 δ",
        "englishName": "Wasat",
        "hip": 35550,
        "ra": 7.335383,
        "dec": 21.98232,
        "mag": 3.5,
        "color": "#fff3d2",
        "distanceLy": 60.5
      },
      {
        "id": "mekbuda",
        "name": "双子座 ζ",
        "englishName": "Mekbuda",
        "hip": 34088,
        "ra": 7.068481,
        "dec": 20.570297,
        "mag": 4.01,
        "color": "#ffd89e",
        "distanceLy": 1380
      },
      {
        "id": "alhena",
        "name": "井宿三",
        "englishName": "Alhena",
        "hip": 31681,
        "ra": 6.628528,
        "dec": 16.399252,
        "mag": 1.93,
        "color": "#dae9ff",
        "distanceLy": 110
      },
      {
        "id": "alzirr",
        "name": "双子座 ξ",
        "englishName": "Alzirr",
        "hip": 32362,
        "ra": 6.754824,
        "dec": 12.895591,
        "mag": 3.35,
        "color": "#fff3d2",
        "distanceLy": 58.7
      },
      {
        "id": "hip-37740",
        "name": "双子座 κ",
        "englishName": "Kap Gem",
        "hip": 37740,
        "ra": 7.740793,
        "dec": 24.397993,
        "mag": 3.57,
        "color": "#ffd89e",
        "distanceLy": 140
      },
      {
        "id": "hip-33018",
        "name": "双子座 θ",
        "englishName": "The Gem",
        "hip": 33018,
        "ra": 6.879816,
        "dec": 33.961254,
        "mag": 3.6,
        "color": "#dae9ff",
        "distanceLy": 190
      }
    ],
    "lines": [
      [
        "castor",
        "mebsuta"
      ],
      [
        "mebsuta",
        "tejat"
      ],
      [
        "tejat",
        "propus"
      ],
      [
        "castor",
        "hip-33018"
      ],
      [
        "hip-33018",
        "mebsuta"
      ],
      [
        "pollux",
        "wasat"
      ],
      [
        "wasat",
        "mekbuda"
      ],
      [
        "mekbuda",
        "alhena"
      ],
      [
        "alhena",
        "alzirr"
      ],
      [
        "pollux",
        "hip-37740"
      ],
      [
        "castor",
        "pollux"
      ],
      [
        "mebsuta",
        "wasat"
      ]
    ],
    "featured": [
      "castor",
      "pollux",
      "alhena"
    ]
  },
  {
    "id": "leo",
    "name": "狮子座",
    "latin": "Leo",
    "abbr": "Leo",
    "region": "north",
    "zodiac": true,
    "tagline": "一个反问号，勾出雄狮的鬃毛。",
    "recognition": "从轩辕十四向上，可以连出像反写问号的“镰刀”星群。另一侧的三角形，标出狮子的后半身。",
    "story": "Leo 的名字意为狮子。观察连线时，可以把弯曲的镰刀想成头部与鬃毛，把后方三角形想成身躯和尾部。",
    "fact": "轩辕十四是狮子座的显眼亮星。星座里的天体并不都属于同一系统；这个方向还可以观测到远得多的星系。",
    "source": {
      "label": "NASA · 狮子座的天体",
      "url": "https://science.nasa.gov/solar-system/skywatching/night-sky-network/celestial-wonders-in-leo/"
    },
    "stars": [
      {
        "id": "regulus",
        "name": "轩辕十四",
        "englishName": "Regulus",
        "hip": 49669,
        "ra": 10.139532,
        "dec": 11.967207,
        "mag": 1.36,
        "color": "#aacfff",
        "distanceLy": 79.3
      },
      {
        "id": "hip-49583",
        "name": "狮子座 η",
        "englishName": "Eta Leo",
        "hip": 49583,
        "ra": 10.122209,
        "dec": 16.762664,
        "mag": 3.48,
        "color": "#dae9ff",
        "distanceLy": 1270
      },
      {
        "id": "algieba",
        "name": "狮子座 γ",
        "englishName": "Algieba",
        "hip": 50583,
        "ra": 10.332873,
        "dec": 19.841489,
        "mag": 2.01,
        "color": "#ffd89e",
        "distanceLy": 130
      },
      {
        "id": "adhafera",
        "name": "狮子座 ζ",
        "englishName": "Adhafera",
        "hip": 50335,
        "ra": 10.278171,
        "dec": 23.417311,
        "mag": 3.43,
        "color": "#fff3d2",
        "distanceLy": 270
      },
      {
        "id": "rasalas",
        "name": "狮子座 μ",
        "englishName": "Rasalas",
        "hip": 48455,
        "ra": 9.879398,
        "dec": 26.006951,
        "mag": 3.88,
        "color": "#ffd89e",
        "distanceLy": 120
      },
      {
        "id": "ras-elased-australis",
        "name": "狮子座 ε",
        "englishName": "Ras Elased Australis",
        "hip": 47908,
        "ra": 9.764188,
        "dec": 23.774255,
        "mag": 2.97,
        "color": "#ffd89e",
        "distanceLy": 250
      },
      {
        "id": "zosma",
        "name": "狮子座 δ",
        "englishName": "Zosma",
        "hip": 54872,
        "ra": 11.235138,
        "dec": 20.523717,
        "mag": 2.56,
        "color": "#dae9ff",
        "distanceLy": 58.4
      },
      {
        "id": "chertan",
        "name": "狮子座 θ",
        "englishName": "Chertan",
        "hip": 54879,
        "ra": 11.237335,
        "dec": 15.42957,
        "mag": 3.33,
        "color": "#dae9ff",
        "distanceLy": 170
      },
      {
        "id": "denebola",
        "name": "五帝座一",
        "englishName": "Denebola",
        "hip": 57632,
        "ra": 11.817663,
        "dec": 14.57206,
        "mag": 2.14,
        "color": "#dae9ff",
        "distanceLy": 35.9
      }
    ],
    "lines": [
      [
        "regulus",
        "hip-49583"
      ],
      [
        "hip-49583",
        "algieba"
      ],
      [
        "algieba",
        "adhafera"
      ],
      [
        "adhafera",
        "rasalas"
      ],
      [
        "rasalas",
        "ras-elased-australis"
      ],
      [
        "algieba",
        "zosma"
      ],
      [
        "zosma",
        "denebola"
      ],
      [
        "denebola",
        "chertan"
      ],
      [
        "chertan",
        "regulus"
      ],
      [
        "chertan",
        "zosma"
      ]
    ],
    "featured": [
      "regulus",
      "algieba",
      "denebola"
    ]
  },
  {
    "id": "pegasus",
    "name": "飞马座",
    "latin": "Pegasus",
    "abbr": "Peg",
    "region": "north",
    "zodiac": false,
    "tagline": "用一个大四边形，打开秋夜的星图。",
    "recognition": "先辨认宽阔的“飞马大四边形”，再沿室宿一一侧的亮星连线，向危宿三延伸，寻找马颈和头部。",
    "story": "Pegasus 来自希腊神话中的带翼飞马。古老星图用飞翔的马来记忆这片天空；星点之间的连线并不是宇宙中真实存在的线。",
    "fact": "大四边形的一角——壁宿二——在现代天区划分中属于仙女座。因此一个辨认星群，可以跨越不止一个星座。",
    "source": {
      "label": "Chandra · 飞马座的故事",
      "url": "https://chandra.si.edu/photo/constellations/pegasus.html"
    },
    "stars": [
      {
        "id": "markab",
        "name": "室宿一",
        "englishName": "Markab",
        "hip": 113963,
        "ra": 23.079348,
        "dec": 15.205264,
        "mag": 2.49,
        "color": "#dae9ff",
        "distanceLy": 130
      },
      {
        "id": "scheat",
        "name": "室宿二",
        "englishName": "Scheat",
        "hip": 113881,
        "ra": 23.062901,
        "dec": 28.082789,
        "mag": 2.44,
        "color": "#ffb783",
        "distanceLy": 200
      },
      {
        "id": "alpheratz",
        "name": "壁宿二",
        "englishName": "Alpheratz",
        "hip": 677,
        "ra": 0.139791,
        "dec": 29.090432,
        "mag": 2.07,
        "color": "#dae9ff",
        "distanceLy": 97.0,
        "constellationNote": "属于仙女座；参与飞马大四边形星群"
      },
      {
        "id": "algenib",
        "name": "壁宿一",
        "englishName": "Algenib",
        "hip": 1067,
        "ra": 0.220598,
        "dec": 15.183596,
        "mag": 2.83,
        "color": "#aacfff",
        "distanceLy": 390
      },
      {
        "id": "homam",
        "name": "飞马座 ζ",
        "englishName": "Homam",
        "hip": 112029,
        "ra": 22.691033,
        "dec": 10.831364,
        "mag": 3.41,
        "color": "#aacfff",
        "distanceLy": 200
      },
      {
        "id": "biham",
        "name": "飞马座 θ",
        "englishName": "Biham",
        "hip": 109427,
        "ra": 22.169996,
        "dec": 6.197865,
        "mag": 3.52,
        "color": "#dae9ff",
        "distanceLy": 92.3
      },
      {
        "id": "enif",
        "name": "危宿三",
        "englishName": "Enif",
        "hip": 107315,
        "ra": 21.736433,
        "dec": 9.875011,
        "mag": 2.38,
        "color": "#ffb783",
        "distanceLy": 690
      },
      {
        "id": "matar",
        "name": "飞马座 η",
        "englishName": "Matar",
        "hip": 112158,
        "ra": 22.716704,
        "dec": 30.221245,
        "mag": 2.93,
        "color": "#ffd89e",
        "distanceLy": 210
      }
    ],
    "lines": [
      [
        "markab",
        "scheat"
      ],
      [
        "scheat",
        "alpheratz"
      ],
      [
        "alpheratz",
        "algenib"
      ],
      [
        "algenib",
        "markab"
      ],
      [
        "markab",
        "homam"
      ],
      [
        "homam",
        "biham"
      ],
      [
        "biham",
        "enif"
      ],
      [
        "scheat",
        "matar"
      ]
    ],
    "featured": [
      "markab",
      "alpheratz",
      "enif"
    ]
  },
  {
    "id": "crux",
    "name": "南十字座",
    "latin": "Crux",
    "abbr": "Cru",
    "region": "south",
    "zodiac": false,
    "tagline": "小小的十字，点亮南方星空。",
    "recognition": "找出四颗明亮恒星，两两相连组成一长一短的十字轴。十字旁还有一颗稍暗、颜色偏暖的恒星。",
    "story": "南十字是南方天空里广为人知的标志，出现在多个国家的旗帜上，也被欧洲南方天文台用在标志中。",
    "fact": "南十字座是 88 个现代星座中面积最小的一个。四颗主要恒星距离不同，十字形状来自我们在地球上的观看方向。",
    "source": {
      "label": "ESO · 南十字星的故事",
      "url": "https://www.eso.org/public/blog/navigating-the-stars/"
    },
    "stars": [
      {
        "id": "acrux",
        "name": "十字架二",
        "englishName": "Acrux",
        "hip": 60718,
        "ra": 12.443311,
        "dec": -63.099092,
        "mag": 0.77,
        "color": "#aacfff",
        "distanceLy": 320
      },
      {
        "id": "mimosa",
        "name": "十字架三",
        "englishName": "Mimosa",
        "hip": 62434,
        "ra": 12.795359,
        "dec": -59.688764,
        "mag": 1.25,
        "color": "#aacfff",
        "distanceLy": 280
      },
      {
        "id": "gacrux",
        "name": "十字架一",
        "englishName": "Gacrux",
        "hip": 61084,
        "ra": 12.519429,
        "dec": -57.113212,
        "mag": 1.59,
        "color": "#ffb783",
        "distanceLy": 88.6
      },
      {
        "id": "imai",
        "name": "十字架四",
        "englishName": "Imai",
        "hip": 59747,
        "ra": 12.252427,
        "dec": -58.748928,
        "mag": 2.79,
        "color": "#aacfff",
        "distanceLy": 350
      },
      {
        "id": "ginan",
        "name": "南十字座 ε",
        "englishName": "Ginan",
        "hip": 60260,
        "ra": 12.356031,
        "dec": -60.401147,
        "mag": 3.59,
        "color": "#ffd89e",
        "distanceLy": 230
      }
    ],
    "lines": [
      [
        "acrux",
        "gacrux"
      ],
      [
        "mimosa",
        "imai"
      ]
    ],
    "featured": [
      "acrux",
      "mimosa",
      "gacrux"
    ]
  },
  {
    "id": "canis-major",
    "name": "大犬座",
    "latin": "Canis Major",
    "abbr": "CMa",
    "region": "south",
    "zodiac": false,
    "tagline": "追随天狼星，认识夜空最亮的恒星。",
    "recognition": "从耀眼的天狼星开始，向周围较暗的亮星延伸。它的南侧有弧矢一与弧矢七等亮星，构成大犬的身躯。",
    "story": "Canis Major 意为“大犬”。西方传统星图常把它看作跟随猎户的猎犬，天狼星因此也有“犬星”的称呼。",
    "fact": "天狼星是地球夜空中视亮度最高的恒星，距离约 8.6 光年。它还有一颗白矮星伴星，肉眼看到的光点并不总是单独一颗恒星。",
    "source": {
      "label": "NASA · 天狼星与它的伴星",
      "url": "https://science.nasa.gov/asset/hubble/the-dog-star-sirius-and-its-tiny-companion/"
    },
    "stars": [
      {
        "id": "sirius",
        "name": "天狼星",
        "englishName": "Sirius",
        "hip": 32349,
        "ra": 6.752481,
        "dec": -16.716116,
        "mag": -1.44,
        "color": "#dae9ff",
        "distanceLy": 8.6
      },
      {
        "id": "mirzam",
        "name": "大犬座 β",
        "englishName": "Mirzam",
        "hip": 30324,
        "ra": 6.378329,
        "dec": -17.955918,
        "mag": 1.98,
        "color": "#aacfff",
        "distanceLy": 490
      },
      {
        "id": "muliphein",
        "name": "大犬座 γ",
        "englishName": "Muliphein",
        "hip": 34045,
        "ra": 7.062637,
        "dec": -15.633286,
        "mag": 4.11,
        "color": "#aacfff",
        "distanceLy": 440
      },
      {
        "id": "wezen",
        "name": "弧矢一",
        "englishName": "Wezen",
        "hip": 34444,
        "ra": 7.139857,
        "dec": -26.3932,
        "mag": 1.83,
        "color": "#fff3d2",
        "distanceLy": 1610
      },
      {
        "id": "adhara",
        "name": "弧矢七",
        "englishName": "Adhara",
        "hip": 33579,
        "ra": 6.977097,
        "dec": -28.972084,
        "mag": 1.5,
        "color": "#aacfff",
        "distanceLy": 410
      },
      {
        "id": "aludra",
        "name": "弧矢二",
        "englishName": "Aludra",
        "hip": 35904,
        "ra": 7.401584,
        "dec": -29.303104,
        "mag": 2.45,
        "color": "#aacfff",
        "distanceLy": 1990
      },
      {
        "id": "furud",
        "name": "大犬座 ζ",
        "englishName": "Furud",
        "hip": 30122,
        "ra": 6.338553,
        "dec": -30.063367,
        "mag": 3.02,
        "color": "#aacfff",
        "distanceLy": 360
      }
    ],
    "lines": [
      [
        "sirius",
        "mirzam"
      ],
      [
        "sirius",
        "muliphein"
      ],
      [
        "muliphein",
        "wezen"
      ],
      [
        "wezen",
        "adhara"
      ],
      [
        "adhara",
        "furud"
      ],
      [
        "wezen",
        "aludra"
      ],
      [
        "sirius",
        "wezen"
      ]
    ],
    "featured": [
      "sirius",
      "wezen",
      "adhara"
    ]
  }
];

export const CONSTELLATION_SOURCES = [
  {
    "label": "David Nash · HYG v4.1 恒星数据",
    "url": "https://github.com/astronexus/HYG-Database/tree/main/hyg/CURRENT",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/"
  },
  {
    "label": "IAU · 88 星座与天区",
    "url": "https://www.iau.org/IAU/Astronomy-FAQs/Constellations.aspx"
  },
  {
    "label": "NASA · 从猎户座认识宇宙",
    "url": "https://science.nasa.gov/universe/stories/quick-reads/discovering-the-universe-through-the-constellation-orion/"
  },
  {
    "label": "NASA · 星群与星座",
    "url": "https://science.nasa.gov/solar-system/what-are-asterisms/"
  },
  {
    "label": "NASA · 观星常见问题",
    "url": "https://science.nasa.gov/skywatching/faq/"
  },
  {
    "label": "Chandra · 仙后座的故事",
    "url": "https://chandra.si.edu/photo/constellations/cassiopeia.html"
  },
  {
    "label": "NASA · 夏季大三角：天津四",
    "url": "https://science.nasa.gov/solar-system/skywatching/night-sky-network/summer-triangle-corner-deneb/"
  },
  {
    "label": "NASA · 夏季大三角：织女星",
    "url": "https://science.nasa.gov/solar-system/skywatching/night-sky-network/summer-triangle-corner-vega/"
  },
  {
    "label": "NASA · 认识天蝎座",
    "url": "https://science.nasa.gov/solar-system/skywatching/night-sky-network/july2025-night-sky-notes/"
  },
  {
    "label": "NASA · 毕星团与昴星团",
    "url": "https://science.nasa.gov/solar-system/skywatching/night-sky-network/spot-the-young-stars-of-the-hyades-and-pleiades/"
  },
  {
    "label": "NASA · 寻找双子座",
    "url": "https://science.nasa.gov/solar-system/skywatching/night-sky-network/gemini-constellation/"
  },
  {
    "label": "NASA · 狮子座的天体",
    "url": "https://science.nasa.gov/solar-system/skywatching/night-sky-network/celestial-wonders-in-leo/"
  },
  {
    "label": "Chandra · 飞马座的故事",
    "url": "https://chandra.si.edu/photo/constellations/pegasus.html"
  },
  {
    "label": "ESO · 南十字星的故事",
    "url": "https://www.eso.org/public/blog/navigating-the-stars/"
  },
  {
    "label": "NASA · 天狼星与它的伴星",
    "url": "https://science.nasa.gov/asset/hubble/the-dog-star-sirius-and-its-tiny-companion/"
  },
  {
    "label": "Chandra · 猎户座的文化故事",
    "url": "https://chandra.si.edu/photo/constellations/orion.html"
  },
  {
    "label": "Chandra · 大犬座的文化故事",
    "url": "https://chandra.si.edu/photo/constellations/canismajor.html"
  }
];
