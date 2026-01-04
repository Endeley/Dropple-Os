import { MessageBus } from '@/core/messageBus';

// Single shared bus for canvas interactions.
export const canvasBus = new MessageBus();
