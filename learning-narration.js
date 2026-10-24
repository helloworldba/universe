import { CONSTELLATION_KNOWLEDGE, CONSTELLATION_FOUNDATIONS } from './constellation-knowledge.js';
import { GUIDE_KNOWLEDGE } from './guide-knowledge.js';

export function learningNarrationText(lesson) {
  const parts = [lesson.title, ...lesson.sections.flatMap(([title, copy]) => [title, copy])];
  if (lesson.observe) parts.push('一起观察', lesson.observe);
  if (lesson.question) parts.push('想一想', lesson.question, '我们来看看答案', lesson.answer);
  return parts.map(text => /[。！？]$/.test(text) ? text : `${text}。`).join(' ');
}

export const LEARNING_NARRATIONS = [
  ...Object.entries(CONSTELLATION_KNOWLEDGE).map(([id, lesson]) => ({ key: `learning/constellation/${id}`, lesson })),
  ...Object.entries(CONSTELLATION_FOUNDATIONS).map(([panel, lesson]) => ({ key: `learning/basics/${panel}`, lesson })),
  ...Object.entries(GUIDE_KNOWLEDGE).map(([id, lesson]) => ({ key: `learning/guide/${id}`, lesson })),
];
