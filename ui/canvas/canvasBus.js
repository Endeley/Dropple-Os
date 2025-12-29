import { MessageBus } from '@/core/messageBus';
import { InputSessionManager } from '@/input/InputSessionManager';

// Shared bus and session manager for all canvas-layer components.
export const bus = new MessageBus();
export const sessionManager = new InputSessionManager(bus);
