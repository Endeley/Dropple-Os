'use client';

import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import {
    selectActiveTool,
    selectVisibleTools,
} from '@/runtime/selectors/toolSelectors.js';

export function useTools() {
    const tools = useRuntimeStore(selectVisibleTools);
    const activeTool = useRuntimeStore(selectActiveTool);

    return {
        tools,
        activeTool,
    };
}
