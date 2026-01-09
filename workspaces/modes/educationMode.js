import { createModeAdapter } from './ModeAdapter';

export const EducationMode = createModeAdapter({
  id: 'education',
  label: 'Education',
  capabilities: {
    canvas: true,
    spatial: true,
    timeline: true,
    education: true,
    editing: false,
  },
  renderer: {
    stage: 'CanvasStage',
    overlays: ['education'],
  },
  reducers: [],
  interactions: {
    pointer: false,
    keyboard: false,
  },
  panels: {
    left: ['LessonOutlinePanel'],
    right: ['EducationInspector', 'EducationTimelinePanel'],
    top: ['EducationToolbar'],
    bottom: ['TimelineBar'],
  },
  preview: {
    lockEditing: true,
  },
});
