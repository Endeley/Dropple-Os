import { createModeAdapter } from './ModeAdapter';

export const WriterMode = createModeAdapter({
  id: 'writer',
  label: 'Writer',
  capabilities: { text: true },
});
