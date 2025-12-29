// core/events/eventTypes.js

export const EventTypes = Object.freeze({
    // Node lifecycle
    NODE_CREATE: 'node/create',
    NODE_UPDATE: 'node/update',
    NODE_DELETE: 'node/delete',

    // Tree structure
    NODE_ATTACH: 'node/attach',
    NODE_DETACH: 'node/detach',

    // Layout & transform
    NODE_MOVE: 'node/move',
    NODE_RESIZE: 'node/resize',
    NODE_REORDER: 'node/reorder',

    // Selection (stateful but deterministic)
    SELECTION_SET: 'selection/set',
});
