import { getPreview } from '@/runtime/interactions/input/inputSessionManager.js';

export function collectInput(context) {
  const input = context.input || {};

  return {
    ...context,
    input: {
      ...input,
      sessionPreview: getPreview(),
    },
  };
}
