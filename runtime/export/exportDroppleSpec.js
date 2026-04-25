import { executeExport } from '../../engine/export/exportController.js';
import { evaluateTransitionFrame } from '../transition/evaluateTransitionFrame.js';
import { buildEvaluationInputs } from '../animation/buildEvaluationInputs.js';
import { buildDroppleSpec } from './buildDroppleSpec.js';
import { validateDroppleSpec } from './validateDroppleSpec.js';

/**
 * The ONLY semantic export entry point.
 */
export function exportDroppleSpec(workspace) {
    const timeline = workspace?.timeline?.timelines?.default ?? null;
    const inputs = buildEvaluationInputs(workspace, { timeMs: 0, strictSceneScope: true });
    if (!inputs.sceneGraphTree) {
        throw new Error('Export blocked: no valid scene scope');
    }
    const shot = {
        shotTimeline: inputs.shotTimeline,
        sceneGraph: inputs.sceneGraphTree,
        activeSceneId: inputs.activeSceneId,
        activeShotId: inputs.activeShotId,
        presentHash: workspace?.timeline?.presentHash ?? null,
    };

    const result = executeExport(shot, timeline, {
        evaluateShotAtFn: (_shotTimeline, _sceneGraph, timeMs, options = {}) =>
            evaluateTransitionFrame({
                shotTimeline: inputs.shotTimeline,
                sceneGraph: workspace?.document?.sceneGraph ?? null,
                activeSceneId: inputs.activeSceneId,
                activeShotId: options?.shotId ?? inputs.activeShotId ?? null,
                timeMs,
                cameraTransform: inputs.cameraTransform ?? null,
                strictSceneScope: true,
            }),
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
