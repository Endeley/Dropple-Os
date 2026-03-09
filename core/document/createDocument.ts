import type { DroppleDocument } from './documentSchema';

export function createEmptyDocument(): DroppleDocument {
    const now = Date.now();

    return {
        meta: {
            id: crypto.randomUUID(),
            name: 'Untitled',
            version: 1,
            createdAt: now,
            updatedAt: now,
        },

        sceneGraph: {
            rootIds: [],
            nodes: {},
        },

        layout: {
            containers: {},
            constraints: {},
        },

        components: {
            definitions: {},
            instances: {},
        },

        motion: {
            clips: {},
        },

        scenes: {
            scenes: {},
            activeSceneId: undefined,
        },

        assets: {
            images: {},
            videos: {},
            audio: {},
        },

        exports: {
            targets: [],
        },
    };
}
