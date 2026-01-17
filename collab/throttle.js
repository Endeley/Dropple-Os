'use client';

export function throttle(fn, waitMs) {
  let last = 0;
  let timeoutId = null;
  let pendingArgs = null;

  return (...args) => {
    const now = Date.now();
    const delta = now - last;

    if (delta >= waitMs) {
      last = now;
      fn(...args);
      return;
    }

    pendingArgs = args;

    if (timeoutId) return;

    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (!pendingArgs) return;
      last = Date.now();
      fn(...pendingArgs);
      pendingArgs = null;
    }, waitMs - delta);
  };
}
