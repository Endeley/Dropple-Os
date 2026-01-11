import { WorkspaceRegistry } from '../registry.js';

/**
 * Merge allowedEventTypes from parent → child.
 * Child can extend (add) events, not mutate parent.
 */
function mergeAllowedEvents(parent, base) {
    if (!parent && !base) return null;

    const parentSet = parent instanceof Set ? parent : parent ? new Set(parent) : null;
    const baseSet = base instanceof Set ? base : base ? new Set(base) : null;

    if (!parentSet) return baseSet;
    if (!baseSet) return parentSet;

    // Child EXTENDS parent (union)
    return new Set([...parentSet, ...baseSet]);
}

/**
 * Resolves full workspace definition including inheritance.
 * This is a PURE policy resolver — no enforcement happens here.
 */
export function resolveWorkspacePolicy(id) {
    const base = WorkspaceRegistry[id];
    if (!base) return { error: 'unknown-workspace' };

    // Inherited workspace
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

            allowedEventTypes: mergeAllowedEvents(parent.allowedEventTypes, base.allowedEventTypes),

            readonly: base.status === 'stub',
            allowedTools: base.status === 'stub' ? [] : base.tools || [],
            allowedPanels: base.status === 'stub' ? [] : base.panels || [],
        };
    }

    // Root workspace (no inheritance)
    return {
        ...base,
        allowedEventTypes: base.allowedEventTypes || null,
        readonly: base.status === 'stub',
        allowedTools: base.status === 'stub' ? [] : base.tools || [],
        allowedPanels: base.status === 'stub' ? [] : base.panels || [],
    };
}
