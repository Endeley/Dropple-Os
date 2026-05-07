import { evaluateRenderFrame } from './renderOrchestration.js';

function safeInteger(value, fallback = 0) {
    return Number.isInteger(value) ? value : fallback;
}

function buildExecutionId(sessionId) {
    return `${String(sessionId)}:execution`;
}

function assertSession(session) {
    if (!session || typeof session !== 'object') {
        throw new Error('render session execution requires session.');
    }
    if (!Array.isArray(session.frameTimes) || !Array.isArray(session.sampleTimes)) {
        throw new Error('render session execution requires canonical frameTimes and sampleTimes.');
    }
}

function buildFrameCursorMap(frameTimes) {
    return new Map(frameTimes.map((timeMs, index) => [Number(timeMs), index]));
}

function normalizeCompletedFrames(completedFrames = []) {
    return Array.isArray(completedFrames)
        ? completedFrames
              .filter((entry) => entry && typeof entry === 'object')
              .map((entry) => ({
                  frameIndex: safeInteger(entry.frameIndex, -1),
                  timeMs: Number(entry.timeMs ?? 0),
                  frameHash: entry.frameHash ?? null,
                  shotId: entry.shotId ?? null,
                  shotTimeMs: entry.shotTimeMs ?? null,
                  evalStatus: entry.evalStatus ?? 'NO_SHOT',
                  transitionWindow: entry.transitionWindow ?? null,
              }))
              .filter((entry) => entry.frameIndex >= 0)
        : [];
}

function createExecutionSnapshot({
    session,
    renderInput,
    frameCursor = 0,
    sampleCursor = 0,
    completedFrames = [],
    status = 'idle',
} = {}) {
    const normalizedCompletedFrames = normalizeCompletedFrames(completedFrames);

    return Object.freeze({
        executionId: buildExecutionId(session.sessionId),
        sessionId: session.sessionId,
        renderInput,
        session,
        frameCursor,
        sampleCursor,
        totalFrames: session.totalFrames,
        totalSamples: Array.isArray(session.sampleTimes) ? session.sampleTimes.length : 0,
        completedFrames: normalizedCompletedFrames,
        completedFrameCount: normalizedCompletedFrames.length,
        status,
    });
}

export function createRenderSessionExecution({
    session,
    renderInput,
} = {}) {
    assertSession(session);
    if (!renderInput || typeof renderInput !== 'object') {
        throw new Error('render session execution requires renderInput.');
    }

    return createExecutionSnapshot({
        session,
        renderInput,
        frameCursor: 0,
        sampleCursor: 0,
        completedFrames: [],
        status: session.totalFrames > 0 ? 'ready' : 'completed',
    });
}

export function resumeRenderSessionExecution({
    session,
    renderInput,
    executionState,
} = {}) {
    assertSession(session);
    if (!renderInput || typeof renderInput !== 'object') {
        throw new Error('render session execution requires renderInput.');
    }

    const completedFrames = normalizeCompletedFrames(executionState?.completedFrames ?? []);
    const nextFrameCursor = Math.max(0, Math.min(session.totalFrames, completedFrames.length));
    const frameCursorMap = buildFrameCursorMap(session.frameTimes);
    const sampleCursor = session.sampleTimes.reduce((count, timeMs) => {
        const frameIndex = frameCursorMap.get(Number(timeMs));
        return frameIndex != null && frameIndex < nextFrameCursor ? count + 1 : count;
    }, 0);

    return createExecutionSnapshot({
        session,
        renderInput,
        frameCursor: nextFrameCursor,
        sampleCursor,
        completedFrames,
        status: nextFrameCursor >= session.totalFrames ? 'completed' : 'ready',
    });
}

export function stepRenderSessionExecution(executionState) {
    const state = executionState;
    const session = state?.session ?? null;
    const renderInput = state?.renderInput ?? null;
    assertSession(session);
    if (!renderInput || typeof renderInput !== 'object') {
        throw new Error('render session execution requires renderInput.');
    }

    if (state.frameCursor >= session.totalFrames) {
        return createExecutionSnapshot({
            session,
            renderInput,
            frameCursor: session.totalFrames,
            sampleCursor: state.sampleCursor ?? 0,
            completedFrames: state.completedFrames ?? [],
            status: 'completed',
        });
    }

    const timeMs = Number(session.frameTimes[state.frameCursor] ?? 0);
    const previousFrame = Array.isArray(state.completedFrames) ? state.completedFrames.at(-1) ?? null : null;
    const frameResult = evaluateRenderFrame({
        renderInput: {
            ...renderInput,
            timeMs,
        },
        timeMs,
        reason: 'render-session-step',
        commit: false,
    });

    const nextCompletedFrames = [
        ...(state.completedFrames ?? []),
        {
            frameIndex: state.frameCursor,
            timeMs,
            frameHash: frameResult.frameHash ?? null,
            shotId: frameResult.shotId ?? null,
            shotTimeMs: frameResult.shotTimeMs ?? null,
            evalStatus: frameResult.evalStatus ?? 'NO_SHOT',
            transitionWindow: frameResult.transitionWindow ?? null,
        },
    ];
    const nextFrameCursor = state.frameCursor + 1;
    const nextSampleCursor =
        (state.sampleCursor ?? 0) +
        (session.sampleTimes.includes(timeMs) && (previousFrame?.timeMs ?? null) !== timeMs ? 1 : 0);

    return createExecutionSnapshot({
        session,
        renderInput,
        frameCursor: nextFrameCursor,
        sampleCursor: nextSampleCursor,
        completedFrames: nextCompletedFrames,
        status: nextFrameCursor >= session.totalFrames ? 'completed' : 'running',
    });
}

export function runRenderSessionExecution({
    session,
    renderInput,
    executionState = null,
} = {}) {
    let state = executionState
        ? resumeRenderSessionExecution({ session, renderInput, executionState })
        : createRenderSessionExecution({ session, renderInput });

    while (state.frameCursor < session.totalFrames) {
        state = stepRenderSessionExecution(state);
    }

    return state;
}
