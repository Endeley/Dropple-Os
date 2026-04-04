'use client';

import { exportTimelineToCSS } from '@/timeline/export/cssExporter.js';
import { exportCSSAnimation } from '@/ui/bridges/exportAnimationBridge.js';
import { useWorkspaceVisualState } from '@/runtime/projection/useWorkspaceVisualState.js';

/**
 * Minimal export UI. Proof-of-concept only.
 * No state mutation; pure code generation.
 */
export default function ExportPanel({ timeline }) {
    const runtimeState = useWorkspaceVisualState((s) => ({
        nodes: s.nodes,
        rootIds: s.rootIds,
        sceneGraph: s.sceneGraph,
        scene: s.scene,
    }));

    function onExportCSS() {
        const result = exportCSSAnimation({
            runtimeState,
            timeline,
            performExport: () => exportTimelineToCSS(timeline),
        });

        if (!result.success) {
            console.warn('[Export] Blocked:', result.reason);
            alert(`Export blocked: ${result.reason || 'unknown error'}`);
            return;
        }

        navigator.clipboard?.writeText(result.output).catch(() => {});
        console.info('CSS animation copied to clipboard');
    }

    return (
        <div style={{ padding: 12 }}>
            <h3>Export</h3>
            <button onClick={onExportCSS}>Export CSS Animation</button>
        </div>
    );
}
