'use client';

import { useEffect, useState } from 'react';
import { MODE_HINTS } from './modeHints';
import { hasSeen, markSeen } from './useOnboardingState';

export function useModeOnboarding(mode) {
  const [text, setText] = useState(null);

  useEffect(() => {
    if (!mode) return;
    if (hasSeen(mode)) return;

    const hint = MODE_HINTS[mode];
    if (!hint) return;

    let showTimer = null;
    let hideTimer = null;

    showTimer = setTimeout(() => {
      setText(hint);
      hideTimer = setTimeout(() => {
        setText(null);
        markSeen(mode);
      }, 2500);
    }, 0);

    return () => {
      if (showTimer) clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [mode]);

  useEffect(() => {
    if (!text) return;

    function onFirstAction() {
      setText(null);
      markSeen(mode);
    }

    window.addEventListener('pointerdown', onFirstAction, { once: true });
    window.addEventListener('keydown', onFirstAction, { once: true });
    return () => {
      window.removeEventListener('pointerdown', onFirstAction);
      window.removeEventListener('keydown', onFirstAction);
    };
  }, [text, mode]);

  return text;
}
