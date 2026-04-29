import { getDesignStateAtCursor } from '@/core/persistence/index.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { bootWorkspaceDocument } from '@/runtime/workspaces/index.js';
import { initialRuntimeState } from '@/runtime/state/runtimeState.internal.js';

export function hydrateRuntimeSnapshot({
    dispatcher,
    snapshot,
    animate = false,
    workspace,
    mode,
} = {}) {
    const explicitRuntimeSnapshot =
        snapshot?.runtimeSnapshot &&
        typeof snapshot.runtimeSnapshot === 'object'
            ? snapshot.runtimeSnapshot
            : null;
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

    const replayedRuntimeSnapshot = explicitRuntimeSnapshot
        ? null
        : getDesignStateAtCursor({
              events,
              uptoIndex: cursorIndex,
          });
    const runtimeSnapshot =
        explicitRuntimeSnapshot ??
        replayedRuntimeSnapshot ??
        initialRuntimeState;

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
