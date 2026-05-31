import test from 'node:test';
import assert from 'node:assert/strict';

import { resolvePerspectiveAssistants } from '@/runtime/assistants/resolvePerspectiveAssistants.js';

test('perspective assistant resolution is deterministic for direct perspective routes', () => {
    const left = resolvePerspectiveAssistants({
        perspectiveId: 'create',
        entryId: 'uiux',
    });
    const right = resolvePerspectiveAssistants({
        perspectiveId: 'create',
        entryId: 'uiux',
    });

    assert.deepEqual(left, right);
    assert.equal(left.perspectiveId, 'create');
    assert.equal(left.adapter?.id, 'adapter.create');
    assert.ok(left.assistants.length >= 2);
    assert.ok(left.assistants.some((entry) => entry.id === 'assistant.design'));
    assert.ok(left.assistants.some((entry) => entry.id === 'assistant.media'));
    assert.equal(left.activeAssistantId, 'assistant.design');
});

test('create perspective assistant defaults stay entry-consistent across design and media entries', () => {
    const designEntry = resolvePerspectiveAssistants({
        perspectiveId: 'create',
        entryId: 'branding',
    });
    const mediaEntry = resolvePerspectiveAssistants({
        perspectiveId: 'create',
        entryId: 'animation',
    });
    const podcastEntry = resolvePerspectiveAssistants({
        perspectiveId: 'create',
        entryId: 'podcast',
    });

    assert.equal(designEntry.workspaceId, 'design');
    assert.equal(designEntry.activeAssistantId, 'assistant.design');
    assert.equal(mediaEntry.workspaceId, 'media');
    assert.equal(mediaEntry.activeAssistantId, 'assistant.media');
    assert.equal(podcastEntry.workspaceId, 'media');
    assert.equal(podcastEntry.overlayId, 'podcast');
    assert.equal(podcastEntry.activeAssistantId, 'assistant.media');
});

test('perspective assistant resolution follows perspective fallback and remains fail-closed', () => {
    const result = resolvePerspectiveAssistants({
        perspectiveId: 'unknown-perspective',
        entryId: 'unknown-entry',
    });

    assert.equal(result.perspectiveId, 'overview');
    assert.equal(result.adapter?.id, 'adapter.overview');
    assert.equal(result.activeAssistantId, null);
    assert.deepEqual(result.assistants, []);
});

test('perspective assistant resolution honors preferred assistant only within matching perspective', () => {
    const valid = resolvePerspectiveAssistants({
        perspectiveId: 'build',
        entryId: 'application',
        preferredAssistantId: 'assistant.build',
    });
    assert.equal(valid.activeAssistantId, 'assistant.build');

    const invalid = resolvePerspectiveAssistants({
        perspectiveId: 'build',
        entryId: 'application',
        preferredAssistantId: 'assistant.design',
    });
    assert.equal(invalid.activeAssistantId, 'assistant.build');
});

test('build perspective assistant defaults stay entry-consistent across canonical and overlay entries', () => {
    const applicationEntry = resolvePerspectiveAssistants({
        perspectiveId: 'build',
        entryId: 'application',
    });
    const aiEntry = resolvePerspectiveAssistants({
        perspectiveId: 'build',
        entryId: 'ai',
    });
    const conversionEntry = resolvePerspectiveAssistants({
        perspectiveId: 'build',
        entryId: 'conversion',
    });

    assert.equal(applicationEntry.workspaceId, 'build');
    assert.equal(applicationEntry.activeAssistantId, 'assistant.build');
    assert.equal(aiEntry.overlayId, 'ai-systems');
    assert.equal(aiEntry.activeAssistantId, 'assistant.build');
    assert.equal(conversionEntry.overlayId, 'conversion');
    assert.equal(conversionEntry.activeAssistantId, 'assistant.build');
});

test('perspective assistant resolution preserves overlay-backed operate routing', () => {
    const result = resolvePerspectiveAssistants({
        perspectiveId: 'operate',
        entryId: 'systems-engineering',
    });

    assert.equal(result.perspectiveId, 'operate');
    assert.equal(result.adapter?.id, 'adapter.operate');
    assert.equal(result.overlayId, 'systems-engineering');
    assert.equal(result.activeAssistantId, 'assistant.operations');
    assert.deepEqual(
        result.assistants.map((entry) => entry.id),
        ['assistant.operations'],
    );
});
