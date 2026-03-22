'use client';

import { useWorkspaceVisualState } from '@/runtime/projection';

export default function GroupTransformOverlay() {
    const group = useWorkspaceVisualState((state) => state.groupTransform);

    if (!group?.bounds) return null;

    const {
        x = 0,
        y = 0,
        width = 0,
        height = 0,
    } = group.bounds;

    return (
        <div
            style={{
                position: 'absolute',
                left: x,
                top: y,
                width,
                height,
                border: '1px dashed rgba(77, 163, 255, 0.95)',
                boxSizing: 'border-box',
                pointerEvents: 'none',
            }}
        />
    );
}
