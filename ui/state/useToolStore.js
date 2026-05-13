import { useWorkspaceProjectionState as useRuntimeStore } from '@/runtime/projection';

const EMPTY_OBJECT = Object.freeze({});
const EMPTY_ARRAY = Object.freeze([]);
const DEFAULT_TOOLS = Object.freeze({
    activeTool: 'select',
    visibleTools: EMPTY_ARRAY,
    visibleToolDefinitions: EMPTY_OBJECT,
});

export function useToolStore(selector) {
    return useRuntimeStore((state) => {
        const tools = state.tools ?? DEFAULT_TOOLS;
        return typeof selector === 'function' ? selector(tools) : tools;
    });
}
