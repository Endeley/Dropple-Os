import { canvasBus } from '../eventBus/canvasBus.js';
import { getWorkspaceProjection } from '@/runtime/projection';
import { getWorkspaceActivation } from '@/ui/bridges/workspaceActivationFacade.js';

const DEFAULT_BOUNDS = { x: 0, y: 0, width: 160, height: 100 };
const MIN_SIZE = 1;
const TYPE_ALIASES = {
    rect: 'shape',
    rectangle: 'shape',
    default: 'shape',
};
const SEMANTIC_TAGS = {
    frame: 'div',
    shape: 'div',
    text: 'p',
    image: 'img',
    button: 'button',
};

function finiteOr(value, fallback) {
    return Number.isFinite(value) ? value : fallback;
}

function normalizeBounds(bounds, position) {
    const source = bounds || {
        x: position?.x,
        y: position?.y,
        width: DEFAULT_BOUNDS.width,
        height: DEFAULT_BOUNDS.height,
    };
    const width = Math.max(MIN_SIZE, finiteOr(source?.width, DEFAULT_BOUNDS.width));
    const height = Math.max(MIN_SIZE, finiteOr(source?.height, DEFAULT_BOUNDS.height));
    return {
        x: finiteOr(source?.x, DEFAULT_BOUNDS.x),
        y: finiteOr(source?.y, DEFAULT_BOUNDS.y),
        width,
        height,
    };
}

function resolveWorkspace() {
    const projection = getWorkspaceProjection?.();
    const workspaceId = projection?.id ?? null;
    if (!workspaceId) return null;
    return getWorkspaceActivation(workspaceId);
}

function isCreationAllowed(workspace, type) {
    if (!workspace) return true;
    const caps = workspace.capabilities instanceof Set ? workspace.capabilities : new Set();
    if (!caps.has('node:create') && caps.size > 0) return false;
    const tools = new Set(workspace.tools || []);
    if (tools.size === 0) return true;
    return tools.has(type);
}

function normalizeType(type) {
    const raw = String(type || '').toLowerCase();
    return TYPE_ALIASES[raw] || raw;
}

function normalizeProps(props, type) {
    const next = props ? { ...props } : {};
    const semantic = next.semantic ? { ...next.semantic } : null;
    if (semantic?.tag || next.semanticTag) {
        return {
            ...next,
            semantic: semantic || next.semantic,
            semanticTag: next.semanticTag ?? semantic?.tag ?? null,
        };
    }
    const tag = SEMANTIC_TAGS[type] || 'div';
    return {
        ...next,
        semantic: semantic ? { ...semantic, tag: semantic.tag ?? tag } : { tag },
        semanticTag: tag,
    };
}

export function nodeCreateIntent(payload) {
    console.log('INTENT EMITTED:', payload);
    if (!payload?.type) return;
    const workspace = resolveWorkspace();

    const type = normalizeType(payload.type);
    if (!type) return;
    if (!isCreationAllowed(workspace, type)) return;

    const bounds = normalizeBounds(payload.bounds, payload.position);
    const normalized = {
        id: payload.id ?? null,
        type,
        parentId: payload.parentId ?? null,
        bounds,
        position: { x: bounds.x, y: bounds.y },
        props: normalizeProps(payload.props, type),
        style: payload.style ? { ...payload.style } : {},
        content: payload.content ?? null,
    };

    canvasBus.emit('intent.node.create', normalized);
}
