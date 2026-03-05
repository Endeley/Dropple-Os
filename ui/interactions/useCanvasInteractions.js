import { useMemo, useRef, useCallback } from 'react';
import { createInteractionSession } from './interactionSession.js';
import { createToolController } from './toolController.js';

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
    controller.onPointerDown(sessionRef.current, toWorldPoint(e), e.pointerId, toolId, {
      additive: e.shiftKey,
    });
  }, [controller, toWorldPoint, getActiveToolId]);

  const onPointerMove = useCallback((e) => {
    controller.onPointerMove(sessionRef.current, toWorldPoint(e));
  }, [controller, toWorldPoint]);

  const onPointerUp = useCallback((e) => {
    controller.onPointerUp(sessionRef.current);
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  }, [controller]);

  return { onPointerDown, onPointerMove, onPointerUp, sessionRef };
}
