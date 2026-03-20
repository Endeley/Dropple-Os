import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import {
    selectActiveTool,
    selectVisibleTools,
} from '@/runtime/selectors/toolSelectors.js';

export function useToolStore(selector) {
    const runtimeProjection = useRuntimeStore((state) => ({
        activeTool: selectActiveTool(state),
        visibleTools: selectVisibleTools(state),
    }));

    return typeof selector === 'function' ? selector(runtimeProjection) : runtimeProjection;
}
