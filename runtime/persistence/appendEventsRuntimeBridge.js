import { getRuntimeState } from '@/runtime/state/runtimeState';
import { useAppendRuntimeEvents } from '@/persistence/appendRuntimeEvents';

export function useAppendEventsRuntimeBridge() {
    const appendRuntimeEvents = useAppendRuntimeEvents();

    return async function appendEventsFromRuntime(events) {
        const snapshot = getRuntimeState();
        return appendRuntimeEvents(events, snapshot);
    };
}
