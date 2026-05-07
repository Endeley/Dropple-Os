'use client';

import { loadRenderExecutionCommands } from '@/ui/bridges/exportExecutionRuntimeBridge.js';

function createEmptyCommandState() {
    return Object.freeze({
        registryState: Object.freeze({
            revision: 0,
            records: Object.freeze([]),
        }),
        workflow: null,
    });
}

function buildServiceSnapshot(state) {
    return Object.freeze({
        workflow: state?.workflow ?? null,
        registryState: state?.registryState ?? createEmptyCommandState().registryState,
    });
}

export function createExportExecutionService({
    initialState = createEmptyCommandState(),
} = {}) {
    let state = initialState;

    return Object.freeze({
        getState() {
            return buildServiceSnapshot(state);
        },

        async createWorkflow({ snapshot, exportTarget = null } = {}) {
            const { createExportExecutionCommand } = await loadRenderExecutionCommands();
            const result = createExportExecutionCommand({
                snapshot,
                exportTarget,
                state,
            });
            state = result.state;
            return result.result;
        },

        async stepWorkflow({ snapshot, exportTarget = null } = {}) {
            const { stepExportExecutionCommand } = await loadRenderExecutionCommands();
            const result = stepExportExecutionCommand({
                snapshot,
                exportTarget,
                state,
            });
            state = result.state;
            return result.result;
        },

        async runWorkflow({ snapshot, exportTarget = null } = {}) {
            const { runExportExecutionCommand } = await loadRenderExecutionCommands();
            const result = runExportExecutionCommand({
                snapshot,
                exportTarget,
                state,
            });
            state = result.state;
            return result.result;
        },

        async performWorkflow() {
            const { performExportExecutionCommand } = await loadRenderExecutionCommands();
            return performExportExecutionCommand({
                state,
            });
        },

        async persist(metadata = {}) {
            const { persistRenderExecutionCommandState } = await loadRenderExecutionCommands();
            return persistRenderExecutionCommandState({
                state,
                metadata,
            });
        },

        async restore() {
            const { restoreRenderExecutionCommandState } = await loadRenderExecutionCommands();
            state = restoreRenderExecutionCommandState();
            return buildServiceSnapshot(state);
        },

        reset() {
            state = createEmptyCommandState();
            return buildServiceSnapshot(state);
        },
    });
}
