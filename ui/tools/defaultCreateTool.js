import { canvasBus } from '../eventBus/canvasBus.js';
import { nodeCreateIntent } from '@/ui/creation/nodeCreateIntent';

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

    nodeCreateIntent({
      type: 'rect',
      bounds,
    });
  };

  return canvasBus.on('tool.create.default', handleCreate);
}
