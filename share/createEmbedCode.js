import { createShareLink } from './createShareLink';
import { EMBED_PRESETS } from './embedPresets';

export function createEmbedCode({
  zoom = 1,
  bg = 'light',
  timeline = true,
  controls = true,
  width = 800,
  height = 450,
} = {}) {
  const base = createShareLink();
  const params = new URLSearchParams({
    zoom: String(zoom),
    bg,
    timeline: timeline ? 'on' : 'off',
    controls: controls ? 'on' : 'off',
  }).toString();

  const src = `${base}?${params}`;

  return `<iframe src="${src}" width="${width}" height="${height}" style="border:0;border-radius:8px" loading="lazy" allowfullscreen></iframe>`;
}

export function createEmbedCodeFromPreset(presetKey, overrides = {}) {
  const preset = EMBED_PRESETS[presetKey];
  if (!preset) {
    throw new Error(`Unknown embed preset: ${presetKey}`);
  }

  const params = {
    ...preset.params,
    ...(overrides.params || {}),
  };
  const size = {
    ...preset.size,
    ...(overrides.size || {}),
  };

  return createEmbedCode({
    zoom: params.zoom,
    bg: params.bg,
    timeline: params.timeline,
    controls: params.controls,
    width: size.width,
    height: size.height,
  });
}
