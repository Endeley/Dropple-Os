import { canvasBus } from '@/ui/canvasBus';

/**
 * Shape creation tool (Graphic mode default).
 */
export function registerCreateShapeTool({ selectSingle }) {
  const handleCreate = ({ bounds }) => {
    if (!bounds) return;
    const id = crypto.randomUUID();

    canvasBus.emit('intent.node.create', {
      id,
      type: 'shape',
      bounds,
    });

    selectSingle?.(id);
  };

  return canvasBus.on('tool.create.shape', handleCreate);
}
