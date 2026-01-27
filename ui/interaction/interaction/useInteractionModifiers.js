'use client';

import { useEffect, useState } from 'react';

export function useInteractionModifiers() {
  const [mods, setMods] = useState({
    shift: false,
    alt: false,
  });

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Shift') setMods((m) => ({ ...m, shift: true }));
      if (e.key === 'Alt') setMods((m) => ({ ...m, alt: true }));
    }
    function onKeyUp(e) {
      if (e.key === 'Shift') setMods((m) => ({ ...m, shift: false }));
      if (e.key === 'Alt') setMods((m) => ({ ...m, alt: false }));
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  return mods;
}
