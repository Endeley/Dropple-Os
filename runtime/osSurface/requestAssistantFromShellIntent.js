import { requestAssistantAction } from '@/runtime/assistants/requestAssistantAction.js';

export function requestAssistantFromShellIntent({
    dispatcher,
    assistantId,
    assistantAction,
    perspectiveId = null,
    assistantInput = null,
} = {}) {
    return requestAssistantAction({
        dispatcher,
        assistantId,
        action: assistantAction,
        perspectiveId,
        input: assistantInput,
    });
}
