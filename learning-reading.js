import { LEARNING_SOURCES } from './learning-sources.js';

const node = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
};

// Native details preserves keyboard/assistive-technology behavior. All editorial
// content is text, never interpolated HTML. No remote assets or audio required.
export function createLearningReading(lesson, { onToggle = () => {}, narration, owner, key } = {}) {
  const details = node('details', 'learning-reading');
  const summary = node('summary', 'learning-reading-summary');
  summary.append(node('span', '', lesson.title), node('span', 'learning-reading-hint', '拓展阅读'));
  const content = node('div', 'learning-reading-content');
  if (narration && owner && key) {
    const audioRow = node('div', 'learning-audio');
    const play = node('button', 'learning-narrate', '听拓展讲解');
    const status = node('span', 'learning-audio-status');
    play.type = 'button';play.setAttribute('aria-pressed', 'false');
    play.setAttribute('aria-label', `听拓展讲解：${lesson.title}`);
    status.setAttribute('role', 'status');
    play.addEventListener('click', () => {
      status.textContent = '';
      narration.toggle({ owner, key,
        onState: state => {
          play.textContent = state === 'loading' ? '取消加载' : state === 'playing' ? '停止讲解' : '听拓展讲解';
          play.setAttribute('aria-label', `${play.textContent}：${lesson.title}`);
          play.setAttribute('aria-pressed', String(state !== 'idle'));
          play.setAttribute('aria-busy', String(state === 'loading'));
        },
        onError: message => { status.textContent = message; },
      });
    });
    // Closing one reading must not stop an introduction or a different reading.
    details.addEventListener('toggle', () => {
      if (details.isConnected === false) return;
      const playing = narration.getState?.();
      if (!details.open && playing?.owner === owner && playing.key === key) narration.stop(owner);
    });
    audioRow.append(play, status);content.append(audioRow);
  }
  lesson.sections.forEach(([heading, copy]) => {
    const section = node('section', 'learning-reading-section');
    section.append(node('h3', '', heading), node('p', '', copy));
    content.append(section);
  });
  if (lesson.observe) {
    const observation = node('section', 'learning-observation');
    observation.append(node('h3', '', '在这里观察'), node('p', '', lesson.observe));
    content.append(observation);
  }
  if (lesson.question && lesson.answer) {
    const quiz = node('details', 'learning-question');
    quiz.append(node('summary', '', `想一想：${lesson.question}`), node('p', '', lesson.answer));
    content.append(quiz);
  }
  const sources = lesson.sources.map(key => LEARNING_SOURCES[key].label).join('；');
  content.append(node('p', 'learning-reading-source', `资料参考：${sources}`));
  details.append(summary, content);
  details.addEventListener('toggle', () => onToggle(details.open));
  return details;
}
