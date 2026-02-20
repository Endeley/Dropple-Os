import { canvasBus } from '@/infrastructure/eventBus/canvasBus.js';

/**
 * Frame creation tool (UIUX authoring).
 * Emits intent ONLY.
 * Actual node creation is handled by nodeCreateResolver.
 */
export function registerCreateFrameTool({ selectSingle }) {
    const handleCreate = ({ bounds }) => {
        if (!bounds) return;

        canvasBus.emit('intent.node.create', {
            type: 'frame',
            bounds,
        });

        // Selection will resolve after node is created
        // (selection resolver / reducer handles this later)
    };

    return canvasBus.on('tool.create.frame', handleCreate);
}
