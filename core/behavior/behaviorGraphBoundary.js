import {
  normalizeBehaviorGraph,
  validateBehaviorGraph,
  hashBehaviorGraph,
} from '@/core/contracts/BehaviorGraphContract.js';

export function canonicalizeBehaviorGraph(graph) {
  const normalized = normalizeBehaviorGraph(graph);
  validateBehaviorGraph(normalized);
  return normalized;
}

export function getBehaviorGraphHash(graph) {
  const normalized = normalizeBehaviorGraph(graph);
  return hashBehaviorGraph(normalized);
}
