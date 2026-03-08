import { getRuntimeState } from '@/runtime/state/runtimeState';
import { useAppendRuntimeEvents } from '@/runtime/persistence/appendRuntimeEvents.js';

export function useAppendEventsRuntimeBridge() {
    const appendRuntimeEvents = useAppendRuntimeEvents();

    return async function appendEventsFromRuntime(events) {
        const snapshot = getRuntimeState();
        return appendRuntimeEvents(events, snapshot);
    };
}
