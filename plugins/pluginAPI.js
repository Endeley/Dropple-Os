export function createPluginAPI({ bus, dispatcher, getState }) {
    return Object.freeze({
        on(eventType, handler) {
            return bus.on(eventType, handler);
        },

        dispatch(event) {
            dispatcher.dispatch(event);
        },

        getState() {
            return getState();
        },

        registerTool(tool) {
            bus.emit('plugin.tool.register', tool);
        },

        registerPanel(panel) {
            bus.emit('plugin.panel.register', panel);
        },
    });
}
