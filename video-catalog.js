import {findBlackHole} from './black-hole-data.js';
// 在对应数组中填写视频，保存并刷新网页即可。空数组通常隐藏入口；黑洞页保留按钮并提示「视频准备中」。
// 每项可以写 { title: '视频标题', bvid: '有效的 BV 号', page: 1, author: '作者' }
// 或 { title: '视频标题', url: 'https://www.bilibili.com/video/有效的BV号/' }。
// page 是分 P 序号，从 1 开始；同一页面可放多项。请勿填 b23.tv 短链接。
// object/目标ID 用于原天体详情；blackhole/目标ID 可独立配置黑洞专题视频。
const BLACK_HOLE_VIDEO = [{ title: '黑洞', bvid: 'BV1Bgnq6XEBi', page: 1, author: '洋zai' }];
export const VIDEO_CATALOG = {
  'object/sun': [{ title: '太阳', bvid: 'BV1TGnm6AEhH', page: 1 }],
  'object/mercury': [{ title: '水星', bvid: 'BV1xRnm6YE91', page: 1 }],
  'object/venus': [{ title: '金星', bvid: 'BV1WFnU6FEUW', page: 1 }],
  'object/earth': [{ title: '地球', bvid: 'BV1kpnm6sEMf', page: 1 }],
  'object/moon': [{ title: '月球', bvid: 'BV1knnm6dEQP', page: 1 }],
  'object/mars': [{ title: '火星', bvid: 'BV1CFnU6FERG', page: 1 }],
  'object/jupiter': [{ title: '木星', bvid: 'BV12Rnm6YEqi', page: 1 }],
  'object/saturn': [{ title: '土星', bvid: 'BV14Rnm6YEFp', page: 1 }],
  'object/uranus': [{ title: '天王星', bvid: 'BV1CJnm64ENR', page: 1 }],
  'object/neptune': [{ title: '海王星', bvid: 'BV1CJnm64Eme', page: 1 }],
  'object/solar': [{ title: '太阳系', bvid: 'BV1mGnm6wEwU', page: 1 }],
  'object/galaxy': [{ title: '银河系', bvid: 'BV1J4nm6XEb8', page: 1 }],
  'object/sagittarius-a': [{ title: '人马座 A*', bvid: 'BV1Thn26cELq', page: 1 }],
  'object/m87-blackhole': BLACK_HOLE_VIDEO,
  'object/cyg-x1': BLACK_HOLE_VIDEO,
  'object/m31-blackhole': [],
  'object/m32-blackhole': [],
  'object/m33-x7': [],
  'object/lmc-x1': [],
  'object/jwst': [],
  'object/roman': [],
  'object/hubble': [{ title: '哈勃太空望远镜', bvid: 'BV1Tbn26aEoh', page: 1 }],
  'object/voyager': [{ title: '旅行者 1 号', bvid: 'BV1Tbn26aEoT', page: 1 }],
  'object/pillars-of-creation': [{ title: '创生之柱', bvid: 'BV1WFnU6FEY1', page: 1 }],
  'object/crab-nebula': [{ title: '蟹状星云', bvid: 'BV1xRnm6YERw', page: 1 }],
  'object/m13-cluster': [{ title: 'M13 武仙座球状星团', bvid: 'BV1sFnU6FEFa', page: 1 }],
  'object/horsehead-nebula': [{ title: '猎户座马头星云', bvid: 'BV1yFnU6FETY', page: 1 }],
  // 其它天体及航天器同样使用 object/目标ID。
  // 独立黑洞专题的七个目标统一使用原 M87* 的黑洞科普视频。
  'blackhole/sgr-a': BLACK_HOLE_VIDEO,
  'blackhole/m87': BLACK_HOLE_VIDEO,
  'blackhole/cyg-x1': BLACK_HOLE_VIDEO,
  'blackhole/m31-blackhole': BLACK_HOLE_VIDEO,
  'blackhole/m32-blackhole': BLACK_HOLE_VIDEO,
  'blackhole/m33-x7': BLACK_HOLE_VIDEO,
  'blackhole/lmc-x1': BLACK_HOLE_VIDEO,
  'blackhole/ton618': BLACK_HOLE_VIDEO,
  'blackhole/structure': BLACK_HOLE_VIDEO,
  'blackhole/detection': BLACK_HOLE_VIDEO,
  'blackhole/compare': BLACK_HOLE_VIDEO,
  'constellation/orion': [],
  'constellation/ursa-major': [],
  'constellation/cassiopeia': [],
  'constellation/cygnus': [],
  'constellation/lyra': [],
  'constellation/scorpius': [],
  'constellation/taurus': [],
  'constellation/gemini': [],
  'constellation/leo': [],
  'constellation/pegasus': [],
  'constellation/crux': [],
  'constellation/canis-major': [],
  // 星座使用 constellation/星座ID；科普章节独立于天体页面配置。
  'guide/earth': [],
  'guide/moon': [],
  'guide/sun': [],
  'guide/jupiter': [],
  'guide/neptune': [],
  'guide/atlas': [],
  'guide/proxima-b': [],
  'guide/sagittarius-a': [],
  'guide/jwst': [],
  'guide/trajectories': [],
  'guide/big-bang': [],
};

const BV_PATTERN = /^BV[0-9A-Za-z]{10}$/;
const BILIBILI_HOSTS = new Set(['www.bilibili.com', 'm.bilibili.com', 'bilibili.com']);

/** Accept video identifiers only, never arbitrary embed HTML or player URLs. */
export function parseBilibiliVideo(entry) {
  const record = typeof entry === 'string' ? { url: entry } : entry;
  if (!record || typeof record !== 'object') return null;
  const input = String(record.url || record.bvid || '').trim();
  let bvid = input, part = '1';
  if (!BV_PATTERN.test(input)) {
    let url;
    try { url = new URL(input); } catch { return null; }
    if (!['https:', 'http:'].includes(url.protocol) || !BILIBILI_HOSTS.has(url.hostname)
      || url.username || url.password || url.port) return null;
    const match = url.pathname.match(/^\/video\/(BV[0-9A-Za-z]{10})\/?$/);
    if (!match) return null;
    bvid = match[1];
    if (url.searchParams.has('p')) part = url.searchParams.get('p');
  }
  if (record.page !== undefined) part = String(record.page);
  if (!/^[1-9]\d*$/.test(part) || !Number.isSafeInteger(Number(part))) return null;
  const page = Number(part);
  const watch = new URL(`https://www.bilibili.com/video/${bvid}/`);
  if (page > 1) watch.searchParams.set('p', String(page));
  const player = new URL('https://player.bilibili.com/player.html');
  // Official external-player parameters: https://player.bilibili.com/
  player.search = new URLSearchParams({ bvid, p: String(page), autoplay: '0', danmaku: '0', poster: '1' }).toString();
  return {
    bvid, page, title: typeof record.title === 'string' ? record.title.trim() : '',
    author: typeof record.author === 'string' ? record.author.trim() : '',
    watchUrl: watch.href, embedUrl: player.href,
  };
}

export function videosFor(key, catalog = VIDEO_CATALOG) {
  if(!Object.hasOwn(catalog,key)&&key.startsWith('blackhole/')){const record=findBlackHole(key.slice(10));if(record)key=`object/${record.catalogId}`;}
  if (!Object.hasOwn(catalog, key) || !Array.isArray(catalog[key])) return [];
  const seen = new Set();
  return catalog[key].map(parseBilibiliVideo).filter(video => {
    if (!video) return false;
    const identity = `${video.bvid}/${video.page}`;
    if (seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
}
