import { WorkspaceRegistry } from './index.js';

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

function mergeCapabilities(parent = [], base = []) {
    const parentArr = Array.isArray(parent) ? parent : [];
    const baseArr = Array.isArray(base) ? base : [];
    return Array.from(new Set([...parentArr, ...baseArr]));
}

function mergeDenies(parent = [], base = []) {
    const parentArr = Array.isArray(parent) ? parent : [];
    const baseArr = Array.isArray(base) ? base : [];
    return Array.from(new Set([...parentArr, ...baseArr]));
}

function asArray(value) {
    if (!value) return [];
    return Array.isArray(value) ? value : Array.from(value);
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

        const merged = {
            ...parent,
            ...base,

            policy: {
                ...(parent.policy || {}),
                ...(base.policy || {}),
                capabilities: mergeCapabilities(
                    parent.policy?.capabilities,
                    base.policy?.capabilities
                ),
                denies: mergeDenies(parent.policy?.denies, base.policy?.denies),
            },

            timeline: base.timeline || parent.timeline || null,

            allowedEventTypes: mergeAllowedEvents(
                parent.events?.allowedEventTypes,
                base.events?.allowedEventTypes
            ),
            enabledTriggerTypes: mergeAllowedEvents(
                parent.events?.enabledTriggerTypes,
                base.events?.enabledTriggerTypes
            ),

            readonly: base.status === 'stub' || base.policy?.mutation === 'readonly',
            allowedTools: base.status === 'stub' ? [] : base.ui?.tools || [],
            allowedPanels: base.status === 'stub' ? [] : base.ui?.panels || [],
        };
        return {
            ...merged,
            allowedEventTypes: new Set(merged.allowedEventTypes || []),
            enabledTriggerTypes: new Set(asArray(merged.enabledTriggerTypes)),
            tools: merged.tools ?? merged.ui?.tools ?? [],
            panels: merged.panels ?? merged.ui?.panels ?? [],
            canvasPolicy: merged.canvas?.policy ?? null,
            canvasSurface: merged.canvas?.surface ?? null,
        };
    }

    // Root workspace (no inheritance)
    const merged = {
        ...base,
        allowedEventTypes: base.events?.allowedEventTypes || null,
        enabledTriggerTypes: base.events?.enabledTriggerTypes || null,
        readonly: base.status === 'stub' || base.policy?.mutation === 'readonly',
        allowedTools: base.status === 'stub' ? [] : base.ui?.tools || [],
        allowedPanels: base.status === 'stub' ? [] : base.ui?.panels || [],
    };
    return {
        ...merged,
        allowedEventTypes: new Set(merged.allowedEventTypes || []),
        enabledTriggerTypes: new Set(asArray(merged.enabledTriggerTypes)),
        tools: merged.tools ?? merged.ui?.tools ?? [],
        panels: merged.panels ?? merged.ui?.panels ?? [],
        canvasPolicy: merged.canvas?.policy ?? null,
        canvasSurface: merged.canvas?.surface ?? null,
    };
}
