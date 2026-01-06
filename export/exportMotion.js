// export/exportMotion.js

import { exportCSS } from './css/exportCSS';
import { exportWAAPI } from './waapi/exportWAAPI';

/**
 * Canonical motion export entry point.
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
