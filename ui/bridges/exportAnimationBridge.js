import { executeExportWithPreflight } from '@/runtime/export/executeExport.js';
import { buildEvaluationInputs } from '@/runtime/animation/buildEvaluationInputs.js';

export function exportCSSAnimation({ runtimeState, timeline, performExport }) {
    const inputs = buildEvaluationInputs(runtimeState || {});
    const shot = {
        shotTimeline: inputs.shotTimeline,
        sceneGraph: inputs.sceneGraphTree,
        activeShotId: inputs.activeShotId,
        presentHash: null,
    };

    return executeExportWithPreflight(shot, timeline, {
        performExport,
    });
}
