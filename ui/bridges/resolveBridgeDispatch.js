export function resolveBridgeDispatch(dispatcherOrDispatch) {
    if (typeof dispatcherOrDispatch === 'function') {
        return dispatcherOrDispatch;
    }

    if (typeof dispatcherOrDispatch?.dispatch === 'function') {
        return dispatcherOrDispatch.dispatch;
    }

    return null;
}
