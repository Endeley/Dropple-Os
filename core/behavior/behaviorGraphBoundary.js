//
// Single chokepoint for BehaviorGraph correctness + determinism.
// Rule: NO ONE hashes/persists/compares BehaviorGraphs without going through this module.

import {
  normalizeBehaviorGraph,
  validateBehaviorGraph,
  hashBehaviorGraph,
} from '@/core/contracts/BehaviorGraphContract.js';

/**
 * Returns a canonical (normalized) BehaviorGraph.
 * - Normalization makes ordering + shape stable for hashing/diffing/persistence.
 * - Validation guarantees structural integrity.
 *
 * NOTE: We return the normalized object (not the original) so callers
 * naturally “carry canonical forward”.
 */
export function canonicalizeBehaviorGraph(graph) {
  const canonical = normalizeBehaviorGraph(graph);
  validateBehaviorGraph(canonical);
  return canonical;
}

/**
 * Deterministic structural hash for a BehaviorGraph.
 * Always hashes the normalized + validated representation.
 */
export function getBehaviorGraphHash(graph) {
  const canonical = canonicalizeBehaviorGraph(graph);
  return hashBehaviorGraph(canonical);
}

/**
 * Convenience: canonicalize and return both canonical + hash.
 * Useful for persistence layers (store graph + hash together).
 */
export function canonicalizeAndHashBehaviorGraph(graph) {
  const canonical = canonicalizeBehaviorGraph(graph);
  const hash = hashBehaviorGraph(canonical);
  return { canonical, hash };
}

/**
 * Strict structural equality check (by canonical hash).
 * Use for “is the graph meaningfully the same?” across reorderings.
 */
export function areBehaviorGraphsStructurallyEqual(a, b) {
  return getBehaviorGraphHash(a) === getBehaviorGraphHash(b);
}
