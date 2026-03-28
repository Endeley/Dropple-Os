import {
  beginSession,
  updatePointer,
  endSession,
  getActiveSessionType,
  getPreview,
} from '@/runtime/interactions/index.js';
import { resolveToolHandler } from '@/runtime/tools/toolHandlers.js';

/**
 * COMPATIBILITY LAYER ONLY
 *
 * Session preview access is non-canonical for canvas authoring. Keep consumers
 * scoped to preview-specific helpers rather than the generic session surface.
 */
export function getReorderPreviewOnly() {
  const preview = getPreview();
  return preview?.type === 'reorder-preview' ? preview : null;
}

export {
  beginSession,
  endSession,
  getActiveSessionType,
  getPreview,
  resolveToolHandler,
  updatePointer,
};
