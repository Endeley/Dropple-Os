import { Capability } from './capabilityVocabulary.js';

const GLOBAL_CAPS = [
  Capability.VIEWPORT_PAN,
  Capability.VIEWPORT_ZOOM,
  Capability.VIEWPORT_FIT,
  Capability.PROJECT_READ,
];

export const WORKSPACE_CAPABILITIES = Object.freeze({
  graphic: new Set([
    Capability.NODE_READ,
    Capability.NODE_SELECT,
    Capability.NODE_GROUP,
    Capability.NODE_UNGROUP,

    Capability.LAYOUT_READ,
    Capability.STYLE_READ,
    Capability.CONTENT_READ,

    ...GLOBAL_CAPS,
  ]),

  uiux: new Set([
    Capability.NODE_READ,
    Capability.NODE_SELECT,
    Capability.NODE_CREATE,
    Capability.NODE_DELETE,
    Capability.NODE_DUPLICATE,
    Capability.NODE_GROUP,
    Capability.NODE_UNGROUP,

    Capability.LAYOUT_READ,
    Capability.LAYOUT_WRITE,
    Capability.LAYOUT_CONSTRAINTS,
    Capability.LAYOUT_AUTOLAYOUT,

    Capability.STYLE_READ,
    Capability.STYLE_WRITE,

    Capability.CONTENT_READ,
    Capability.CONTENT_WRITE,

    Capability.COMPONENT_READ,

    Capability.PROJECT_SAVE,

    ...GLOBAL_CAPS,
  ]),

  prototype: new Set([
    Capability.NODE_READ,
    Capability.NODE_SELECT,

    Capability.LAYOUT_READ,
    Capability.STYLE_READ,
    Capability.CONTENT_READ,

    Capability.INTERACTION_READ,

    ...GLOBAL_CAPS,
  ]),

  motion: new Set([
    Capability.NODE_READ,
    Capability.NODE_SELECT,

    Capability.MOTION_READ,

    ...GLOBAL_CAPS,
  ]),

  dev: new Set([
    Capability.NODE_READ,

    Capability.LAYOUT_READ,
    Capability.STYLE_READ,
    Capability.CONTENT_READ,

    Capability.COMPONENT_READ,
    Capability.INTERACTION_READ,
    Capability.MOTION_READ,

    ...GLOBAL_CAPS,
  ]),

  animation: new Set([
    Capability.NODE_READ,
    Capability.NODE_SELECT,

    Capability.MOTION_READ,

    ...GLOBAL_CAPS,
  ]),
});

export const WORKSPACE_COMMAND_CAPABILITIES = Object.freeze({
  graphic: Object.freeze({
    group: true,
    ungroup: true,
  }),
  uiux: Object.freeze({
    group: true,
    ungroup: true,
  }),
  prototype: Object.freeze({
    group: false,
    ungroup: false,
  }),
  motion: Object.freeze({
    group: false,
    ungroup: false,
  }),
  dev: Object.freeze({
    group: false,
    ungroup: false,
  }),
  animation: Object.freeze({
    group: false,
    ungroup: false,
  }),
});

export function getWorkspaceCapabilities(workspaceId) {
  return WORKSPACE_CAPABILITIES[workspaceId] || new Set(GLOBAL_CAPS);
}

export function canRunWorkspaceCommand(workspaceId, commandId) {
  const commandCaps = WORKSPACE_COMMAND_CAPABILITIES[workspaceId];
  if (!commandCaps) return false;
  return commandCaps[commandId] === true;
}
