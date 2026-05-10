import { performMotionExportCommand } from '../motion/motionExportCommands.js';
import { renderLegacyWaapiMotionExport } from '../motion/adaptMotionExport.js';

/**
 * Export motion as legacy WAAPI verification JSON through canonical motion authority.
 *
 * 🔒 Deterministic
 * 🔒 Read-only
 */
export function exportWAAPI(state) {
    if (!state) return '';

    const result = performMotionExportCommand({
        state,
        format: 'waapi',
    });

    return renderLegacyWaapiMotionExport(result.output);
}
