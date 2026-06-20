import {
  VIEWPORT_SET,
  VIEWPORT_PAN,
  VIEWPORT_ZOOM,
} from '../viewportEvents.js';
import { EventTypes } from '../eventTypes.js';
import { clampZoom } from '@/core/viewport/cameraPolicy.js';

export function viewportReducer(state, event) {
  const workspace = state.workspace || {};
  const vp = workspace.viewport || { x: 0, y: 0, scale: 1 };

  switch (event.type) {
    case VIEWPORT_SET:
    case EventTypes.WORKSPACE_SET_VIEWPORT: {
      const next = { ...vp, ...(event.payload || {}) };
      if (typeof next.scale === 'number') {
        next.scale = clampZoom(next.scale);
      }
      return {
        ...state,
        workspace: {
          ...workspace,
          viewport: next,
        },
      };
    }

    case VIEWPORT_PAN:
      return {
        ...state,
        workspace: {
          ...workspace,
          viewport: {
            ...vp,
            x: vp.x + (event.payload?.dx ?? 0),
            y: vp.y + (event.payload?.dy ?? 0),
          },
        },
      };

    case VIEWPORT_ZOOM: {
      const scale = clampZoom(vp.scale * (event.payload?.scale ?? 1));
      let x = vp.x;
      let y = vp.y;

      const anchor = event.payload?.anchor;
      if (anchor && Number.isFinite(anchor.x) && Number.isFinite(anchor.y)) {
        const screenX = (anchor.x - vp.x) * vp.scale;
        const screenY = (anchor.y - vp.y) * vp.scale;
        x = anchor.x - screenX / scale;
        y = anchor.y - screenY / scale;
      }

      return {
        ...state,
        workspace: {
          ...workspace,
          viewport: {
            ...vp,
            x,
            y,
            scale,
          },
        },
      };
    }

    default:
      return state;
  }
}
