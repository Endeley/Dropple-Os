import test from 'node:test';
import assert from 'node:assert/strict';

import {
    normalizeDesignModeId,
    resolveDesignModeLabel,
    resolveDesignTopChrome,
    resolveDesignWorkspaceContext,
    buildDesignPublishModePayload,
} from '@/ui/workspace/design/DesignShellPrimitivesCore.js';

test('design shell mode normalization is deterministic and fail-closed', () => {
    assert.equal(normalizeDesignModeId(' UIUX '), 'uiux');
    assert.equal(normalizeDesignModeId('GRAPHIC'), 'graphic');
    assert.equal(normalizeDesignModeId(undefined), 'uiux');
    assert.equal(normalizeDesignModeId('', 'document'), 'document');
});

test('design shell mode labels are deterministic', () => {
    assert.equal(resolveDesignModeLabel('uiux'), 'UIUX');
    assert.equal(resolveDesignModeLabel('graphic'), 'Graphic');
    assert.equal(resolveDesignModeLabel('document'), 'Document');
    assert.equal(resolveDesignModeLabel('unknown-mode'), 'Design');
});

test('design top chrome profile resolves deterministically', () => {
    assert.deepEqual(resolveDesignTopChrome('uiux'), {
        primaryActionLabel: 'Frame',
        secondaryActionLabel: 'Auto Layout',
        zoomLabel: '100%',
        surfaceLabel: 'Draft Surface',
    });
    assert.deepEqual(resolveDesignTopChrome('graphic'), {
        primaryActionLabel: 'Frame',
        secondaryActionLabel: 'Auto Layout',
        zoomLabel: '100%',
        surfaceLabel: 'Draft Surface',
    });
    assert.deepEqual(resolveDesignTopChrome('unknown-mode'), {
        primaryActionLabel: 'Frame',
        secondaryActionLabel: 'Auto Layout',
        zoomLabel: '100%',
        surfaceLabel: 'Draft Surface',
    });
});

test('design workspace context resolution is deterministic and fail-closed', () => {
    assert.deepEqual(
        resolveDesignWorkspaceContext({
            modeId: ' Graphic ',
            workspaceContext: {
                workspaceId: 'Design',
                definitionId: 'design',
            },
        }),
        Object.freeze({
            modeId: 'graphic',
            workspaceId: 'design',
        }),
    );

    assert.deepEqual(
        resolveDesignWorkspaceContext({
            modeId: null,
            workspaceContext: null,
        }),
        Object.freeze({
            modeId: 'uiux',
            workspaceId: 'design',
        }),
    );
});

test('design publish mode payload is deterministic', () => {
    assert.deepEqual(
        buildDesignPublishModePayload({
            modeId: ' document ',
            workspaceId: ' DESIGN ',
        }),
        Object.freeze({
            id: 'document',
            workspaceId: 'design',
        }),
    );
});
