import { createModeAdapter } from './ModeAdapter';

export const ReviewMode = createModeAdapter({
  id: 'review',
  label: 'Review',
  capabilities: {
    canvas: true,
    spatial: true,
    timeline: true,
    editing: false,
    annotations: true,
  },
  renderer: {
    stage: 'CanvasStage',
    overlays: ['rulers', 'guides', 'measurements'],
  },
  interactions: {
    pointer: false,
    keyboard: false,
  },
  panels: {
    left: ['SubmissionInfoPanel'],
    right: ['RubricPanel'],
    top: ['ReviewToolbar'],
    bottom: ['TimelineBar'],
  },
});
