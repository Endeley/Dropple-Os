'use client';

import { useMemo } from 'react';
import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore.js';
import { useWorkspaceVisualState } from '@/runtime/projection/index.js';
import { applyCharacterConstraints } from './applyCharacterConstraints.js';
import { applyAttachments } from '@/runtime/attachments/applyAttachments.js';

export function useCharacterRenderNodes() {
    const projectedNodes = useWorkspaceVisualState((s) => s.nodes || {});
    const previewNodes = useAnimatedRuntimeStore((s) => s.previewNodes);

    return useMemo(() => {
        const hasPreviewNodes = previewNodes && Object.keys(previewNodes).length > 0;
        const nodes = hasPreviewNodes
            ? {
                ...projectedNodes,
                ...previewNodes,
            }
            : projectedNodes;

        const withCharacters = applyCharacterConstraints(nodes || {});
        return applyAttachments(withCharacters || {});
    }, [projectedNodes, previewNodes]);
}
