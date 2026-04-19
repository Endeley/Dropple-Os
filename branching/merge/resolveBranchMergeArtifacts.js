import { replayEvents } from '@/core/persistence/replayEngine.js';
import { computeMergeDiff } from './computeMergeDiff.js';
import { planMerge } from './planMerge.js';

function replayBranch(events = []) {
    return replayEvents({ events });
}

function getSharedBaseEvents(targetBranch, sourceBranch) {
    const targetEvents = Array.isArray(targetBranch?.events) ? targetBranch.events : [];
    const sourceEvents = Array.isArray(sourceBranch?.events) ? sourceBranch.events : [];
    const length = Math.min(targetEvents.length, sourceEvents.length);
    const baseEvents = [];

    for (let index = 0; index < length; index += 1) {
        const targetEvent = targetEvents[index];
        const sourceEvent = sourceEvents[index];

        if (!targetEvent || !sourceEvent || targetEvent.id !== sourceEvent.id) {
            break;
        }

        baseEvents.push(targetEvent);
    }

    return baseEvents;
}

function buildNodeMap(state) {
    const sceneGraph = state?.document?.sceneGraph ?? {};
    const layoutNodes = state?.document?.layout?.nodes ?? {};
    const nodeIds = Object.keys(sceneGraph.nodes ?? {}).sort();

    return Object.fromEntries(
        nodeIds.map((nodeId) => {
            const node = sceneGraph.nodes[nodeId] ?? {};
            const layout = layoutNodes[nodeId] ?? undefined;

            return [
                nodeId,
                {
                    ...node,
                    ...(layout ? { layout } : {}),
                },
            ];
        }),
    );
}

export function resolveBranchMergeArtifacts({ targetBranch, sourceBranch }) {
    if (!targetBranch || !sourceBranch) {
        return {
            baseState: null,
            targetState: null,
            sourceState: null,
            diff: null,
            events: [],
        };
    }

    const baseEvents = getSharedBaseEvents(targetBranch, sourceBranch);
    const baseState = replayBranch(baseEvents);
    const targetState = replayBranch(targetBranch.events ?? []);
    const sourceState = replayBranch(sourceBranch.events ?? []);

    const diff = computeMergeDiff(
        buildNodeMap(baseState),
        buildNodeMap(sourceState),
        buildNodeMap(targetState),
    );

    return {
        baseState,
        targetState,
        sourceState,
        diff,
        events: planMerge(diff),
    };
}
