'use client';

const DELIVERY_DEFINITIONS = Object.freeze({
    poster: Object.freeze({
        title: 'This Composition is ready to reach an audience.',
        subtitle: 'Choose where this communication needs to go before choosing a format.',
        audiences: Object.freeze([
            Object.freeze({
                id: 'clientReview',
                label: 'Client review',
                intent: 'Share this with a client or stakeholder for feedback.',
            }),
            Object.freeze({
                id: 'socialPost',
                label: 'Social post',
                intent: 'Prepare this communication for a social audience.',
            }),
            Object.freeze({
                id: 'printHandoff',
                label: 'Print handoff',
                intent: 'Prepare this communication for print production or handoff.',
            }),
            Object.freeze({
                id: 'presentation',
                label: 'Presentation',
                intent: 'Use this communication in a live or reviewed presentation.',
            }),
        ]),
    }),
    socialGraphic: Object.freeze({
        title: 'This Composition is ready to reach an audience.',
        subtitle: 'Choose where this communication needs to go before choosing a format.',
        audiences: Object.freeze([
            Object.freeze({ id: 'socialPost', label: 'Social post', intent: 'Prepare this communication for a social audience.' }),
            Object.freeze({ id: 'clientReview', label: 'Client review', intent: 'Share this with a client or stakeholder for feedback.' }),
            Object.freeze({ id: 'campaignPreview', label: 'Campaign preview', intent: 'Review this communication as part of a larger campaign.' }),
            Object.freeze({ id: 'presentation', label: 'Presentation', intent: 'Use this communication in a live or reviewed presentation.' }),
        ]),
    }),
    brandBoard: Object.freeze({
        title: 'This Composition is ready to reach an audience.',
        subtitle: 'Choose where this communication needs to go before choosing a format.',
        audiences: Object.freeze([
            Object.freeze({ id: 'clientReview', label: 'Client review', intent: 'Share this identity direction for stakeholder review.' }),
            Object.freeze({ id: 'brandHandoff', label: 'Brand handoff', intent: 'Prepare this identity system for handoff or documentation.' }),
            Object.freeze({ id: 'presentation', label: 'Presentation', intent: 'Use this identity work in a live or reviewed presentation.' }),
            Object.freeze({ id: 'teamAlignment', label: 'Team alignment', intent: 'Use this composition to align a team around brand direction.' }),
        ]),
    }),
});

function resolveDefinition(starterId = 'poster') {
    return DELIVERY_DEFINITIONS[starterId] ?? DELIVERY_DEFINITIONS.poster;
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

export function resolveGraphicDeliveryProjection(selectedNode = null, nodesById = {}) {
    const artboard = isGraphicArtboard(selectedNode)
        ? selectedNode
        : isExpressiveGraphicNode(selectedNode)
          ? nodesById?.[selectedNode.parentId] ?? null
          : null;

    if (!isGraphicArtboard(artboard)) return null;

    const expressiveChildren = Object.values(nodesById ?? {}).filter(
        (node) => node?.parentId === artboard.id && isExpressiveGraphicNode(node),
    );

    if (expressiveChildren.length < 1) return null;

    const definition = resolveDefinition(artboard?.metadata?.graphicStarterId ?? 'poster');

    return Object.freeze({
        artboardId: artboard.id,
        compositionTitle: artboard?.metadata?.graphicCompositionTitle ?? 'Composition',
        expressiveCount: expressiveChildren.length,
        title: definition.title,
        subtitle: definition.subtitle,
        audiences: definition.audiences,
        ownership:
            'Composition remains the owner. Delivery decisions should follow audience need before export format.',
    });
}
