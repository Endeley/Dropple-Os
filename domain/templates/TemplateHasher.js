import crypto from 'crypto';

/**
 * Transient keys that must never affect structural identity
 */
const TRANSIENT_KEYS = new Set([
  '__internal',
  '__debug',
  'lastEvaluatedAt',
  'runtimeCache',
  'uiState',
]);

/**
 * Deep clone without mutation risk
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Recursively remove transient properties
 */
function stripTransient(node) {
  if (Array.isArray(node)) {
    return node.map(stripTransient);
  }

  if (node && typeof node === 'object') {
    const cleaned = {};
    for (const key of Object.keys(node)) {
      if (TRANSIENT_KEYS.has(key)) continue;
      cleaned[key] = stripTransient(node[key]);
    }
    return cleaned;
  }

  return node;
}

/**
 * Recursively sort keys for deterministic output
 */
function sortKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map(sortKeys);
  }

  if (obj && typeof obj === 'object') {
    const sorted = {};
    for (const key of Object.keys(obj).sort()) {
      sorted[key] = sortKeys(obj[key]);
    }
    return sorted;
  }

  return obj;
}

/**
 * Stable stringify (no whitespace drift)
 */
function stableStringify(obj) {
  return JSON.stringify(obj);
}

/**
 * Generate SHA-256 structural hash
 */
export function hashTemplateGraph(graph) {
  if (!graph || typeof graph !== 'object') {
    throw new Error('Invalid template graph provided for hashing.');
  }

  const cloned = deepClone(graph);
  const stripped = stripTransient(cloned);
  const sorted = sortKeys(stripped);
  const stable = stableStringify(sorted);

  const hash = crypto
    .createHash('sha256')
    .update(stable)
    .digest('hex');

  return Object.freeze(hash);
}
