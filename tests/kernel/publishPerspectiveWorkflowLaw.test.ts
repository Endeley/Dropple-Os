import test from 'node:test';
import assert from 'node:assert/strict';

import { ArtifactKind } from '@/core/artifacts/ArtifactKind.js';
import { buildPublishPerspectiveWorldSummary } from '@/runtime/workspaces/publishPerspectiveWorkflow.js';

test('publish perspective world summary is deterministic and entry-aware', () => {
    const document = Object.freeze({
        exports: Object.freeze({
            targets: Object.freeze([
                Object.freeze({ id: 'web', type: 'web' }),
                Object.freeze({ id: 'video', type: 'mp4' }),
            ]),
        }),
        components: Object.freeze({
            definitions: Object.freeze({ button: Object.freeze({}), card: Object.freeze({}) }),
            instances: Object.freeze({ hero: Object.freeze({}) }),
        }),
        themes: Object.freeze({
            activeThemeId: 'dark',
            byId: Object.freeze({
                dark: Object.freeze({
                    variants: Object.freeze({
                        compact: Object.freeze({}),
                        spacious: Object.freeze({}),
                    }),
                }),
            }),
        }),
        tokens: Object.freeze({
            color: Object.freeze({ primary: '#000000' }),
            spacing: Object.freeze({ base: 8 }),
        }),
    });
    const universe = Object.freeze({
        hubId: 'project:hub',
        nodes: Object.freeze({
            'project:hub': Object.freeze({ id: 'project:hub', kind: ArtifactKind.PROJECT_HUB, label: 'Hub' }),
            'document:primary': Object.freeze({ id: 'document:primary', kind: ArtifactKind.DOCUMENT, label: 'Release Notes' }),
            'components:library': Object.freeze({ id: 'components:library', kind: ArtifactKind.COMPONENT_LIBRARY, label: 'Component Library' }),
            'workflow:publish': Object.freeze({ id: 'workflow:publish', kind: ArtifactKind.WORKFLOW, label: 'Publish Targets' }),
        }),
    });

    const governanceA = buildPublishPerspectiveWorldSummary({ entryId: 'governance', document, universe });
    const governanceB = buildPublishPerspectiveWorldSummary({ entryId: 'governance', document, universe });
    const themes = buildPublishPerspectiveWorldSummary({ entryId: 'themes', document, universe });
    const variants = buildPublishPerspectiveWorldSummary({ entryId: 'variants', document, universe });
    const components = buildPublishPerspectiveWorldSummary({ entryId: 'components', document, universe });

    assert.deepEqual(governanceA, governanceB);
    assert.equal(governanceA.activityLabel, 'Governance');
    assert.equal(governanceA.currentTaskLabel, 'Publish Targets');
    assert.equal(governanceA.linkedContextCount, 3);
    assert.equal(governanceA.summaryLabel, '2 export targets · 3 components · 1 themes');
    assert.equal(themes.currentTaskLabel, 'dark');
    assert.equal(themes.summaryLabel, '1 themes · 2 variants · 2 token groups');
    assert.equal(variants.currentTaskLabel, 'dark/compact');
    assert.equal(components.currentTaskLabel, 'Component Library');
    assert.equal(components.summaryLabel, '3 components · 1 themes · 2 variants');
});

test('publish perspective world summary fails closed when publish context is empty', () => {
    assert.deepEqual(
        buildPublishPerspectiveWorldSummary({ entryId: 'review', document: null, universe: null }),
        Object.freeze({
            activityLabel: 'Review',
            currentTaskLabel: 'Awaiting release review',
            linkedContextCount: 0,
            summaryLabel: '0 export targets · 0 components · 0 themes',
            bridgeLabel: 'Publish / Review',
        }),
    );
});
