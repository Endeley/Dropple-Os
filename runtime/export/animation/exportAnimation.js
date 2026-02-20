import { exportCSSKeyframes } from './css/exportCSSKeyframes.js';
import { exportWAAPI } from './waapi/exportWAAPI.js';
import { normalizeAnimationExport } from './normalizeAnimationExport.js';

/**
 * Canonical animation export.
 *
 * @param {Object} params
 * @param {Object} params.state - full design/runtime state
 * @param {'css'|'waapi'} params.format
 *
 * @returns {{ output: any, normalized: any }}
 */
export function exportAnimation({ state, format }) {
  const animations = state?.timeline?.animations;
  if (!animations) {
    return { output: null, normalized: null };
  }

  let output;

  switch (format) {
    case 'css':
      output = exportCSSKeyframes({ animations });
      break;

    case 'waapi':
      output = exportWAAPI({ animations });
      break;

    default:
      throw new Error(`Unsupported animation export format: ${format}`);
  }

  const normalized = normalizeAnimationExport(output);

  return { output, normalized };
}
