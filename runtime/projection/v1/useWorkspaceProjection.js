'use client';

/**
 * @deprecated Legacy workspace projection hook.
 *
 * Prefer `useWorkspaceViewState`, which reads directly from the projected
 * Zustand mirror and keeps React consumers on the canonical projection path.
 */

import { useMemo } from 'react';
import { useRuntimeStore } from '../../stores/useRuntimeStore.js';
import { getWorkspaceProjection } from './workspaceProjection.js';

export function useWorkspaceProjection(selector = (state) => state) {
    const workspace = useRuntimeStore((state) => state.workspace);
    const projection = useMemo(
        () => getWorkspaceProjection({ workspace }),
        [workspace]
    );
    return selector(projection);
}
