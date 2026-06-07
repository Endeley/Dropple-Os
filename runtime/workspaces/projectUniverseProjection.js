import { ArtifactKind } from '@/core/artifacts/ArtifactKind.js';
import { normalizeProjectUniverseArtifacts } from '@/core/project/normalizeProjectUniverseArtifacts.js';
import {
    resolveBlueprintFromCatalog,
    resolveBlueprintFromCatalogByVersionId,
} from '@/runtime/blueprints/blueprintCatalog.js';

function asObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

function asNonEmptyString(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function titleCaseFromId(value, fallback) {
    const source = asNonEmptyString(value);
    if (!source) return fallback;
    return source
        .replace(/[._]/g, ' ')
        .split(/[\s-]+/)
        .filter(Boolean)
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join(' ');
}

function countObjectKeys(value) {
    return Object.keys(asObject(value) ?? {}).length;
}

function listSortedEntries(value) {
    return Object.entries(asObject(value) ?? {}).sort(([left], [right]) => left.localeCompare(right));
}

function createNode(id, kind, label, metadata = {}) {
    return Object.freeze({
        id,
        kind,
        label,
        refs: Object.freeze([]),
        metadata: Object.freeze(metadata),
    });
}

function createGroup(id, perspectiveId, label, nodeIds, metadata = {}) {
    return Object.freeze({
        id,
        perspectiveId,
        label,
        nodeIds: Object.freeze([...nodeIds].sort()),
        metadata: Object.freeze(metadata),
    });
}

function joinLabels(labels) {
    if (!Array.isArray(labels) || labels.length === 0) return '';
    if (labels.length === 1) return labels[0];
    if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
    return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`;
}

function summarizeKinds(nodeIds, nodes) {
    const counts = {};
    for (const nodeId of nodeIds) {
        const kind = asNonEmptyString(nodes?.[nodeId]?.kind) ?? ArtifactKind.DOCUMENT;
        counts[kind] = (counts[kind] ?? 0) + 1;
    }
    return Object.freeze(
        Object.fromEntries(
            Object.entries(counts).sort(([left], [right]) => left.localeCompare(right)),
        ),
    );
}

function resolvePrimaryNodeId(nodeIds, nodes) {
    if (!Array.isArray(nodeIds) || nodeIds.length === 0) return null;
    const preferredKinds = [
        ArtifactKind.DOCUMENT,
        ArtifactKind.FRAME,
        ArtifactKind.WORKFLOW,
        ArtifactKind.SYSTEM_MODEL,
        ArtifactKind.VIDEO,
        ArtifactKind.ANIMATION,
    ];

    for (const kind of preferredKinds) {
        const match = nodeIds.find((nodeId) => nodes?.[nodeId]?.kind === kind);
        if (match) return match;
    }

    return nodeIds[0] ?? null;
}

function resolveBlueprintFromBootstrap(bootstrap) {
    const versionId = asNonEmptyString(bootstrap?.blueprintVersionId);
    if (versionId) {
        const fromVersion = resolveBlueprintFromCatalogByVersionId(versionId);
        if (fromVersion) return fromVersion;
    }

    const blueprintId = asNonEmptyString(bootstrap?.blueprintId);
    if (blueprintId) {
        return resolveBlueprintFromCatalog(blueprintId);
    }

    return null;
}

function resolveFrameNodes(document) {
    const sceneGraph = asObject(document?.sceneGraph);
    const nodes = asObject(sceneGraph?.nodes);
    const rootIds = new Set(Array.isArray(sceneGraph?.rootIds) ? sceneGraph.rootIds : []);

    return Object.entries(nodes ?? {})
        .filter(([, node]) => asNonEmptyString(node?.type) === 'frame')
        .sort(([leftId, leftNode], [rightId, rightNode]) => {
            const leftRoot = rootIds.has(leftId) ? 0 : 1;
            const rightRoot = rootIds.has(rightId) ? 0 : 1;
            if (leftRoot !== rightRoot) return leftRoot - rightRoot;
            const leftLabel = asNonEmptyString(leftNode?.name) ?? leftId;
            const rightLabel = asNonEmptyString(rightNode?.name) ?? rightId;
            return leftLabel.localeCompare(rightLabel);
        })
        .map(([nodeId, node]) =>
            createNode(
                `frame:${nodeId}`,
                ArtifactKind.FRAME,
                asNonEmptyString(node?.name) ?? titleCaseFromId(nodeId, 'Frame'),
                {
                    sourceId: nodeId,
                    nodeType: asNonEmptyString(node.type) ?? 'frame',
                    rootFrame: rootIds.has(nodeId),
                },
            ),
        )
        .filter(Boolean);
}

function resolveGraphNodes(document) {
    const graphs = listSortedEntries(document?.graphs);
    const flows = listSortedEntries(asObject(document?.app)?.flows);
    const workflowNodes = [];

    for (const [graphId] of graphs) {
        workflowNodes.push(
            createNode(`workflow:graph:${graphId}`, ArtifactKind.WORKFLOW, titleCaseFromId(graphId, 'Workflow'), {
                sourceId: graphId,
                sourceSlice: 'graphs',
            }),
        );
    }

    for (const [flowId] of flows) {
        workflowNodes.push(
            createNode(`workflow:flow:${flowId}`, ArtifactKind.WORKFLOW, titleCaseFromId(flowId, 'Flow'), {
                sourceId: flowId,
                sourceSlice: 'app.flows',
            }),
        );
    }

    return workflowNodes;
}

function resolveSequenceNodes(document) {
    const sequences = listSortedEntries(asObject(document?.sequences)?.sequences);
    return sequences.map(([sequenceId, sequence]) =>
        createNode(
            `sequence:${sequenceId}`,
            ArtifactKind.VIDEO,
            asNonEmptyString(sequence?.name) ?? titleCaseFromId(sequenceId, 'Sequence'),
            {
                sourceId: sequenceId,
                clipCount: Array.isArray(sequence?.clips) ? sequence.clips.length : 0,
            },
        ),
    );
}

function resolveStateMachineNodes(document) {
    const machines = listSortedEntries(asObject(document?.stateMachines)?.machines);
    return machines.map(([machineId, machine]) =>
        createNode(
            `state-machine:${machineId}`,
            ArtifactKind.STATE_MACHINE,
            asNonEmptyString(machine?.name) ?? titleCaseFromId(machineId, 'State Machine'),
            {
                sourceId: machineId,
            },
        ),
    );
}

function resolveAggregateNodes(document, blueprint) {
    const nodes = [];
    const componentCount =
        countObjectKeys(asObject(document?.components)?.definitions) +
        countObjectKeys(asObject(document?.components)?.instances);
    if (componentCount > 0) {
        nodes.push(
            createNode('components:library', ArtifactKind.COMPONENT_LIBRARY, 'Component Library', {
                componentCount,
            }),
        );
    }

    const motionClipCount = countObjectKeys(asObject(document?.motion)?.clips);
    const rigCount = countObjectKeys(asObject(document?.rigs)?.rigs);
    if (motionClipCount > 0 || rigCount > 0) {
        nodes.push(
            createNode('animation:motion', ArtifactKind.ANIMATION, 'Motion System', {
                motionClipCount,
                rigCount,
            }),
        );
    }

    const exportTargetCount = Array.isArray(asObject(document?.exports)?.targets)
        ? document.exports.targets.length
        : 0;
    if (exportTargetCount > 0) {
        nodes.push(
            createNode('workflow:publish', ArtifactKind.WORKFLOW, 'Publish Targets', {
                exportTargetCount,
            }),
        );
    }

    const systemSignalCount =
        countObjectKeys(document?.variables) +
        countObjectKeys(document?.bindings) +
        countObjectKeys(asObject(document?.app)?.flows);
    const blueprintOperateCount = Array.isArray(blueprint?.workspaceProfiles?.operate)
        ? blueprint.workspaceProfiles.operate.length
        : 0;
    if (systemSignalCount > 0 || blueprintOperateCount > 0) {
        nodes.push(
            createNode('system:model', ArtifactKind.SYSTEM_MODEL, 'System Model', {
                systemSignalCount,
                blueprintOperateCount,
            }),
        );
    }

    return nodes;
}

function withHubRefs(hubId, nodes) {
    const nextNodes = {};
    for (const node of Object.values(nodes ?? {})) {
        nextNodes[node.id] =
            node.id === hubId
                ? node
                : Object.freeze({
                      ...node,
                      refs: Object.freeze([hubId]),
                  });
    }
    return nextNodes;
}

function layoutNodes(rawNodes) {
    const groupSlots = {
        [ArtifactKind.PROJECT_HUB]: Object.freeze({ baseX: 0, baseY: 0, stepX: 0, stepY: 0, perRow: 1 }),
        [ArtifactKind.FRAME]: Object.freeze({ baseX: -300, baseY: -120, stepX: 144, stepY: 92, perRow: 2 }),
        [ArtifactKind.DOCUMENT]: Object.freeze({ baseX: -80, baseY: 186, stepX: 160, stepY: 0, perRow: 2 }),
        [ArtifactKind.VIDEO]: Object.freeze({ baseX: 220, baseY: -120, stepX: 144, stepY: 92, perRow: 2 }),
        [ArtifactKind.ANIMATION]: Object.freeze({ baseX: 190, baseY: -214, stepX: 132, stepY: 0, perRow: 2 }),
        [ArtifactKind.WORKFLOW]: Object.freeze({ baseX: -300, baseY: 84, stepX: 144, stepY: 92, perRow: 2 }),
        [ArtifactKind.STATE_MACHINE]: Object.freeze({ baseX: 220, baseY: 72, stepX: 144, stepY: 92, perRow: 2 }),
        [ArtifactKind.KNOWLEDGE_PAGE]: Object.freeze({ baseX: -70, baseY: 248, stepX: 140, stepY: 0, perRow: 2 }),
        [ArtifactKind.COMPONENT_LIBRARY]: Object.freeze({ baseX: -64, baseY: -222, stepX: 136, stepY: 0, perRow: 2 }),
        [ArtifactKind.AI_AGENT]: Object.freeze({ baseX: 112, baseY: 236, stepX: 132, stepY: 0, perRow: 2 }),
        [ArtifactKind.SYSTEM_MODEL]: Object.freeze({ baseX: 48, baseY: 148, stepX: 148, stepY: 0, perRow: 2 }),
    };

    const counters = {};
    const entries = Object.entries(rawNodes).sort(([left], [right]) => left.localeCompare(right));
    return Object.fromEntries(
        entries.map(([nodeId, node]) => {
            const slot = groupSlots[node.kind] ?? groupSlots[ArtifactKind.DOCUMENT];
            const index = counters[node.kind] ?? 0;
            counters[node.kind] = index + 1;
            const column = index % slot.perRow;
            const row = Math.floor(index / slot.perRow);

            return [
                nodeId,
                Object.freeze({
                    ...node,
                    x: slot.baseX + column * slot.stepX,
                    y: slot.baseY + row * slot.stepY,
                }),
            ];
        }),
    );
}

function resolveGroupPerspectiveId(node) {
    if (!node || node.kind === ArtifactKind.PROJECT_HUB) return null;
    if (node.id === 'workflow:publish') return 'publish';

    switch (node.kind) {
        case ArtifactKind.FRAME:
        case ArtifactKind.DOCUMENT:
        case ArtifactKind.VIDEO:
        case ArtifactKind.ANIMATION:
        case ArtifactKind.COMPONENT_LIBRARY:
            return 'create';
        case ArtifactKind.SYSTEM_MODEL:
            return 'operate';
        case ArtifactKind.KNOWLEDGE_PAGE:
            return 'collaborate';
        case ArtifactKind.WORKFLOW:
        case ArtifactKind.STATE_MACHINE:
        case ArtifactKind.AI_AGENT:
            return 'build';
        default:
            return 'overview';
    }
}

function buildUniverseGroups(nodes) {
    const definitions = Object.freeze({
        create: Object.freeze({ label: 'Create', x: -260, y: -260 }),
        build: Object.freeze({ label: 'Build', x: 250, y: -260 }),
        operate: Object.freeze({ label: 'Operate', x: 250, y: 220 }),
        collaborate: Object.freeze({ label: 'Collaborate', x: -260, y: 220 }),
        publish: Object.freeze({ label: 'Publish', x: 0, y: 290 }),
    });

    const buckets = new Map(
        Object.keys(definitions).map((perspectiveId) => [perspectiveId, []]),
    );

    for (const node of Object.values(nodes ?? {})) {
        const perspectiveId = resolveGroupPerspectiveId(node);
        if (!perspectiveId || !buckets.has(perspectiveId)) continue;
        buckets.get(perspectiveId).push(node.id);
    }

    return Object.fromEntries(
        [...buckets.entries()]
            .filter(([, nodeIds]) => nodeIds.length > 0)
            .map(([perspectiveId, nodeIds]) => {
                const definition = definitions[perspectiveId];
                const kindCounts = summarizeKinds(nodeIds, nodes);
                const primaryNodeId = resolvePrimaryNodeId(nodeIds, nodes);
                const primaryNodeLabel =
                    primaryNodeId && nodes?.[primaryNodeId]?.label
                        ? nodes[primaryNodeId].label
                        : null;
                return [
                    `group:${perspectiveId}`,
                    Object.freeze({
                        ...createGroup(`group:${perspectiveId}`, perspectiveId, definition.label, nodeIds, {
                            artifactCount: nodeIds.length,
                            kindCounts,
                            primaryNodeId,
                            primaryNodeLabel,
                        }),
                        x: definition.x,
                        y: definition.y,
                    }),
                ];
            }),
    );
}

function resolveGroupRelationshipOrder(perspectiveId) {
    switch (perspectiveId) {
        case 'create':
            return ['build', 'publish'];
        case 'build':
            return ['create', 'operate', 'publish'];
        case 'operate':
            return ['build', 'publish'];
        case 'collaborate':
            return ['create', 'publish'];
        case 'publish':
            return ['create', 'build', 'operate', 'collaborate'];
        default:
            return [];
    }
}

function enrichGroupsWithRelationships(groups) {
    const allPerspectiveIds = Object.keys(groups ?? {})
        .filter((groupId) => groupId.startsWith('group:'))
        .map((groupId) => groupId.slice('group:'.length))
        .sort((left, right) => left.localeCompare(right));
    const nextGroups = {};
    for (const [groupId, group] of Object.entries(groups ?? {}).sort(([left], [right]) => left.localeCompare(right))) {
        const preferredPerspectiveIds = resolveGroupRelationshipOrder(group.perspectiveId).filter(
            (perspectiveId) => Object.prototype.hasOwnProperty.call(groups, `group:${perspectiveId}`),
        );
        const fallbackPerspectiveIds =
            preferredPerspectiveIds.length > 0
                ? preferredPerspectiveIds
                : allPerspectiveIds.filter((perspectiveId) => perspectiveId !== group.perspectiveId);
        const relatedPerspectiveIds = fallbackPerspectiveIds.filter(
            (perspectiveId, index, collection) => collection.indexOf(perspectiveId) === index,
        );
        const relatedGroupIds = relatedPerspectiveIds.map((perspectiveId) => `group:${perspectiveId}`);
        const relatedLabels = relatedPerspectiveIds
            .map((perspectiveId) => groups[`group:${perspectiveId}`]?.label)
            .filter(Boolean);
        nextGroups[groupId] = Object.freeze({
            ...group,
            metadata: Object.freeze({
                ...group.metadata,
                relatedPerspectiveIds: Object.freeze(relatedPerspectiveIds),
                relatedGroupIds: Object.freeze(relatedGroupIds),
                relationshipCount: relatedGroupIds.length,
                relationshipSummary:
                    relatedLabels.length > 0 ? `Linked to ${joinLabels(relatedLabels)}` : 'Linked within project hub',
            }),
        });
    }
    return nextGroups;
}

function enrichNodesWithRelationships(nodes, groups, hubId) {
    const groupByNodeId = new Map();
    for (const group of Object.values(groups ?? {})) {
        for (const nodeId of group.nodeIds ?? []) {
            groupByNodeId.set(nodeId, group);
        }
    }

    const nextNodes = {};
    for (const [nodeId, node] of Object.entries(nodes ?? {}).sort(([left], [right]) => left.localeCompare(right))) {
        if (nodeId === hubId) {
            nextNodes[nodeId] = node;
            continue;
        }

        const ownerGroup = groupByNodeId.get(nodeId) ?? null;
        const relatedGroups = Array.isArray(ownerGroup?.metadata?.relatedGroupIds)
            ? ownerGroup.metadata.relatedGroupIds
                  .map((groupId) => groups?.[groupId] ?? null)
                  .filter(Boolean)
            : [];
        const relatedPrimaryNodeIds = relatedGroups
            .map((group) => group?.metadata?.primaryNodeId)
            .filter((value) => typeof value === 'string' && value.length > 0 && value !== nodeId);
        const refs = Object.freeze(
            [...new Set([hubId, ...relatedPrimaryNodeIds, ...(Array.isArray(node.refs) ? node.refs : [])])]
                .filter((value) => typeof value === 'string' && value.length > 0)
                .sort(),
        );

        nextNodes[nodeId] = Object.freeze({
            ...node,
            refs,
            metadata: Object.freeze({
                ...node.metadata,
                ownerPerspectiveId: ownerGroup?.perspectiveId ?? 'overview',
                relatedPerspectiveIds: Object.freeze(
                    Array.isArray(ownerGroup?.metadata?.relatedPerspectiveIds)
                        ? [...ownerGroup.metadata.relatedPerspectiveIds]
                        : [],
                ),
                relationshipSummary: ownerGroup?.metadata?.relationshipSummary ?? null,
            }),
        });
    }

    return nextNodes;
}

export function buildProjectUniverseProjection({ document = null, projectIdentity = null } = {}) {
    const bootstrap = asObject(document?.meta)?.projectBootstrap ?? null;
    const blueprint = resolveBlueprintFromBootstrap(bootstrap);
    const hubId = 'project:hub';
    const projectName =
        asNonEmptyString(projectIdentity?.name) ??
        asNonEmptyString(bootstrap?.projectName) ??
        asNonEmptyString(asObject(document?.meta)?.name) ??
        'Project Hub';

    const rawNodes = [
        createNode(hubId, ArtifactKind.PROJECT_HUB, projectName, {
            blueprintId: asNonEmptyString(projectIdentity?.blueprintId) ?? asNonEmptyString(bootstrap?.blueprintId),
        }),
        createNode(
            'document:primary',
            ArtifactKind.DOCUMENT,
            asNonEmptyString(asObject(document?.meta)?.name) ?? 'Primary Document',
            {
                documentId: asNonEmptyString(asObject(document?.meta)?.id),
            },
        ),
        ...resolveFrameNodes(document),
        ...resolveGraphNodes(document),
        ...resolveSequenceNodes(document),
        ...resolveStateMachineNodes(document),
        ...resolveAggregateNodes(document, blueprint),
    ];

    const deduped = Object.fromEntries(rawNodes.map((node) => [node.id, node]));
    const withRefs = withHubRefs(hubId, deduped);
    const laidOutNodes = layoutNodes(withRefs);
    const baseGroups = buildUniverseGroups(laidOutNodes);
    const groups = enrichGroupsWithRelationships(baseGroups);
    const nodes = enrichNodesWithRelationships(laidOutNodes, groups, hubId);

    return normalizeProjectUniverseArtifacts({
        version: 1,
        hubId,
        nodes,
        groups,
    });
}
