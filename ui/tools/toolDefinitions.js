import { TOOL_CAPABILITIES as BASE_TOOL_CAPABILITIES } from '@/ui/capabilities/toolCapabilities';
import { getWorkspaceActivation } from '@/ui/bridges/workspaceActivationFacade.js';
import { resolveModeWithOverlay } from '@/platform/workspaces/modeResolution.js';

/**
 * TOOL BUS TOPICS
 * (kept for capability mapping)
 */
export const TOOL_BUS_TOPICS = Object.freeze({
    select: 'tool.select',
    pan: 'tool.pan',
    zoom: 'tool.zoom',
    fit: 'tool.fit',
    frame: 'tool.create.frame',
    shape: 'tool.create.shape',
    text: 'tool.create.text',
    image: 'tool.create.image',
    layer: 'tool.create.layer',
    defaultCreate: 'tool.create.default',
});

/**
 * CANONICAL TOOL ORDER (prevents UI drift)
 */
const TOOL_GROUP_ORDER = ['navigate', 'create', 'edit', 'vector', 'timeline', 'components', 'document', 'education', 'dev', 'branding'];

/**
 * TOOL DEFINITIONS
 */
export const TOOL_DEFINITIONS = Object.freeze([
    { id: 'select', label: 'Select', group: 'navigate' },
    { id: 'pan', label: 'Pan', group: 'navigate' },
    { id: 'zoom', label: 'Zoom', group: 'navigate' },
    { id: 'fit', label: 'Fit', group: 'navigate' },

    { id: 'frame', label: 'Frame', group: 'create', createsNode: true, nodeType: 'frame' },
    { id: 'text', label: 'Text', group: 'create', createsNode: true, nodeType: 'text' },
    { id: 'shape', label: 'Shape', group: 'create', createsNode: true, nodeType: 'shape' },
    { id: 'image', label: 'Image', group: 'create', createsNode: true, nodeType: 'image' },
    { id: 'layer', label: 'Layer', group: 'create', createsNode: true, nodeType: 'layer' },

    { id: 'move', label: 'Move', group: 'edit' },
    { id: 'resize', label: 'Resize', group: 'edit' },
    { id: 'exec-contract-shared', label: 'Exec Contract Shared', group: 'edit' },
    { id: 'exec-version-minor-shared', label: 'Exec Version Minor Shared', group: 'edit' },
    { id: 'exec-version-major-shared', label: 'Exec Version Major Shared', group: 'edit' },
    { id: 'exec-version-major-migrated-shared', label: 'Exec Version Major Migrated Shared', group: 'edit' },
    { id: 'rig-select', label: 'Rig Select', group: 'navigate' },
    { id: 'rig-move', label: 'Rig Move', group: 'edit' },

    { id: 'path', label: 'Path', group: 'vector' },
    { id: 'stroke', label: 'Stroke', group: 'vector' },

    { id: 'keyframe', label: 'Keyframe', group: 'timeline' },
    { id: 'cut', label: 'Cut', group: 'timeline' },
    { id: 'trim', label: 'Trim', group: 'timeline' },

    { id: 'component', label: 'Component', group: 'components' },
    { id: 'variant', label: 'Variant', group: 'components' },
    { id: 'token', label: 'Token', group: 'components' },

    { id: 'section', label: 'Section', group: 'document' },
    { id: 'page', label: 'Page', group: 'document' },

    { id: 'step', label: 'Step', group: 'education' },
    { id: 'explain', label: 'Explain', group: 'education' },

    { id: 'inspect', label: 'Inspect', group: 'dev' },
    { id: 'translate', label: 'Translate', group: 'dev' },

    { id: 'edit', label: 'Edit', group: 'branding' },
    { id: 'apply', label: 'Apply', group: 'branding' },
]);

export const TOOL_DEFINITION_BY_ID = Object.freeze(
    TOOL_DEFINITIONS.reduce((acc, tool) => {
        acc[tool.id] = tool;
        return acc;
    }, {}),
);

export const TOOL_CAPABILITIES = BASE_TOOL_CAPABILITIES;

/**
 * FALLBACKS (pure classification — no merging logic)
 */
const FALLBACK_MODE_TOOLS = Object.freeze({
    uiux: ['select', 'pan', 'zoom', 'fit', 'frame', 'text', 'shape', 'image'],
    graphic: ['select', 'pan', 'zoom', 'fit', 'shape'],
    animation: ['select', 'pan', 'zoom', 'fit', 'layer'],
    document: ['text', 'section', 'page'],
    dev: ['inspect', 'translate'],
});

const FALLBACK_OVERLAY_TOOLS = Object.freeze({
    'brand-systems': ['shape', 'path', 'edit', 'apply'],
    'icon-systems': ['select', 'pan', 'zoom', 'fit', 'stroke', 'path'],
});

/**
 * WORKSPACE TOOL RESOLUTION (STRICT — no merging)
 */
function resolveWorkspaceTools({ workspaceId, modeId, overlayId }) {
    const rawModeId = modeId || workspaceId;
    const overlayResolution = resolveModeWithOverlay(rawModeId);
    const resolvedWorkspaceId = overlayResolution.workspaceId || workspaceId || null;
    const resolvedModeId = overlayResolution.canonicalModeId || modeId || workspaceId || null;
    const resolvedOverlayId = overlayId || overlayResolution.overlayId || null;

    if (resolvedOverlayId && Array.isArray(FALLBACK_OVERLAY_TOOLS[resolvedOverlayId])) {
        return FALLBACK_OVERLAY_TOOLS[resolvedOverlayId];
    }

    const activationInput =
        resolvedWorkspaceId && resolvedModeId
            ? { workspaceId: resolvedWorkspaceId, modeId: resolvedModeId }
            : workspaceId;
    const activation = getWorkspaceActivation(activationInput);

    if (Array.isArray(activation?.tools) && activation.tools.length > 0) {
        return activation.tools;
    }

    return FALLBACK_MODE_TOOLS[resolvedModeId] || [];
}

/**
 * CAPABILITY CHECK
 */
function hasAll(capSet, required = []) {
    if (!required.length) return true;
    if (!capSet || typeof capSet.has !== 'function') return false;
    return required.every((cap) => capSet.has(cap));
}

function isToolVisible(toolId, capabilitySet) {
    if (!capabilitySet) return true;

    const topic = TOOL_BUS_TOPICS[toolId];
    const caps = TOOL_CAPABILITIES?.[topic];

    if (!caps) return true;

    return hasAll(capabilitySet, caps.readCaps) && hasAll(capabilitySet, caps.writeCaps);
}

/**
 * FINAL API
 */
export function getVisibleToolsForWorkspace({ workspaceId, modeId = null, overlayId = null, capabilitySet }) {
    const allowed = new Set(resolveWorkspaceTools({ workspaceId, modeId, overlayId }));

    const filtered = TOOL_DEFINITIONS.filter((tool) => {
        if (!allowed.has(tool.id)) return false;
        return isToolVisible(tool.id, capabilitySet);
    });

    // Stable grouping order
    return filtered.sort((a, b) => {
        return TOOL_GROUP_ORDER.indexOf(a.group) - TOOL_GROUP_ORDER.indexOf(b.group);
    });
}
