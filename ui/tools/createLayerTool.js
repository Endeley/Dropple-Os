import { canvasBus } from '../eventBus/canvasBus.js';

export const CreateLayerTool = {
  id: 'create-layer',
  label: 'Create Layer',
};

/**
 * Layer creation tool (Animation mode default).
 */
export function registerCreateLayerTool() {
  const handleCreate = ({ bounds }) => {
    if (!bounds) return;

    canvasBus.emit('intent.node.create', {
      type: 'layer',
      bounds,
    });
  };

  return canvasBus.on('tool.create.layer', handleCreate);
}
