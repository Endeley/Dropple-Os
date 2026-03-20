import { getRuntimeDispatcher } from '@/runtime/dispatcher/dispatcherHandle.js';
import { selectActiveTool } from '@/runtime/selectors/toolSelectors.js';
import { shouldHandleInput } from './inputPolicy.js';
import { getToolHandler } from '@/runtime/tools/toolController.js';

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

    if (typeof handler === 'function') {
        return handler(input, context);
    }

    return typeof options.fallbackHandler === 'function'
        ? options.fallbackHandler(input, context)
        : null;
}
