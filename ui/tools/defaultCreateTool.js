import { canvasBus } from '../eventBus/canvasBus.js';

export const DefaultCreateTool = {
  id: 'create-default',
  label: 'Create Default',
};

/**
 * Default creation tool.
 * Activated AFTER intent resolution.
 */
export function registerDefaultCreateTool() {
  const handleCreate = ({ bounds }) => {
    if (!bounds) return;

    canvasBus.emit('intent.node.create', {
      type: 'rect',
      bounds,
    });
  };

  return canvasBus.on('tool.create.default', handleCreate);
}
