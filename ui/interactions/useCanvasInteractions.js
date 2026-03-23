import { useCallback, useRef } from 'react';
import { handleInputEvent } from '@/ui/bridges/inputEngineFacade.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { TOOL_DEFINITION_BY_ID } from '@/ui/tools/toolDefinitions';
import { nodeCreateIntent } from '@/ui/creation/nodeCreateIntent';
import { resolveTargetNodeId } from '@/ui/interactions/resolveTargetNodeId.js';

export function useCanvasInteractions({ getActiveToolId, getWorldPointFromEvent, getDefaultParentId }) {
  const createSessionRef = useRef(null);

  const toWorldPoint = useCallback((e) => {
    if (typeof getWorldPointFromEvent === 'function') {
      return getWorldPointFromEvent(e);
    }
    return { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
  }, [getWorldPointFromEvent]);

  const routePointerInput = useCallback((type, e) => {
    const worldPoint = toWorldPoint(e);
    const tool = typeof getActiveToolId === 'function' ? getActiveToolId(e) : 'select';
    const targetNodeId = resolveTargetNodeId(e.target, {
      x: e.clientX,
      y: e.clientY,
    });

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
    if (e.defaultPrevented) return;
    e.stopPropagation();

    const worldPoint = toWorldPoint(e);
    const tool = typeof getActiveToolId === 'function' ? getActiveToolId(e) : 'select';
    const toolDef = TOOL_DEFINITION_BY_ID[tool];
    const targetNodeId = resolveTargetNodeId(e.target, {
      x: e.clientX,
      y: e.clientY,
    });

    if (toolDef?.createsNode && !targetNodeId) {
      createSessionRef.current = {
        tool,
        nodeType: toolDef.nodeType,
        start: worldPoint,
        current: worldPoint,
      };
      e.currentTarget.setPointerCapture?.(e.pointerId);
      return;
    }

    e.currentTarget.setPointerCapture?.(e.pointerId);
    routePointerInput('pointerdown', e);
  }, [getActiveToolId, routePointerInput, toWorldPoint]);

  const onPointerMove = useCallback((e) => {
    if (e.defaultPrevented) return;
    e.stopPropagation();

    if (createSessionRef.current) {
      createSessionRef.current = {
        ...createSessionRef.current,
        current: toWorldPoint(e),
      };
      return;
    }

    routePointerInput('pointermove', e);
  }, [routePointerInput, toWorldPoint]);

  const onPointerUp = useCallback((e) => {
    if (e.defaultPrevented) return;
    e.stopPropagation();

    if (createSessionRef.current) {
      const { start, current, nodeType, tool } = createSessionRef.current;
      const width = Math.abs(current.x - start.x);
      const height = Math.abs(current.y - start.y);

      if (width > 6 && height > 6) {
        const bounds = {
          x: Math.min(start.x, current.x),
          y: Math.min(start.y, current.y),
          width,
          height,
        };
        const parentId = typeof getDefaultParentId === 'function' ? getDefaultParentId() : null;

        const handled = handleInputEvent(
          {
            type: EventTypes.INPUT_CREATE_COMMIT,
            event: e,
            worldPoint: start,
            bounds,
            nodeType,
            parentId,
          },
          {
            tool,
            fallbackHandler() {
              nodeCreateIntent({
                type: nodeType,
                bounds,
                parentId,
              });
              return { handled: true };
            },
          },
        );

        if (!handled) {
          nodeCreateIntent({
            type: nodeType,
            bounds,
            parentId,
          });
        }
      }

      createSessionRef.current = null;
      e.currentTarget.releasePointerCapture?.(e.pointerId);
      return;
    }

    routePointerInput('pointerup', e);
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  }, [getDefaultParentId, routePointerInput]);

  const onPointerCancel = useCallback((e) => {
    if (!e.defaultPrevented) {
      e.stopPropagation();
    }

    if (!createSessionRef.current) {
      routePointerInput('pointercancel', e);
    }

    createSessionRef.current = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  }, [routePointerInput]);

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel };
}
