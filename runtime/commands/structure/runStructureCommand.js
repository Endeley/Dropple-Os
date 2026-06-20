import { canRunWorkspaceCommand } from '@/ui/capabilities/workspaceCapabilities.js';
import { getNodes } from '@/runtime/document/documentAdapter.js';
import { groupSelection } from '@/runtime/grouping/groupSelection.js';
import { ungroupSelection } from '@/runtime/grouping/ungroupSelection.js';

const __DEV__ = process.env.NODE_ENV !== 'production';

function devGroupDebug(stage, details = {}) {
    if (!__DEV__) return;
    globalThis.__lastGroupCommandDebug = {
        stage,
        details,
    };
    console.groupCollapsed(`%c[GroupCommand] ${stage}`, 'color:#2563eb;font-weight:600');
    Object.entries(details).forEach(([key, value]) => {
        console.log(`${key}:`, value);
    });
    console.groupEnd();
}

function logGroupPostCommit({ dispatcher, selectedIds = [] }) {
    if (!__DEV__) return;

    const nextState = dispatcher?.getState?.();
    const nodes = getNodes(nextState);
    const selectionIds = Array.from(nextState?.selection?.ids ?? []).filter(Boolean);
    const primary = nextState?.selection?.primary ?? null;
    const primaryNode = primary ? nodes?.[primary] ?? null : null;

    devGroupDebug('post-commit', {
        selectionIds,
        primary,
        primaryNodeType: primaryNode?.type ?? null,
        primaryNode,
        childParents: selectedIds.map((id) => ({
            id,
            parentId: nodes?.[id]?.parentId ?? null,
        })),
        rootIds: nextState?.document?.sceneGraph?.rootIds ?? [],
    });
}

function resolveWorkspaceCommandTarget(runtimeState, workspaceId = null, modeId = null) {
    return (
        modeId ??
        runtimeState?.workspace?.modeId ??
        workspaceId ??
        runtimeState?.workspace?.id ??
        runtimeState?.workspaceId ??
        'graphic'
    );
}

export function runStructureCommand({
    commandId,
    dispatcher,
    payload = {},
    workspaceId = null,
    modeId = null,
}) {
    const runtimeState = dispatcher?.getState?.();
    if (!runtimeState || typeof dispatcher?.dispatch !== 'function') return null;

    const commandTarget = resolveWorkspaceCommandTarget(runtimeState, workspaceId, modeId);
    if (!canRunWorkspaceCommand(commandTarget, commandId)) {
        devGroupDebug('aborted: capability gate', {
            commandId,
            commandTarget,
            workspaceId,
            modeId,
            runtimeWorkspace: runtimeState?.workspace ?? null,
        });
        return null;
    }

    const payloadSelectedIds = Array.isArray(payload?.nodeIds) ? payload.nodeIds.filter(Boolean) : null;
    const selectedIds = payloadSelectedIds ?? Array.from(runtimeState?.selection?.ids ?? []).filter(Boolean);
    const nodes = getNodes(runtimeState);

    if (commandId === 'group') {
        if (selectedIds.length < 2) {
            devGroupDebug('aborted: insufficient selection', {
                selectedIds,
                selectionCount: selectedIds.length,
            });
            return null;
        }

        const parentIds = selectedIds.map((id) => nodes[id]?.parentId ?? null);
        const sameParent = parentIds.every((id) => id === parentIds[0]);
        if (!sameParent) {
            devGroupDebug('aborted: mixed parents', {
                selectedIds,
                parentIds,
                sameParent,
            });
            return null;
        }

        const result = groupSelection(selectedIds, dispatcher);

        devGroupDebug(result ? 'committed' : 'aborted: groupSelection returned null', {
            selectedIds,
            parentIds,
            sameParent,
            result,
        });

        if (result && typeof result.then === 'function') {
            result.then(() => {
                logGroupPostCommit({ dispatcher, selectedIds });
            });
        } else if (result) {
            logGroupPostCommit({ dispatcher, selectedIds });
        }

        return result;
    }

    if (commandId === 'ungroup') {
        const nodeId = selectedIds[0];
        if (!nodeId) {
            devGroupDebug('ungroup aborted: no selected node', {
                selectedIds,
            });
            return null;
        }

        const result = ungroupSelection(nodeId, dispatcher);

        devGroupDebug(result ? 'ungroup committed' : 'ungroup aborted: ungroupSelection returned null', {
            selectedIds,
            nodeId,
            result,
        });

        return result;
    }

    return null;
}
