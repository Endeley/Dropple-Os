import { resolveWorkspaceActivationContract } from '@/platform/capabilities/workspaceActivation.js';
import {
    getWorkspaceDefinition,
} from './workspaceRegistry.js';

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

export function getResolvedWorkspaceDefinition(workspaceId) {
    return getWorkspaceDefinition(workspaceId);
}
