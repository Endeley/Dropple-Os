import { normalizeAnimationExport } from './normalizeAnimationExport.js';
import { performMotionExportCommand } from '../motion/motionExportCommands.js';

/**
 * Canonical semantic animation export through motion export authority.
 *
 * @param {Object} params
 * @param {Object} params.state - full design/runtime state
 * @param {'css'|'waapi'} params.format
 *
 * @returns {{ manifest: any, output: any, normalized: any }}
 */
export function exportAnimation({ state, format }) {
  const motion = state?.document?.motion ?? null;
  if (!motion) {
    return { manifest: null, output: null, normalized: null };
  }

  const result = performMotionExportCommand({
    state,
    format,
  });

  const normalized = normalizeAnimationExport(result.output);

  return {
    manifest: result.manifest,
    output: result.output,
    normalized,
  };
}
