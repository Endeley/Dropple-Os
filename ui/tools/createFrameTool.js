import { canvasBus } from '@/ui/canvasBus';

/**
 * Frame creation tool (UI mode default).
 */
export function registerCreateFrameTool({ emit, selectSingle }) {
  if (!emit) {
    throw new Error('registerCreateFrameTool requires emit');
  }

  const handleCreate = ({ bounds }) => {
    if (!bounds) return;
    const { x, y, width, height } = bounds;
    const id = crypto.randomUUID();

    emit({
      type: 'node.create',
      payload: {
        nodeId: id,
        nodeType: 'frame',
        parentId: null,
        layout: { x, y, width, height },
      },
    });

    selectSingle?.(id);
  };

  return canvasBus.on('tool.create.frame', handleCreate);
}
