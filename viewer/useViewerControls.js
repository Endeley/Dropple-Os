'use client';

import { useCallback, useEffect, useState } from 'react';

export function useViewerControls(defaults = {}) {
  const [zoom, setZoom] = useState(defaults.zoom ?? 1);
  const [bg, setBg] = useState(defaults.bg ?? 'light');
  const [fullscreen, setFullscreen] = useState(false);

  const zoomIn = () => setZoom((z) => Math.min(4, +(z + 0.1).toFixed(2)));
  const zoomOut = () => setZoom((z) => Math.max(0.1, +(z - 0.1).toFixed(2)));
  const resetZoom = () => setZoom(1);

  const toggleBg = () =>
    setBg((value) =>
      value === 'light' ? 'dark' : value === 'dark' ? 'transparent' : 'light'
    );

  const toggleFullscreen = useCallback(() => {
    const el = document.documentElement;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
      setFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setFullscreen(false);
    }
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === '+') zoomIn();
      if (e.key === '-') zoomOut();
      if (e.key === '0') resetZoom();
      if (e.key.toLowerCase() === 'f') toggleFullscreen();
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleFullscreen]);

  return {
    zoom,
    bg,
    fullscreen,
    zoomIn,
    zoomOut,
    resetZoom,
    toggleBg,
    toggleFullscreen,
  };
}
