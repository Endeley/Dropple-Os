'use client';

const REFINEMENT_DEFINITIONS = Object.freeze({
    message: Object.freeze({
        title: 'Make the message communicate more clearly.',
        subtitle: 'Strengthen hierarchy, emphasis, and readability before reaching for more control.',
        qualityFocus: 'Improve clarity first. Greater control should follow communication need, not replace it.',
        relationshipPrompts: Object.freeze([
            'Make the message the focal point before adding more detail.',
            'Use surrounding elements only when they strengthen the message.',
            'Increase contrast so the message reads quickly and confidently.',
        ]),
        qualitySignals: Object.freeze(['Hierarchy', 'Emphasis', 'Readability']),
    }),
    visualForm: Object.freeze({
        title: 'Make the visual form support the message.',
        subtitle: 'Strengthen hierarchy, balance, and emphasis before reaching for more control.',
        qualityFocus: 'A visual form should clarify the Composition before it becomes decoration.',
        relationshipPrompts: Object.freeze([
            'Use the form to guide attention toward the message.',
            'Balance scale and placement so the form supports the Composition.',
            'Remove or soften forms that compete with the focal point.',
        ]),
        qualitySignals: Object.freeze(['Balance', 'Focus', 'Contrast']),
    }),
    supportingImage: Object.freeze({
        title: 'Make the image strengthen the communication.',
        subtitle: 'Strengthen focus, atmosphere, and message support before reaching for more control.',
        qualityFocus: 'An image should clarify the Composition and support the message before it adds complexity.',
        relationshipPrompts: Object.freeze([
            'Keep the image subordinate to the primary message when needed.',
            'Choose framing and scale that reinforce the Composition.',
            'Use the image to support atmosphere without weakening hierarchy.',
        ]),
        qualitySignals: Object.freeze(['Focus', 'Atmosphere', 'Support']),
    }),
    brandElement: Object.freeze({
        title: 'Make the brand visible without overpowering the message.',
        subtitle: 'Strengthen identity, hierarchy, and placement before reaching for more control.',
        qualityFocus: 'Brand should reinforce recognition while preserving the Composition’s communication quality.',
        relationshipPrompts: Object.freeze([
            'Place brand elements where they support recognition, not distraction.',
            'Keep the message primary unless brand recognition is the main goal.',
            'Use spacing and scale to make identity feel deliberate.',
        ]),
        qualitySignals: Object.freeze(['Identity', 'Placement', 'Recognition']),
    }),
});

function resolveDefinition(meaning = 'message') {
    return REFINEMENT_DEFINITIONS[meaning] ?? REFINEMENT_DEFINITIONS.message;
}

function isGraphicArtboard(node) {
    return (
        node?.type === 'frame' &&
        node?.metadata?.graphicArtifactRole === 'artboard' &&
        node?.metadata?.graphicFirstExpression === true
    );
}

function isExpressiveGraphicNode(node) {
    return Boolean(node?.metadata?.graphicSemanticRole);
}

export function resolveGraphicRefinementProjection(selectedNode = null, nodesById = {}) {
    const artboard = isGraphicArtboard(selectedNode)
        ? selectedNode
        : isExpressiveGraphicNode(selectedNode)
          ? nodesById?.[selectedNode.parentId] ?? null
          : null;

    if (!isGraphicArtboard(artboard)) return null;

    const expressiveChildren = Object.values(nodesById ?? {}).filter(
        (node) => node?.parentId === artboard.id && isExpressiveGraphicNode(node),
    );

    if (expressiveChildren.length === 0) return null;

    const primaryMeaning =
        selectedNode?.metadata?.graphicVocabularyMeaning ??
        expressiveChildren[expressiveChildren.length - 1]?.metadata?.graphicVocabularyMeaning ??
        'message';
    const definition = resolveDefinition(primaryMeaning);

    return Object.freeze({
        artboardId: artboard.id,
        compositionTitle: artboard?.metadata?.graphicCompositionTitle ?? 'Composition',
        expressiveCount: expressiveChildren.length,
        primaryMeaning,
        title: definition.title,
        subtitle: definition.subtitle,
        qualityFocus: definition.qualityFocus,
        relationshipPrompts: definition.relationshipPrompts,
        qualitySignals: definition.qualitySignals,
        ownership:
            'Composition remains the owner while hierarchy, emphasis, and relationships become clearer.',
    });
}

