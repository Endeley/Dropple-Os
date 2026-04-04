'use client';

import { useMemo } from 'react';
import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore.js';
import { applyCharacterConstraints } from './applyCharacterConstraints.js';
import { applyAttachments } from '@/runtime/attachments/applyAttachments.js';

export function useCharacterRenderNodes() {
    const nodes = useAnimatedRuntimeStore((s) => s.previewNodes);

    return useMemo(() => {
        const withCharacters = applyCharacterConstraints(nodes || {});
        return applyAttachments(withCharacters || {});
    }, [nodes]);
}
