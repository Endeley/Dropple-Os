'use client';

export default function LivingWorldHost({
    activeRegionId = 'home',
    regionIds = [],
    worldId = 'dropple-first-world',
    children,
}) {
    return (
        <div
            data-testid='living-world-host'
            data-world-id={worldId}
            data-active-region={activeRegionId}
            data-region-ids={regionIds.join(',')}
            style={{ display: 'contents' }}
        >
            {children}
        </div>
    );
}
