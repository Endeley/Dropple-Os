import { getDesignStateAtCursor } from '@/core/persistence/index.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { bootWorkspaceDocument } from '@/runtime/workspaces/index.js';

export function hydrateRuntimeSnapshot({
    dispatcher,
    snapshot,
    animate = false,
    workspace,
    mode,
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

    const nextDocument =
        runtimeSnapshot?.document && typeof runtimeSnapshot.document === 'object'
            ? bootWorkspaceDocument({
                  document: runtimeSnapshot.document,
                  workspace,
                  mode,
              })
            : runtimeSnapshot?.document;

    const nextRuntimeSnapshot =
        nextDocument === runtimeSnapshot?.document
            ? runtimeSnapshot
            : {
                  ...runtimeSnapshot,
                  document: nextDocument,
              };

    dispatcher?.hydrateRuntimeState?.(nextRuntimeSnapshot, { animate });

    return {
        events,
        cursorIndex,
        runtimeSnapshot: nextRuntimeSnapshot,
    };
}
