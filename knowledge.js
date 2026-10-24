import {NEBULA_KNOWLEDGE} from './nebula-data.js';
import {BLACK_HOLE_KNOWLEDGE} from './black-hole-data.js';
import { SOLAR_KNOWLEDGE } from './knowledge-solar.js';
import { CRAFT_KNOWLEDGE } from './knowledge-craft.js';
import { DEEP_KNOWLEDGE } from './knowledge-deep.js';

// Reading content is separate from the geometry, navigation and simulation data.
export const KNOWLEDGE = { ...SOLAR_KNOWLEDGE, ...CRAFT_KNOWLEDGE, ...DEEP_KNOWLEDGE, ...BLACK_HOLE_KNOWLEDGE, ...NEBULA_KNOWLEDGE };

export function knowledgeFor(object) {
  const entry = KNOWLEDGE[object.id];
  const sources = entry?.sources?.length ? entry.sources : object.source ? [object.source] : [];
  return {
    metrics: entry?.metrics || [],
    sections: entry?.sections || [],
    facts: entry?.sections?.length ? [] : object.facts || [],
    sources: sources.filter((source, index, all) => /^https?:\/\//.test(source.url)
      && all.findIndex(item => item.url === source.url) === index),
  };
}
