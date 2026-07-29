function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

const ANCHOR_COLOR_BY_IDENTITY = Object.freeze({
    structured: '#f59e0b',
    expressive: '#8b5cf6',
    cinematic: '#38bdf8',
    ordered: '#cbd5e1',
    collective: '#4ade80',
    home: '#93c5fd',
});

function toSpatialPosition(section) {
    const horizontalScale = 0.0048;
    const depthScale = 0.0042;
    const verticalScale = 0.0011;

    return Object.freeze({
        x: (section?.x ?? 0) * horizontalScale,
        y: clamp(((section?.y ?? 0) - 140) * verticalScale, -0.45, 1.4),
        z: -(section?.z ?? 0) * depthScale,
    });
}

export function createSpatialWorldSceneModel({
    activeRegionId,
    arrivalPhase,
    camera,
    destinationId,
    highlightedAnchorId,
    lookOffset,
    originRegionId,
    projectedSections,
}) {
    const journeyProgress = camera?.progress ?? 0;
    const selectedDestinationId = destinationId ?? 'design';
    const sections = projectedSections ?? [];
    const designSection =
        sections.find((section) => section.id === 'design') ??
        Object.freeze({ id: 'design', identity: 'expressive', x: 220, y: 120, z: 5200 });
    const designPosition = toSpatialPosition(designSection);

    return Object.freeze({
        activeRegionId,
        arrivalPhase,
        destinationId: selectedDestinationId,
        destinationProgress: designSection.progress ?? 0.34,
        journeyProgress,
        camera: Object.freeze({
            x: camera?.x ?? 0,
            y: camera?.y ?? 0,
            z: camera?.z ?? 0,
            progress: journeyProgress,
            zoom: 1,
            lookOffset: Object.freeze({
                x: lookOffset?.x ?? 0,
                y: lookOffset?.y ?? 0,
            }),
        }),
        origin: Object.freeze({
            regionId: originRegionId,
            platformRadius: 5.4,
            center: Object.freeze({ x: 0, y: 0, z: 0 }),
            departureFade: clamp(1 - (journeyProgress - 0.18) / 0.12, 0.04, 1),
            departureCommitment: clamp((journeyProgress - 0.22) / 0.1, 0, 1),
        }),
        traveler: Object.freeze({
            id: 'traveler',
            position: Object.freeze({ x: 0, y: 0.16, z: 1.12 }),
        }),
        worldCore: Object.freeze({
            id: 'world-core',
            position: Object.freeze({ x: 0, y: 1.7, z: 0.22 }),
        }),
        route: Object.freeze({
            start: Object.freeze({ x: 0.04, y: 0.03, z: 0.82 }),
            threshold: Object.freeze({ x: -1.08, y: 0.06, z: -7.4 }),
            bridge: Object.freeze({ x: 1.24, y: 0.1, z: -14.8 }),
            gateway: Object.freeze({ x: -0.84, y: 0.18, z: -24.6 }),
            destination: Object.freeze({
                x: designPosition.x * 0.54,
                y: 0.28,
                z: designPosition.z - 2.6,
            }),
        }),
        landforms: Object.freeze({
            westernRidgeReveal: clamp((journeyProgress - 0.18) / 0.22, 0, 1),
            easternRiseReveal: clamp((journeyProgress - 0.26) / 0.22, 0, 1),
        }),
        journey: Object.freeze({
            thresholdReveal: clamp((journeyProgress - 0.16) / 0.12, 0, 1),
            bridgeReveal: clamp((journeyProgress - 0.28) / 0.12, 0, 1),
            gatewayReveal: clamp((journeyProgress - 0.42) / 0.1, 0, 1),
            districtReveal: clamp((journeyProgress - 0.52) / 0.08, 0, 1),
        }),
        destinationDistrict: Object.freeze({
            id: 'design',
            identity: designSection.identity,
            label: 'Design District',
            approachReveal: clamp((journeyProgress - 0.42) / 0.12, 0, 1),
            arrivalReveal: clamp((journeyProgress - 0.56) / 0.06, 0, 1),
            position: Object.freeze({
                x: designPosition.x * 0.5,
                y: 0.12,
                z: designPosition.z - 3.8,
            }),
        }),
        anchors: Object.freeze(
            sections
                .filter((section) => section.id !== originRegionId)
                .map((section) => {
                    const position = toSpatialPosition(section);
                    return Object.freeze({
                        id: section.id,
                        identity: section.identity,
                        color: ANCHOR_COLOR_BY_IDENTITY[section.identity] ?? '#93c5fd',
                        highlighted:
                            section.id === highlightedAnchorId ||
                            section.id === activeRegionId ||
                            section.id === selectedDestinationId,
                        position,
                        revealAt: section.revealAt ?? 0,
                        beaconOnly: section.beaconOnly ?? false,
                    });
                }),
        ),
    });
}
