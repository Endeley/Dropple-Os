import { v4 as uuid } from 'uuid';

import type { ProjectV2 } from '../contracts/project.v2';
import { PRIMARY_SHOT_TRACK_ID } from '@/core/scene/shotTracks.js';

export const DEFAULT_SHOT_DURATION_MS = 5000;

export function createProjectV2({
    id,
    name,
    rootCompositionId,
}: {
    id: string;
    name: string;
    rootCompositionId: string;
}): ProjectV2 {
    const sceneId = uuid();
    const shotId = uuid();

    return {
        version: 2,

        id,
        name,

        compositions: {
            [rootCompositionId]: {
                id: rootCompositionId,
                name: 'Root Composition',
                // existing composition structure untouched
            },
        },

        assets: {},

        sceneGraph: {
            version: 1,
            activeSceneId: sceneId,
            activeShotId: shotId,
            scenes: [
                {
                    id: sceneId,
                    name: 'Scene 1',
                    duration: DEFAULT_SHOT_DURATION_MS,
                    shots: [
                        {
                            id: shotId,
                            name: 'Shot 1',
                            start: 0,
                            duration: DEFAULT_SHOT_DURATION_MS,
                            compositionId: rootCompositionId,
                            transitionOut: null,
                        },
                    ],
                    shotTracks: [
                        {
                            id: PRIMARY_SHOT_TRACK_ID,
                            name: 'Primary',
                            order: 0,
                            kind: 'shot',
                            shots: [
                                {
                                    id: shotId,
                                    name: 'Shot 1',
                                    start: 0,
                                    duration: DEFAULT_SHOT_DURATION_MS,
                                    compositionId: rootCompositionId,
                                    transitionOut: null,
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    };
}
