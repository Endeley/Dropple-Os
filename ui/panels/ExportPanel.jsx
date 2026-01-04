'use client';

import { exportTimelineToCSS } from '@/timeline/export/cssExporter.js';

/**
 * Minimal export UI. Proof-of-concept only.
 * No state mutation; pure code generation.
 */
export default function ExportPanel({ timeline }) {
    function onExportCSS() {
        const css = exportTimelineToCSS(timeline);
        navigator.clipboard?.writeText(css).catch(() => {});
        // eslint-disable-next-line no-alert
        alert('CSS animation copied to clipboard');
    }

    return (
        <div style={{ padding: 12 }}>
            <h3>Export</h3>
            <button onClick={onExportCSS}>Export CSS Animation</button>
        </div>
    );
}
