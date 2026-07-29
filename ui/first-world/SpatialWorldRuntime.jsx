'use client';

import { useMemo } from 'react';

import { createSpatialWorldSceneModel } from './rendering/createSpatialWorldSceneModel.js';
import ThreeSpatialRenderer from './rendering/ThreeSpatialRenderer.jsx';

export default function SpatialWorldRuntime({
    activeRegionId,
    arrivalPhase,
    camera,
    destinationId,
    highlightedAnchorId,
    lookOffset,
    originRegionId,
    projectedSections,
}) {
    const sceneModel = useMemo(
        () =>
            createSpatialWorldSceneModel({
                activeRegionId,
                arrivalPhase,
                camera,
                destinationId,
                highlightedAnchorId,
                lookOffset,
                originRegionId,
                projectedSections,
            }),
        [
            activeRegionId,
            arrivalPhase,
            camera,
            destinationId,
            highlightedAnchorId,
            lookOffset,
            originRegionId,
            projectedSections,
        ],
    );

    return <ThreeSpatialRenderer sceneModel={sceneModel} />;
}
