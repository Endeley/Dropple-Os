import { canvasBus } from '@/ui/canvasBus';

/**
 * Default creation tool.
 * Activated AFTER intent resolution.
 */
export function registerDefaultCreateTool({ selectSingle }) {
  const handleCreate = ({ bounds }) => {
    if (!bounds) return;
    const id = crypto.randomUUID();

    canvasBus.emit('intent.node.create', {
      id,
      type: 'rect',
      bounds,
    });

    selectSingle?.(id);
  };

  return canvasBus.on('tool.create.default', handleCreate);
}
