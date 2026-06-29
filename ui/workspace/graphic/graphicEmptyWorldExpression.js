const GRAPHIC_EMPTY_WORLD_STARTERS = Object.freeze([
    Object.freeze({
        id: 'poster',
        label: 'Poster',
        title: 'Poster',
        description: 'Promote one message with clear hierarchy and visual impact.',
        compositionLabel: 'Poster Composition',
        accent: 'coral',
    }),
    Object.freeze({
        id: 'socialGraphic',
        label: 'Social Graphic',
        title: 'Social Graphic',
        description: 'Create a fast, focused communication for a social feed.',
        compositionLabel: 'Social Graphic Composition',
        accent: 'blue',
    }),
    Object.freeze({
        id: 'brandBoard',
        label: 'Brand Board',
        title: 'Brand Board',
        description: 'Gather visual direction, typography, color, and identity cues.',
        compositionLabel: 'Brand Board Composition',
        accent: 'gold',
    }),
    Object.freeze({
        id: 'logoSheet',
        label: 'Logo Sheet',
        title: 'Logo Sheet',
        description: 'Explore marks, variations, and first identity directions.',
        compositionLabel: 'Logo Sheet Composition',
        accent: 'violet',
    }),
    Object.freeze({
        id: 'flyer',
        label: 'Flyer',
        title: 'Flyer',
        description: 'Communicate an offer, event, or announcement in one clear piece.',
        compositionLabel: 'Flyer Composition',
        accent: 'teal',
    }),
    Object.freeze({
        id: 'presentationCover',
        label: 'Presentation Cover',
        title: 'Presentation Cover',
        description: 'Frame the first impression of a story, pitch, or proposal.',
        compositionLabel: 'Presentation Cover Composition',
        accent: 'slate',
    }),
]);

function isGraphicMode({ workspaceId = null, modeId = null } = {}) {
    return workspaceId === 'graphic' || modeId === 'graphic';
}

export function getGraphicEmptyWorldStarters() {
    return GRAPHIC_EMPTY_WORLD_STARTERS;
}

export function resolveGraphicEmptyWorldStarter(starterId) {
    return GRAPHIC_EMPTY_WORLD_STARTERS.find((starter) => starter.id === starterId) ?? GRAPHIC_EMPTY_WORLD_STARTERS[0];
}

export function shouldShowGraphicEmptyWorld({
    workspaceId = null,
    modeId = null,
    nodeCount = 0,
} = {}) {
    if (!isGraphicMode({ workspaceId, modeId })) return false;
    return Number(nodeCount) === 0;
}
