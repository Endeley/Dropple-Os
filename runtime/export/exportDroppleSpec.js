import { performExportExecution, runExportExecution } from '@/runtime/render/exportSession.js';

/**
 * The ONLY semantic export entry point.
 */
export function exportDroppleSpec({ snapshot, options: _options = {} } = {}) {
    if (!snapshot || typeof snapshot !== 'object') {
        throw new Error('exportDroppleSpec requires snapshot.');
    }
    const workflow = runExportExecution({ snapshot });
    return performExportExecution(workflow);
}
