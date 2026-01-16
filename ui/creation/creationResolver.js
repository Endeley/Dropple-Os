import { canvasBus } from '@/ui/canvasBus';

/**
 * Central resolver for creation intent.
 * Does NOT create nodes directly.
 * Routes intent based on mode / defaults.
 */
export function registerCreationResolver({ getMode }) {
  const handleIntent = (intent) => {
    const mode = getMode?.() ?? 'graphic';

    switch (mode) {
      case 'ui':
        canvasBus.emit('tool.create.frame', intent);
        break;
      case 'animation':
        canvasBus.emit('tool.create.layer', intent);
        break;
      case 'graphic':
      default:
        canvasBus.emit('tool.create.shape', intent);
        break;
    }
  };

  return canvasBus.on('intent.create', handleIntent);
}
