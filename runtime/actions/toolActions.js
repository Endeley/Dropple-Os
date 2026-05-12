import { EventTypes } from '@/core/events/eventTypes.js';

export const REGISTER_TOOLS = EventTypes.TOOLS_REGISTER;
export const UNREGISTER_TOOLS = EventTypes.TOOLS_UNREGISTER;
export const SET_ACTIVE_TOOL = EventTypes.TOOL_SET_ACTIVE;

export function registerTools({ source, tools, descriptors, priority }) {
    return {
        type: REGISTER_TOOLS,
        payload: {
            source,
            tools,
            descriptors,
            priority,
        },
    };
}

export function unregisterTools({ source }) {
    return {
        type: UNREGISTER_TOOLS,
        payload: {
            source,
        },
    };
}

export function setActiveTool(tool) {
    return {
        type: SET_ACTIVE_TOOL,
        payload: tool,
    };
}
