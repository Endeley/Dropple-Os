import test from 'node:test';
import assert from 'node:assert/strict';

import {
    PROJECT_PERSPECTIVES,
    getProjectPerspectiveDefinition,
    hasProjectPerspective,
    listProjectPerspectiveIds,
    resolveInitialProjectPerspectiveContext,
    resolveProjectPerspectiveFocus,
    resolveProjectPerspectiveContext,
    resolveProjectPerspectiveForEntry,
} from '@/platform/workspaces/projectPerspectiveRouter.js';

test('project perspective ids are deterministic and complete', () => {
    assert.deepEqual(listProjectPerspectiveIds(), ['build', 'collaborate', 'create', 'operate', 'overview', 'publish']);
});

test('project perspective registry exposes immutable definitions', () => {
    const create = getProjectPerspectiveDefinition('create');
    assert.ok(create);
    assert.equal(Object.isFrozen(create), true);
    assert.equal(create?.defaultEntryId, 'uiux');
    assert.deepEqual(create?.entries, ['uiux', 'graphic', 'branding', 'icons', 'document', 'animation', 'video', 'audio', 'podcast']);
    assert.equal(Object.isFrozen(PROJECT_PERSPECTIVES), true);
});

test('project perspective predicates are strict and normalized', () => {
    assert.equal(hasProjectPerspective('create'), true);
    assert.equal(hasProjectPerspective(' CREATE '), true);
    assert.equal(hasProjectPerspective('unknown'), false);
});

test('project perspective resolves create entry to canonical workspace context', () => {
    assert.deepEqual(
        resolveProjectPerspectiveContext({ perspectiveId: 'create', entryId: 'video' }),
        Object.freeze({
            perspectiveId: 'create',
            perspectiveLabel: 'Create',
            perspectiveSource: 'perspective-direct',
            entryId: 'video',
            entrySource: 'entry-direct',
            workspaceId: 'media',
            modeId: 'video',
            definitionId: 'video',
            overlayId: null,
            overlayClass: null,
            canonicalModeId: 'video',
        }),
    );
});

test('project perspective resolves design overlay aliases inside create perspective without losing canonical ownership', () => {
    assert.deepEqual(
        resolveProjectPerspectiveContext({ perspectiveId: 'create', entryId: 'branding' }),
        Object.freeze({
            perspectiveId: 'create',
            perspectiveLabel: 'Create',
            perspectiveSource: 'perspective-direct',
            entryId: 'branding',
            entrySource: 'entry-direct',
            workspaceId: 'design',
            modeId: 'branding',
            definitionId: 'branding',
            overlayId: 'brand-systems',
            overlayClass: 'capability',
            canonicalModeId: 'graphic',
        }),
    );

    assert.deepEqual(
        resolveProjectPerspectiveContext({ perspectiveId: 'create', entryId: 'icons' }),
        Object.freeze({
            perspectiveId: 'create',
            perspectiveLabel: 'Create',
            perspectiveSource: 'perspective-direct',
            entryId: 'icons',
            entrySource: 'entry-direct',
            workspaceId: 'design',
            modeId: 'icons',
            definitionId: 'icons',
            overlayId: 'icon-systems',
            overlayClass: 'capability',
            canonicalModeId: 'graphic',
        }),
    );
});

test('project perspective resolves media overlay aliases inside create perspective without losing canonical ownership', () => {
    assert.deepEqual(
        resolveProjectPerspectiveContext({ perspectiveId: 'create', entryId: 'podcast' }),
        Object.freeze({
            perspectiveId: 'create',
            perspectiveLabel: 'Create',
            perspectiveSource: 'perspective-direct',
            entryId: 'podcast',
            entrySource: 'entry-direct',
            workspaceId: 'media',
            modeId: 'podcast',
            definitionId: 'podcast',
            overlayId: 'podcast',
            overlayClass: 'payload',
            canonicalModeId: 'audio',
        }),
    );
});

test('project perspective resolves build/operate overlays without creating new truth models', () => {
    assert.deepEqual(
        resolveProjectPerspectiveContext({ perspectiveId: 'build', entryId: 'ai' }),
        Object.freeze({
            perspectiveId: 'build',
            perspectiveLabel: 'Build',
            perspectiveSource: 'perspective-direct',
            entryId: 'ai',
            entrySource: 'entry-direct',
            workspaceId: 'build',
            modeId: 'ai-build',
            definitionId: 'ai',
            overlayId: 'ai-systems',
            overlayClass: 'payload',
            canonicalModeId: 'automation',
        }),
    );

    assert.deepEqual(
        resolveProjectPerspectiveContext({ perspectiveId: 'build', entryId: 'conversion' }),
        Object.freeze({
            perspectiveId: 'build',
            perspectiveLabel: 'Build',
            perspectiveSource: 'perspective-direct',
            entryId: 'conversion',
            entrySource: 'entry-direct',
            workspaceId: 'build',
            modeId: 'conversion',
            definitionId: 'conversion',
            overlayId: 'conversion',
            overlayClass: 'payload',
            canonicalModeId: 'automation',
        }),
    );

    assert.deepEqual(
        resolveProjectPerspectiveContext({ perspectiveId: 'operate', entryId: 'systems-engineering' }),
        Object.freeze({
            perspectiveId: 'operate',
            perspectiveLabel: 'Operate',
            perspectiveSource: 'perspective-direct',
            entryId: 'systems-engineering',
            entrySource: 'entry-direct',
            workspaceId: 'build',
            modeId: 'systems-engineering',
            definitionId: 'dev',
            overlayId: 'systems-engineering',
            overlayClass: 'payload',
            canonicalModeId: 'automation',
        }),
    );
});

test('project perspective resolves system entries in publish perspective without creating new truth models', () => {
    assert.deepEqual(
        resolveProjectPerspectiveContext({ perspectiveId: 'publish', entryId: 'tokens' }),
        Object.freeze({
            perspectiveId: 'publish',
            perspectiveLabel: 'Publish',
            perspectiveSource: 'perspective-direct',
            entryId: 'tokens',
            entrySource: 'entry-direct',
            workspaceId: 'system',
            modeId: 'tokens',
            definitionId: 'material',
            overlayId: null,
            overlayClass: null,
            canonicalModeId: 'tokens',
        }),
    );

    assert.deepEqual(
        resolveProjectPerspectiveContext({ perspectiveId: 'publish', entryId: 'themes' }),
        Object.freeze({
            perspectiveId: 'publish',
            perspectiveLabel: 'Publish',
            perspectiveSource: 'perspective-direct',
            entryId: 'themes',
            entrySource: 'entry-direct',
            workspaceId: 'system',
            modeId: 'themes',
            definitionId: 'material',
            overlayId: 'themes',
            overlayClass: 'capability',
            canonicalModeId: 'tokens',
        }),
    );

    assert.deepEqual(
        resolveProjectPerspectiveContext({ perspectiveId: 'publish', entryId: 'variants' }),
        Object.freeze({
            perspectiveId: 'publish',
            perspectiveLabel: 'Publish',
            perspectiveSource: 'perspective-direct',
            entryId: 'variants',
            entrySource: 'entry-direct',
            workspaceId: 'system',
            modeId: 'variants',
            definitionId: 'material',
            overlayId: 'variants',
            overlayClass: 'capability',
            canonicalModeId: 'components',
        }),
    );
});

test('project perspective resolves collaborate entries without creating new truth models', () => {
    assert.deepEqual(
        resolveProjectPerspectiveContext({ perspectiveId: 'collaborate', entryId: 'review' }),
        Object.freeze({
            perspectiveId: 'collaborate',
            perspectiveLabel: 'Collaborate',
            perspectiveSource: 'perspective-direct',
            entryId: 'review',
            entrySource: 'entry-direct',
            workspaceId: 'collaborate',
            modeId: 'review',
            definitionId: 'review',
            overlayId: null,
            overlayClass: null,
            canonicalModeId: 'review',
        }),
    );

    assert.deepEqual(
        resolveProjectPerspectiveContext({ perspectiveId: 'collaborate', entryId: 'production' }),
        Object.freeze({
            perspectiveId: 'collaborate',
            perspectiveLabel: 'Collaborate',
            perspectiveSource: 'perspective-direct',
            entryId: 'production',
            entrySource: 'entry-direct',
            workspaceId: 'collaborate',
            modeId: 'production',
            definitionId: 'review',
            overlayId: null,
            overlayClass: null,
            canonicalModeId: 'production',
        }),
    );

    assert.deepEqual(
        resolveProjectPerspectiveContext({ perspectiveId: 'collaborate', entryId: 'education' }),
        Object.freeze({
            perspectiveId: 'collaborate',
            perspectiveLabel: 'Collaborate',
            perspectiveSource: 'perspective-direct',
            entryId: 'education',
            entrySource: 'entry-direct',
            workspaceId: 'collaborate',
            modeId: 'education',
            definitionId: 'education',
            overlayId: 'learning',
            overlayClass: 'payload',
            canonicalModeId: 'knowledge',
        }),
    );
});

test('project perspective fails closed to defaults for unknown perspective or disallowed entry', () => {
    assert.deepEqual(
        resolveProjectPerspectiveContext({ perspectiveId: 'unknown-perspective', entryId: 'video' }),
        Object.freeze({
            perspectiveId: 'overview',
            perspectiveLabel: 'Overview',
            perspectiveSource: 'perspective-fallback',
            entryId: 'uiux',
            entrySource: 'entry-default',
            workspaceId: 'design',
            modeId: 'uiux',
            definitionId: 'uiux',
            overlayId: null,
            overlayClass: null,
            canonicalModeId: 'uiux',
        }),
    );

    assert.deepEqual(
        resolveProjectPerspectiveContext({ perspectiveId: 'collaborate', entryId: 'video' }),
        Object.freeze({
            perspectiveId: 'collaborate',
            perspectiveLabel: 'Collaborate',
            perspectiveSource: 'perspective-direct',
            entryId: 'review',
            entrySource: 'entry-default',
            workspaceId: 'collaborate',
            modeId: 'review',
            definitionId: 'review',
            overlayId: null,
            overlayClass: null,
            canonicalModeId: 'review',
        }),
    );
});

test('project perspective focus mapping is deterministic and fail-closed', () => {
    assert.deepEqual(
        resolveProjectPerspectiveFocus({ perspectiveId: 'operate', entryId: 'enterprise-operations' }),
        Object.freeze({
            perspectiveId: 'operate',
            perspectiveLabel: 'Operate',
            perspectiveSource: 'perspective-direct',
            entryId: 'enterprise-operations',
            entrySource: 'entry-direct',
            workspaceId: 'build',
            modeId: 'enterprise-operations',
            definitionId: 'conversion',
            overlayId: 'enterprise-operations',
            overlayClass: 'payload',
            canonicalModeId: 'automation',
            primaryArtifactKind: 'system-model',
            secondaryArtifactKinds: Object.freeze(['workflow', 'state-machine', 'knowledge-page']),
        }),
    );

    assert.deepEqual(
        resolveProjectPerspectiveFocus({ perspectiveId: 'unknown', entryId: 'unknown' }),
        Object.freeze({
            perspectiveId: 'overview',
            perspectiveLabel: 'Overview',
            perspectiveSource: 'perspective-fallback',
            entryId: 'uiux',
            entrySource: 'entry-default',
            workspaceId: 'design',
            modeId: 'uiux',
            definitionId: 'uiux',
            overlayId: null,
            overlayClass: null,
            canonicalModeId: 'uiux',
            primaryArtifactKind: 'project-hub',
            secondaryArtifactKinds: Object.freeze(['document', 'workflow', 'knowledge-page']),
        }),
    );
});

test('project perspective bootstrap resolver prefers document bootstrap default perspective', () => {
    assert.deepEqual(
        resolveInitialProjectPerspectiveContext({
            document: {
                meta: {
                    projectBootstrap: {
                        defaultPerspectiveId: 'build',
                    },
                },
            },
        }),
        Object.freeze({
            perspectiveId: 'build',
            perspectiveLabel: 'Build',
            perspectiveSource: 'perspective-direct',
            entryId: 'application',
            entrySource: 'entry-default',
            workspaceId: 'build',
            modeId: 'application',
            definitionId: 'dev',
            overlayId: null,
            overlayClass: null,
            canonicalModeId: 'application',
            bootstrapPerspectiveId: 'build',
            bootstrapApplied: true,
        }),
    );
});

test('project perspective inference for direct workspace entries is deterministic and perspective-first', () => {
    assert.deepEqual(
        resolveProjectPerspectiveForEntry({ entryId: 'media' }),
        Object.freeze({
            perspectiveId: 'create',
            perspectiveLabel: 'Create',
            perspectiveSource: 'perspective-direct',
            entryId: 'animation',
            entrySource: 'entry-direct',
            workspaceId: 'media',
            modeId: 'animation',
            definitionId: 'animation',
            overlayId: null,
            overlayClass: null,
            canonicalModeId: 'animation',
        }),
    );

    assert.deepEqual(
        resolveProjectPerspectiveForEntry({ entryId: 'systems-engineering' }),
        Object.freeze({
            perspectiveId: 'operate',
            perspectiveLabel: 'Operate',
            perspectiveSource: 'perspective-direct',
            entryId: 'systems-engineering',
            entrySource: 'entry-direct',
            workspaceId: 'build',
            modeId: 'systems-engineering',
            definitionId: 'dev',
            overlayId: 'systems-engineering',
            overlayClass: 'payload',
            canonicalModeId: 'automation',
        }),
    );

    assert.deepEqual(
        resolveProjectPerspectiveForEntry({ entryId: 'versioning' }),
        Object.freeze({
            perspectiveId: 'publish',
            perspectiveLabel: 'Publish',
            perspectiveSource: 'perspective-direct',
            entryId: 'versioning',
            entrySource: 'entry-direct',
            workspaceId: 'system',
            modeId: 'versioning',
            definitionId: 'material',
            overlayId: 'versioning',
            overlayClass: 'payload',
            canonicalModeId: 'governance',
        }),
    );
});
