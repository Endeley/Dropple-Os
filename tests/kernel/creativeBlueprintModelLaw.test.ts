import test from 'node:test';
import assert from 'node:assert/strict';

import { validateCreativeBlueprintV1 } from '@/domain/creativeBlueprint/CreativeBlueprintContract.js';
import { planUIUXArtifactModel } from '@/domain/creativeBlueprint/planUIUXArtifactModel.js';

function createLandingPageBlueprintFixture() {
    return {
        world: 'Digital Product Design',
        scenario: 'landingPage',
        purpose: 'Present an AI SaaS product',
        structure: [
            { type: 'hero' },
            { type: 'features' },
            { type: 'pricing' },
            { type: 'faq' },
            { type: 'footer' },
        ],
        relationships: [
            { from: 'hero:1', to: 'features:2' },
            { from: 'features:2', to: 'pricing:3' },
        ],
    };
}

function createLoginBlueprintFixture() {
    return {
        world: 'Digital Product Design',
        scenario: 'login',
        purpose: 'Authenticate a returning user',
        structure: [
            { id: 'identity-region', type: 'identityRegion', label: 'Identity Region' },
            { id: 'auth-form', type: 'authenticationForm', label: 'Authentication Form' },
            { id: 'primary-action', type: 'primaryAction', label: 'Sign In' },
            { id: 'recovery-path', type: 'recoveryPath', label: 'Forgot Password' },
        ],
        relationships: [{ from: 'identity-region', to: 'auth-form' }],
    };
}

function createSettingsBlueprintFixture() {
    return {
        world: 'Digital Product Design',
        scenario: 'settings',
        purpose: 'Organize editable preferences',
        structure: [{ id: 'preference-groups', type: 'preferenceGroups', label: 'Preference Groups' }],
        relationships: [{ from: 'preference-groups', to: 'preference-groups' }],
    };
}

function createDashboardBlueprintFixture() {
    return {
        world: 'Digital Product Design',
        scenario: 'dashboard',
        purpose: 'Summarize system status and navigation',
        structure: [
            { id: 'dashboard-navigation', type: 'navigation', label: 'Navigation' },
            { id: 'dashboard-metrics', type: 'metrics', label: 'Metrics Overview' },
            { id: 'dashboard-data', type: 'dataCards', label: 'Data Cards' },
        ],
        relationships: [{ from: 'dashboard-navigation', to: 'dashboard-metrics' }],
    };
}

function artifactById(plan, id) {
    return plan.artifacts.find((artifact) => artifact.id === id) ?? null;
}

test('creative blueprint contract validates a minimal uiux blueprint deterministically', () => {
    const left = validateCreativeBlueprintV1(createLandingPageBlueprintFixture());
    const right = validateCreativeBlueprintV1(createLandingPageBlueprintFixture());

    assert.deepEqual(left, right);
    assert.equal(left.schemaVersion, '1.0.0');
    assert.equal(left.world, 'Digital Product Design');
    assert.equal(left.scenario, 'landingPage');
    assert.equal(left.structure[0].id, 'hero:1');
    assert.equal(left.relationships[0].from, 'hero:1');
});

test('creative blueprint contract fails closed when relationships reference unknown structure ids', () => {
    assert.throws(
        () =>
            validateCreativeBlueprintV1({
                ...createLandingPageBlueprintFixture(),
                relationships: [{ from: 'missing', to: 'features:2' }],
            }),
        /unknown source id: missing/,
    );
});

test('uiux artifact planner emits deterministic artifact model from blueprint', () => {
    const left = planUIUXArtifactModel({ blueprint: createLandingPageBlueprintFixture() });
    const right = planUIUXArtifactModel({ blueprint: createLandingPageBlueprintFixture() });

    assert.deepEqual(left, right);
    assert.equal(left.root.artifactType, 'frame');
    assert.equal(left.root.semanticRole, 'page');
    assert.ok(left.artifacts.length > 5);
    assert.deepEqual(
        left.artifacts
            .filter((artifact) => artifact.parentId === 'page-root')
            .map((artifact) => artifact.semanticRole),
        ['hero', 'features', 'pricing', 'faq', 'footer'],
    );
    const heroHeading = artifactById(left, 'hero:1::heading:1');
    assert.equal(heroHeading?.parentId, 'hero:1');
    assert.equal(heroHeading?.artifactType, 'text');
});

test('uiux artifact planner fails closed for non-uiux worlds', () => {
    assert.throws(
        () =>
            planUIUXArtifactModel({
                blueprint: {
                    ...createLandingPageBlueprintFixture(),
                    world: 'Visual Communication',
                },
            }),
        /only supports world "Digital Product Design"/,
    );
});

test('uiux artifact planner keeps relationship entries advisory when they do not lawfully define structure', () => {
    const blueprint = createLandingPageBlueprintFixture();
    const reordered = {
        ...blueprint,
        relationships: [{ from: 'pricing:3', to: 'hero:1' }],
    };

    const left = planUIUXArtifactModel({ blueprint });
    const right = planUIUXArtifactModel({ blueprint: reordered });

    assert.deepEqual(
        left.artifacts.map((artifact) => [artifact.id, artifact.parentId, artifact.order]),
        right.artifacts.map((artifact) => [artifact.id, artifact.parentId, artifact.order]),
    );
    assert.deepEqual(left.advisoryRelationships, blueprint.relationships);
    assert.deepEqual(right.advisoryRelationships, reordered.relationships);
    assert.deepEqual(left.structuralRelationships.length > 0, true);
});

test('uiux artifact planner remains runtime-independent and avoids runtime-only fields', () => {
    const plan = planUIUXArtifactModel({ blueprint: createDashboardBlueprintFixture() });

    const nodesToInspect = [plan.root, ...plan.artifacts];
    for (const entry of nodesToInspect) {
        assert.equal(Object.hasOwn(entry, 'type'), false);
        assert.equal(Object.hasOwn(entry, 'transform'), false);
        assert.equal(Object.hasOwn(entry, 'seedGraph'), false);
        assert.equal(Object.hasOwn(entry, 'seedEvents'), false);
        assert.equal(Object.hasOwn(entry, 'lineage'), false);
        assert.equal(Object.hasOwn(entry, 'certification'), false);
    }
});

test('uiux artifact planner produces form-centered hierarchy for login scenarios', () => {
    const plan = planUIUXArtifactModel({ blueprint: createLoginBlueprintFixture() });

    assert.equal(artifactById(plan, 'primary-action')?.parentId, 'auth-form');
    assert.equal(artifactById(plan, 'recovery-path')?.parentId, 'auth-form');
    assert.equal(artifactById(plan, 'auth-form::identifierField:1')?.parentId, 'auth-form');
    assert.equal(artifactById(plan, 'auth-form::secretField:2')?.parentId, 'auth-form');
});

test('uiux artifact planner produces grouped preference hierarchy for settings scenarios', () => {
    const plan = planUIUXArtifactModel({ blueprint: createSettingsBlueprintFixture() });

    assert.deepEqual(
        plan.artifacts
            .filter((artifact) => artifact.parentId === 'preference-groups')
            .map((artifact) => artifact.semanticRole),
        ['accountPreferences', 'notificationPreferences', 'securityPreferences'],
    );
});
