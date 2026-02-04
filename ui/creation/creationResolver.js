import { canvasBus } from '@/ui/canvasBus';

/**
 * Central resolver for creation intent.
 * Does NOT create nodes directly.
 * Routes intent based on mode / defaults.
 */
export function registerCreationResolver({ getMode }) {
    const handleIntent = (intent) => {
        const mode = getMode?.() ?? 'graphic';

        let type = 'shape';
        if (mode === 'uiux') type = 'frame';
        if (mode === 'animation') type = 'layer';

        canvasBus.emit('intent.node.create', {
            type,
            position: intent?.position ?? { x: 0, y: 0 },
            bounds: intent?.bounds ?? null,
        });
    };

    return canvasBus.on('intent.create', handleIntent);
}
