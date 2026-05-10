import { performMotionExportCommand } from '../motion/motionExportCommands.js';
import { renderLegacyCssMotionExport } from '../motion/adaptMotionExport.js';

/**
 * Export motion as CSS text through the canonical motion export authority.
 *
 * 🔒 Deterministic
 * 🔒 Read-only
 */
export function exportCSS(state) {
    if (!state) return '';

    const result = performMotionExportCommand({
        state,
        format: 'css',
    });

    return renderLegacyCssMotionExport(result.output);
}
