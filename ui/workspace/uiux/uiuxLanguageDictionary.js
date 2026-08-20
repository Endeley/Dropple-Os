const FRAME_CHILDREN = Object.freeze(['section', 'container', 'component', 'text', 'shape', 'image', 'button']);
const CONTAINER_CHILDREN = Object.freeze(['section', 'container', 'component', 'text', 'shape', 'image', 'button']);
const SECTION_CHILDREN = Object.freeze(['container', 'component', 'text', 'shape', 'image', 'button']);
const COMPONENT_CHILDREN = Object.freeze(['container', 'text', 'shape', 'image', 'button']);

const FRAME_DEFAULT_MOMENTUM = Object.freeze([
    'Define page purpose',
    'Establish content hierarchy',
    'Introduce primary action',
    'Organize page structure',
]);

const FRAME_SCENARIO_MOMENTUM = Object.freeze({
    landingPage: Object.freeze([
        'Create Hero Section',
        'Introduce Brand Identity',
        'Add Primary Call To Action',
        'Create Feature Sections',
    ]),
    dashboard: Object.freeze([
        'Create Navigation',
        'Add Metrics Overview',
        'Create Data Cards',
        'Organize Information Hierarchy',
    ]),
    login: Object.freeze([
        'Create Authentication Form',
        'Add Brand Identity',
        'Add Primary Action',
        'Provide Recovery Path',
    ]),
    settings: Object.freeze([
        'Create Preference Groups',
        'Organize Settings Categories',
        'Surface Account Information',
        'Add Save / Cancel Actions',
    ]),
});

const SCENARIO_ALIASES = Object.freeze({
    landing: 'landingPage',
    'landing page': 'landingPage',
    'landing-page': 'landingPage',
    landingpage: 'landingPage',
    homepage: 'landingPage',
    home: 'landingPage',
    dashboard: 'dashboard',
    login: 'login',
    signIn: 'login',
    signin: 'login',
    authentication: 'login',
    auth: 'login',
    settings: 'settings',
    preferences: 'settings',
});

function normalizeScenarioKey(value) {
    if (typeof value !== 'string') return null;
    const normalized = value.trim();
    if (normalized.length === 0) return null;
    const compact = normalized.replace(/[^a-zA-Z0-9]+/g, ' ').trim();
    if (compact.length === 0) return null;
    const lower = compact.toLowerCase();
    if (SCENARIO_ALIASES[lower]) return SCENARIO_ALIASES[lower];
    if (FRAME_SCENARIO_MOMENTUM[lower]) return lower;
    return null;
}

function extractScenarioCandidates(node) {
    if (!node || typeof node !== 'object') return [];

    return [
        node.scenario,
        node.intent,
        node.name,
        node.label,
        node.metadata?.scenario,
        node.metadata?.creativeScenario,
        node.meta?.scenario,
        node.meta?.creativeScenario,
        node.metadata?.intent,
        node.meta?.intent,
        node.props?.scenario,
        node.props?.intent,
    ].filter((value) => typeof value === 'string' && value.trim().length > 0);
}

export function resolveUIUXCreativeScenario(input) {
    if (typeof input === 'string') {
        return normalizeScenarioKey(input);
    }

    if (input && typeof input === 'object') {
        const direct =
            normalizeScenarioKey(input.scenario) ||
            normalizeScenarioKey(input.intent) ||
            normalizeScenarioKey(input.metadata?.scenario) ||
            normalizeScenarioKey(input.metadata?.creativeScenario) ||
            normalizeScenarioKey(input.metadata?.intent) ||
            normalizeScenarioKey(input.meta?.scenario) ||
            normalizeScenarioKey(input.meta?.creativeScenario) ||
            normalizeScenarioKey(input.meta?.intent);
        if (direct) return direct;

        const candidates = extractScenarioCandidates(input);
        for (const candidate of candidates) {
            const resolved = normalizeScenarioKey(candidate);
            if (resolved) return resolved;
        }
    }

    return null;
}

function resolveMomentumSteps(definition, scenario) {
    const defaultSteps = definition?.momentum?.default;
    const scenarioSteps = definition?.momentum?.scenarios?.[scenario];
    return Array.isArray(scenarioSteps) && scenarioSteps.length > 0 ? scenarioSteps : defaultSteps;
}

export const UIUX_LANGUAGE_DICTIONARY = Object.freeze({
    frame: Object.freeze({
        id: 'frame',
        label: 'Frame',
        concept: 'Page / Screen',
        identity: 'Page',
        identitySummary: 'The primary page or screen artifact in the application world.',
        meaning: 'It belongs to your Application.',
        belongsTo: 'Application',
        parentGrammar: 'Page',
        allowedChildren: FRAME_CHILDREN,
        capabilityDomains: Object.freeze(['Structure', 'Layout', 'Content', 'Appearance', 'Motion', 'Export']),
        evolvesInto: Object.freeze([
            'Landing Page',
            'Dashboard',
            'Login',
            'Settings',
            'Profile',
            'Mobile Screen',
            'Component Shell',
        ]),
        momentum: Object.freeze({
            default: FRAME_DEFAULT_MOMENTUM,
            scenarios: FRAME_SCENARIO_MOMENTUM,
        }),
        creation: Object.freeze({
            visible: true,
            order: 10,
            toolId: 'frame',
            railLabel: 'Frame',
        }),
        projection: Object.freeze({
            explainBeforeProperties: true,
            prompt: 'This Page can become:',
        }),
    }),
    text: Object.freeze({
        id: 'text',
        label: 'Text',
        concept: 'Content Hierarchy',
        identity: 'Text',
        identitySummary: 'Text introduces meaning, hierarchy, and communication into the interface.',
        meaning: 'It belongs inside a Page, Section, or Component.',
        belongsTo: 'Page / Section / Component',
        parentGrammar: 'Element',
        allowedChildren: Object.freeze([]),
        capabilityDomains: Object.freeze(['Content', 'Typography', 'Appearance']),
        evolvesInto: Object.freeze(['Heading', 'Paragraph', 'Label', 'Caption']),
        nextMeaningfulSteps: Object.freeze(['Refine hierarchy', 'Adjust typography', 'Add supporting content']),
        creation: Object.freeze({
            visible: true,
            order: 20,
            toolId: 'text',
            railLabel: 'Text',
        }),
        projection: Object.freeze({
            explainBeforeProperties: true,
            prompt: 'This Text can become:',
        }),
    }),
    shape: Object.freeze({
        id: 'shape',
        label: 'Shape',
        concept: 'Visual Primitive',
        identity: 'Shape',
        identitySummary: 'A primitive visual element that can become interface structure, emphasis, or support.',
        meaning: 'It belongs inside a Page, Section, or Component.',
        belongsTo: 'Page / Section / Component',
        parentGrammar: 'Element',
        allowedChildren: Object.freeze([]),
        capabilityDomains: Object.freeze(['Appearance', 'Layout', 'Motion']),
        evolvesInto: Object.freeze(['Card base', 'Surface block', 'Divider', 'Icon shape']),
        nextMeaningfulSteps: Object.freeze(['Adjust size', 'Refine appearance', 'Place inside layout']),
        creation: Object.freeze({
            visible: true,
            order: 25,
            toolId: 'shape',
            railLabel: 'Shape',
        }),
        projection: Object.freeze({
            explainBeforeProperties: true,
            prompt: 'This Shape can become:',
        }),
    }),
    image: Object.freeze({
        id: 'image',
        label: 'Image',
        concept: 'Visual Content',
        identity: 'Image',
        identitySummary: 'Images introduce illustration, media, and visual emphasis into the interface.',
        meaning: 'It belongs inside a Page, Section, or Component.',
        belongsTo: 'Page / Section / Component',
        parentGrammar: 'Element',
        allowedChildren: Object.freeze([]),
        capabilityDomains: Object.freeze(['Content', 'Appearance', 'Motion']),
        evolvesInto: Object.freeze(['Illustration', 'Photo', 'Background', 'Mask', 'Animated Asset']),
        nextMeaningfulSteps: Object.freeze(['Replace source', 'Add supporting text', 'Position within layout']),
        creation: Object.freeze({
            visible: true,
            order: 30,
            toolId: 'image',
            railLabel: 'Image',
        }),
        projection: Object.freeze({
            explainBeforeProperties: true,
            prompt: 'This Image can become:',
        }),
    }),
    container: Object.freeze({
        id: 'container',
        label: 'Container',
        concept: 'Section Boundary',
        identity: 'Container',
        identitySummary: 'A structural boundary that organizes related interface content.',
        meaning: 'It belongs inside a Page, Section, or Component.',
        belongsTo: 'Page / Section / Component',
        parentGrammar: 'Section',
        allowedChildren: CONTAINER_CHILDREN,
        capabilityDomains: Object.freeze(['Structure', 'Layout', 'Content', 'Appearance']),
        evolvesInto: Object.freeze(['Section', 'Card', 'Hero Block', 'Reusable Container']),
        nextMeaningfulSteps: Object.freeze(['Add content', 'Create layout', 'Group related interface elements']),
        creation: Object.freeze({
            visible: false,
            order: 40,
            toolId: null,
            railLabel: 'Container',
        }),
        projection: Object.freeze({
            explainBeforeProperties: true,
            prompt: 'This Container can become:',
        }),
    }),
    button: Object.freeze({
        id: 'button',
        label: 'Button',
        concept: 'Interactive Element',
        identity: 'Button',
        identitySummary: 'A primary interaction element that invites action inside the interface.',
        meaning: 'It belongs inside a Section or Component.',
        belongsTo: 'Section / Component',
        parentGrammar: 'Element',
        allowedChildren: Object.freeze([]),
        capabilityDomains: Object.freeze(['Content', 'Appearance', 'Interaction', 'Motion']),
        evolvesInto: Object.freeze(['Primary CTA', 'Secondary Action', 'Icon Button', 'Navigation Action']),
        nextMeaningfulSteps: Object.freeze(['Set label', 'Choose hierarchy', 'Connect to interaction flow']),
        creation: Object.freeze({
            visible: false,
            order: 50,
            toolId: null,
            railLabel: 'Button',
        }),
        projection: Object.freeze({
            explainBeforeProperties: true,
            prompt: 'This Button can become:',
        }),
    }),
    section: Object.freeze({
        id: 'section',
        label: 'Section',
        concept: 'Application Section',
        identity: 'Section',
        identitySummary: 'A meaningful area of a page that groups related content and purpose.',
        meaning: 'It belongs inside a Page.',
        belongsTo: 'Page',
        parentGrammar: 'Section',
        allowedChildren: SECTION_CHILDREN,
        capabilityDomains: Object.freeze(['Structure', 'Layout', 'Content', 'Appearance']),
        evolvesInto: Object.freeze(['Hero Section', 'Feature Section', 'Pricing Section', 'Settings Section']),
        nextMeaningfulSteps: Object.freeze(['Add content', 'Define hierarchy', 'Turn into a reusable pattern']),
        creation: Object.freeze({
            visible: false,
            order: 60,
            toolId: null,
            railLabel: 'Section',
        }),
        projection: Object.freeze({
            explainBeforeProperties: true,
            prompt: 'This Section can become:',
        }),
    }),
    component: Object.freeze({
        id: 'component',
        label: 'Component',
        concept: 'Reusable Interface Unit',
        identity: 'Component',
        identitySummary: 'A reusable interface unit that can repeat across the application.',
        meaning: 'It belongs to your Application or Page structure.',
        belongsTo: 'Application / Page',
        parentGrammar: 'Component',
        allowedChildren: COMPONENT_CHILDREN,
        capabilityDomains: Object.freeze(['Structure', 'Layout', 'Content', 'Appearance', 'Interaction', 'Export']),
        evolvesInto: Object.freeze(['Navigation Component', 'Card Component', 'Form Component', 'Design System Seed']),
        nextMeaningfulSteps: Object.freeze(['Add content', 'Define reuse boundaries', 'Refine interaction behavior']),
        creation: Object.freeze({
            visible: false,
            order: 70,
            toolId: null,
            railLabel: 'Component',
        }),
        projection: Object.freeze({
            explainBeforeProperties: true,
            prompt: 'This Component can become:',
        }),
    }),
});

export const UIUX_LANGUAGE_ORDER = Object.freeze(['frame', 'text', 'shape', 'image', 'container', 'button', 'section', 'component']);

export function getUIUXLanguageDefinition(artifactType, options = {}) {
    if (typeof artifactType !== 'string' || artifactType.trim().length === 0) return null;
    const definition = UIUX_LANGUAGE_DICTIONARY[artifactType] ?? null;
    if (!definition) return null;

    if (!definition.momentum) {
        return definition;
    }

    const scenario = resolveUIUXCreativeScenario(options?.scenario ?? options?.node ?? null);
    const nextMeaningfulSteps = resolveMomentumSteps(definition, scenario);

    return Object.freeze({
        ...definition,
        activeScenario: scenario,
        nextMeaningfulSteps: Array.isArray(nextMeaningfulSteps) ? nextMeaningfulSteps : [],
    });
}

export function getUIUXCreationEntries({ availableToolIds = [] } = {}) {
    const allowed = new Set(Array.isArray(availableToolIds) ? availableToolIds : []);

    return UIUX_LANGUAGE_ORDER.map((id) => UIUX_LANGUAGE_DICTIONARY[id])
        .filter((entry) => entry?.creation?.visible === true && entry.creation.toolId && allowed.has(entry.creation.toolId))
        .sort((left, right) => (left.creation.order ?? 0) - (right.creation.order ?? 0));
}
