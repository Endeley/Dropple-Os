/**
 * @deprecated Legacy projection entrypoint.
 *
 * New React-facing projection reads should prefer the canonical hooks backed by
 * the projected Zustand mirror:
 * - useWorkspaceVisualState
 * - useWorkspaceViewState
 *
 * Keep this surface only for compatibility while callers are migrated.
 */

export * from './runtimeSnapshot.js';
export * from './workspaceProjection.js';
export * from './selectors.js';
export * from './useWorkspaceProjection.js';
export * from './uxAuditProjection.js';
