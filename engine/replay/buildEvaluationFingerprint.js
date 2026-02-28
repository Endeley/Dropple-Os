import crypto from 'crypto';
import { evaluateShotAt } from '../evaluation/evaluateShotAt.js';

function stableSerialize(value) {
    if (Array.isArray(value)) {
        return value.map(stableSerialize);
    }
    if (value && typeof value === 'object') {
        const keys = Object.keys(value).sort();
        const result = {};
        for (const key of keys) {
            result[key] = stableSerialize(value[key]);
        }
        return result;
    }
    return value;
}

export function buildEvaluationFingerprint(controller, time = 1000) {
    const timeline = controller?.snapshotGraph?.nodes?.[controller?.headId]?.timeline ?? null;
    const sceneGraph = controller?.sceneGraph ?? null;

    if (!timeline || !sceneGraph) {
        throw new Error('buildEvaluationFingerprint requires controller with sceneGraph and timeline');
    }

    const shotTimeline = {
        shots: [
            {
                id: 'cert-shot',
                startMs: 0,
                endMs: timeline.duration ?? time,
                timeline,
            },
        ],
    };

    const result = evaluateShotAt(shotTimeline, sceneGraph, time, {
        shotId: 'cert-shot',
    });

    const serialized = JSON.stringify(stableSerialize(result?.evaluatedScene ?? null));
    return crypto.createHash('sha256').update(serialized).digest('hex');
}
