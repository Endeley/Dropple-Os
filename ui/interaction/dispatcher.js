import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';

// Single shared dispatcher for UI interactions.
export const dispatcher = createEventDispatcher();
