import { buildRuntimeSnapshotFromTemplateGraph } from './graphToRuntimeSnapshot.js';
import { installTemplateSeed } from '../../engine/templates/installTemplateSeed.js';
import { initialRuntimeState } from '../../runtime/state/runtimeState.internal.js';
import { createCanonicalDocumentEnvelope } from '../../core/persistence/documentEnvelope.js';
import { createNode } from '../../core/nodes/createNode.js';
import { normalizeNodeShape } from '../../design/state/normalizeNodeShape.js';

function isSeedTemplate(template) {
    return Boolean(
        template &&
            typeof template === 'object' &&
            template.baseSceneGraph &&
            template.states &&
            typeof template.defaultState === 'string',
    );
}

function buildParentMap(tree = {}) {
    const parentById = {};

    Object.entries(tree).forEach(([parentId, children]) => {
        (children || []).forEach((childId) => {
            parentById[childId] = parentId;
        });
    });

    return parentById;
}

function buildSceneGraphDocument(baseSceneGraph) {
    const parentById = buildParentMap(baseSceneGraph?.tree);
    const nodes = {};

    for (const node of baseSceneGraph?.nodes || []) {
        const layout = {
            x: node?.transform?.x ?? 0,
            y: node?.transform?.y ?? 0,
        };

        nodes[node.id] = createNode({
            ...normalizeNodeShape({
                id: node.id,
                type: node.type || 'frame',
                parentId: parentById[node.id] ?? null,
                layout,
            }),
            children: [...(baseSceneGraph?.tree?.[node.id] ?? [])],
            opacity: node?.opacity ?? 1,
            channels: node?.channels ?? {},
        });
    }

    return {
        rootIds: baseSceneGraph?.rootId ? [baseSceneGraph.rootId] : [],
        nodes,
    };
}

function buildMotionDocument(timeline) {
    const clips = {};

    for (const channel of timeline?.channels || []) {
        if (!channel?.target || !channel?.property) continue;

        const clipId = `clip:${channel.target}:${channel.property}`;
        clips[clipId] = {
            id: clipId,
            target: channel.target,
            property: channel.property,
            keyframes: (channel.keyframes || []).map((keyframe, index) => ({
                id: keyframe?.id ?? `${clipId}:${index}:${keyframe.time ?? keyframe.t ?? 0}`,
                t: keyframe.time ?? keyframe.t,
                v: keyframe.value ?? keyframe.v,
                easing: keyframe.easing ?? 'linear',
            })),
        };
    }

    return { clips };
}

function buildRuntimeSnapshotFromSeed(seed) {
    const { controller } = installTemplateSeed(seed);
    const timeline =
        controller?.snapshotGraph?.nodes?.[controller.headId]?.timeline ??
        seed?.states?.[seed.defaultState] ??
        null;

    const document = createCanonicalDocumentEnvelope({
        name: seed?.metadata?.name ?? 'Untitled Template',
    });

    document.sceneGraph = buildSceneGraphDocument(seed.baseSceneGraph);
    document.motion = buildMotionDocument(timeline);

    return {
        ...initialRuntimeState,
        document,
        timeline: {
            timelines: {
                default: timeline,
            },
        },
    };
}

export function buildRuntimeSnapshotFromCertifiedTemplate(template) {
    return isSeedTemplate(template)
        ? buildRuntimeSnapshotFromSeed(template)
        : buildRuntimeSnapshotFromTemplateGraph(template?.graph);
}

export function installCertifiedTemplate({ dispatcher, template } = {}) {
    const resolved = dispatcher ?? globalThis.__droppleDispatcher ?? null;
    if (!resolved?.hydrateRuntimeState) {
        throw new Error('Missing dispatcher.');
    }

    const snapshot = buildRuntimeSnapshotFromCertifiedTemplate(template);

    resolved.hydrateRuntimeState(snapshot, { animate: false });

    return {
        installed: true,
        structuralHash:
            template?.certification?.structuralHash ??
            template?.certification?.snapshotHash ??
            null,
    };
}
