// Educational relative-position diagrams. The geometry intentionally does not
// represent live ephemerides; source URLs are retained for editorial verification.
const POSITIONS = {
  jwst: {
    heading: '地球背太阳一侧 · 日地 L2 附近',
    description: '韦布随地球共同绕太阳运行，并在 L2 附近的晕轨道上绕行。图中约 150 万千米是地球至 L2 的距离。',
    source: '依据：NASA · 韦布的 L2 轨道',
    url: 'https://science.nasa.gov/mission/webb/orbit/',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 182" role="img" aria-labelledby="craft-position-title craft-position-desc">
      <title id="craft-position-title">詹姆斯·韦伯太空望远镜与太阳、地球的位置关系</title>
      <desc id="craft-position-desc">太阳在左，地球在中，日地 L2 位于地球背太阳一侧，距地球约 150 万千米。韦布沿 L2 附近的晕轨道运行。大小、距离、轨道与位置均为示意。</desc>
      <path class="position-axis" d="M45 84H235"></path>
      <path class="position-direction" d="M57 40H153m-5-4 5 4-5 4"></path>
      <text class="position-muted" x="105" y="28" text-anchor="middle">背太阳方向</text>
      <circle class="position-sun-glow" cx="28" cy="84" r="23"></circle>
      <circle class="position-sun" cx="28" cy="84" r="16"></circle>
      <text x="28" y="119" text-anchor="middle">太阳</text>
      <circle class="position-earth-glow" cx="108" cy="84" r="14"></circle>
      <circle class="position-earth" cx="108" cy="84" r="9"></circle>
      <text x="108" y="119" text-anchor="middle">地球</text>
      <ellipse class="position-halo" cx="215" cy="84" rx="24" ry="37"></ellipse>
      <path class="position-l2" d="M211 84h8m-4-4v8"></path>
      <text x="215" y="105" text-anchor="middle">L2</text>
      <path class="position-craft" d="m232 53 7 4v8l-7 4-7-4v-8Z"></path>
      <path class="position-leader" d="M232 48V35"></path>
      <text class="position-highlight" x="232" y="25" text-anchor="middle">韦布</text>
      <text class="position-muted" x="215" y="137" text-anchor="middle">晕轨道</text>
      <path class="position-measure" d="M108 145v7h107v-7"></path>
      <text x="162" y="174" text-anchor="middle">约 150 万 km</text>
    </svg>`,
  },
  roman: {
    heading: '从地球出发 · 日地 L2 目标轨道',
    description: '罗曼的目标工作区域位于地球背太阳一侧的 L2 附近晕轨道。曲线仅示意转移方向，约 150 万千米指地球至 L2 的距离。',
    clarification: '截至 NASA 2026 年 10 月 14 日的报道，任务正进行仪器测试、校准与对焦。图中模型用于表示任务与目标区域，不代表实时位置或已到达 L2。',
    source: '依据：NASA · 罗曼发射、目标轨道与在轨调试',
    url: 'https://science.nasa.gov/mission/roman-space-telescope/roman-launch/',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 212" role="img" aria-labelledby="craft-position-title craft-position-desc">
      <title id="craft-position-title">南希·格蕾丝·罗曼太空望远镜与地球、L2 目标轨道的关系</title>
      <desc id="craft-position-desc">太阳在左，地球在中，日地 L2 位于地球背太阳方向，距地球约 150 万千米。虚线曲线示意从地球到 L2 附近晕轨道的转移方向，不表示实时位置、飞行进度或精确转移轨迹。</desc>
      <path class="position-axis" d="M45 96H238"></path>
      <path class="position-direction" d="M55 40H150m-5-4 5 4-5 4"></path>
      <text class="position-muted" x="103" y="27" text-anchor="middle">背太阳方向</text>
      <circle class="position-sun-glow" cx="28" cy="96" r="23"></circle>
      <circle class="position-sun" cx="28" cy="96" r="16"></circle>
      <text x="28" y="131" text-anchor="middle">太阳</text>
      <circle class="position-earth-glow" cx="103" cy="96" r="14"></circle>
      <circle class="position-earth" cx="103" cy="96" r="9"></circle>
      <text x="103" y="131" text-anchor="middle">地球</text>
      <ellipse class="position-halo position-roman-halo" cx="217" cy="96" rx="24" ry="38"></ellipse>
      <path class="position-l2" d="M213 96h8m-4-4v8"></path>
      <text x="217" y="116" text-anchor="middle">L2</text>
      <path class="position-flight position-transfer" d="M112 91C139 55 167 48 200 65m-8-5 8 5-8 1"></path>
      <text class="position-muted" x="151" y="52" text-anchor="middle">转移示意</text>
      <g class="position-roman-probe" transform="translate(237 73) rotate(20)">
        <path d="M-5-9H5V9H-5Z"></path><path d="M-12-5H-5V5H-12Zm17 0h7V5H5Z"></path>
        <path d="M-5-9Q0-14 5-9"></path>
      </g>
      <path class="position-leader" d="M237 59V40"></path>
      <text class="position-highlight" x="232" y="27" text-anchor="middle">罗曼</text>
      <text class="position-muted" x="205" y="151" text-anchor="middle">目标晕轨道</text>
      <path class="position-measure" d="M103 167v7h114v-7"></path>
      <text x="160" y="196" text-anchor="middle">约 150 万 km</text>
    </svg>`,
  },
  voyager: {
    heading: '从地球出发 · 飞向星际空间',
    description: '旅行者 1 号从地球出发，飞掠木星和土星后向行星轨道平面的北侧远行。2012 年 8 月 25 日穿越日球层顶，进入星际空间。',
    clarification: '日球层顶是太阳风的边界；越过它不等于离开整个太阳系，奥尔特云还在更远处。',
    source: '依据：NASA · 旅行者任务与太阳系边界',
    url: 'https://science.nasa.gov/mission/voyager/frequently-asked-questions/',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 220" role="img" aria-labelledby="craft-position-title craft-position-desc">
      <title id="craft-position-title">旅行者 1 号与地球、日球层的位置关系</title>
      <desc id="craft-position-desc">太阳与地球轨道位于日球层内，旅行者 1 号沿示意路径向外远行，于 2012 年穿越日球层顶进入星际空间。此图不显示实时位置、真实距离或精确飞行轨迹。</desc>
      <ellipse class="position-heliosphere" cx="84" cy="113" rx="76" ry="64"></ellipse>
      <text class="position-muted" x="52" y="69" text-anchor="middle">日球层</text>
      <text class="position-highlight" x="211" y="23" text-anchor="middle">星际空间</text>
      <ellipse class="position-orbit" cx="62" cy="118" rx="31" ry="19"></ellipse>
      <circle class="position-sun-glow" cx="62" cy="118" r="17"></circle>
      <circle class="position-sun" cx="62" cy="118" r="11"></circle>
      <text x="62" y="157" text-anchor="middle">太阳</text>
      <circle class="position-earth" cx="82" cy="104" r="6"></circle>
      <path class="position-leader" d="M82 97V88"></path>
      <text x="87" y="82" text-anchor="middle">地球</text>
      <path class="position-flight" d="M89 104C118 103 134 97 151 83L222 46m-8-1 8 1-4 7"></path>
      <circle class="position-crossing" cx="151" cy="83" r="4"></circle>
      <path class="position-leader" d="M151 88l23 31h12"></path>
      <text x="190" y="137" text-anchor="middle">日球层顶</text>
      <text class="position-muted" x="190" y="156" text-anchor="middle">2012 年穿越</text>
      <path class="position-probe" d="m227 40 10 7m-14 0a10 10 0 0 0 10 7m-5-2-5 7m8-5 8 6"></path>
      <text class="position-highlight" x="210" y="80" text-anchor="middle">旅行者 1 号</text>
      <path class="position-leader" d="M37 134l-10 47"></path>
      <text class="position-muted" x="36" y="200" text-anchor="middle">地球轨道</text>
    </svg>`,
  },
};

export function craftPositionFor(id) { return POSITIONS[id] || null; }

export function createCraftPositionDiagram() {
  const element = document.createElement('details');
  element.className = 'craft-position'; element.open = true; element.hidden = true;
  const summary = document.createElement('summary');
  summary.textContent = '位置示意';
  const hint = document.createElement('span'); hint.className = 'position-toggle-hint'; hint.setAttribute('aria-hidden', 'true'); summary.append(hint);
  const heading = document.createElement('p'); heading.className = 'position-heading';
  const graphic = document.createElement('div'); graphic.className = 'position-graphic';
  const description = document.createElement('p'); description.className = 'position-description';
  const clarification = document.createElement('p'); clarification.className = 'position-clarification';
  const note = document.createElement('p'); note.className = 'position-note'; note.textContent = '相对位置示意 · 非等比例 · 非实时位置';
  const source = document.createElement('p'); source.className = 'position-source';
  element.append(summary, heading, graphic, description, clarification, note, source);
  let current = null;
  function render(id) {
    if (id === current) return;
    current = id;
    const data = craftPositionFor(id);
    element.hidden = !data;
    element.dataset.craft = data ? id : '';
    graphic.innerHTML = data?.svg || '';
    heading.textContent = data?.heading || '';
    description.textContent = data?.description || '';
    clarification.textContent = data?.clarification || '';
    clarification.hidden = !data?.clarification;
    source.textContent = data?.source || '';
  }
  return { element, render };
}
