import { exportCSS } from './css/exportCSS.js';
import { exportWAAPI } from './waapi/exportWAAPI.js';

/**
 * Stable runtime motion export adapter over canonical motion export authority.
 *
 * 🔒 Stable API
 */
export function exportMotion(state, format = 'css') {
    if (!state) return '';

    switch (format) {
        case 'css':
            return exportCSS(state);
        case 'waapi':
            return exportWAAPI(state);
        default:
            throw new Error(`Unknown export format: ${format}`);
    }
}
