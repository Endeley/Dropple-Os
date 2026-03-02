import { buildRuntimeSnapshotFromTemplateGraph } from './graphToRuntimeSnapshot.js';

export function installCertifiedTemplate({ dispatcher, template } = {}) {
    const resolved = dispatcher ?? globalThis.__droppleDispatcher ?? null;
    if (!resolved?.hydrateRuntimeState) {
        throw new Error('Missing dispatcher.');
    }
    if (!template?.graph) {
        throw new Error('Invalid template structure.');
    }

    const snapshot = buildRuntimeSnapshotFromTemplateGraph(template.graph);

    // Optional: reset history if template install == new document
    // dispatcher.reset();

    resolved.hydrateRuntimeState(snapshot, { animate: false });

    return {
        installed: true,
        structuralHash: template.certification?.structuralHash ?? null,
    };
}
