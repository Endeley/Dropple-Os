import crypto from 'crypto';

export function computeRegistryFingerprint(entries) {
  const stable = JSON.stringify(entries);
  return crypto.createHash('sha256').update(stable).digest('hex');
}
