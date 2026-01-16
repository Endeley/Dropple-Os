import { canvasBus } from '@/ui/canvasBus';

/**
 * Layer creation tool (Animation mode default).
 */
export function registerCreateLayerTool({ emit, selectSingle }) {
  if (!emit) {
    throw new Error('registerCreateLayerTool requires emit');
  }

  const handleCreate = ({ bounds }) => {
    if (!bounds) return;
    const { x, y, width, height } = bounds;
    const id = crypto.randomUUID();

    emit({
      type: 'node.create',
      payload: {
        nodeId: id,
        nodeType: 'layer',
        parentId: null,
        layout: { x, y, width, height },
      },
    });

    selectSingle?.(id);
  };

  return canvasBus.on('tool.create.layer', handleCreate);
}
