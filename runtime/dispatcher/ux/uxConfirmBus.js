const listeners = new Set();
let activeRequest = null;

export function subscribeUXConfirmRequests(listener) {
    listeners.add(listener);
    if (activeRequest) {
        listener({ actionType: activeRequest.actionType });
    }
    return () => listeners.delete(listener);
}

export function requestUXConfirmation({ actionType }) {
    if (activeRequest) return activeRequest.promise;

    let resolveFn;
    const promise = new Promise((resolve) => {
        resolveFn = resolve;
    });

    activeRequest = {
        actionType,
        resolve: resolveFn,
        promise,
    };

    for (const listener of listeners) {
        listener({ actionType });
    }

    return promise.then((confirmed) => {
        if (activeRequest?.promise === promise) {
            activeRequest = null;
        }
        return Boolean(confirmed);
    });
}

export function respondUXConfirmation({ actionType, confirmed }) {
    if (!activeRequest) return;
    if (actionType && activeRequest.actionType !== actionType) return;

    const { resolve } = activeRequest;
    activeRequest = null;
    resolve(Boolean(confirmed));
}
