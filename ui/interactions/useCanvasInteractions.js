import { useMemo, useRef, useCallback } from 'react';
import { createInteractionSession } from './interactionSession.js';
import { createToolController, resolveSessionNodeIds } from './toolController.js';
import { hitTestNode } from './hitTestNode.js';
import { canvasBus } from '@/ui/eventBus/canvasBus.js';
import {
  beginSession,
  updatePointer,
  endSession,
  getActiveSessionType,
} from '@/runtime/interactions/input/inputSessionManager.js';
import { SELECTION_SET, SELECTION_CLEAR } from '@/core/events/selectionEvents.js';

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
      const hit = hitTestNode(runtimeState, worldPoint);
      if (!hit?.id) {
        if (toolId === 'move' && typeof dispatch === 'function') {
          dispatch({ type: SELECTION_CLEAR });
        }
        return;
      }

      const selectionIds = runtimeState?.selection?.ids || [];
      const nodeIds = resolveSessionNodeIds(selectionIds, hit.id);

      if (typeof dispatch === 'function' && !selectionIds.includes(hit.id)) {
        dispatch({ type: SELECTION_SET, payload: { ids: [hit.id] } });
      }

      if (toolId === 'move') {
        beginSession({
          type: 'move',
          payload: {
            nodeIds,
            startPointer: worldPoint,
          },
        });
        return;
      }

      if (toolId === 'resize') {
        beginSession({
          type: 'resize',
          payload: {
            nodeIds,
            handleId: 'se',
            pointerWorld: worldPoint,
          },
        });
        return;
      }

      if (toolId === 'rotate') {
        beginSession({
          type: 'rotate',
          payload: {
            nodeIds,
            startPointerWorld: worldPoint,
          },
        });
        return;
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
