import { canvasBus } from '@/infrastructure/eventBus/canvasBus.js';

export const CreateShapeTool = {
  id: 'create-shape',
  label: 'Create Shape',
};

/**
 * Shape creation tool (Graphic mode default).
 */
export function registerCreateShapeTool() {
  const handleCreate = ({ bounds }) => {
    if (!bounds) return;

    canvasBus.emit('intent.node.create', {
      type: 'shape',
      bounds,
    });
  };

  return canvasBus.on('tool.create.shape', handleCreate);
}
