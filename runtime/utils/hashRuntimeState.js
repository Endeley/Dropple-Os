import crypto from 'crypto';

const VOLATILE_KEYS = new Set([
  'timestamp',
  'createdAt',
  'updatedAt',
  '_perf',
  'metrics',
]);

function stableStringify(value) {
  if (value === undefined) return 'null';
  if (value === null) return 'null';

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    const keys = Object.keys(value)
      .filter((k) => !VOLATILE_KEYS.has(k))
      .sort();

    return `{${keys
      .map((k) => `"${k}":${stableStringify(value[k])}`)
      .join(',')}}`;
  }

  return JSON.stringify(value);
}

export function hashRuntimeState(state) {
  const payload = stableStringify(state);
  return crypto.createHash('sha256').update(payload).digest('hex');
}
