// design/canvas/tools/registerDefineTransitionTool.js
// Emits intent only. No mutation. No ID generation.

export function registerDefineTransitionTool(register) {
    if (typeof register !== 'function') return;
    register({
        id: 'tool.behavior.defineTransition',
        label: 'Define Transition',
        onIntent(dispatch, payload) {
            dispatch({
                type: 'behavior/transition/define',
                payload,
            });
        },
    });
}

