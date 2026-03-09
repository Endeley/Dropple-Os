import { hitTestNode, getNodeRect } from './hitTestNode.js';
import {
  SELECTION_SET,
  SELECTION_ADD,
  SELECTION_CLEAR,
} from '@/core/events/selectionEvents.js';
import { canRunWorkspaceCommand } from '@/ui/capabilities/workspaceCapabilities';
import { getSceneGraph } from '@/runtime/document/documentAdapter';
import { wrapSelection } from '@/runtime/commands/structure/wrapSelection';
import { unwrapNodeCommand } from '@/runtime/commands/structure/unwrapNode';

function buildCommandRuntimeState(runtimeState, selectedIds) {
  return {
    ...runtimeState,
    selection: {
      ids: selectedIds,
    },
  };
}

export function runToolCommand({ commandId, getRuntimeState, dispatch }) {
  if (typeof getRuntimeState !== 'function') return null;
  if (typeof dispatch !== 'function') return null;

  const runtimeState = getRuntimeState();
  const workspaceId =
    runtimeState?.workspace?.id ??
    runtimeState?.workspaceId ??
    'graphic';
  const selectedIds = Array.isArray(runtimeState?.selection?.ids)
    ? runtimeState.selection.ids.filter(Boolean)
    : [];
  const graph = getSceneGraph(runtimeState);
  const nodes = graph?.nodes || runtimeState?.nodes || {};

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

      const hit = hitTestNode(runtimeState, worldPoint);
      session.hitNodeId = hit?.id || null;

      session.selectionBox = null;

      if (session.hitNodeId) {
        if (options.additive) {
          dispatch({
            type: SELECTION_ADD,
            payload: { id: session.hitNodeId },
          });
        } else {
          dispatch({
            type: SELECTION_SET,
            payload: { ids: [session.hitNodeId] },
          });
        }
      } else {
        dispatch({
          type: SELECTION_CLEAR,
        });
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
        const minX = Math.min(box.startX, box.endX);
        const minY = Math.min(box.startY, box.endY);
        const maxX = Math.max(box.startX, box.endX);
        const maxY = Math.max(box.startY, box.endY);

        const runtimeState = getRuntimeState();
        const nodes = Object.values(runtimeState?.nodes || {});
        const selected = [];

        for (const node of nodes) {
          const rect = getNodeRect(node);
          if (rect.width <= 0 || rect.height <= 0) continue;
          const intersects = !(
            rect.x > maxX ||
            rect.x + rect.width < minX ||
            rect.y > maxY ||
            rect.y + rect.height < minY
          );
          if (intersects) selected.push(node.id);
        }

        if (selected.length) {
          dispatch({
            type: SELECTION_SET,
            payload: { ids: selected },
          });
        } else {
          dispatch({ type: SELECTION_CLEAR });
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
      return runToolCommand({ commandId, getRuntimeState, dispatch });
    },

    group() {
      return runToolCommand({ commandId: 'group', getRuntimeState, dispatch });
    },

    ungroup() {
      return runToolCommand({ commandId: 'ungroup', getRuntimeState, dispatch });
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
