export function getAIRequest(state, requestId) {
    return state?.ai?.requests?.[requestId] ?? null;
}

export function getAIRequests(state) {
    const requests = Object.values(state?.ai?.requests ?? {});
    return requests.sort((a, b) => {
        const byStarted = Number(a?.startedAt ?? 0) - Number(b?.startedAt ?? 0);
        if (byStarted !== 0) return byStarted;
        return String(a?.id ?? '').localeCompare(String(b?.id ?? ''));
    });
}

export function getLatestAIRequest(state) {
    const requests = getAIRequests(state);
    return requests.length ? requests[requests.length - 1] : null;
}
