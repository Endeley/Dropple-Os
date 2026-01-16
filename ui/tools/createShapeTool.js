import { canvasBus } from '@/ui/canvasBus';

/**
 * Shape creation tool (Graphic mode default).
 */
export function registerCreateShapeTool({ emit, selectSingle }) {
  if (!emit) {
    throw new Error('registerCreateShapeTool requires emit');
  }

  const handleCreate = ({ bounds }) => {
    if (!bounds) return;
    const { x, y, width, height } = bounds;
    const id = crypto.randomUUID();

    emit({
      type: 'node.create',
      payload: {
        nodeId: id,
        nodeType: 'shape',
        parentId: null,
        layout: { x, y, width, height },
      },
    });

    selectSingle?.(id);
  };

  return canvasBus.on('tool.create.shape', handleCreate);
}
