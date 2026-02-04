import { canvasBus } from '@/ui/canvasBus';

/**
 * Layer creation tool (Animation mode default).
 */
export function registerCreateLayerTool({ selectSingle }) {
  const handleCreate = ({ bounds }) => {
    if (!bounds) return;
    const id = crypto.randomUUID();

    canvasBus.emit('intent.node.create', {
      id,
      type: 'layer',
      bounds,
    });

    selectSingle?.(id);
  };

  return canvasBus.on('tool.create.layer', handleCreate);
}
