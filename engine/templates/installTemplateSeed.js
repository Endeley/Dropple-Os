import { hashTimeline, normalizeTimeline } from '../../domain/timeline/TimelineContract.js';
import { applyTimelineMutation } from '../timeline/timelineHistory.js';
import { buildSceneTree } from '../../domain/scene/buildSceneTree.js';
import { resolveTemplateSeedIdentity } from './templateSeed.js';

function deepClone(value) {
    if (value == null) return value;
    if (typeof structuredClone === 'function') return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
}

function applyParamDefaults(sceneGraph, params) {
    if (!params || typeof params !== 'object') return sceneGraph;

    const nodesById = new Map();
    const nodes = (sceneGraph.nodes || []).map((node) => {
        const clone = { ...node };
        nodesById.set(clone.id, clone);
        return clone;
    });

    const applyBlock = (block) => {
        if (!block || typeof block !== 'object') return;
        for (const [key, def] of Object.entries(block)) {
            if (!def || typeof def !== 'object') continue;
            if (!('default' in def)) continue;
            const [nodeId, prop] = key.split('.');
            if (!nodeId || !prop) continue;
            const node = nodesById.get(nodeId);
            if (!node) continue;
            node[prop] = deepClone(def.default);
        }
    };

    applyBlock(params.content);
    applyBlock(params.style);
    applyBlock(params.motion);

    return {
        ...sceneGraph,
        nodes,
    };
}

export function installTemplateSeed(seed) {
    if (!seed || typeof seed !== 'object') {
        throw new Error('installTemplateSeed requires a seed object');
    }

    const identity = resolveTemplateSeedIdentity(seed);

    const states = deepClone(seed.states || {});
    const stateNames = Object.keys(states).sort();
    if (!stateNames.length) {
        throw new Error('Template seed contains no states');
    }

    const defaultState = seed.defaultState;
    if (!defaultState || !states[defaultState]) {
        throw new Error('Template seed defaultState is invalid');
    }

    const timeline = normalizeTimeline(deepClone(states[defaultState]));
    const timelineHash = hashTimeline(timeline);
    if (timelineHash !== seed.snapshotHash) {
        throw new Error('Template seed snapshotHash does not match default state timeline');
    }

    const baseSceneGraph = applyParamDefaults(deepClone(seed.baseSceneGraph), seed.params);
    const sceneGraphTree = buildSceneTree(baseSceneGraph);

    const snapshotGraph = {
        nodes: {
            [seed.snapshotHash]: {
                id: seed.snapshotHash,
                timeline,
                parentIds: [],
                childrenIds: [],
                diffFromParent: null,
            },
        },
        headId: seed.snapshotHash,
        meta: {},
    };

    const controller = {
        snapshotGraph,
        headId: seed.snapshotHash,
        baseSceneGraph,
        sceneGraph: sceneGraphTree,
        templateStates: states,
        defaultState,
    };

    const seedMetadata = {
        id: seed.id,
        version: seed.version,
        snapshotHash: seed.snapshotHash,
        contentHash: identity.contentHash,
        lineage: deepClone(identity.lineage),
        defaultState,
        availableStates: stateNames,
        metadata: deepClone(seed.metadata ?? {}),
    };

    return { controller, seedMetadata };
}

export function switchTemplateState(controller, stateName) {
    if (!controller || typeof controller !== 'object') {
        throw new Error('switchTemplateState requires a controller');
    }
    const states = controller.templateStates || {};
    const nextState = states[stateName];
    if (!nextState) {
        throw new Error(`Unknown template state: ${stateName}`);
    }

    const nextTimeline = normalizeTimeline(deepClone(nextState));
    const nextGraph = applyTimelineMutation(controller.snapshotGraph, nextTimeline);

    if (nextGraph === controller.snapshotGraph) return controller;

    return {
        ...controller,
        snapshotGraph: nextGraph,
        headId: nextGraph.headId,
    };
}
