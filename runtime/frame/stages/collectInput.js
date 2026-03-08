import { getPreview } from '@/runtime/interactions/input/InputSessionManager.js';

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
