import { canvasBus } from '@/ui/canvasBus';

/**
 * Default creation tool.
 * Activated AFTER intent resolution.
 */
export function registerDefaultCreateTool({ emit, selectSingle }) {
  if (!emit) {
    throw new Error('registerDefaultCreateTool requires emit');
  }

  const handleCreate = ({ bounds }) => {
    if (!bounds) return;
    const { x, y, width, height } = bounds;
    const id = crypto.randomUUID();

    emit({
      type: 'node.create',
      payload: {
        nodeId: id,
        nodeType: 'rect',
        parentId: null,
        layout: { x, y, width, height },
      },
    });

    selectSingle?.(id);
  };

  return canvasBus.on('tool.create.default', handleCreate);
}
