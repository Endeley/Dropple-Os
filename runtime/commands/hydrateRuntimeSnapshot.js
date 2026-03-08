import { getDesignStateAtCursor } from '@/runtime/replay/getDesignStateAtCursor.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';

export function hydrateRuntimeSnapshot({
    dispatcher,
    snapshot,
    animate = false,
} = {}) {
    const events = Array.isArray(snapshot?.events) ? snapshot.events : [];
    const maxIndex = events.length - 1;
    const cursorIndex = Math.max(
        -1,
        Math.min(maxIndex, snapshot?.cursorIndex ?? maxIndex)
    );

    useRuntimeStore.setState({
        events,
        cursorIndex,
    });

    const runtimeSnapshot = getDesignStateAtCursor({
        events,
        uptoIndex: cursorIndex,
    });

    dispatcher?.hydrateRuntimeState?.(runtimeSnapshot, { animate });

    return {
        events,
        cursorIndex,
        runtimeSnapshot,
    };
}
