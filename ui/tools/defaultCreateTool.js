import { canvasBus } from '@/infrastructure/eventBus/canvasBus.js';

export const DefaultCreateTool = {
  id: 'create-default',
  label: 'Create Default',
};

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
