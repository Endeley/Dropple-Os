'use client';

import { useMemo } from 'react';
import { applyCharacterConstraints } from '@/runtime/characters/applyCharacterConstraints.js';
import { applyAttachments } from '@/runtime/attachments/applyAttachments.js';
import {
    useCanvasAnimatedState,
    useCanvasVisualState,
} from '@/ui/canvas/CanvasContext.jsx';

export function useCharacterRenderNodes() {
    const projectedNodes = useCanvasVisualState((s) => s.nodes || {});
    const previewNodes = useCanvasAnimatedState((s) => s.previewNodes);

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
