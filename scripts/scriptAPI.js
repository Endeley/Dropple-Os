export function createScriptAPI({ dispatcher, getState }) {
    return Object.freeze({
        emit(event) {
            dispatcher.dispatch(event);
        },

        getSelection() {
            return getState()?.selection ?? [];
        },

        getNodes(ids) {
            const nodes = getState()?.nodes || {};
            return ids.map((id) => nodes[id]).filter(Boolean);
        },
    });
}
