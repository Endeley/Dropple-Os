import { createModeAdapter } from './ModeAdapter';

export const DesignMode = createModeAdapter({
  id: 'design',
  label: 'Design',
  capabilities: {
    layout: true,
  },
  panels: {
    left: ['LayersPanel', 'AssetsPanel'],
    right: ['InspectorPanel', 'AutoLayoutPanel'],
  },
  renderer: {
    stage: 'CanvasStage',
  },
});
