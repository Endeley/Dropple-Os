const GRAPHIC_COMPOSITION_DEFINITIONS = Object.freeze({
    poster: Object.freeze({
        starterId: 'poster',
        title: 'Poster Composition',
        meaning:
            'This Composition owns a focused communication piece with one primary message, clear hierarchy, and strong visual emphasis.',
        ownership:
            'It holds the direction, relationships, and future expressions of the work before any Artboard becomes necessary.',
        nextMeaningfulSteps: Object.freeze([
            'Clarify the focal message',
            'Establish visual hierarchy',
            'Define color direction',
            'Gather supporting imagery',
        ]),
        capabilityDomains: Object.freeze(['Structure', 'Hierarchy', 'Typography', 'Color']),
    }),
    socialGraphic: Object.freeze({
        starterId: 'socialGraphic',
        title: 'Social Graphic Composition',
        meaning:
            'This Composition owns a fast, focused communication made for quick recognition, clarity, and visual impact.',
        ownership:
            'It keeps the message, pacing, and future expressions aligned before any Artboard or object appears.',
        nextMeaningfulSteps: Object.freeze([
            'Define the key message',
            'Choose the focal visual',
            'Set the visual rhythm',
            'Introduce brand cues',
        ]),
        capabilityDomains: Object.freeze(['Structure', 'Hierarchy', 'Brand', 'Color']),
    }),
    brandBoard: Object.freeze({
        starterId: 'brandBoard',
        title: 'Brand Board Composition',
        meaning:
            'This Composition owns a visual identity system by keeping typography, color, tone, and reference relationships together.',
        ownership:
            'It organizes the shared visual language that future expressions will inherit.',
        nextMeaningfulSteps: Object.freeze([
            'Define visual direction',
            'Choose typography signals',
            'Establish color language',
            'Collect shared references',
        ]),
        capabilityDomains: Object.freeze(['Brand', 'Typography', 'Color', 'Relationships']),
    }),
    logoSheet: Object.freeze({
        starterId: 'logoSheet',
        title: 'Logo Sheet Composition',
        meaning:
            'This Composition owns mark exploration by holding variations, comparisons, and identity relationships in one communication system.',
        ownership:
            'It keeps visual identity exploration coherent before any individual expression surface appears.',
        nextMeaningfulSteps: Object.freeze([
            'Define the mark direction',
            'Compare variation families',
            'Test visual balance',
            'Establish identity cues',
        ]),
        capabilityDomains: Object.freeze(['Structure', 'Identity', 'Precision', 'Relationships']),
    }),
    flyer: Object.freeze({
        starterId: 'flyer',
        title: 'Flyer Composition',
        meaning:
            'This Composition owns a single promotional communication that must organize message, callouts, and emphasis clearly.',
        ownership:
            'It keeps offer, hierarchy, and support material aligned before future expressions begin.',
        nextMeaningfulSteps: Object.freeze([
            'Clarify the offer',
            'Organize message priority',
            'Define supporting details',
            'Set visual emphasis',
        ]),
        capabilityDomains: Object.freeze(['Structure', 'Hierarchy', 'Typography', 'Emphasis']),
    }),
    presentationCover: Object.freeze({
        starterId: 'presentationCover',
        title: 'Presentation Cover Composition',
        meaning:
            'This Composition owns the first impression of a story, pitch, or proposal by framing tone, message, and visual confidence.',
        ownership:
            'It defines the opening communication system that later expressions will extend.',
        nextMeaningfulSteps: Object.freeze([
            'Frame the opening message',
            'Choose the visual tone',
            'Establish hierarchy',
            'Introduce supporting identity',
        ]),
        capabilityDomains: Object.freeze(['Structure', 'Tone', 'Typography', 'Brand']),
    }),
});

export function resolveGraphicCompositionProjection(starterId = 'poster') {
    return GRAPHIC_COMPOSITION_DEFINITIONS[starterId] ?? GRAPHIC_COMPOSITION_DEFINITIONS.poster;
}
