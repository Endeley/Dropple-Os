import { canvasBus } from '../eventBus/canvasBus.js';
import { canRunWorkspaceCommand } from '@/ui/capabilities/workspaceCapabilities.js';
import { wrapSelection } from '@/runtime/commands/structure/wrapSelection.js';
import { unwrapNodeCommand } from '@/runtime/commands/structure/unwrapNode.js';
import { registerGraphIntentBridge } from './graphIntentBridge.js';
import { getNodes } from '@/runtime/document/documentAdapter.js';

let registered = false;

function buildCommandRuntimeState(runtimeState, selectedIds) {
    return {
        ...runtimeState,
        selection: {
            ids: new Set(selectedIds),
            primary: selectedIds[0] ?? null,
        },
    };
}

function runCommand(commandId, dispatcher) {
    const runtimeState = dispatcher?.getState?.();
    const dispatch = dispatcher?.dispatch?.bind(dispatcher);

    if (!runtimeState || typeof dispatch !== 'function') return null;

    const workspaceId =
        runtimeState?.workspace?.modeId ??
        runtimeState?.workspace?.id ??
        runtimeState?.workspaceId ??
        'graphic';

    if (!canRunWorkspaceCommand(workspaceId, commandId)) {
        return null;
    }

    const selectedIds = Array.from(runtimeState?.selection?.ids ?? []).filter(Boolean);
    const nodes = getNodes(runtimeState);

    if (commandId === 'group') {
        if (selectedIds.length < 2) return null;

        const parentIds = selectedIds.map((id) => nodes[id]?.parentId ?? null);
        const parentId = parentIds[0] ?? null;
        const sameParent = parentIds.every((id) => id === parentId);
        if (!sameParent) return null;

        return wrapSelection({
            runtimeState: buildCommandRuntimeState(runtimeState, selectedIds),
            nodeIds: selectedIds,
            wrapperNode: {
                id: `group_${crypto.randomUUID()}`,
                type: 'group',
            },
            parentId,
            dispatch,
        });
    }

    if (commandId === 'ungroup') {
        const nodeId = selectedIds[0];
        if (!nodeId) return null;

        return unwrapNodeCommand({
            runtimeState: buildCommandRuntimeState(runtimeState, selectedIds),
            nodeId,
            dispatch,
        });
    }

    return null;
}

export function registerCommandIntentBridge(dispatcher) {
    if (registered) return () => {};
    registered = true;

    const onRunCommand = (payload) => {
        const commandId = payload?.commandId ?? null;
        if (!commandId) return null;
        return runCommand(commandId, dispatcher);
    };

    canvasBus.on('intent.command.run', onRunCommand);
    const disposeGraphBridge = registerGraphIntentBridge(dispatcher);

    return () => {
      canvasBus.off('intent.command.run', onRunCommand);
      disposeGraphBridge?.();
      registered = false;
    };
}
