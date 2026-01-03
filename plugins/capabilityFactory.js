import { Permissions } from './pluginPermissions';

/**
 * Derives a minimal capability object from declared permissions.
 * Missing permissions mean the capability bucket is absent entirely.
 */
export function createCapabilities({ permissions = [], bus, dispatcher, getState }) {
    const caps = {};

    // ---- EVENTS ----
    if (permissions.includes(Permissions.EVENTS_EMIT)) {
        caps.events = caps.events || {};
        caps.events.emit = (event) => {
            dispatcher.dispatch(event);
        };
    }

    if (permissions.includes(Permissions.EVENTS_LISTEN)) {
        caps.events = caps.events || {};
        caps.events.on = (type, handler) => bus.on(type, handler);
    }

    // ---- SELECTION ----
    if (permissions.includes(Permissions.SELECTION_READ)) {
        caps.selection = {
            get() {
                return getState().selection ?? [];
            },
        };
    }

    // ---- NODES ----
    if (permissions.includes(Permissions.NODES_READ)) {
        caps.nodes = {
            read(ids) {
                const nodes = getState().nodes;
                return ids.map((id) => nodes[id]).filter(Boolean);
            },
        };
    }

    // ---- UI REGISTRATION ----
    if (permissions.includes(Permissions.UI_REGISTER_TOOL)) {
        caps.ui = caps.ui || {};
        caps.ui.registerTool = (tool) => {
            bus.emit('plugin.tool.register', tool);
        };
    }

    if (permissions.includes(Permissions.UI_REGISTER_PANEL)) {
        caps.ui = caps.ui || {};
        caps.ui.registerPanel = (panel) => {
            bus.emit('plugin.panel.register', panel);
        };
    }

    return Object.freeze(caps);
}
