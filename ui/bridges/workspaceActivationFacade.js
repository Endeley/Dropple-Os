import { resolveWorkspaceActivationContract } from '@/platform/capabilities/workspaceActivation.js';
import {
    getWorkspaceDefinition as getCanonicalWorkspaceDefinition,
    resolveWorkspaceId as resolveCanonicalWorkspaceId,
} from '@/platform/workspaces/workspaceRegistry.js';
import { adaptWorkspaceToContractV1 } from '@/core/contracts/adaptWorkspaceToContractV1.js';

function safeArray(values) {
    if (!values) return [];
    if (Array.isArray(values)) return values;
    if (values instanceof Set) return Array.from(values);
    return [];
}

export function getWorkspaceActivation(workspaceId) {
    if (!workspaceId) return null;

    try {
        const activation = resolveWorkspaceActivationContract(workspaceId);
        return {
            ...activation,
            capabilities: new Set(safeArray(activation.capabilities)),
            tools: safeArray(activation.tools),
            panels: safeArray(activation.panels),
            nodes: safeArray(activation.nodes),
            compilers: safeArray(activation.compilers),
            exports: safeArray(activation.exports),
            dataProviders: safeArray(activation.dataProviders),
            workspaceFeatures: safeArray(activation.workspaceFeatures),
            permissions: safeArray(activation.permissions),
        };
    } catch {
        return null;
    }
}

export function resolveWorkspaceId(modeId) {
    return resolveCanonicalWorkspaceId(modeId);
}

export function getWorkspaceDefinition(workspaceId) {
    return getCanonicalWorkspaceDefinition(workspaceId);
}

function mergeWorkspaceCapabilities(definition, activation) {
    return {
        ...(definition?.capabilities || {}),
        timeline:
            definition?.capabilities?.timeline === true ||
            activation?.capabilities?.has('timeline') === true,
        animation:
            definition?.capabilities?.animation === true ||
            activation?.capabilities?.has('animation') === true,
        rigging:
            definition?.capabilities?.rigging === true ||
            activation?.capabilities?.has('rig:author') === true,
        sequencer:
            definition?.capabilities?.sequencer === true ||
            activation?.capabilities?.has('sequencer:author') === true,
        editing: definition?.readonly ? false : definition?.capabilities?.editing ?? true,
    };
}

export function getWorkspaceAdapter(modeId) {
    const workspaceId = resolveWorkspaceId(modeId);
    const definition = getWorkspaceDefinition(workspaceId);
    const activation = getWorkspaceActivation(workspaceId);

    if (!definition || !activation) {
        return {
            id: modeId || workspaceId,
            label: modeId || workspaceId,
            workspaceId,
            capabilities: {},
            panels: [],
            interactions: { keyboard: true, pointer: true },
            ui: { editing: true },
            timeline: null,
            allowedEventTypes: null,
        };
    }

    const isEducation = modeId === 'education';
    const isReview = modeId === 'review';
    const editingEnabled = mergeWorkspaceCapabilities(definition, activation).editing !== false;

    return {
        id: modeId || workspaceId,
        label: definition.label || modeId || workspaceId,
        workspaceId,
        profile: definition.profile,
        capabilities: mergeWorkspaceCapabilities(definition, activation),
        timeline: activation.timeline || definition.timeline || null,
        allowedEventTypes: activation.allowedEventTypes || null,
        panels: activation.panels || [],
        interactions: {
            keyboard: !isEducation && !isReview,
            pointer: !isEducation && !isReview,
        },
        ui: {
            editing: editingEnabled && !isEducation && !isReview,
        },
    };
}

export function getWorkspaceContractDefinition(workspaceId) {
    const normalizedId = resolveWorkspaceId(workspaceId);
    const definition = getWorkspaceDefinition(normalizedId);
    const activation = getWorkspaceActivation(normalizedId);

    if (!definition || !activation) return null;

    return adaptWorkspaceToContractV1({
        ...definition,
        tools: activation.tools,
        panels: activation.panels,
        capabilities: mergeWorkspaceCapabilities(definition, activation),
        allowedEventTypes: activation.allowedEventTypes,
        enabledTriggerTypes: activation.enabledTriggerTypes,
        canvasPolicy: activation.canvasPolicy,
        canvasSurface: activation.canvasSurface,
        timeline: activation.timeline || definition.timeline || null,
        export: activation.export || definition.export || null,
    });
}
