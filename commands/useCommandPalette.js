'use client';

import { useEffect, useState } from 'react';

export function useCommandPalette({ enabled = true } = {}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    function onKey(e) {
      const isMac = navigator.platform.includes('Mac');
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled]);

  return {
    open,
    close: () => setOpen(false),
  };
}
