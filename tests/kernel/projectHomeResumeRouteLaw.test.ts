import test from 'node:test';
import assert from 'node:assert/strict';

import { buildProjectHomeResumeRoute } from '@/runtime/workspaces/projectHomeResumeRoute.js';

test('project home resume route is deterministic and encodes document ids', () => {
    assert.equal(buildProjectHomeResumeRoute('doc-123'), '/workspace/new?doc=doc-123');
    assert.equal(buildProjectHomeResumeRoute(' doc 123 '), '/workspace/new?doc=doc%20123');
    assert.equal(buildProjectHomeResumeRoute('doc-123'), '/workspace/new?doc=doc-123');
});

test('project home resume route fails closed to overview', () => {
    assert.equal(buildProjectHomeResumeRoute(null), '/workspace/overview');
    assert.equal(buildProjectHomeResumeRoute(''), '/workspace/overview');
    assert.equal(buildProjectHomeResumeRoute('   '), '/workspace/overview');
});
