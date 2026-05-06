import { executeExport } from '../../engine/export/exportController.js';
import { buildEvaluationInputs } from '../animation/buildEvaluationInputs.js';
import { buildDroppleSpec } from './buildDroppleSpec.js';
import { validateDroppleSpec } from './validateDroppleSpec.js';
import { buildRenderSchedule, evaluateRenderFrame } from '@/runtime/render/renderOrchestration.js';

/**
 * The ONLY semantic export entry point.
 */
export function exportDroppleSpec({ snapshot, options: _options = {} } = {}) {
    if (!snapshot || typeof snapshot !== 'object') {
        throw new Error('exportDroppleSpec requires snapshot.');
    }

    const timeline = snapshot?.timeline?.timelines?.default ?? null;
    const inputs = buildEvaluationInputs(snapshot, { timeMs: 0, strictSceneScope: true });
    if (!inputs.renderInput?.sceneGraph) {
        throw new Error('Export blocked: no valid scene scope');
    }
    const shot = {
        shotTimeline: inputs.shotTimeline,
        sceneGraph: inputs.renderInput.sceneGraphTree,
        activeSceneId: inputs.activeSceneId,
        activeShotId: inputs.activeShotId,
        presentHash: snapshot?.timeline?.presentHash ?? null,
    };
    const renderSchedule = buildRenderSchedule({
        renderInput: inputs.renderInput,
        fromMs: 0,
        sampleCount: 4,
        includeTransitionBoundaries: true,
    });

    const result = executeExport(shot, timeline, {
        frames: renderSchedule.sampleTimes,
        evaluateShotAtFn: (_shotTimeline, _sceneGraph, timeMs, options = {}) =>
            evaluateRenderFrame({
                renderInput: {
                    ...inputs.renderInput,
                    activeShotId: options?.shotId ?? inputs.renderInput.activeShotId ?? null,
                    timeMs,
                },
                timeMs,
                reason: 'export-preflight',
                commit: false,
            }),
        performExport: () => {
            const spec = buildDroppleSpec(snapshot);
            validateDroppleSpec(spec);
            return spec;
        },
    });

    if (!result.success) {
        throw new Error(result.reason || 'Export blocked by stability gate');
    }

    return result.output;
}
