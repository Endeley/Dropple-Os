export const EMBED_PRESETS = {
  presentation: {
    label: 'Presentation',
    description: 'Clean viewer for slides and demos',
    params: {
      zoom: 1,
      bg: 'dark',
      timeline: false,
      controls: false,
    },
    size: { width: 960, height: 540 },
  },
  docs: {
    label: 'Docs',
    description: 'Readable embed for documentation',
    params: {
      zoom: 1,
      bg: 'light',
      timeline: true,
      controls: true,
    },
    size: { width: 800, height: 500 },
  },
  minimal: {
    label: 'Minimal',
    description: 'Bare content, no UI',
    params: {
      zoom: 1,
      bg: 'transparent',
      timeline: false,
      controls: false,
    },
    size: { width: 720, height: 405 },
  },
};
