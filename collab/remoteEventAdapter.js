export function applyRemoteEvent(event, dispatcher) {
    // 🔐 trust only valid events
    if (!event?.type) return;

    dispatcher.dispatch(event);
}
