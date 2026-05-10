import { getRuntimeDispatcher } from '@/runtime/dispatcher/dispatcherHandle.js';
import { selectActiveTool } from '@/runtime/selectors/toolSelectors.js';
import { shouldHandleInput } from './inputPolicy.js';
import { getToolHandler, getToolHandlerFamily } from '@/runtime/tools/toolController.js';
import { getCoreToolHandler } from './coreToolHandlers.js';
import { isApprovedToolHandlerFamily } from '@/runtime/tools/interpretToolSpec.js';

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

    const resolvedHandler =
        typeof options.resolveToolHandler === 'function'
            ? options.resolveToolHandler(tool)
            : null;
    const registeredHandler = getToolHandler(tool);
    const registeredFamily = getToolHandlerFamily(tool);
    const boundedRegisteredHandler = isApprovedToolHandlerFamily(registeredFamily)
        ? registeredHandler
        : null;
    const handler = resolvedHandler ?? boundedRegisteredHandler ?? getCoreToolHandler(tool);

    let result = null;

    if (typeof handler !== 'function') {
        if (process.env.NODE_ENV === 'development') {
            console.warn('[InputEngine] Missing handler for tool:', tool);
        }
    } else {
        result = handler(input, context);
        if (isHandledResult(result)) return result;
    }

    const fallbackResult =
        typeof options.fallbackHandler === 'function'
            ? options.fallbackHandler(input, context)
            : null;

    return isHandledResult(fallbackResult) ? fallbackResult : null;
}
