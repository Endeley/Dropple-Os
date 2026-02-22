import { Capability } from '@/ui/capabilities/capabilityVocabulary';

export const TOOL_CAPABILITIES = Object.freeze({
  'tool.select': { readCaps: [Capability.NODE_SELECT] },
  'tool.pan': { readCaps: [Capability.VIEWPORT_PAN] },
  'tool.zoom': { readCaps: [Capability.VIEWPORT_ZOOM] },
  'tool.fit': { readCaps: [Capability.VIEWPORT_FIT] },

  'tool.create.frame': { readCaps: [Capability.NODE_CREATE] },
  'tool.create.text': {
    readCaps: [Capability.NODE_CREATE, Capability.CONTENT_WRITE],
  },
  'tool.create.shape': { readCaps: [Capability.NODE_CREATE] },
  'tool.create.image': {
    readCaps: [Capability.NODE_CREATE, Capability.CONTENT_WRITE],
  },
  'tool.create.layer': { readCaps: [Capability.NODE_CREATE] },
  'tool.create.default': { readCaps: [Capability.NODE_CREATE] },
});
