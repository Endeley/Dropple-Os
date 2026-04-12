export function applyMergedLog(events, dispatcher) {
    events.forEach((evt) => {
        dispatcher.dispatch({
            type: evt.type,
            payload: evt.payload,
        });
    });
}
