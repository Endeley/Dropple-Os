import { MessageBus } from '@/core/messageBus';

// CANONICAL MESSAGE BUS
// This is the ONLY message bus allowed in Dropple.
// See architecture.md for rules.
export const canvasBus = new MessageBus();
