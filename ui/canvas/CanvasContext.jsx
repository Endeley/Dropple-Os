'use client';

import { createContext, useContext, useSyncExternalStore } from 'react';
import {
    selectProjectedVisualState,
    selectWorkspaceViewState,
    workspaceProjectionStore,
} from '@/runtime/projection';
import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore.js';

const EMPTY_SUBSCRIBE = () => () => {};

const CanvasContext = createContext({
    zoomTier: 'normal',
    onResizeHandlePointerDown: null,
    onResizeHandlePointerMove: null,
    onResizeHandlePointerUp: null,
    onRotateHandlePointerDown: null,
    readOnly: false,
    viewStateOverride: null,
    visualStateOverride: null,
    animatedStateOverride: null,
    setCanvasSurface: null,
});

export function CanvasProvider({ value, children }) {
    return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
}

export function useCanvasContext() {
    return useContext(CanvasContext);
}

function useOverrideAwareStoreValue({ override, store, projectState, selector }) {
    return useSyncExternalStore(
        override ? EMPTY_SUBSCRIBE : store.subscribe,
        () => {
            if (override) {
                return selector(override);
            }

            const state = store.getState();
            return selector(projectState ? projectState(state) : state);
        },
        () => {
            if (override) {
                return selector(override);
            }

            const state = store.getState();
            return selector(projectState ? projectState(state) : state);
        },
    );
}

export function useCanvasViewState(selector = (state) => state) {
    const { viewStateOverride } = useCanvasContext();

    return useOverrideAwareStoreValue({
        override: viewStateOverride,
        store: workspaceProjectionStore,
        projectState: selectWorkspaceViewState,
        selector,
    });
}

export function useCanvasVisualState(selector = (state) => state) {
    const { visualStateOverride } = useCanvasContext();

    return useOverrideAwareStoreValue({
        override: visualStateOverride,
        store: workspaceProjectionStore,
        projectState: selectProjectedVisualState,
        selector,
    });
}

export function useCanvasAnimatedState(selector = (state) => state) {
    const { animatedStateOverride } = useCanvasContext();

    return useOverrideAwareStoreValue({
        override: animatedStateOverride,
        store: useAnimatedRuntimeStore,
        selector,
    });
}

export function useCanvasRuntimeState(selector = (state) => state) {
    return useOverrideAwareStoreValue({
        override: null,
        store: workspaceProjectionStore,
        selector,
    });
}

export { CanvasContext };
