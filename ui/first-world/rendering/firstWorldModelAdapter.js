import { listVisibleFirstWorldRegions } from '@/ui/first-world/RegionHost.jsx';

export const TRAVEL_ORDER = Object.freeze([
    'home',
    'design',
    'build',
    'media',
    'system',
    'collaborate',
]);

export const ORIGIN_REGION_ID = 'home';

const WORKSPACE_STORIES = Object.freeze({
    design: Object.freeze({
        identity: 'expressive',
        x: 220,
        y: 120,
        z: 9200,
        progress: 0.62,
        revealAt: 0.18,
    }),
    build: Object.freeze({
        identity: 'structured',
        x: -1480,
        y: -260,
        z: 13200,
        progress: 0.78,
        revealAt: 0.7,
        beaconOnly: true,
    }),
    collaborate: Object.freeze({
        identity: 'collective',
        x: -620,
        y: 440,
        z: 19600,
        progress: 1,
        revealAt: 0.9,
        beaconOnly: true,
    }),
    media: Object.freeze({
        identity: 'cinematic',
        x: 760,
        y: -200,
        z: 16400,
        progress: 0.9,
        revealAt: 0.82,
        beaconOnly: true,
    }),
    system: Object.freeze({
        identity: 'ordered',
        x: 1380,
        y: 520,
        z: 21200,
        progress: 0.96,
        revealAt: 0.94,
        beaconOnly: true,
    }),
});

export const HOME_WORLD = Object.freeze({
    id: ORIGIN_REGION_ID,
    identity: ORIGIN_REGION_ID,
    progress: 0,
    x: 0,
    y: 140,
    z: 0,
});

export const TRAVELER_SPAWN = Object.freeze({
    id: 'traveler',
    regionId: ORIGIN_REGION_ID,
    state: 'present',
    x: HOME_WORLD.x,
    y: HOME_WORLD.y,
    z: HOME_WORLD.z,
    progress: HOME_WORLD.progress,
});

function buildWorkspaceSections(visibleRegionRegistry) {
    return visibleRegionRegistry
        .filter((region) => region.id !== 'home')
        .map((region) => {
            const workspaceId = region.id;
            const story = WORKSPACE_STORIES[workspaceId];

            if (!story) {
                return null;
            }

            return Object.freeze({
                id: workspaceId,
                identity: story.identity,
                x: story.x,
                y: story.y,
                z: story.z,
                progress: story.progress,
                revealAt: story.revealAt ?? 0,
                beaconOnly: story.beaconOnly ?? false,
            });
        })
        .filter(Boolean);
}

export function createFirstWorldRendererModel() {
    const visibleRegionRegistry = listVisibleFirstWorldRegions();
    const workspaceSections = buildWorkspaceSections(visibleRegionRegistry);
    const worldSectionById = Object.freeze(
        Object.fromEntries(workspaceSections.map((section) => [section.id, section])),
    );
    const travelStops = Object.freeze([
        HOME_WORLD,
        Object.freeze({
            id: 'great-route',
            x: 0,
            y: 120,
            z: 1800,
            progress: 0.16,
        }),
        Object.freeze({
            id: 'commitment-threshold',
            x: -120,
            y: 90,
            z: 3600,
            progress: 0.28,
        }),
        Object.freeze({
            id: 'old-bridge',
            x: 220,
            y: 120,
            z: 5600,
            progress: 0.4,
        }),
        Object.freeze({
            id: 'design-gateway',
            x: -80,
            y: 160,
            z: 7600,
            progress: 0.52,
        }),
        worldSectionById.design,
        worldSectionById.build,
        worldSectionById.media,
        worldSectionById.system,
        worldSectionById.collaborate,
    ].filter(Boolean));

    return Object.freeze({
        homeWorld: HOME_WORLD,
        originRegionId: ORIGIN_REGION_ID,
        primaryJourneyDestinationId: 'design',
        travelerSpawn: TRAVELER_SPAWN,
        workspaceSections,
        worldSectionById,
        travelStops,
    });
}
