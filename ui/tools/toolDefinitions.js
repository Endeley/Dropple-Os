import { TOOL_CAPABILITIES as BASE_TOOL_CAPABILITIES } from '@/ui/capabilities/toolCapabilities';
import { resolveWorkspacePolicy } from '@/workspaces/registry/resolveWorkspacePolicy';

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
  { id: 'defaultCreate', label: 'Default Create', group: 'create', createsNode: true, nodeType: 'shape' },

  { id: 'move', label: 'Move', group: 'edit' },
  { id: 'resize', label: 'Resize', group: 'edit' },

  { id: 'path', label: 'Path', group: 'vector' },
  { id: 'stroke', label: 'Stroke', group: 'vector' },

  { id: 'keyframe', label: 'Keyframe', group: 'timeline' },
  { id: 'cut', label: 'Cut', group: 'timeline' },
  { id: 'trim', label: 'Trim', group: 'timeline' },
  { id: 'overlay', label: 'Overlay', group: 'timeline' },
  { id: 'mute', label: 'Mute', group: 'timeline' },
  { id: 'chapter', label: 'Chapter', group: 'timeline' },

  { id: 'component', label: 'Component', group: 'components' },
  { id: 'variant', label: 'Variant', group: 'components' },
  { id: 'token', label: 'Token', group: 'components' },

  { id: 'section', label: 'Section', group: 'document' },
  { id: 'page', label: 'Page', group: 'document' },

  { id: 'step', label: 'Step', group: 'education' },
  { id: 'explain', label: 'Explain', group: 'education' },

  { id: 'inspect', label: 'Inspect', group: 'dev' },
  { id: 'translate', label: 'Translate', group: 'dev' },
  { id: 'refactor', label: 'Refactor', group: 'dev' },

  { id: 'edit', label: 'Edit', group: 'branding' },
  { id: 'apply', label: 'Apply', group: 'branding' },
  { id: 'validate', label: 'Validate', group: 'branding' },
]);

export const TOOL_DEFINITION_BY_ID = Object.freeze(
  TOOL_DEFINITIONS.reduce((acc, tool) => {
    acc[tool.id] = tool;
    return acc;
  }, {})
);

export const TOOL_CAPABILITIES = BASE_TOOL_CAPABILITIES;

const FALLBACK_WORKSPACE_TOOLS = Object.freeze({
  uiux: ['select', 'pan', 'zoom', 'fit', 'frame', 'text', 'shape', 'image'],
  graphic: ['select', 'pan', 'zoom', 'fit', 'shape'],
  animation: ['select', 'pan', 'zoom', 'fit', 'layer'],
  icon: ['select', 'pan', 'zoom', 'fit', 'stroke', 'path'],
  icons: ['select', 'pan', 'zoom', 'fit', 'stroke', 'path'],
  document: ['text', 'section', 'page'],
  dev: ['inspect', 'translate', 'refactor'],
  branding: ['edit', 'apply', 'validate'],
});

function normalizeWorkspaceId(workspaceId) {
  if (!workspaceId) return null;
  if (workspaceId === 'icon') return 'icons';
  return workspaceId;
}

function resolveWorkspaceTools(workspaceId) {
  const normalizedId = normalizeWorkspaceId(workspaceId);
  if (!normalizedId) return [];

  const policy = resolveWorkspacePolicy(normalizedId);
  const fallback = FALLBACK_WORKSPACE_TOOLS[normalizedId] || null;

  if (policy?.error) {
    return fallback || [];
  }

  const policyTools = Array.isArray(policy?.allowedTools) ? policy.allowedTools : [];

  if (!policyTools.length) {
    return fallback || [];
  }

  if (!fallback) {
    return policyTools;
  }

  const merged = [...policyTools];
  fallback.forEach((toolId) => {
    if (!merged.includes(toolId)) {
      merged.push(toolId);
    }
  });

  return merged;
}

function hasAll(capSet, required = []) {
  if (!required.length) return true;
  if (!capSet || typeof capSet.has !== 'function') return false;
  return required.every((cap) => capSet.has(cap));
}

function isToolVisible(toolId, capabilitySet) {
  if (!capabilitySet) return true;

  const topic = TOOL_BUS_TOPICS[toolId];
  if (!topic) return true;

  const caps = TOOL_CAPABILITIES[topic];
  if (!caps) return true;

  const { readCaps = [], writeCaps = [] } = caps;
  return hasAll(capabilitySet, readCaps) && hasAll(capabilitySet, writeCaps);
}

export function getVisibleToolsForWorkspace({ workspaceId, capabilitySet }) {
  const allowed = new Set(resolveWorkspaceTools(workspaceId));

  return TOOL_DEFINITIONS.filter((tool) => {
    if (!allowed.has(tool.id)) return false;
    return isToolVisible(tool.id, capabilitySet);
  });
}
