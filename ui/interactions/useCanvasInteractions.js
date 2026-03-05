import { useMemo, useRef, useCallback } from 'react';
import { createInteractionSession } from './interactionSession.js';
import { createToolController } from './toolController.js';
import { hitTestNode } from './hitTestNode.js';
import { canvasBus } from '@/ui/eventBus/canvasBus.js';
import {
  beginSession,
  updatePointer,
  endSession,
  getActiveSessionType,
} from '@/runtime/interactions/input/inputSessionManager.js';

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

    if (toolId === 'resize') {
      const worldPoint = toWorldPoint(e);
      const hit = hitTestNode(getRuntimeState(), worldPoint);
      if (!hit?.id) return;
      beginSession({
        type: 'resize',
        payload: {
          nodeId: hit.id,
          handleId: 'se',
          pointerWorld: worldPoint,
        },
      });
      return;
    }

    controller.onPointerDown(sessionRef.current, toWorldPoint(e), e.pointerId, toolId, {
      additive: e.shiftKey,
    });
  }, [controller, toWorldPoint, getActiveToolId, getRuntimeState]);

  const onPointerMove = useCallback((e) => {
    if (getActiveSessionType() === 'resize') {
      updatePointer({ pointer: toWorldPoint(e) });
      return;
    }
    controller.onPointerMove(sessionRef.current, toWorldPoint(e));
  }, [controller, toWorldPoint]);

  const onPointerUp = useCallback((e) => {
    if (getActiveSessionType() === 'resize') {
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
