import { createModeAdapter } from './ModeAdapter';

export const PodcastMode = createModeAdapter({
  id: 'podcast',
  label: 'Podcast',
  capabilities: { audio: true },
});
