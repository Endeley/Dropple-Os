import { resumeRenderSessionExecution } from './renderSessionExecution.js';
import {
    buildFrameExecutionCheckpoint,
    assertFrameExecutionCheckpointLegality,
} from '@/runtime/scheduler/frameExecutionSchedule.js';

function stableStringify(value) {
    if (value === undefined || value === null) return 'null';

    if (Array.isArray(value)) {
        return `[${value.map(stableStringify).join(',')}]`;
    }

    if (typeof value === 'object') {
        return `{${Object.keys(value)
            .sort()
            .map((key) => `"${key}":${stableStringify(value[key])}`)
            .join(',')}}`;
    }

    return JSON.stringify(value);
}

function hashString64(input) {
    let hash = 0xcbf29ce484222325n;
    const prime = 0x100000001b3n;

    for (let index = 0; index < input.length; index += 1) {
        hash ^= BigInt(input.charCodeAt(index));
        hash = (hash * prime) & 0xffffffffffffffffn;
    }

    return hash.toString(16).padStart(16, '0');
}

function assertManifest(manifest) {
    if (!manifest || typeof manifest !== 'object') {
        throw new Error('render progress requires manifest.');
    }
    if (typeof manifest.manifestId !== 'string' || !manifest.manifestId.trim()) {
        throw new Error('render progress requires manifest.manifestId.');
    }
    if (typeof manifest.sessionId !== 'string' || !manifest.sessionId.trim()) {
        throw new Error('render progress requires manifest.sessionId.');
    }
    if (!Array.isArray(manifest.frameTimes) || !Array.isArray(manifest.sampleTimes)) {
        throw new Error('render progress requires canonical manifest frameTimes and sampleTimes.');
    }
}

function assertRenderInput(renderInput) {
    if (!renderInput || typeof renderInput !== 'object') {
        throw new Error('render progress requires renderInput.');
    }
}

function assertExecutionState(executionState) {
    if (!executionState || typeof executionState !== 'object') {
        throw new Error('render progress requires executionState.');
    }
    if (typeof executionState.sessionId !== 'string' || !executionState.sessionId.trim()) {
        throw new Error('render progress requires executionState.sessionId.');
    }
}

export function buildSessionFromManifest(manifest) {
    assertManifest(manifest);

    return Object.freeze({
        sessionId: manifest.sessionId,
        frameRate: Number(manifest.frameRate ?? 24),
        stepMs: Number(manifest.stepMs ?? 0),
        durationMs: Number(manifest.durationMs ?? 0),
        fromMs: Number(manifest.fromMs ?? 0),
        toMs: Number(manifest.toMs ?? 0),
        frameTimes: Object.freeze([...(manifest.frameTimes ?? [])]),
        totalFrames: Number(manifest.totalFrames ?? manifest.frameTimes?.length ?? 0),
        sampleTimes: Object.freeze([...(manifest.sampleTimes ?? [])]),
        framePolicy: manifest.framePolicy ?? null,
        samplePolicy: manifest.samplePolicy ?? null,
    });
}

export function buildRenderProgressSnapshot(executionState) {
    assertExecutionState(executionState);
    const lastCompletedFrame = Array.isArray(executionState.completedFrames)
        ? executionState.completedFrames.at(-1) ?? null
        : null;

    return Object.freeze({
        completedFrameCount: Number(executionState.completedFrameCount ?? 0),
        totalFrames: Number(executionState.totalFrames ?? 0),
        sampleCursor: Number(executionState.sampleCursor ?? 0),
        totalSamples: Number(executionState.totalSamples ?? 0),
        frameCursor: Number(executionState.frameCursor ?? 0),
        status: executionState.status ?? 'idle',
        lastCompletedFrameTimeMs: Number.isFinite(lastCompletedFrame?.timeMs) ? Number(lastCompletedFrame.timeMs) : null,
        lastCompletedFrameHash: lastCompletedFrame?.frameHash ?? null,
    });
}

export function buildRenderExecutionCheckpoint({
    manifest,
    executionState,
} = {}) {
    assertManifest(manifest);
    assertExecutionState(executionState);

    if (executionState.sessionId !== manifest.sessionId) {
        throw new Error('render checkpoint requires matching manifest.sessionId and executionState.sessionId.');
    }

    const progress = buildRenderProgressSnapshot(executionState);
    const checkpointPayload = {
        manifestId: manifest.manifestId,
        sessionId: manifest.sessionId,
        executionId: executionState.executionId ?? `${manifest.sessionId}:execution`,
        progress,
        completedFrames: [...(executionState.completedFrames ?? [])],
    };

    return Object.freeze({
        checkpointId: `render-checkpoint:${hashString64(stableStringify(checkpointPayload))}`,
        scheduler: Object.freeze({
            checkpoint: buildFrameExecutionCheckpoint({
                frameTimes: manifest.frameTimes,
                frameCursor: Number(executionState.frameCursor ?? 0),
            }),
        }),
        ...checkpointPayload,
    });
}

export function resumeRenderExecutionCheckpoint({
    manifest,
    renderInput,
    checkpoint,
} = {}) {
    assertManifest(manifest);
    assertRenderInput(renderInput);

    if (!checkpoint || typeof checkpoint !== 'object') {
        throw new Error('render progress requires checkpoint.');
    }
    if (checkpoint.manifestId !== manifest.manifestId) {
        throw new Error('render checkpoint manifest mismatch.');
    }
    if (checkpoint.sessionId !== manifest.sessionId) {
        throw new Error('render checkpoint session mismatch.');
    }
    if (!checkpoint.scheduler || typeof checkpoint.scheduler !== 'object') {
        throw new Error('render checkpoint missing scheduler legality metadata.');
    }

    const legality = assertFrameExecutionCheckpointLegality({
        frameTimes: manifest.frameTimes,
        checkpoint: checkpoint.scheduler.checkpoint ?? null,
    });
    const legalCursor = Number(legality.legality.cursor ?? 0);

    const session = buildSessionFromManifest(manifest);
    if (Number((checkpoint.completedFrames ?? []).length) !== legalCursor) {
        throw new Error('render checkpoint cursor/completedFrames mismatch.');
    }
    return resumeRenderSessionExecution({
        session,
        renderInput,
        executionState: {
            sessionId: checkpoint.sessionId,
            executionId: checkpoint.executionId ?? `${checkpoint.sessionId}:execution`,
            completedFrames: [...(checkpoint.completedFrames ?? [])],
        },
    });
}
