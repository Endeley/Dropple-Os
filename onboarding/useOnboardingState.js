'use client';

const KEY = 'dropple.onboarding.seen';

export function hasSeen(mode) {
  if (typeof window === 'undefined') return false;
  try {
    const seen = JSON.parse(window.localStorage.getItem(KEY) || '{}');
    return Boolean(seen[mode]);
  } catch {
    return false;
  }
}

export function markSeen(mode) {
  if (typeof window === 'undefined') return;
  try {
    const seen = JSON.parse(window.localStorage.getItem(KEY) || '{}');
    seen[mode] = true;
    window.localStorage.setItem(KEY, JSON.stringify(seen));
  } catch {}
}
