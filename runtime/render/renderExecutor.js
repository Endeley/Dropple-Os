import {
    cancelRenderQueueExecution,
    createRenderQueueExecution,
    runRenderQueueExecution,
    stepRenderQueueExecution,
} from './renderQueueExecution.js';

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

function assertExecutor(executor) {
    if (!executor || typeof executor !== 'object') {
        throw new Error('render executor requires executor.');
    }
    if (typeof executor.executorId !== 'string' || !executor.executorId.trim()) {
        throw new Error('render executor requires executor.executorId.');
    }
}

function assertManifest(manifest) {
    if (!manifest || typeof manifest !== 'object') {
        throw new Error('render executor requires manifest.');
    }
    if (typeof manifest.manifestId !== 'string' || !manifest.manifestId.trim()) {
        throw new Error('render executor requires manifest.manifestId.');
    }
}

function buildAssignment(executor, manifest, checkpoint, mode) {
    const payload = {
        executorId: executor.executorId,
        workerId: executor.workerId,
        manifestId: manifest.manifestId,
        checkpointId: checkpoint?.checkpointId ?? null,
        mode,
    };

    return Object.freeze({
        assignmentId: `render-assignment:${hashString64(stableStringify(payload))}`,
        executorId: executor.executorId,
        workerId: executor.workerId,
        manifestId: manifest.manifestId,
        checkpointId: checkpoint?.checkpointId ?? null,
        mode,
    });
}

export function createLocalRenderExecutor({
    executorId = 'render-executor:local',
    workerId = 'local-worker',
} = {}) {
    return Object.freeze({
        executorId: String(executorId),
        workerId: String(workerId),
        kind: 'local',
    });
}

export function executeRenderAssignment({
    executor = createLocalRenderExecutor(),
    queueState,
    manifest,
    renderInput,
    executionState = null,
    checkpoint = null,
    priority = 0,
    mode = 'run',
} = {}) {
    assertExecutor(executor);
    assertManifest(manifest);

    const assignment = buildAssignment(executor, manifest, checkpoint, mode);

    if (mode === 'create') {
        const result = createRenderQueueExecution({
            queueState,
            manifest,
            renderInput,
            executionState,
            checkpoint,
            priority,
        });

        return Object.freeze({
            executor,
            assignment,
            ...result,
        });
    }

    if (mode === 'step') {
        const result = stepRenderQueueExecution({
            queueState,
            manifest,
            renderInput,
            executionState,
            checkpoint,
        });

        return Object.freeze({
            executor,
            assignment,
            ...result,
        });
    }

    if (mode === 'run') {
        const result = runRenderQueueExecution({
            queueState,
            manifest,
            renderInput,
            executionState,
            checkpoint,
        });

        return Object.freeze({
            executor,
            assignment,
            ...result,
        });
    }

    throw new Error(`Unsupported render executor mode: ${mode}`);
}

export function cancelRenderAssignment({
    executor = createLocalRenderExecutor(),
    queueState,
    manifest,
    reason = 'cancelled',
} = {}) {
    assertExecutor(executor);
    assertManifest(manifest);

    return Object.freeze({
        executor,
        assignment: buildAssignment(executor, manifest, null, 'cancel'),
        queueState: cancelRenderQueueExecution({
            queueState,
            manifest,
            reason,
        }),
    });
}
