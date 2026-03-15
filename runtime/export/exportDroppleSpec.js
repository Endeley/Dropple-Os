import { executeExport } from '../../engine/export/exportController.js';
import { buildEvaluationInputs } from '../animation/buildEvaluationInputs.js';
import { buildDroppleSpec } from './buildDroppleSpec';
import { validateDroppleSpec } from './validateDroppleSpec';

/**
 * The ONLY semantic export entry point.
 */
export function exportDroppleSpec(workspace) {
    const timeline = workspace?.timeline?.timelines?.default ?? null;
    const inputs = buildEvaluationInputs(workspace, { timeMs: 0 });
    const shot = {
        shotTimeline: inputs.shotTimeline,
        sceneGraph: inputs.sceneGraphTree,
        activeShotId: inputs.activeShotId,
        presentHash: workspace?.timeline?.presentHash ?? null,
    };

    const result = executeExport(shot, timeline, {
        performExport: () => {
            const spec = buildDroppleSpec(workspace);
            validateDroppleSpec(spec);
            return spec;
        },
    });

    if (!result.success) {
        throw new Error(result.reason || 'Export blocked by stability gate');
    }

    return result.output;
}
