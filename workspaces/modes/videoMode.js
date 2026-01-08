import { createModeAdapter } from './ModeAdapter';

export const VideoMode = createModeAdapter({
  id: 'video',
  label: 'Video',
  capabilities: { video: true },
});
