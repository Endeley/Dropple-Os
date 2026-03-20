import { getRuntimeDispatcher } from '@/runtime/dispatcher/dispatcherHandle.js';
import { selectActiveTool } from '@/runtime/selectors/toolSelectors.js';
import { shouldHandleInput } from './inputPolicy.js';
import { getToolHandler } from '@/runtime/tools/toolController.js';

export function isHandledResult(result) {
    return Boolean(result && typeof result === 'object' && result.handled === true);
}

export function handleInputEvent(input, options = {}) {
    const dispatcher = options.dispatcher ?? getRuntimeDispatcher();
    const state = options.state ?? dispatcher?.getState?.();
    const tool = options.tool ?? selectActiveTool(state);

    if (!tool) return null;
    if (!shouldHandleInput({ input, state, tool })) return null;

    const context = {
        dispatcher,
        state,
        tool,
        ...(options.context ?? {}),
    };

    const handler =
        (typeof options.resolveToolHandler === 'function'
            ? options.resolveToolHandler(tool)
            : null) ?? getToolHandler(tool);

    let result = null;

    if (typeof handler === 'function') {
        result = handler(input, context);
        if (isHandledResult(result)) {
            if (process.env.NODE_ENV === 'development') {
                console.debug('[InputEngine]', {
                    input,
                    tool,
                    handled: true,
                });
            }
            return result;
        }
    }

    const fallbackResult =
        typeof options.fallbackHandler === 'function'
            ? options.fallbackHandler(input, context)
            : null;

    if (process.env.NODE_ENV === 'development') {
        console.debug('[InputEngine]', {
            input,
            tool,
            handled: isHandledResult(fallbackResult),
        });
    }

    return isHandledResult(fallbackResult) ? fallbackResult : null;
}
