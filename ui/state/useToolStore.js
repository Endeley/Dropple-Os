import { useWorkspaceProjectionState as useRuntimeStore } from '@/runtime/projection';

export function useToolStore(selector) {
    return useRuntimeStore((state) => {
        const tools = state.tools ?? {
            activeTool: 'select',
            visibleTools: [],
            visibleToolDefinitions: {},
        };
        return typeof selector === 'function' ? selector(tools) : tools;
    });
}
