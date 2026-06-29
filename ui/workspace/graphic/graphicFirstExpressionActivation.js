import { nanoid } from 'nanoid';
import { resolveGraphicEmptyWorldStarter } from './graphicEmptyWorldExpression.js';
import { resolveGraphicCompositionProjection } from './graphicCompositionProjection.js';

const DEFAULT_ARTBOARD_BOUNDS = Object.freeze({
    x: -192,
    y: -144,
    width: 1440,
    height: 1024,
});

export function buildGraphicFirstExpressionSelectionIntent(nodeId) {
    if (typeof nodeId !== 'string' || nodeId.trim().length === 0) return null;

    return Object.freeze({
        ids: Object.freeze([nodeId]),
        primary: nodeId,
    });
}

export function buildGraphicFirstExpressionCreateIntent(starterId = 'poster', options = null) {
    const starter = resolveGraphicEmptyWorldStarter(starterId);
    const composition = resolveGraphicCompositionProjection(starter.id);
    const id =
        options && typeof options === 'object' && !Array.isArray(options)
            ? options.id ?? null
            : null;

    return Object.freeze({
        id,
        type: 'frame',
        name: `${starter.label} Artboard`,
        bounds: DEFAULT_ARTBOARD_BOUNDS,
        metadata: Object.freeze({
            graphicStarterId: starter.id,
            graphicCompositionTitle: composition.title,
            graphicArtifactRole: 'artboard',
            graphicFirstExpression: true,
        }),
    });
}

export function buildGraphicFirstExpressionActivation(starterId = 'poster') {
    const nodeId = `artboard-${nanoid()}`;
    const createIntent = buildGraphicFirstExpressionCreateIntent(starterId, { id: nodeId });
    const selectionIntent = buildGraphicFirstExpressionSelectionIntent(nodeId);

    return Object.freeze({
        nodeId,
        createIntent,
        selectionIntent,
    });
}
