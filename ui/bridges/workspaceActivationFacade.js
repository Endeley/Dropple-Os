import { resolveWorkspaceActivationContract } from '@/platform/capabilities/workspaceActivation.js';
import { resolveWorkspaceContext } from '@/platform/workspaces/resolveWorkspaceContext.js';
import { resolveModeDefinition } from '@/platform/workspaces/modeResolution.js';
import { getWorkspaceDefinition as getResolvedWorkspaceDefinition } from '@/platform/workspaces/workspaceRegistry.js';
import { adaptWorkspaceToContractV1 } from '@/core/contracts/adaptWorkspaceToContractV1.js';

function safeArray(values) {
    if (!values) return [];
    if (Array.isArray(values)) return [...values];
    if (values instanceof Set) return Array.from(values);
    return [];
}

function safeSet(values) {
    return new Set(safeArray(values));
}

function resolveContext(input) {
    return resolveWorkspaceContext(input);
}

export function resolveWorkspaceId(input) {
    return resolveContext(input)?.workspaceId ?? null;
}

export function resolveModeId(input) {
    return resolveContext(input)?.modeId ?? null;
}

export function getWorkspaceDefinition(input) {
    const context = resolveContext(input);
    if (!context) return null;
    return getResolvedWorkspaceDefinition(
        context.definitionId ?? context.modeId ?? context.workspaceId,
    );
}

export function getModeDefinition(input) {
    const context = resolveContext(input);
    if (!context) return null;
    return resolveModeDefinition(context.modeId);
}

function buildWorkspaceActivation(activation, context) {
    return {
        ...activation,
        workspace: context.workspaceId,
        workspaceId: context.workspaceId,
        modeId: context.modeId,
        definitionId: context.definitionId,
        source: context.source,
        capabilities: safeSet(activation?.capabilities),
        tools: safeArray(activation?.tools),
        panels: safeArray(activation?.panels),
        nodes: safeArray(activation?.nodes),
        compilers: safeArray(activation?.compilers),
        exports: safeArray(activation?.exports),
        dataProviders: safeArray(activation?.dataProviders),
        workspaceFeatures: safeArray(activation?.workspaceFeatures),
        permissions: safeArray(activation?.permissions),
        allowedEventTypes: safeArray(activation?.allowedEventTypes),
        enabledTriggerTypes: safeArray(activation?.enabledTriggerTypes),
    };
}

function mergeWorkspaceCapabilities(workspaceDefinition, modeDefinition, activation) {
    const workspaceCapabilities = workspaceDefinition?.capabilities ?? {};
    const modeExposure = modeDefinition?.exposure ?? {};
    const activationCapabilities = activation?.capabilities ?? new Set();

    const readOnly = modeExposure.readOnly === true || workspaceDefinition?.readonly === true;
    const review = modeExposure.review === true;
    const canvas = modeExposure.canvas === true;
    const timeline = modeExposure.timeline === true;
    const exportEnabled = modeExposure.export === true;

    return {
        ...workspaceCapabilities,
        timeline: timeline || workspaceCapabilities.timeline === true || activationCapabilities.has('timeline') === true,
        animation: workspaceCapabilities.animation === true || activationCapabilities.has('animation') === true,
        rigging: workspaceCapabilities.rigging === true || activationCapabilities.has('rig:author') === true,
        sequencer: workspaceCapabilities.sequencer === true || activationCapabilities.has('sequencer:author') === true,
        canvas,
        review,
        export: exportEnabled,
        editing: readOnly ? false : (workspaceCapabilities.editing ?? true),
        readOnly,
    };
}

function buildWorkspaceAdapter(input, context, workspaceDefinition, modeDefinition, activation) {
    if (!context || !workspaceDefinition || !modeDefinition || !activation) {
        return {
            id: typeof input === 'string' ? input : null,
            label: typeof input === 'string' ? input : null,
            workspaceId: null,
            modeId: null,
            capabilities: {},
            panels: [],
            interactions: { keyboard: true, pointer: true },
            ui: { editing: true, readOnly: false, review: false, canvas: true, timeline: false },
            timeline: null,
            allowedEventTypes: null,
        };
    }

    const capabilities = mergeWorkspaceCapabilities(workspaceDefinition, modeDefinition, activation);
    const exposure = modeDefinition?.exposure ?? {};
    const editingEnabled = capabilities.editing === true;

    return {
        id: context.modeId,
        label: modeDefinition.label || workspaceDefinition.label || context.modeId,
        workspaceId: context.workspaceId,
        modeId: context.modeId,
        definitionId: context.definitionId,
        source: context.source,
        profile: workspaceDefinition.profile,
        capabilities,
        timeline: exposure.timeline === true ? activation.timeline || workspaceDefinition.timeline || null : null,
        allowedEventTypes: activation.allowedEventTypes || null,
        panels: activation.panels || [],
        interactions: {
            keyboard: editingEnabled,
            pointer: exposure.canvas === true || editingEnabled,
        },
        ui: {
            editing: editingEnabled,
            readOnly: exposure.readOnly === true,
            review: exposure.review === true,
            canvas: exposure.canvas === true,
            timeline: exposure.timeline === true,
        },
    };
}

function buildWorkspaceContractSeed(context, workspaceDefinition, modeDefinition, activation) {
    return {
        ...workspaceDefinition,
        id: context.workspaceId,
        modeId: context.modeId,
        definitionId: context.definitionId,
        source: context.source,
        tools: activation.tools,
        panels: activation.panels,
        capabilities: mergeWorkspaceCapabilities(workspaceDefinition, modeDefinition, activation),
        allowedEventTypes: activation.allowedEventTypes,
        enabledTriggerTypes: activation.enabledTriggerTypes,
        canvasPolicy: activation.canvasPolicy,
        canvasSurface: activation.canvasSurface,
        timeline: modeDefinition?.exposure?.timeline === true ? activation.timeline || workspaceDefinition.timeline || null : null,
        export: modeDefinition?.exposure?.export === true ? activation.export || workspaceDefinition.export || null : null,
    };
}

export function getWorkspaceActivation(input) {
    const context = resolveContext(input);
    if (!context) return null;

    try {
        return buildWorkspaceActivation(
            resolveWorkspaceActivationContract(context.definitionId ?? context.modeId ?? context.workspaceId),
            context,
        );
    } catch {
        return null;
    }
}

export function getWorkspaceAdapter(input) {
    const context = resolveContext(input);
    const workspaceDefinition = context ? getWorkspaceDefinition(context) : null;
    const modeDefinition = context ? resolveModeDefinition(context.modeId) : null;
    const activation = context ? getWorkspaceActivation(context) : null;

    return buildWorkspaceAdapter(input, context, workspaceDefinition, modeDefinition, activation);
}

export function getWorkspaceContractDefinition(input) {
    const context = resolveContext(input);
    if (!context) return null;

    const workspaceDefinition = getWorkspaceDefinition(context);
    const modeDefinition = resolveModeDefinition(context.modeId);
    const activation = getWorkspaceActivation(context);

    if (!workspaceDefinition || !modeDefinition || !activation) return null;

    return adaptWorkspaceToContractV1(
        buildWorkspaceContractSeed(context, workspaceDefinition, modeDefinition, activation),
    );
}
