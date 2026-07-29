'use client';

export default function LivingWorldHost({
    activeRegionId = 'home',
    originRegionId = 'home',
    regionIds = [],
    traveler = null,
    worldId = 'dropple-first-world',
    children,
}) {
    return (
        <div
            data-testid='living-world-host'
            data-world-id={worldId}
            data-active-region={activeRegionId}
            data-origin-region={originRegionId}
            data-region-ids={regionIds.join(',')}
            style={{ display: 'contents' }}
        >
            {traveler ? (
                <div
                    data-testid='world-traveler'
                    data-traveler-id={traveler.id}
                    data-origin-region={traveler.regionId}
                    data-traveler-region={traveler.regionId}
                    data-traveler-state={traveler.state}
                    data-spawn-x={String(traveler.x)}
                    data-spawn-y={String(traveler.y)}
                    data-spawn-z={String(traveler.z)}
                    hidden
                />
            ) : null}
            {children}
        </div>
    );
}
