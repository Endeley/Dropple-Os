import { validateCreativeBlueprintV1 } from './CreativeBlueprintContract.js';

const UIUX_ARTIFACT_KIND_BY_STRUCTURE_TYPE = Object.freeze({
    hero: 'section',
    features: 'section',
    pricing: 'section',
    faq: 'section',
    footer: 'section',
    navigation: 'section',
    metrics: 'section',
    dataCards: 'section',
    charts: 'section',
    tables: 'section',
    activity: 'section',
    activityRegion: 'section',
    identityRegion: 'section',
    authenticationForm: 'section',
    primaryAction: 'button',
    recoveryPath: 'text',
    preferenceGroups: 'section',
    accountInfo: 'section',
    saveActions: 'section',
});

const STRUCTURAL_RELATIONSHIP_TYPES = Object.freeze({
    CONTAINS: 'contains',
    ORDERS: 'orders',
    REFERENCES: 'references',
});

function resolveArtifactKind(type) {
    return UIUX_ARTIFACT_KIND_BY_STRUCTURE_TYPE[type] ?? 'section';
}

function resolveArtifactLabel(entry) {
    if (typeof entry.label === 'string' && entry.label.trim().length > 0) {
        return entry.label.trim();
    }

    return entry.type
        .replace(/([A-Z])/g, ' $1')
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/^./, (value) => value.toUpperCase());
}

function createRoot(validated) {
    return Object.freeze({
        id: 'page-root',
        artifactType: 'frame',
        semanticRole: 'page',
        label: validated.scenario,
        parentId: null,
    });
}

function createPlannerState(validated, root) {
    const entriesByType = new Map(validated.structure.map((entry) => [entry.type, entry]));
    const artifacts = [];
    const structuralRelationships = [];
    const artifactIds = new Set([root.id]);
    let syntheticCounter = 0;

    function addArtifact({
        id,
        artifactType,
        semanticRole,
        label,
        parentId,
        order,
        sourceBlueprintId = null,
    }) {
        if (artifactIds.has(id)) {
            throw new Error(`uiux artifact planner emitted duplicate artifact id "${id}"`);
        }

        artifactIds.add(id);
        artifacts.push(
            Object.freeze({
                id,
                artifactType,
                semanticRole,
                label,
                parentId,
                order,
                ...(sourceBlueprintId ? { sourceBlueprintId } : {}),
            }),
        );

        if (parentId) {
            structuralRelationships.push(
                Object.freeze({
                    type: STRUCTURAL_RELATIONSHIP_TYPES.CONTAINS,
                    parentId,
                    childId: id,
                    order,
                }),
            );
        }
    }

    function addBlueprintArtifact(entry, { parentId = root.id, order = 0 } = {}) {
        addArtifact({
            id: entry.id,
            artifactType: resolveArtifactKind(entry.type),
            semanticRole: entry.type,
            label: resolveArtifactLabel(entry),
            parentId,
            order,
            sourceBlueprintId: entry.id,
        });
        return entry.id;
    }

    function addPlannedArtifact(parentId, order, semanticRole, artifactType, label) {
        syntheticCounter += 1;
        const id = `${parentId}::${semanticRole}:${syntheticCounter}`;
        addArtifact({
            id,
            artifactType,
            semanticRole,
            label,
            parentId,
            order,
        });
        return id;
    }

    function addChildren(parentId, specs) {
        specs.forEach((spec, index) => {
            addPlannedArtifact(parentId, index, spec.semanticRole, spec.artifactType, spec.label);
        });
    }

    return {
        root,
        validated,
        entriesByType,
        artifacts,
        structuralRelationships,
        addBlueprintArtifact,
        addChildren,
    };
}

function buildLandingPageStructure(state) {
    state.validated.structure.forEach((entry, index) => {
        const sectionId = state.addBlueprintArtifact(entry, { parentId: state.root.id, order: index });

        switch (entry.type) {
            case 'hero':
                state.addChildren(sectionId, [
                    { semanticRole: 'heading', artifactType: 'text', label: 'Hero Heading' },
                    { semanticRole: 'supportingCopy', artifactType: 'text', label: 'Hero Supporting Copy' },
                    { semanticRole: 'primaryAction', artifactType: 'button', label: 'Primary CTA' },
                ]);
                break;
            case 'features':
                state.addChildren(sectionId, [
                    { semanticRole: 'featureGrid', artifactType: 'container', label: 'Feature Grid' },
                    { semanticRole: 'featureSummary', artifactType: 'text', label: 'Feature Summary' },
                ]);
                break;
            case 'pricing':
                state.addChildren(sectionId, [
                    { semanticRole: 'pricingSummary', artifactType: 'text', label: 'Pricing Summary' },
                    { semanticRole: 'pricingAction', artifactType: 'button', label: 'Choose Plan' },
                ]);
                break;
            case 'faq':
                state.addChildren(sectionId, [
                    { semanticRole: 'faqList', artifactType: 'container', label: 'FAQ List' },
                ]);
                break;
            case 'footer':
                state.addChildren(sectionId, [
                    { semanticRole: 'footerLinks', artifactType: 'container', label: 'Footer Links' },
                ]);
                break;
            default:
                state.addChildren(sectionId, [
                    { semanticRole: `${entry.type}Content`, artifactType: 'container', label: `${resolveArtifactLabel(entry)} Content` },
                ]);
        }
    });
}

function buildDashboardStructure(state) {
    state.validated.structure.forEach((entry, index) => {
        const sectionId = state.addBlueprintArtifact(entry, { parentId: state.root.id, order: index });

        switch (entry.type) {
            case 'navigation':
                state.addChildren(sectionId, [
                    { semanticRole: 'navigationBrand', artifactType: 'text', label: 'Product Identity' },
                    { semanticRole: 'navigationItems', artifactType: 'container', label: 'Navigation Items' },
                ]);
                break;
            case 'metrics':
                state.addChildren(sectionId, [
                    { semanticRole: 'metricsHeader', artifactType: 'text', label: 'Overview Heading' },
                    { semanticRole: 'metricCards', artifactType: 'container', label: 'Metric Cards' },
                ]);
                break;
            case 'dataCards':
                state.addChildren(sectionId, [
                    { semanticRole: 'dataGrid', artifactType: 'container', label: 'Data Card Grid' },
                    { semanticRole: 'detailPanel', artifactType: 'container', label: 'Detail Panel' },
                ]);
                break;
            default:
                state.addChildren(sectionId, [
                    { semanticRole: `${entry.type}Content`, artifactType: 'container', label: `${resolveArtifactLabel(entry)} Content` },
                ]);
        }
    });
}

function buildLoginStructure(state) {
    const authenticationEntry = state.entriesByType.get('authenticationForm') ?? null;
    const nestedTypes = new Set(['primaryAction', 'recoveryPath']);

    state.validated.structure.forEach((entry, index) => {
        const parentId =
            authenticationEntry && nestedTypes.has(entry.type) ? authenticationEntry.id : state.root.id;
        state.addBlueprintArtifact(entry, {
            parentId,
            order: index,
        });
    });

    if (authenticationEntry) {
        state.addChildren(authenticationEntry.id, [
            { semanticRole: 'identifierField', artifactType: 'text', label: 'Email or Username' },
            { semanticRole: 'secretField', artifactType: 'text', label: 'Password' },
        ]);
    }
}

function buildSettingsStructure(state) {
    state.validated.structure.forEach((entry, index) => {
        const sectionId = state.addBlueprintArtifact(entry, { parentId: state.root.id, order: index });

        if (entry.type === 'preferenceGroups') {
            state.addChildren(sectionId, [
                { semanticRole: 'accountPreferences', artifactType: 'container', label: 'Account Preferences' },
                { semanticRole: 'notificationPreferences', artifactType: 'container', label: 'Notification Preferences' },
                { semanticRole: 'securityPreferences', artifactType: 'container', label: 'Security Preferences' },
            ]);
            return;
        }

        state.addChildren(sectionId, [
            { semanticRole: `${entry.type}Content`, artifactType: 'container', label: `${resolveArtifactLabel(entry)} Content` },
        ]);
    });
}

function buildGenericStructure(state) {
    state.validated.structure.forEach((entry, index) => {
        const sectionId = state.addBlueprintArtifact(entry, { parentId: state.root.id, order: index });
        state.addChildren(sectionId, [
            { semanticRole: `${entry.type}Content`, artifactType: 'container', label: `${resolveArtifactLabel(entry)} Content` },
        ]);
    });
}

const PLAN_BUILDERS_BY_SCENARIO = Object.freeze({
    landingPage: buildLandingPageStructure,
    dashboard: buildDashboardStructure,
    login: buildLoginStructure,
    settings: buildSettingsStructure,
});

export function planUIUXArtifactModel({ blueprint }) {
    const validated = validateCreativeBlueprintV1(blueprint);

    if (validated.world !== 'Digital Product Design') {
        throw new Error(`uiux artifact planner only supports world "Digital Product Design" (received ${validated.world})`);
    }

    const root = createRoot(validated);
    const state = createPlannerState(validated, root);
    const planBuilder = PLAN_BUILDERS_BY_SCENARIO[validated.scenario] ?? buildGenericStructure;

    planBuilder(state);

    return Object.freeze({
        schemaVersion: '1.0.0',
        world: validated.world,
        scenario: validated.scenario,
        purpose: validated.purpose,
        root,
        artifacts: Object.freeze(state.artifacts),
        structuralRelationships: Object.freeze(state.structuralRelationships),
        advisoryRelationships: validated.relationships,
        relationships: validated.relationships,
    });
}
