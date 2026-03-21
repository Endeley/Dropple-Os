import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';

export function useToolStore(selector) {
    return useRuntimeStore((state) => {
        const tools = state.tools ?? { activeTool: 'select', visibleTools: [] };
        return typeof selector === 'function' ? selector(tools) : tools;
    });
}
