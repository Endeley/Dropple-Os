import { hitTestNode } from './hitTestNode.js';
import { canRunWorkspaceCommand } from '@/ui/capabilities/workspaceCapabilities';
import {
  clearSelection,
  getSceneGraph,
  getNodes,
  hitTestPoint,
  selectBounds,
  selectNode,
  toggleNode,
  unwrapNodeCommand,
  wrapSelection,
} from '@/ui/bridges/selectionRuntimeFacade.js';

function buildCommandRuntimeState(runtimeState, selectedIds) {
  return {
    ...runtimeState,
    selection: {
      ids: new Set(selectedIds),
      primary: selectedIds[0] ?? null,
    },
  };
}

export function executeWorkspaceCommand({ commandId, getRuntimeState, dispatch }) {
  if (typeof getRuntimeState !== 'function') return null;
  if (typeof dispatch !== 'function') return null;

  const runtimeState = getRuntimeState();
  const workspaceId =
    runtimeState?.workspace?.id ??
    runtimeState?.workspaceId ??
    'graphic';
  const selectedIds = Array.from(runtimeState?.selection?.ids ?? []).filter(Boolean);
  const graph = getSceneGraph(runtimeState);
  const nodes = graph?.nodes || getNodes(runtimeState);

  if (!canRunWorkspaceCommand(workspaceId, commandId)) {
    return null;
}

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

export function createToolController({ getRuntimeState, dispatch }) {
  if (typeof getRuntimeState !== 'function') throw new Error('getRuntimeState required');
  if (typeof dispatch !== 'function') throw new Error('dispatch required');

  return {
    onPointerDown(session, worldPoint, pointerId, toolId, options = {}) {
      const runtimeState = getRuntimeState();
      session.active = true;
      session.toolId = toolId || session.toolId || 'select';
      session.pointerId = pointerId;

      session.startWorld = worldPoint;
      session.lastWorld = worldPoint;
      session.previewDelta = { dx: 0, dy: 0 };

      const pointHit = hitTestPoint({
        runtime: runtimeState,
        x: worldPoint.x,
        y: worldPoint.y,
      });
      const fallbackHit = pointHit ? null : hitTestNode(runtimeState, worldPoint);
      session.hitNodeId =
        typeof pointHit === 'string'
          ? pointHit
          : pointHit?.id || fallbackHit?.id || null;

      session.selectionBox = null;

      if (session.hitNodeId) {
        if (options.additive) {
          dispatch(toggleNode(session.hitNodeId));
        } else {
          dispatch(selectNode(session.hitNodeId));
        }
      } else {
        dispatch(clearSelection());
        if (session.toolId === 'select') {
          session.selectionBox = {
            startX: worldPoint.x,
            startY: worldPoint.y,
            endX: worldPoint.x,
            endY: worldPoint.y,
          };
        }
      }
    },

    onPointerMove(session, worldPoint) {
      if (!session.active) return;

      session.lastWorld = worldPoint;

      if (session.selectionBox) {
        session.selectionBox.endX = worldPoint.x;
        session.selectionBox.endY = worldPoint.y;
        return;
      }

      const dx = worldPoint.x - session.startWorld.x;
      const dy = worldPoint.y - session.startWorld.y;
      session.previewDelta = { dx, dy };
    },

    onPointerUp(session) {
      if (!session.active) return;

      const { toolId, hitNodeId, previewDelta } = session;

      if (session.selectionBox) {
        const box = session.selectionBox;
        const runtimeState = getRuntimeState();
        const event = selectBounds(runtimeState, {
          x: Math.min(box.startX, box.endX),
          y: Math.min(box.startY, box.endY),
          width: Math.abs(box.endX - box.startX),
          height: Math.abs(box.endY - box.startY),
        });

        if (event.payload.ids.length) {
          dispatch(event);
        } else {
          dispatch(clearSelection());
        }
      }

      if (toolId === 'move' && hitNodeId && (previewDelta.dx !== 0 || previewDelta.dy !== 0)) {
        dispatch({
          type: 'node/move',
          payload: { id: hitNodeId, dx: previewDelta.dx, dy: previewDelta.dy },
        });
      }

      session.active = false;
      session.pointerId = null;
      session.startWorld = null;
      session.lastWorld = null;
      session.hitNodeId = null;
      session.previewDelta = { dx: 0, dy: 0 };
      session.selectionBox = null;
    },

    runCommand(commandId) {
      return executeWorkspaceCommand({ commandId, getRuntimeState, dispatch });
    },

    group() {
      return executeWorkspaceCommand({ commandId: 'group', getRuntimeState, dispatch });
    },

    ungroup() {
      return executeWorkspaceCommand({ commandId: 'ungroup', getRuntimeState, dispatch });
    },
  };
}

export function resolveSessionNodeIds(selectionIds, targetNodeId) {
  const ids = Array.isArray(selectionIds) ? selectionIds : [];
  if (targetNodeId && ids.includes(targetNodeId)) {
    return ids;
  }
  return targetNodeId ? [targetNodeId] : [];
}
