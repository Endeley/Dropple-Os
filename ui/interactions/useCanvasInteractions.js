import { useMemo, useRef, useCallback } from 'react';
import { createInteractionSession } from './interactionSession.js';
import { createToolController, resolveSessionNodeIds } from './toolController.js';
import { hitTestNode, getNodeRect, pointInRect } from './hitTestNode.js';
import { canvasBus } from '@/ui/eventBus/canvasBus.js';
import { handleInputEvent } from '@/ui/bridges/inputEngineFacade.js';
import {
  beginSession,
  endSession,
  getActiveSessionType,
  resolveToolHandler,
  updatePointer,
} from '@/ui/bridges/inputSessionRuntimeFacade.js';
import { clearSelection, selectNode } from '@/ui/bridges/selectionRuntimeFacade.js';
import { TOOL_DEFINITION_BY_ID } from '@/ui/tools/toolDefinitions.js';

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

  const handleLegacyPointerInput = useCallback((input, context) => {
    const e = input.event;
    const worldPoint = input.worldPoint;
    const toolId = context.tool ?? (typeof getActiveToolId === 'function' ? getActiveToolId() : 'select');
    const dispatchEvent =
      typeof dispatch === 'function'
        ? dispatch
        : typeof context.dispatcher?.dispatch === 'function'
          ? context.dispatcher.dispatch.bind(context.dispatcher)
          : null;

    if (input.type === 'pointerdown') {
      if (toolId === 'move' || toolId === 'resize' || toolId === 'rotate') {
        const runtimeState = context.state ?? getRuntimeState();
        let hit = hitTestNode(runtimeState, worldPoint);
        if (!hit?.id) {
          if (toolId === 'move' && typeof dispatchEvent === 'function') {
            dispatchEvent(clearSelection());
          }
          return null;
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

        const selectionIds = Array.from(runtimeState?.selection?.ids ?? []);
        const nodeIds = resolveSessionNodeIds(selectionIds, hit.id);

        if (typeof dispatchEvent === 'function' && !selectionIds.includes(hit.id)) {
          dispatchEvent(selectNode(hit.id));
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
            return intent;
          }

          if (intent && typeof dispatchEvent === 'function') {
            dispatchEvent(intent);
            return intent;
          }
        }
      }

      controller.onPointerDown(sessionRef.current, worldPoint, input.pointerId, toolId, {
        additive: e.shiftKey,
      });
      return null;
    }

    if (input.type === 'pointermove') {
      const active = getActiveSessionType();
      if (active === 'move' || active === 'resize' || active === 'rotate') {
        updatePointer({ pointer: worldPoint });
        return null;
      }
      controller.onPointerMove(sessionRef.current, worldPoint);
      return null;
    }

    if (input.type === 'pointerup') {
      const active = getActiveSessionType();
      if (active === 'move' || active === 'resize' || active === 'rotate') {
        const event = endSession({ reason: 'pointerUp' });
        if (event) canvasBus.emit('session.commit', event);
        return event;
      }
      controller.onPointerUp(sessionRef.current);
    }

    return null;
  }, [controller, dispatch, getActiveToolId, getRuntimeState]);

  const routePointerInput = useCallback((type, e) => {
    const worldPoint = toWorldPoint(e);
    return handleInputEvent(
      {
        type,
        event: e,
        pointerId: e.pointerId,
        worldPoint,
      },
      {
        fallbackHandler: handleLegacyPointerInput,
      },
    );
  }, [handleLegacyPointerInput, toWorldPoint]);

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

  return { onPointerDown, onPointerMove, onPointerUp, sessionRef };
}
