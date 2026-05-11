import {
    createExportExecution,
    performExportExecution,
    runExportExecution,
    stepExportExecution,
} from '@/runtime/render/exportSession.js';
import {
    createRenderExecutionRegistryState,
    getRenderExecutionRecord,
} from '@/runtime/render/renderExecutionRegistry.js';
import {
    persistRenderExecutionRegistry,
    restoreRenderExecutionRegistry,
} from '@/runtime/render/renderExecutionStore.js';

function assertSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') {
        throw new Error('render execution command requires snapshot.');
    }
}

function buildCommandResult(workflow) {
    if (!workflow || typeof workflow !== 'object') {
        throw new Error('render execution command requires workflow.');
    }

    return Object.freeze({
        manifest: workflow.manifest,
        assignment: workflow.assignment,
        checkpoint: workflow.checkpoint,
        progress: workflow.progress,
        queueEntry: workflow.queueEntry,
        registryState: workflow.registryState,
        executionRecord: getRenderExecutionRecord(workflow.registryState, workflow.manifest.manifestId),
        workflow,
    });
}

export function createRenderExecutionCommandState() {
    return Object.freeze({
        registryState: createRenderExecutionRegistryState(),
        workflow: null,
    });
}

export function createExportExecutionCommand({
    snapshot,
    exportTarget = null,
    state = createRenderExecutionCommandState(),
} = {}) {
    assertSnapshot(snapshot);

    const workflow = createExportExecution({
        snapshot,
        exportTarget,
        registryState: state.registryState,
    });

    return Object.freeze({
        state: Object.freeze({
            registryState: workflow.registryState,
            workflow,
        }),
        result: buildCommandResult(workflow),
    });
}

export function stepExportExecutionCommand({
    snapshot,
    exportTarget = null,
    state = createRenderExecutionCommandState(),
} = {}) {
    assertSnapshot(snapshot);
    const previousWorkflow = state.workflow ?? null;
    const workflow = stepExportExecution({
        snapshot,
        exportTarget,
        queueState: previousWorkflow?.queueState,
        checkpoint: previousWorkflow?.checkpoint ?? null,
        registryState: state.registryState,
    });

    return Object.freeze({
        state: Object.freeze({
            registryState: workflow.registryState,
            workflow,
        }),
        result: buildCommandResult(workflow),
    });
}

export function runExportExecutionCommand({
    snapshot,
    exportTarget = null,
    state = createRenderExecutionCommandState(),
} = {}) {
    assertSnapshot(snapshot);
    const previousWorkflow = state.workflow ?? null;
    const workflow = runExportExecution({
        snapshot,
        exportTarget,
        queueState: previousWorkflow?.queueState,
        checkpoint: previousWorkflow?.checkpoint ?? null,
        registryState: state.registryState,
    });

    return Object.freeze({
        state: Object.freeze({
            registryState: workflow.registryState,
            workflow,
        }),
        result: buildCommandResult(workflow),
    });
}

export function performExportExecutionCommand({
    state,
} = {}) {
    const workflow = state?.workflow ?? null;
    if (!workflow) {
        throw new Error('performExportExecutionCommand requires an active workflow.');
    }

    return Object.freeze({
        output: performExportExecution(workflow),
        result: buildCommandResult(workflow),
    });
}

export function persistRenderExecutionCommandState({
    state,
    metadata = {},
} = {}) {
    const registryState = state?.registryState ?? createRenderExecutionRegistryState();
    return persistRenderExecutionRegistry(registryState, metadata);
}

export function restoreRenderExecutionCommandState() {
    const registryState = restoreRenderExecutionRegistry() ?? createRenderExecutionRegistryState();
    return Object.freeze({
        registryState,
        workflow: null,
    });
}
