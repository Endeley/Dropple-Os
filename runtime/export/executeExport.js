import { executeExport } from '../../engine/export/exportController.js';

/**
 * Runtime bridge for engine export preflight.
 * UI should import from runtime/export only.
 */
export function executeExportWithPreflight(shot, timeline, options = {}) {
    return executeExport(shot, timeline, options);
}
