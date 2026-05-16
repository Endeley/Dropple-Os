import { executeExport } from '@/engine/export/exportController.js';
import { normalizeExportTarget } from '@/core/export/exportTargetContract.js';
import { buildEvaluationInputs } from '@/runtime/animation/buildEvaluationInputs.js';
import { buildDroppleSpec } from '@/runtime/export/buildDroppleSpec.js';
import { validateDroppleSpec } from '@/runtime/export/validateDroppleSpec.js';
import { evaluateRuntimeFrame } from './renderOrchestration.js';
import { createLocalRenderExecutor, executeRenderAssignment } from './renderExecutor.js';
import { createRenderExecutionRegistryState, recordRenderExecutionWorkflow } from './renderExecutionRegistry.js';
import { buildExportManifest } from './exportManifest.js';
import { createRenderQueueState } from './renderQueue.js';
import { buildRenderSession } from './renderSession.js';
import { hashSimulationTrace } from '@/runtime/simulation/simulationTrace.js';

function resolveExportTarget(snapshot, exportTarget = null) {
    if (exportTarget) return normalizeExportTarget(exportTarget);

    const targets = snapshot?.document?.exports?.targets;
    if (Array.isArray(targets) && targets.length > 0) {
        return normalizeExportTarget(targets[0]);
    }

    return normalizeExportTarget({ type: 'mp4' });
}

function buildExportShot(snapshot, inputs) {
    return {
        shotTimeline: inputs.shotTimeline,
        sceneGraph: inputs.renderInput.sceneGraphTree,
        activeSceneId: inputs.activeSceneId,
        activeShotId: inputs.activeShotId,
        presentHash: snapshot?.timeline?.presentHash ?? null,
    };
}

function buildExportWorkflowResult({
    snapshot,
    inputs,
    renderSession,
    manifest,
    assignmentResult,
    executor,
    exportTarget,
    registryState,
} = {}) {
    return Object.freeze({
        snapshot,
        renderInput: inputs.renderInput,
        shot: buildExportShot(snapshot, inputs),
        timeline: snapshot?.timeline?.timelines?.default ?? null,
        exportTarget,
        renderSession,
        manifest,
        executor,
        assignment: assignmentResult.assignment,
        queueState: assignmentResult.queueState,
        executionState: assignmentResult.executionState,
        queueEntry: assignmentResult.queueEntry,
        checkpoint: assignmentResult.checkpoint,
        progress: assignmentResult.queueEntry?.progress ?? null,
        registryState,
        simulationTraceFingerprint: manifest?.simulationTraceFingerprint ?? null,
    });
}

export function createExportExecution({
    snapshot,
    exportTarget = null,
    queueState = createRenderQueueState(),
    executor = createLocalRenderExecutor(),
    checkpoint = null,
    executionState = null,
    priority = 0,
    registryState = createRenderExecutionRegistryState(),
    recordRegistry = true,
} = {}) {
    if (!snapshot || typeof snapshot !== 'object') {
        throw new Error('createExportExecution requires snapshot.');
    }

    const inputs = buildEvaluationInputs(snapshot, { timeMs: 0, strictSceneScope: true });
    if (!inputs.renderInput?.sceneGraph) {
        throw new Error('Export blocked: no valid scene scope');
    }

    const resolvedExportTarget = resolveExportTarget(snapshot, exportTarget);
    const renderSession = buildRenderSession({
        renderInput: inputs.renderInput,
        fromMs: 0,
        samplePolicy: {
            mode: 'stability-preflight',
            sampleCount: 4,
            includeTransitionBoundaries: true,
        },
    });
    const manifest = buildExportManifest({
        renderSession,
        exportTarget: resolvedExportTarget,
        simulationTraceFingerprint: hashSimulationTrace(snapshot?.runtime?.simulation?.trace ?? null),
    });
    const assignmentResult = executeRenderAssignment({
        executor,
        queueState,
        manifest,
        renderInput: inputs.renderInput,
        executionState,
        checkpoint,
        priority,
        mode: 'create',
    });
    const intermediateWorkflow = buildExportWorkflowResult({
        snapshot,
        inputs,
        renderSession,
        manifest,
        assignmentResult,
        executor,
        exportTarget: resolvedExportTarget,
        registryState,
    });
    const nextRegistryState = recordRegistry
        ? recordRenderExecutionWorkflow(registryState, intermediateWorkflow)
        : registryState;

    return buildExportWorkflowResult({
        snapshot,
        inputs,
        renderSession,
        manifest,
        assignmentResult,
        executor,
        exportTarget: resolvedExportTarget,
        registryState: nextRegistryState,
    });
}

export function stepExportExecution({
    snapshot,
    exportTarget = null,
    queueState,
    executor = createLocalRenderExecutor(),
    checkpoint = null,
    registryState = createRenderExecutionRegistryState(),
} = {}) {
    const workflow = createExportExecution({
        snapshot,
        exportTarget,
        queueState,
        executor,
        checkpoint,
        registryState,
        recordRegistry: false,
    });
    const assignmentResult = executeRenderAssignment({
        executor,
        queueState: workflow.queueState,
        manifest: workflow.manifest,
        renderInput: workflow.renderInput,
        checkpoint: workflow.checkpoint,
        mode: 'step',
    });
    const nextRegistryState = recordRenderExecutionWorkflow(
        workflow.registryState,
        {
            ...workflow,
            assignment: assignmentResult.assignment,
            queueState: assignmentResult.queueState,
            executionState: assignmentResult.executionState,
            queueEntry: assignmentResult.queueEntry,
            checkpoint: assignmentResult.checkpoint,
            progress: assignmentResult.queueEntry?.progress ?? null,
        },
    );

    return Object.freeze({
        ...workflow,
        assignment: assignmentResult.assignment,
        queueState: assignmentResult.queueState,
        executionState: assignmentResult.executionState,
        queueEntry: assignmentResult.queueEntry,
        checkpoint: assignmentResult.checkpoint,
        progress: assignmentResult.queueEntry?.progress ?? null,
        registryState: nextRegistryState,
    });
}

export function runExportExecution({
    snapshot,
    exportTarget = null,
    queueState = createRenderQueueState(),
    executor = createLocalRenderExecutor(),
    checkpoint = null,
    registryState = createRenderExecutionRegistryState(),
} = {}) {
    const workflow = createExportExecution({
        snapshot,
        exportTarget,
        queueState,
        executor,
        checkpoint,
        registryState,
        recordRegistry: false,
    });
    const assignmentResult = executeRenderAssignment({
        executor,
        queueState: workflow.queueState,
        manifest: workflow.manifest,
        renderInput: workflow.renderInput,
        checkpoint: workflow.checkpoint,
        mode: 'run',
    });
    const nextRegistryState = recordRenderExecutionWorkflow(
        workflow.registryState,
        {
            ...workflow,
            assignment: assignmentResult.assignment,
            queueState: assignmentResult.queueState,
            executionState: assignmentResult.executionState,
            queueEntry: assignmentResult.queueEntry,
            checkpoint: assignmentResult.checkpoint,
            progress: assignmentResult.queueEntry?.progress ?? null,
        },
    );

    return Object.freeze({
        ...workflow,
        assignment: assignmentResult.assignment,
        queueState: assignmentResult.queueState,
        executionState: assignmentResult.executionState,
        queueEntry: assignmentResult.queueEntry,
        checkpoint: assignmentResult.checkpoint,
        progress: assignmentResult.queueEntry?.progress ?? null,
        registryState: nextRegistryState,
    });
}

export function performExportExecution(workflow) {
    if (!workflow || typeof workflow !== 'object') {
        throw new Error('performExportExecution requires workflow.');
    }

    const result = executeExport(workflow.shot, workflow.timeline, {
        frames: workflow.manifest.sampleTimes,
        evaluateShotAtFn: (_shotTimeline, _sceneGraph, timeMs, options = {}) =>
            evaluateRuntimeFrame({
                renderInput: {
                    ...workflow.renderInput,
                    activeShotId: options?.shotId ?? workflow.renderInput.activeShotId ?? null,
                    timeMs,
                },
                timeMs,
                reason: 'export-preflight',
                commit: false,
            }),
        performExport: () => {
            const spec = buildDroppleSpec(workflow.snapshot);
            validateDroppleSpec(spec);
            return spec;
        },
    });

    if (!result.success) {
        throw new Error(result.reason || 'Export blocked by stability gate');
    }

    return result.output;
}
