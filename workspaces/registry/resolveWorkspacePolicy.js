import { WorkspaceRegistry } from '../registry.js';

/**
 * Resolves full workspace definition including inheritance.
 */
export function resolveWorkspacePolicy(id) {
    const base = WorkspaceRegistry[id];
    if (!base) return { error: 'unknown-workspace' };

    if (base.extends) {
        const parent = resolveWorkspacePolicy(base.extends);
        if (parent?.error) return parent;

        return {
            ...parent,
            ...base,
            capabilities: {
                ...(parent.capabilities || {}),
                ...(base.capabilities || {}),
            },
            timeline: base.timeline || parent.timeline || null,
            readonly: base.status === 'stub',
            allowedTools: base.status === 'stub' ? [] : base.tools || [],
            allowedPanels: base.status === 'stub' ? [] : base.panels || [],
        };
    }

    return {
        ...base,
        readonly: base.status === 'stub',
        allowedTools: base.status === 'stub' ? [] : base.tools || [],
        allowedPanels: base.status === 'stub' ? [] : base.panels || [],
    };
}
