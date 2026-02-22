// design/canvas/tools/registerBindTriggerTool.js
// Emits intent only. No mutation. No ID generation.

export function registerBindTriggerTool(register) {
    if (typeof register !== 'function') return;
    register({
        id: 'tool.behavior.bindTrigger',
        label: 'Bind Trigger',
        onIntent(dispatch, payload) {
            dispatch({
                type: 'behavior/trigger/bind',
                payload,
            });
        },
    });
}

