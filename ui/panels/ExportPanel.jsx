'use client';

import { exportTimelineToCSS } from '@/timeline/export/cssExporter.js';
import { executeExportWithPreflight } from '@/runtime/export/executeExport.js';
import { buildEvaluationInputs } from '@/runtime/animation/buildEvaluationInputs.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';

/**
 * Minimal export UI. Proof-of-concept only.
 * No state mutation; pure code generation.
 */
export default function ExportPanel({ timeline }) {
    const runtimeState = useRuntimeStore((s) => ({
        nodes: s.nodes,
        rootIds: s.rootIds,
        sceneGraph: s.sceneGraph,
        scene: s.scene,
    }));

    function onExportCSS() {
        const inputs = buildEvaluationInputs(runtimeState || {});
        const shot = {
            shotTimeline: inputs.shotTimeline,
            sceneGraph: inputs.sceneGraphTree,
            activeShotId: inputs.activeShotId,
            presentHash: null,
        };

        const result = executeExportWithPreflight(shot, timeline, {
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
