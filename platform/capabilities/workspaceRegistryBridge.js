import {
    getWorkspaceDefinition,
    getWorkspaceRegistry,
} from '@/platform/workspaces/workspaceRegistry.js';
import { getWorkspacePolicy, registerWorkspacePolicy } from './workspacePolicy.js';

export { getWorkspaceDefinition };

function toArray(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (value instanceof Set) return Array.from(value);
    return [];
}

function normalizeWorkspacePolicy(definition) {
    return {
        workspace: definition.id,
        capabilities: [...new Set(definition.policy?.capabilities ?? [])].sort((a, b) =>
            String(a).localeCompare(String(b))
        ),
        denies: [...new Set(definition.policy?.denies ?? [])].sort((a, b) =>
            String(a).localeCompare(String(b))
        ),
        readonly: definition.readonly ?? definition.policy?.mutation === 'readonly',
        tools: [...new Set(definition.ui?.tools ?? [])].sort((a, b) =>
            String(a).localeCompare(String(b))
        ),
        panels: [...new Set(definition.ui?.panels ?? [])].sort((a, b) =>
            String(a).localeCompare(String(b))
        ),
        allowedEventTypes: toArray(definition.events?.allowedEventTypes).sort((a, b) =>
            String(a).localeCompare(String(b))
        ),
        enabledTriggerTypes: toArray(definition.events?.enabledTriggerTypes).sort((a, b) =>
            String(a).localeCompare(String(b))
        ),
        canvasPolicy: definition.canvas?.policy ?? null,
        canvasSurface: definition.canvas?.surface ?? null,
        timeline: definition.timeline ?? null,
        media: definition.media ?? null,
        render: definition.render ?? null,
        export: definition.export ?? null,
    };
}

export function ensureWorkspacePolicyRegistered(workspace) {
    const existing = getWorkspacePolicy(workspace);
    if (existing) return existing;

    const definition = getWorkspaceDefinition(workspace);
    if (!definition) return null;

    const policy = normalizeWorkspacePolicy(definition);
    registerWorkspacePolicy(policy);
    return policy;
}

export function registerWorkspaceRegistryPolicies() {
    return Object.keys(getWorkspaceRegistry())
        .sort((a, b) => a.localeCompare(b))
        .map((workspace) => ensureWorkspacePolicyRegistered(workspace))
        .filter(Boolean);
}
