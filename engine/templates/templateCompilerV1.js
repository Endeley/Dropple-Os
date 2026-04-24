import { validateTemplateArtifact } from '../../core/ccm/validate/validateTemplateArtifact.js';
import { normalizeTimeline, hashTimeline } from '../../domain/timeline/TimelineContract.js';
import { createTimelineController } from '../timeline/timelineController.js';
import { runExportStabilityGate } from '../export/exportStabilityGate.js';
import { computeCapabilityIndex } from '../observability/capabilityIndex.js';
import { createTemplateSeed } from './templateSeed.js';
import { certifyTemplateSeed } from './certifyTemplateSeed.js';
import { buildSceneTree } from '../../domain/scene/buildSceneTree.js';

const NODE_TYPE_MAP = Object.freeze({
    Scene: 'frame',
    Container: 'frame',
    Image: 'image',
    Text: 'text',
    Button: 'button',
    Overlay: 'overlay',
});

const ENGINE_CHANNEL_BY_TEMPLATE_PROPERTY = Object.freeze({
    opacity: 'opacity',
    translateX: 'transform.x',
    translateY: 'transform.y',
});

function mapNodeType(type) {
    if (type in NODE_TYPE_MAP) return NODE_TYPE_MAP[type];
    return type;
}

function cloneParams(params) {
    if (params == null) return {};
    if (typeof structuredClone === 'function') {
        return structuredClone(params);
    }
    return JSON.parse(JSON.stringify(params));
}

function resolveEngineChannelKey(property) {
    const channelKey = ENGINE_CHANNEL_BY_TEMPLATE_PROPERTY[property];
    if (channelKey) return channelKey;

    throw new Error(
        `Template property ${property} is not supported by the current engine channel dialect`,
    );
}

function compileStructure(structure) {
    const nodesSorted = [...structure.nodes]
        .map((node) => ({
            id: node.id,
            type: mapNodeType(node.type),
            transform: { x: 0, y: 0, scale: 1 },
            opacity: 1,
            channels: {},
        }))
        .sort((a, b) => a.id.localeCompare(b.id));

    const nodeIds = new Set(nodesSorted.map((node) => node.id));

    const tree = {};
    const keys = Object.keys(structure.tree || {}).sort();
    for (const parentId of keys) {
        const children = Array.isArray(structure.tree[parentId])
            ? [...structure.tree[parentId]]
            : [];
        tree[parentId] = children.filter((id) => nodeIds.has(id)).sort();
    }

    for (const nodeId of nodeIds) {
        if (!(nodeId in tree)) tree[nodeId] = [];
    }

    return {
        rootId: structure.root,
        nodes: nodesSorted,
        tree,
        layout: structure.layout ? { ...structure.layout } : {},
    };
}

function ensureKeyframesAscending(keyframes, label) {
    let lastTime = -Infinity;
    for (const frame of keyframes) {
        const time = frame.t ?? frame.time;
        if (!Number.isFinite(time)) {
            throw new Error(`${label} keyframes require finite time`);
        }
        if (time <= lastTime) {
            throw new Error(`${label} keyframes must be strictly ascending`);
        }
        lastTime = time;
    }
}

function compileMotionState(name, timeline) {
    const channels = new Map();
    const tracks = [];
    const targetByChannel = new Map();
    const trackGroups = new Map();

    for (const track of timeline.tracks || []) {
        const property = track.property;
        const target = track.target;
        if (!property) {
            throw new Error(`Timeline ${name} track property is required`);
        }
        if (!target) {
            throw new Error(`Timeline ${name} track target is required`);
        }
        const channelKey = resolveEngineChannelKey(property);

        const existingTarget = targetByChannel.get(channelKey);
        if (existingTarget && existingTarget !== target) {
            throw new Error(
                `Timeline ${name} cannot target multiple nodes for engine channel ${channelKey}`,
            );
        }
        targetByChannel.set(channelKey, target);

        if (trackGroups.has(channelKey)) {
            throw new Error(`Timeline ${name} defines duplicate tracks for engine channel ${channelKey}`);
        }
        trackGroups.set(channelKey, {
            channelKey,
            target,
            property,
            keyframes: [...(track.keyframes || [])],
        });
    }

    const groupedKeys = Array.from(trackGroups.keys()).sort();
    for (const channelKey of groupedKeys) {
        const group = trackGroups.get(channelKey);
        const channelId = group.channelKey;

        const canonicalKeyframes = group.keyframes.map((frame) => ({
            time: frame.t ?? frame.time,
            value: frame.v ?? frame.value,
            easing: frame.easing ?? 'linear',
        }));

        if (canonicalKeyframes.length === 0) {
            throw new Error(`channel:${channelId} requires at least one keyframe`);
        }
        ensureKeyframesAscending(canonicalKeyframes, `channel:${channelId}`);

        channels.set(channelId, {
            id: channelId,
            target: group.target,
            property: group.property,
            keyframes: canonicalKeyframes,
        });

        tracks.push({
            id: `track:${channelId}`,
            type: 'standard',
            order: 0,
            channelIds: [channelId],
            meta: {
                blendMode: 'add',
                name: `${group.target}.${group.property}`,
            },
        });
    }

    const sortedTracks = tracks.sort((a, b) => a.id.localeCompare(b.id));
    sortedTracks.forEach((track, index) => {
        track.order = index;
    });

    const channelList = Array.from(channels.values()).sort((a, b) =>
        a.id.localeCompare(b.id)
    );

    return normalizeTimeline({
        duration: timeline.duration ?? 0,
        tracks: sortedTracks,
        groups: [],
        channels: channelList,
    });
}

function compileMotionStates(motion) {
    const timelineNames = Object.keys(motion.timelines || {}).sort();
    const states = {};
    for (const name of timelineNames) {
        states[name] = compileMotionState(name, motion.timelines[name]);
    }
    return states;
}

function resolveDefaultState(motion, stateNames) {
    const trigger = motion?.triggers?.onLoad;
    if (trigger && stateNames.includes(trigger)) return trigger;
    return stateNames[0] ?? null;
}

// buildSceneTree now lives in engine/scene/buildSceneTree.js

export function compileTemplateV1(templateDefinition) {
    validateTemplateArtifact(templateDefinition);

    const baseSceneGraph = compileStructure(templateDefinition.structure);
    const states = compileMotionStates(templateDefinition.motion);
    const stateNames = Object.keys(states).sort();
    if (stateNames.length === 0) {
        throw new Error('Template must define at least one motion timeline');
    }
    const defaultState = resolveDefaultState(templateDefinition.motion, stateNames);
    const defaultTimeline = states[defaultState];
    const snapshotHash = hashTimeline(defaultTimeline);

    const sceneGraphTree = buildSceneTree(baseSceneGraph);
    for (const stateName of stateNames) {
        const timeline = states[stateName];
        const shotTimeline = {
            shots: [
                {
                    id: `template-shot:${stateName}`,
                    startMs: 0,
                    endMs: timeline.duration ?? 0,
                    timeline,
                },
            ],
        };

        const exportGate = runExportStabilityGate({
            timeline,
            shotTimeline,
            sceneGraph: sceneGraphTree,
        });

        if (!exportGate.allowed) {
            throw new Error(
                `Template export stability gate failed (${stateName}): ${exportGate.reason}`
            );
        }
    }

    const controller = createTimelineController(defaultTimeline);
    const capabilityProfile = computeCapabilityIndex(controller);

    const params = cloneParams(templateDefinition.params);

    const seed = createTemplateSeed({
            id: templateDefinition.metadata.id,
            version: templateDefinition.metadata.version,
            snapshotHash,
            baseSceneGraph,
            states,
            defaultState,
            capabilityProfile,
            metadata: {
                name: templateDefinition.metadata.name,
                description: templateDefinition.metadata.description ?? '',
                author: templateDefinition.metadata.author ?? '',
                license: templateDefinition.metadata.license ?? '',
                createdAt: templateDefinition.metadata.createdAt ?? '',
            },
            params,
        });

    const certifiedSeed = certifyTemplateSeed(seed);

    return {
        seed: certifiedSeed,
        capabilityProfile,
    };
}
