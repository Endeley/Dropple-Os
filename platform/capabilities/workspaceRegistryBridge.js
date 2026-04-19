import {
    getWorkspaceDefinition,
    getWorkspaceRegistry,
} from '@/platform/workspaces/workspaceRegistry.js';
import { resolveWorkspacePolicy } from '@/workspaces/registry/resolveWorkspacePolicy.js';
import { getWorkspacePolicy, registerWorkspacePolicy } from './workspacePolicy.js';

export { getWorkspaceDefinition };

function toArray(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (value instanceof Set) return Array.from(value);
    return [];
}

function normalizeWorkspacePolicy(definition) {
    const resolvedDefinition =
        definition?.id ? resolveWorkspacePolicy(definition.id) : null;
    const source =
        resolvedDefinition && !resolvedDefinition.error
            ? resolvedDefinition
            : definition;

    return {
        workspace: source.id,
        capabilities: [...new Set(source.policy?.capabilities ?? [])].sort((a, b) =>
            String(a).localeCompare(String(b))
        ),
        denies: [...new Set(source.policy?.denies ?? [])].sort((a, b) =>
            String(a).localeCompare(String(b))
        ),
        readonly: source.readonly ?? source.policy?.mutation === 'readonly',
        tools: [...new Set(source.tools ?? source.ui?.tools ?? [])].sort((a, b) =>
            String(a).localeCompare(String(b))
        ),
        panels: [...new Set(source.panels ?? source.ui?.panels ?? [])].sort((a, b) =>
            String(a).localeCompare(String(b))
        ),
        allowedEventTypes: toArray(source.allowedEventTypes ?? source.events?.allowedEventTypes)
            .filter(Boolean)
            .sort((a, b) =>
            String(a).localeCompare(String(b))
        ),
        enabledTriggerTypes: toArray(source.enabledTriggerTypes ?? source.events?.enabledTriggerTypes)
            .filter(Boolean)
            .sort((a, b) =>
            String(a).localeCompare(String(b))
        ),
        canvasPolicy: source.canvasPolicy ?? source.canvas?.policy ?? null,
        canvasSurface: source.canvasSurface ?? source.canvas?.surface ?? null,
        timeline: source.timeline ?? null,
        media: source.media ?? null,
        render: source.render ?? null,
        export: source.export ?? null,
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
