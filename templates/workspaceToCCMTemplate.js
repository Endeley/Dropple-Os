import { validateTemplateArtifact } from '@/core/ccm/validate/validateTemplateArtifact.js';

function toNodeEntries(sceneGraph) {
    const source = sceneGraph?.nodes ?? {};

    if (Array.isArray(source)) {
        return source
            .filter((node) => node && typeof node === 'object' && typeof node.id === 'string')
            .map((node) => [node.id, node]);
    }

    if (source && typeof source === 'object') {
        return Object.entries(source).filter(([, node]) => node && typeof node === 'object');
    }

    return [];
}

function sortIds(values = []) {
    return [...values].filter(Boolean).sort((a, b) => String(a).localeCompare(String(b)));
}

function stableSortById(values = []) {
    return [...values].sort((left, right) =>
        String(left?.id ?? '').localeCompare(String(right?.id ?? '')),
    );
}

function normalizeMotionEasing(value) {
    if (value === 'easeInOut') return 'easeInOut';
    if (value === 'ease-in' || value === 'ease-out' || value === 'ease-in-out') {
        return 'easeInOut';
    }
    return 'linear';
}

export function inferTemplateStructure(document) {
    const sceneGraph = document?.sceneGraph ?? {};
    const nodeEntries = toNodeEntries(sceneGraph).sort(([left], [right]) => left.localeCompare(right));
    const rootIds = Array.isArray(sceneGraph?.rootIds) ? sortIds(sceneGraph.rootIds) : [];
    const root = rootIds[0] ?? nodeEntries[0]?.[0] ?? '';

    if (!root || nodeEntries.length === 0) {
        throw new Error('workspaceToCCMTemplate requires at least one scene graph node.');
    }

    const nodes = nodeEntries.map(([id, node]) => ({
        id,
        type: typeof node?.type === 'string' && node.type.length > 0 ? node.type : 'frame',
    }));

    const nodeIds = new Set(nodes.map((node) => node.id));
    const tree = {};

    for (const [id, node] of nodeEntries) {
        const children = Array.isArray(node?.children) ? node.children : [];
        tree[id] = sortIds(children).filter((childId) => nodeIds.has(childId));
    }

    for (const { id } of nodes) {
        if (!Array.isArray(tree[id])) {
            tree[id] = [];
        }
    }

    return {
        root,
        nodes,
        tree,
    };
}

export function inferTemplateMotion(document, events = []) {
    const timelineName = 'default';
    const clips = stableSortById(Object.values(document?.motion?.clips ?? {}))
        .filter(
            (clip) =>
                clip &&
                typeof clip.target === 'string' &&
                typeof clip.property === 'string' &&
                Array.isArray(clip.keyframes),
        )
        .map((clip) => ({
            target: clip.target,
            property: clip.property,
            keyframes: [...clip.keyframes]
                .filter((keyframe) => Number.isFinite(keyframe?.t ?? keyframe?.time))
                .map((keyframe) => ({
                    t: keyframe.t ?? keyframe.time,
                    v: keyframe.v ?? keyframe.value,
                    easing: normalizeMotionEasing(keyframe.easing),
                }))
                .sort((left, right) => left.t - right.t),
        }))
        .filter((clip) => clip.keyframes.length > 0);

    const duration = Math.max(
        1,
        ...clips.flatMap((clip) => clip.keyframes.map((keyframe) => keyframe.t)),
    );

    return {
        timelines: {
            [timelineName]: {
                duration,
                tracks: clips,
            },
        },
        triggers: {
            onLoad: timelineName,
        },
        sourceEventCount: Array.isArray(events) ? events.length : 0,
    };
}

export function inferTemplateParams() {
    return {
        content: {},
        style: {},
        motion: {},
    };
}

export function inferTemplateRuntime(workspaceMode) {
    return {
        viewport: workspaceMode === 'design' ? ['desktop'] : ['desktop'],
        autoplay: true,
        export: {
            motionVideo: false,
            code: false,
        },
    };
}

export function workspaceToCCMTemplate({
    document,
    events = [],
    metadata,
    workspaceMode = 'design',
}) {
    const artifact = {
        metadata: {
            id: metadata?.id,
            version: metadata?.version,
            name: metadata?.name,
            engine: metadata?.engine,
            author: metadata?.author ?? '',
            license: metadata?.license ?? '',
            createdAt: metadata?.createdAt ?? '',
            description: metadata?.description ?? '',
        },
        structure: inferTemplateStructure(document),
        motion: inferTemplateMotion(document, events),
        params: inferTemplateParams(document),
        runtime: inferTemplateRuntime(workspaceMode),
    };

    validateTemplateArtifact(artifact);
    return artifact;
}
