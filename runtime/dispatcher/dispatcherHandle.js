let _dispatcher = null;

export function setRuntimeDispatcher(dispatcher) {
    _dispatcher = dispatcher || null;
}

export function getRuntimeDispatcher() {
    if (!_dispatcher) {
        throw new Error('[RuntimeDispatcher] No dispatcher available');
    }
    return _dispatcher;
}

export const setDispatcher = setRuntimeDispatcher;
export const getDispatcher = getRuntimeDispatcher;
