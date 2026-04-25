import { deriveEdgesFromNodes } from './deriveEdgesFromNodes.js';
import { exportModes } from './exportModes.js';
import { exportMetadata } from './exportMetadata.js';
import { normalizeExportSettings } from '@/core/export/exportTargetContract.js';

/**
 * Build authoritative DroppleSpec from runtime workspace.
 * Non-authoritative state MUST be excluded here.
 */
export function buildDroppleSpec(workspace) {
    const { nodes } = workspace || {};

    return {
        version: 'v2',
        world: buildWorld(workspace),
        nodes: exportNodes(nodes),
        edges: deriveEdgesFromNodes(nodes),
        media: exportMedia(workspace),
        modes: exportModes(workspace),
        metadata: exportMetadata(workspace),
    };
}

// --- helpers (minimal by design) ---

function buildWorld(_workspace) {
    // Opaque, spec-compliant world container (v2)
    return {
        coordinateSystem: 'world-space-v2',
        origin: { x: 0, y: 0 },
    };
}

function exportNodes(nodes) {
    const list = Array.isArray(nodes) ? nodes : Object.values(nodes || {});
    return list.map((n) => ({
        id: n.id,
        type: n.type,
        transform: n.transform,
        props: n.props ?? {},
        meta: n.meta,
    }));
}

function exportMedia(workspace) {
    const document = workspace?.document ?? {};

    return {
        assets: document.assets ?? {
            images: {},
            videos: {},
            audio: {},
        },
        sequences: document.sequences ?? {
            sequences: {},
            activeSequenceId: null,
        },
        exports: normalizeExportSettings(document.exports ?? {
            targets: [],
        }),
    };
}
