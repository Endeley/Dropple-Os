import { canvasBus } from '../eventBus/canvasBus.js';
import { nodeCreateIntent } from '@/ui/creation/nodeCreateIntent';

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

    nodeCreateIntent({
      type: 'shape',
      bounds,
    });
  };

  return canvasBus.on('tool.create.shape', handleCreate);
}
