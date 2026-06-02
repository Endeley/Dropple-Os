import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildProjectBlueprintStartRoute,
    buildProjectEnvironmentStartRoute,
} from '@/platform/workspaces/projectStartRoute.js';

test('project blueprint start route bootstraps certified blueprint installs through the project perspective route', () => {
    assert.equal(
        buildProjectBlueprintStartRoute({ perspectiveId: 'create', blueprintId: 'bp.logistics.v1' }),
        '/workspace/create?blueprint=bp.logistics.v1&bootstrap=1',
    );
});

test('project environment start route canonicalizes entry context and lineage parameters deterministically', () => {
    assert.equal(
        buildProjectEnvironmentStartRoute({
            perspectiveId: 'create',
            workspaceId: 'design',
            modeId: 'uiux',
            lineageRootId: 'root-1',
            versionId: 'version-1',
        }),
        '/workspace/create?entry=uiux&workspaceId=design&modeId=uiux&lineageRootId=root-1&versionId=version-1',
    );
});

test('project environment start route preserves overlay entry ids when present', () => {
    assert.equal(
        buildProjectEnvironmentStartRoute({
            perspectiveId: 'create',
            workspaceId: 'design',
            modeId: 'graphic',
            overlayId: 'branding',
            lineageRootId: 'root-2',
            versionId: 'version-2',
        }),
        '/workspace/create?entry=branding&workspaceId=design&modeId=graphic&lineageRootId=root-2&versionId=version-2&overlayId=branding',
    );
});

test('project environment start route fails closed when lineage identity is incomplete', () => {
    assert.equal(
        buildProjectEnvironmentStartRoute({
            perspectiveId: 'create',
            workspaceId: 'design',
            modeId: 'uiux',
            lineageRootId: 'root-1',
        }),
        '/workspace/create',
    );
});
