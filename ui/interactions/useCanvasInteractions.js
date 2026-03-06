import { useMemo, useRef, useCallback } from 'react';
import { createInteractionSession } from './interactionSession.js';
import { createToolController, resolveSessionNodeIds } from './toolController.js';
import { hitTestNode, getNodeRect, pointInRect } from './hitTestNode.js';
import { canvasBus } from '@/ui/eventBus/canvasBus.js';
import {
  beginSession,
  updatePointer,
  endSession,
  getActiveSessionType,
} from '@/runtime/interactions/input/inputSessionManager.js';
import { SELECTION_SET, SELECTION_CLEAR } from '@/core/events/selectionEvents.js';
import { TOOL_DEFINITION_BY_ID } from '@/ui/tools/toolDefinitions.js';
import { resolveToolHandler } from '@/runtime/tools/toolHandlers.js';

export function useCanvasInteractions({ getRuntimeState, dispatch, getActiveToolId, getWorldPointFromEvent }) {
  const sessionRef = useRef(createInteractionSession());

  const controller = useMemo(() => {
    return createToolController({ getRuntimeState, dispatch });
  }, [getRuntimeState, dispatch]);

  const toWorldPoint = useCallback((e) => {
    if (typeof getWorldPointFromEvent === 'function') {
      return getWorldPointFromEvent(e);
    }
    return { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
  }, [getWorldPointFromEvent]);

  const onPointerDown = useCallback((e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const toolId = typeof getActiveToolId === 'function' ? getActiveToolId() : 'select';

    if (toolId === 'move' || toolId === 'resize' || toolId === 'rotate') {
      const worldPoint = toWorldPoint(e);
      const runtimeState = getRuntimeState();
      let hit = hitTestNode(runtimeState, worldPoint);
      if (!hit?.id) {
        if (toolId === 'move' && typeof dispatch === 'function') {
          dispatch({ type: SELECTION_CLEAR });
        }
        return;
      }

      const nodesById = runtimeState?.nodes || {};
      const hitParent = hit.parentId ? nodesById[hit.parentId] : null;
      if (hitParent?.layout?.autoLayout) {
        const parentRect = getNodeRect(hitParent);
        const edge = 6;
        const innerRect = {
          x: parentRect.x + edge,
          y: parentRect.y + edge,
          width: Math.max(0, parentRect.width - edge * 2),
          height: Math.max(0, parentRect.height - edge * 2),
        };
        const onBoundary =
          pointInRect(worldPoint, parentRect) && !pointInRect(worldPoint, innerRect);
        if (onBoundary) {
          hit = hitParent;
        }
      }

      const selectionIds = runtimeState?.selection?.ids || [];
      const nodeIds = resolveSessionNodeIds(selectionIds, hit.id);

      if (typeof dispatch === 'function' && !selectionIds.includes(hit.id)) {
        dispatch({ type: SELECTION_SET, payload: { ids: [hit.id] } });
      }

      const toolDef = TOOL_DEFINITION_BY_ID[toolId] || { id: toolId };
      const handler = resolveToolHandler(toolDef);

      if (typeof handler === 'function') {
        const sessionPayload = {
          nodeIds,
          ...(toolId === 'move' ? { startPointer: worldPoint } : null),
          ...(toolId === 'resize' ? { handleId: 'se', pointerWorld: worldPoint } : null),
          ...(toolId === 'rotate' ? { startPointerWorld: worldPoint } : null),
        };

        const intent = handler(toolDef, {
          sessionType: toolId,
          sessionPayload,
          nodeIds,
          hitNodeId: hit.id,
          selectionIds,
          pointerWorld: worldPoint,
          additive: e.shiftKey,
        });

        if (intent?.type === 'session/start') {
          beginSession({
            type: intent.payload?.sessionType,
            payload: intent.payload?.sessionPayload || {},
          });
          return;
        }

        if (intent && typeof dispatch === 'function') {
          dispatch(intent);
          return;
        }
      }
    }

    controller.onPointerDown(sessionRef.current, toWorldPoint(e), e.pointerId, toolId, {
      additive: e.shiftKey,
    });
  }, [controller, toWorldPoint, getActiveToolId, getRuntimeState, dispatch]);

  const onPointerMove = useCallback((e) => {
    const active = getActiveSessionType();
    if (active === 'move' || active === 'resize' || active === 'rotate') {
      updatePointer({ pointer: toWorldPoint(e) });
      return;
    }
    controller.onPointerMove(sessionRef.current, toWorldPoint(e));
  }, [controller, toWorldPoint]);

  const onPointerUp = useCallback((e) => {
    const active = getActiveSessionType();
    if (active === 'move' || active === 'resize' || active === 'rotate') {
      const event = endSession({ reason: 'pointerUp' });
      if (event) canvasBus.emit('session.commit', event);
      e.currentTarget.releasePointerCapture?.(e.pointerId);
      return;
    }
    controller.onPointerUp(sessionRef.current);
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  }, [controller]);

  return { onPointerDown, onPointerMove, onPointerUp, sessionRef };
}
