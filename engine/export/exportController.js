import { runExportStabilityGate } from './exportStabilityGate.js';

export function executeExport(shot, timeline, options = {}) {
    const result = runExportStabilityGate({
        timeline,
        shotTimeline: shot?.shotTimeline ?? null,
        sceneGraph: shot?.sceneGraph ?? null,
        presentHash: shot?.presentHash ?? null,
        activeShotId: shot?.activeShotId ?? null,
        frames: options.frames ?? undefined,
    });

    if (!result.allowed) {
        return {
            success: false,
            reason: result.reason,
            timelineHash: result.timelineHash,
            evaluationHash: result.evaluationHash,
        };
    }

    const performExport = options.performExport;
    const output = typeof performExport === 'function' ? performExport(shot, timeline) : null;

    return {
        success: true,
        timelineHash: result.timelineHash,
        evaluationHash: result.evaluationHash,
        output,
    };
}
