import {
    cancelRenderManifest,
    createRenderQueueState,
    dequeueRenderManifest,
    enqueueRenderManifest,
    markRenderManifestCompleted,
    markRenderManifestFailed,
    markRenderManifestRunning,
} from './renderQueue.js';
import {
    createRenderSessionExecution,
    runRenderSessionExecution,
    stepRenderSessionExecution,
} from './renderSessionExecution.js';
import {
    buildRenderExecutionCheckpoint,
    buildRenderProgressSnapshot,
    buildSessionFromManifest,
    resumeRenderExecutionCheckpoint,
} from './renderProgress.js';

function assertManifest(manifest) {
    if (!manifest || typeof manifest !== 'object') {
        throw new Error('render queue execution requires manifest.');
    }
    if (typeof manifest.manifestId !== 'string' || !manifest.manifestId.trim()) {
        throw new Error('render queue execution requires manifest.manifestId.');
    }
    if (typeof manifest.sessionId !== 'string' || !manifest.sessionId.trim()) {
        throw new Error('render queue execution requires manifest.sessionId.');
    }
    if (!Array.isArray(manifest.frameTimes) || !Array.isArray(manifest.sampleTimes)) {
        throw new Error('render queue execution requires canonical manifest frameTimes and sampleTimes.');
    }
}

function assertRenderInput(renderInput) {
    if (!renderInput || typeof renderInput !== 'object') {
        throw new Error('render queue execution requires renderInput.');
    }
}

function getQueueEntry(queueState, manifestId) {
    return queueState.entries.find((entry) => entry.manifestId === manifestId) ?? null;
}

export function createRenderQueueExecution({
    queueState = createRenderQueueState(),
    manifest,
    renderInput,
    priority = 0,
    executionState = null,
    checkpoint = null,
} = {}) {
    assertManifest(manifest);
    assertRenderInput(renderInput);

    const session = buildSessionFromManifest(manifest);
    let nextQueueState = enqueueRenderManifest(queueState, manifest, { priority });
    const entry = getQueueEntry(nextQueueState, manifest.manifestId);

    if (!entry || entry.status === 'cancelled') {
        throw new Error(`render queue execution could not enqueue manifest ${manifest.manifestId}.`);
    }

    if (entry.status === 'queued') {
        const dequeued = dequeueRenderManifest(nextQueueState);
        nextQueueState = dequeued.queueState;
    }

    const normalizedExecution = executionState
        ? checkpoint
            ? resumeRenderExecutionCheckpoint({
                  manifest,
                  renderInput,
                  checkpoint,
              })
            : executionState
                ? resumeRenderExecutionCheckpoint({
                      manifest,
                      renderInput,
                      checkpoint: buildRenderExecutionCheckpoint({
                          manifest,
                          executionState,
                      }),
                  })
                : null
        : createRenderSessionExecution({
              session,
              renderInput,
          });

    nextQueueState = markRenderManifestRunning(
        nextQueueState,
        manifest.manifestId,
        normalizedExecution.executionId,
        buildRenderProgressSnapshot(normalizedExecution),
    );

    return Object.freeze({
        manifest,
        session,
        queueState: nextQueueState,
        executionState: normalizedExecution,
        queueEntry: getQueueEntry(nextQueueState, manifest.manifestId),
        checkpoint: buildRenderExecutionCheckpoint({
            manifest,
            executionState: normalizedExecution,
        }),
    });
}

export function stepRenderQueueExecution({
    queueState,
    manifest,
    renderInput,
    executionState,
    checkpoint = null,
} = {}) {
    assertManifest(manifest);
    assertRenderInput(renderInput);

    const active = createRenderQueueExecution({
        queueState,
        manifest,
        renderInput,
        executionState,
        checkpoint,
    });

    const steppedExecution = stepRenderSessionExecution(active.executionState);
    const progress = buildRenderProgressSnapshot(steppedExecution);
    const nextQueueState =
        steppedExecution.status === 'completed'
            ? markRenderManifestCompleted(active.queueState, manifest.manifestId, progress)
            : markRenderManifestRunning(
                  active.queueState,
                  manifest.manifestId,
                  steppedExecution.executionId,
                  progress,
              );

    return Object.freeze({
        manifest,
        session: active.session,
        queueState: nextQueueState,
        executionState: steppedExecution,
        queueEntry: getQueueEntry(nextQueueState, manifest.manifestId),
        checkpoint: buildRenderExecutionCheckpoint({
            manifest,
            executionState: steppedExecution,
        }),
    });
}

export function runRenderQueueExecution({
    queueState,
    manifest,
    renderInput,
    executionState = null,
    checkpoint = null,
} = {}) {
    assertManifest(manifest);
    assertRenderInput(renderInput);

    const active = createRenderQueueExecution({
        queueState,
        manifest,
        renderInput,
        executionState,
        checkpoint,
    });

    try {
        const completedExecution = runRenderSessionExecution({
            session: active.session,
            renderInput,
            executionState: active.executionState,
        });
        const nextQueueState = markRenderManifestCompleted(
            active.queueState,
            manifest.manifestId,
            buildRenderProgressSnapshot(completedExecution),
        );

        return Object.freeze({
            manifest,
            session: active.session,
            queueState: nextQueueState,
            executionState: completedExecution,
            queueEntry: getQueueEntry(nextQueueState, manifest.manifestId),
            checkpoint: buildRenderExecutionCheckpoint({
                manifest,
                executionState: completedExecution,
            }),
        });
    } catch (error) {
        const failedQueueState = markRenderManifestFailed(
            active.queueState,
            manifest.manifestId,
            error,
            buildRenderProgressSnapshot(active.executionState),
        );

        return Object.freeze({
            manifest,
            session: active.session,
            queueState: failedQueueState,
            executionState: active.executionState,
            queueEntry: getQueueEntry(failedQueueState, manifest.manifestId),
            checkpoint: buildRenderExecutionCheckpoint({
                manifest,
                executionState: active.executionState,
            }),
        });
    }
}

export function cancelRenderQueueExecution({
    queueState,
    manifest,
    reason = 'cancelled',
} = {}) {
    assertManifest(manifest);
    return cancelRenderManifest(queueState, manifest.manifestId, reason);
}
