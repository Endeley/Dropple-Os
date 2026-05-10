// export/generateExportPair.js

import { normalizeExport } from './normalizeExport.js';
import { exportMotion } from './exportMotion.js';

/**
 * Generate before/after export output.
 *
 * 🔒 Pure adapter over canonical motion export authority
 */
export function generateExportPair({ beforeState, afterState, format = 'css' }) {
    const before = normalizeExport(exportMotion(beforeState, format));
    const after = normalizeExport(exportMotion(afterState, format));

    return { before, after };
}
