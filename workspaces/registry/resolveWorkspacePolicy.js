import { WorkspaceRegistry } from './index.js';

/**
 * Resolves workspace config and applies status rules.
 */
export function resolveWorkspacePolicy(mode) {
    const workspace = WorkspaceRegistry[mode];

    if (!workspace) {
        return { error: 'unknown-workspace' };
    }

    if (workspace.status === 'stub') {
        return {
            ...workspace,
            readonly: true,
            allowedTools: [],
            allowedPanels: [],
        };
    }

    return {
        ...workspace,
        readonly: false,
        allowedTools: workspace.tools || [],
        allowedPanels: workspace.panels || [],
    };
}
