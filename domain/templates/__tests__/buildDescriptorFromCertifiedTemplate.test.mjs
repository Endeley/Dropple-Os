import test from 'node:test';
import assert from 'node:assert/strict';

import { buildDescriptorFromCertifiedTemplate } from '../buildDescriptorFromCertifiedTemplate.js';

test('buildDescriptorFromCertifiedTemplate derives deterministic lineage and canonical mode context from certified template truth', () => {
    const template = {
        id: 'tpl.example',
        mode: 'branding',
        certification: {
            lineageRootId: 'root-1',
            lineageNodeId: 'version-1',
        },
    };

    const descriptor = buildDescriptorFromCertifiedTemplate(template);

    assert.equal(descriptor.lineage.lineageRootId, 'root-1');
    assert.equal(descriptor.lineage.versionId, 'version-1');
    assert.equal(descriptor.environment.modeContext.workspaceId, 'design');
    assert.equal(descriptor.environment.modeContext.modeId, 'graphic');
    assert.equal(descriptor.environment.modeContext.overlayId, 'brand-systems');
    assert.equal(descriptor.metadata.source, 'certified-template');
    assert.equal(descriptor.metadata.templateId, 'tpl.example');
});

test('buildDescriptorFromCertifiedTemplate preserves explicit overlay mode context when present', () => {
    const template = {
        id: 'tpl.overlay',
        versionId: 'version-2',
        lineageRootId: 'root-2',
        modeContext: {
            workspaceId: 'design',
            modeId: 'graphic',
            overlayId: 'brand-systems',
        },
    };

    const descriptor = buildDescriptorFromCertifiedTemplate(template);

    assert.equal(descriptor.lineage.lineageRootId, 'root-2');
    assert.equal(descriptor.lineage.versionId, 'version-2');
    assert.equal(descriptor.environment.modeContext.workspaceId, 'design');
    assert.equal(descriptor.environment.modeContext.modeId, 'graphic');
    assert.equal(descriptor.environment.modeContext.overlayId, 'brand-systems');
});
