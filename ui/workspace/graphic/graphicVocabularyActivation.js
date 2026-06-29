import { nanoid } from 'nanoid';

const VOCABULARY_DEFINITIONS = Object.freeze({
    message: Object.freeze({
        id: 'message',
        label: 'Add a message',
        type: 'text',
        name: 'Message',
        content: 'Your message',
        offset: Object.freeze({ x: 120, y: 120, width: 520, height: 88 }),
        metadata: Object.freeze({
            graphicVocabularyMeaning: 'message',
            graphicSemanticRole: 'message',
        }),
    }),
    visualForm: Object.freeze({
        id: 'visualForm',
        label: 'Add a visual form',
        type: 'shape',
        name: 'Visual Form',
        offset: Object.freeze({ x: 120, y: 260, width: 320, height: 220 }),
        metadata: Object.freeze({
            graphicVocabularyMeaning: 'visualForm',
            graphicSemanticRole: 'visual-form',
        }),
    }),
    supportingImage: Object.freeze({
        id: 'supportingImage',
        label: 'Add a supporting image',
        type: 'image',
        name: 'Supporting Image',
        offset: Object.freeze({ x: 720, y: 140, width: 420, height: 280 }),
        metadata: Object.freeze({
            graphicVocabularyMeaning: 'supportingImage',
            graphicSemanticRole: 'supporting-image',
        }),
    }),
    brandElement: Object.freeze({
        id: 'brandElement',
        label: 'Add a brand element',
        type: 'shape',
        name: 'Brand Element',
        offset: Object.freeze({ x: 120, y: 540, width: 220, height: 120 }),
        metadata: Object.freeze({
            graphicVocabularyMeaning: 'brandElement',
            graphicSemanticRole: 'brand-element',
        }),
    }),
});

function resolveVocabularyDefinition(vocabularyId = 'message') {
    return VOCABULARY_DEFINITIONS[vocabularyId] ?? VOCABULARY_DEFINITIONS.message;
}

function resolveBoundsFromArtboard(artboard, offset) {
    const baseX = Number.isFinite(artboard?.layout?.x) ? artboard.layout.x : 0;
    const baseY = Number.isFinite(artboard?.layout?.y) ? artboard.layout.y : 0;

    return Object.freeze({
        x: baseX + offset.x,
        y: baseY + offset.y,
        width: offset.width,
        height: offset.height,
    });
}

export function getGraphicVocabularyMeanings() {
    return Object.freeze(Object.values(VOCABULARY_DEFINITIONS));
}

export function buildGraphicVocabularySelectionIntent(nodeId) {
    if (typeof nodeId !== 'string' || nodeId.trim().length === 0) return null;

    return Object.freeze({
        ids: Object.freeze([nodeId]),
        primary: nodeId,
    });
}

export function buildGraphicVocabularyCreateIntent(vocabularyId = 'message', artboard = null, options = null) {
    const definition = resolveVocabularyDefinition(vocabularyId);
    const id =
        options && typeof options === 'object' && !Array.isArray(options)
            ? options.id ?? null
            : null;

    return Object.freeze({
        id,
        type: definition.type,
        name: definition.name,
        parentId: artboard?.id ?? null,
        bounds: resolveBoundsFromArtboard(artboard, definition.offset),
        content: definition.content ?? null,
        metadata: Object.freeze({
            ...(definition.metadata ?? {}),
            graphicParentArtboardId: artboard?.id ?? null,
        }),
    });
}

export function buildGraphicVocabularyActivation(vocabularyId = 'message', artboard = null) {
    const definition = resolveVocabularyDefinition(vocabularyId);
    const suffix = nanoid();
    const nodeId = `${definition.type}-${suffix}`;
    const createIntent = buildGraphicVocabularyCreateIntent(vocabularyId, artboard, { id: nodeId });
    const selectionIntent = buildGraphicVocabularySelectionIntent(nodeId);

    return Object.freeze({
        nodeId,
        meaning: definition.id,
        createIntent,
        selectionIntent,
    });
}
