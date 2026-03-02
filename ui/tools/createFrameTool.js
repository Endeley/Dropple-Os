import { canvasBus } from '../eventBus/canvasBus.js';
import { nodeCreateIntent } from '@/ui/creation/nodeCreateIntent';

export const CreateFrameTool = {
    id: 'create-frame',
    label: 'Create Frame',
};

/**
 * Frame creation tool (UIUX authoring).
 * Emits intent ONLY.
 * Actual node creation is handled by nodeCreateBridge.
 */
export function registerCreateFrameTool() {
    const handleCreate = ({ bounds }) => {
        if (!bounds) return;

        nodeCreateIntent({
            type: 'frame',
            bounds,
        });

        // Selection will resolve after node is created
        // (selection resolver / reducer handles this later)
    };

    return canvasBus.on('tool.create.frame', handleCreate);
}
