import { canvasBus } from '../eventBus/canvasBus.js';
import { nodeCreateIntent } from '@/ui/creation/nodeCreateIntent';

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

    nodeCreateIntent({
      type: 'layer',
      bounds,
    });
  };

  return canvasBus.on('tool.create.layer', handleCreate);
}
