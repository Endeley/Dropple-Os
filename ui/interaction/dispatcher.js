/**
 * ⚠️ LEGACY DISPATCHER ADAPTER (DEPRECATED)
 *
 * This file exists ONLY for backward compatibility.
 *
 * ❌ It MUST NOT create dispatchers
 * ❌ It MUST NOT own dispatcher lifecycle
 *
 * ✅ The dispatcher is created in WorkspaceRoot
 * ✅ New code MUST use useDispatcher() from workspace context
 *
 * Planned removal: after all legacy callsites are migrated
 * See architecture.md → Dispatcher Architecture (LOCKED)
 */

let _dispatcher = null;

/**
 * Attach the authoritative dispatcher instance.
 * Called exactly once during workspace/session bootstrap.
 */
export function attachDispatcher(dispatcher) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      '[DEPRECATED] ui/interaction/dispatcher adapter is deprecated.\n' +
        'Use useDispatcher() from WorkspaceRoot instead.'
    );
  }

  if (!dispatcher) {
    throw new Error(
      '[UI Dispatcher] attachDispatcher called with invalid dispatcher'
    );
  }

  _dispatcher = dispatcher;
}

export function getDispatcher() {
  if (!_dispatcher) {
    throw new Error(
      '[LegacyDispatcherAdapter] No dispatcher attached. ' +
        'Ensure WorkspaceRoot is mounted.'
    );
  }
  return _dispatcher;
}

/**
 * Dispatch a domain event through the authoritative dispatcher.
 */
export function dispatch(event) {
  if (!_dispatcher) {
    throw new Error(
      '[UI Dispatcher] No dispatcher attached. ' +
        'Workspace/session bootstrap must attach a dispatcher before UI usage.'
    );
  }

  return _dispatcher.dispatch(event);
}

/**
 * Undo the last committed event.
 */
export function undo() {
  if (!_dispatcher) {
    throw new Error('[UI Dispatcher] No dispatcher attached');
  }

  return _dispatcher.undo();
}

/**
 * Redo the last undone event.
 */
export function redo() {
  if (!_dispatcher) {
    throw new Error('[UI Dispatcher] No dispatcher attached');
  }

  return _dispatcher.redo();
}

/**
 * (Optional) Reset dispatcher state.
 * Useful for workspace teardown or full reload.
 */
export function reset() {
  if (!_dispatcher) return;
  return _dispatcher.reset();
}

/**
 * Legacy adapter for callsites expecting a dispatcher object.
 */
export const dispatcher = {
  dispatch,
  undo,
  redo,
  reset,
  getState() {
    if (!_dispatcher) {
      throw new Error('[UI Dispatcher] No dispatcher attached');
    }
    return _dispatcher.getState?.();
  },
};
