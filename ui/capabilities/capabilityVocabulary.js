export const Capability = Object.freeze({
  NODE_READ: 'node.read',
  NODE_SELECT: 'node.select',
  NODE_CREATE: 'node.create',
  NODE_DELETE: 'node.delete',
  NODE_DUPLICATE: 'node.duplicate',
  NODE_GROUP: 'node.group',
  NODE_UNGROUP: 'node.ungroup',

  LAYOUT_READ: 'layout.read',
  LAYOUT_WRITE: 'layout.write',
  LAYOUT_CONSTRAINTS: 'layout.constraints',
  LAYOUT_AUTOLAYOUT: 'layout.autolayout',

  STYLE_READ: 'style.read',
  STYLE_WRITE: 'style.write',

  CONTENT_READ: 'content.read',
  CONTENT_WRITE: 'content.write',

  COMPONENT_READ: 'component.read',
  COMPONENT_CREATE: 'component.create',
  COMPONENT_DETACH: 'component.detach',

  INTERACTION_READ: 'interaction.read',
  INTERACTION_WRITE: 'interaction.write',
  INTERACTION_PREVIEW: 'interaction.preview',

  MOTION_READ: 'motion.read',
  MOTION_WRITE: 'motion.write',
  MOTION_PREVIEW: 'motion.preview',

  VIEWPORT_PAN: 'viewport.pan',
  VIEWPORT_ZOOM: 'viewport.zoom',
  VIEWPORT_FIT: 'viewport.fit',

  PROJECT_READ: 'project.read',
  PROJECT_SAVE: 'project.save',
  PROJECT_EXPORT: 'project.export',
});

export const ALL_CAPABILITIES = Object.values(Capability);
