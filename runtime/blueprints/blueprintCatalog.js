import { EventTypes } from '@/core/events/eventTypes.js';
import { certifyBlueprint } from './installBlueprint.js';

const BLUEPRINT_CATALOG = Object.freeze([
    certifyBlueprint(
        Object.freeze({
            id: 'bp.startup.v1',
            version: 1,
            name: 'Startup Blueprint',
            description: 'Seed a startup project universe with initial design and build structure.',
            kind: 'project',
            workspaceProfiles: Object.freeze({
                create: Object.freeze(['uiux', 'graphic', 'document']),
                build: Object.freeze(['application', 'automation']),
                collaborate: Object.freeze(['review']),
            }),
            capabilityProfiles: Object.freeze({
                create: Object.freeze(['node:create', 'node:update']),
                build: Object.freeze(['workflow:define']),
                collaborate: Object.freeze(['review:submit']),
            }),
            seedGraph: Object.freeze({
                nodes: Object.freeze({
                    'frame.root': Object.freeze({ id: 'frame.root', type: 'frame' }),
                }),
                rootIds: Object.freeze(['frame.root']),
            }),
            seedEvents: Object.freeze([
                Object.freeze({
                    type: EventTypes.NODE_CREATE,
                    payload: Object.freeze({
                        node: Object.freeze({
                            id: 'frame.root',
                            type: 'frame',
                            layout: Object.freeze({ x: 0, y: 0, width: 1280, height: 720 }),
                        }),
                    }),
                }),
                Object.freeze({
                    type: EventTypes.NODE_CREATE,
                    payload: Object.freeze({
                        node: Object.freeze({
                            id: 'frame.product',
                            type: 'frame',
                            parentId: 'frame.root',
                            layout: Object.freeze({ x: 80, y: 72, width: 540, height: 320 }),
                        }),
                    }),
                }),
            ]),
            workflowPresets: Object.freeze({}),
            publishPresets: Object.freeze({}),
            lineage: Object.freeze({
                rootId: 'bp.startup.root',
                versionId: 'bp.startup.v1',
                parentVersionId: null,
            }),
        }),
    ),
    certifyBlueprint(
        Object.freeze({
            id: 'bp.logistics.v1',
            version: 1,
            name: 'Logistics Blueprint',
            description: 'Seed a logistics operations project universe with dispatch and workflow artifacts.',
            kind: 'project',
            workspaceProfiles: Object.freeze({
                create: Object.freeze(['uiux', 'document']),
                operate: Object.freeze(['systems-engineering', 'enterprise-operations']),
                build: Object.freeze(['automation']),
            }),
            capabilityProfiles: Object.freeze({
                operate: Object.freeze(['workflow:define', 'system:model']),
                build: Object.freeze(['automation:author']),
            }),
            seedGraph: Object.freeze({
                nodes: Object.freeze({
                    'frame.ops.root': Object.freeze({ id: 'frame.ops.root', type: 'frame' }),
                }),
                rootIds: Object.freeze(['frame.ops.root']),
            }),
            seedEvents: Object.freeze([
                Object.freeze({
                    type: EventTypes.NODE_CREATE,
                    payload: Object.freeze({
                        node: Object.freeze({
                            id: 'frame.ops.root',
                            type: 'frame',
                            layout: Object.freeze({ x: 0, y: 0, width: 1600, height: 900 }),
                        }),
                    }),
                }),
                Object.freeze({
                    type: EventTypes.NODE_CREATE,
                    payload: Object.freeze({
                        node: Object.freeze({
                            id: 'frame.dispatch',
                            type: 'frame',
                            parentId: 'frame.ops.root',
                            layout: Object.freeze({ x: 96, y: 96, width: 620, height: 360 }),
                        }),
                    }),
                }),
            ]),
            workflowPresets: Object.freeze({}),
            publishPresets: Object.freeze({}),
            lineage: Object.freeze({
                rootId: 'bp.logistics.root',
                versionId: 'bp.logistics.v1',
                parentVersionId: null,
            }),
        }),
    ),
]);

export function listBlueprintCatalog() {
    return BLUEPRINT_CATALOG;
}

export function resolveBlueprintFromCatalog(blueprintId) {
    if (typeof blueprintId !== 'string' || blueprintId.trim().length === 0) return null;
    const normalized = blueprintId.trim().toLowerCase();
    return BLUEPRINT_CATALOG.find((blueprint) => blueprint.id.toLowerCase() === normalized) ?? null;
}

