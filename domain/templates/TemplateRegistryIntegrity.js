import crypto from 'crypto';

function stableSerialize(value) {
  if (Array.isArray(value)) {
    return value.map((item) => stableSerialize(item));
  }

  if (value && typeof value === 'object') {
    const result = {};
    for (const key of Object.keys(value).sort()) {
      result[key] = stableSerialize(value[key]);
    }
    return result;
  }

  return value;
}

export function computeRegistryFingerprint(entries) {
  const stable = JSON.stringify(stableSerialize(entries));
  return crypto.createHash('sha256').update(stable).digest('hex');
}
