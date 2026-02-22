// design/canvas/tools/registerCreateStateTool.js
// Emits intent only. No mutation. No ID generation.

export function registerCreateStateTool(register) {
    if (typeof register !== 'function') return;
    register({
        id: 'tool.behavior.createState',
        label: 'Create State',
        onIntent(dispatch, payload) {
            dispatch({
                type: 'behavior/state/create',
                payload,
            });
        },
    });
}

