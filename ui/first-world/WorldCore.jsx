'use client';

export default function WorldCore({
    originRegionId = 'home',
    worldId = 'dropple-first-world',
    children,
}) {
    return (
        <div
            data-testid='world-core'
            data-world-id={worldId}
            data-origin-region={originRegionId}
            style={{ display: 'contents' }}
        >
            {children}
        </div>
    );
}
