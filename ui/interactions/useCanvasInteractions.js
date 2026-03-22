import { useCallback } from 'react';
import { handleInputEvent } from '@/ui/bridges/inputEngineFacade.js';

export function useCanvasInteractions({ getActiveToolId, getWorldPointFromEvent }) {
  const toWorldPoint = useCallback((e) => {
    if (typeof getWorldPointFromEvent === 'function') {
      return getWorldPointFromEvent(e);
    }
    return { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
  }, [getWorldPointFromEvent]);

  const routePointerInput = useCallback((type, e) => {
    const worldPoint = toWorldPoint(e);
    const tool = typeof getActiveToolId === 'function' ? getActiveToolId(e) : 'select';
    const targetNodeId =
      e.target instanceof Element
        ? e.target.closest?.('[data-node-id]')?.dataset?.nodeId ?? null
        : null;

    return handleInputEvent(
      {
        type,
        event: e,
        pointerId: e.pointerId,
        worldPoint,
        targetNodeId,
      },
      {
        tool,
      },
    );
  }, [getActiveToolId, toWorldPoint]);

  const onPointerDown = useCallback((e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    routePointerInput('pointerdown', e);
  }, [routePointerInput]);

  const onPointerMove = useCallback((e) => {
    routePointerInput('pointermove', e);
  }, [routePointerInput]);

  const onPointerUp = useCallback((e) => {
    routePointerInput('pointerup', e);
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  }, [routePointerInput]);

  return { onPointerDown, onPointerMove, onPointerUp };
}
