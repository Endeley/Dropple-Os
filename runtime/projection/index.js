/**
 * Projection public surface.
 *
 * NOTE:
 * - `useWorkspaceVisualState` and `useWorkspaceViewState` are the canonical
 *   React-facing projection hooks backed by the projected Zustand mirror.
 * - Legacy `v1/*` APIs are intentionally excluded from this default barrel.
 *   Import them explicitly from `runtime/projection/v1/*` only when required
 *   for compatibility during migration.
 */

export * from './selectors/index.js';
export * from './runtimeBridgeBus.js';
export * from './evaluateTimelinePreview.js';
export * from './projectStateAtTime.js';
export * from './useWorkspaceVisualState.js';
export * from './useWorkspaceViewState.js';
export * from './nonReactProjection.js';
export * from './uxAuditProjection.js';
