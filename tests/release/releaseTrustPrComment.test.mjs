import test from 'node:test';
import assert from 'node:assert/strict';
import {
    buildReleaseTrustCommentBody,
    findExistingReleaseTrustComment,
    RELEASE_TRUST_COMMENT_MARKER,
} from '@/scripts/releaseTrustPrComment.mjs';

test('release trust PR comment body is deterministic and carries marker', () => {
    const summary = [
        '## Release Trust Diff Summary',
        '',
        '- Status: **PASS**',
        '',
        '### OS Surface Probe',
        '- Publish clickable: `true`',
        '- Keyframe clickable: `true`',
        '- Pointer intercept errors: `0`',
        '- Duration (current): `1200ms`',
        '- Duration (baseline): `1000ms`',
        '- Duration delta: `+20.0%`',
        '- Duration trend: `regressed`',
        '- Duration status: `OK`',
    ].join('\n');
    const a = buildReleaseTrustCommentBody(summary);
    const b = buildReleaseTrustCommentBody(summary);

    assert.equal(a, b);
    assert.match(a, new RegExp(RELEASE_TRUST_COMMENT_MARKER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(a, /Release Trust Diff Summary/);
    assert.match(a, /OS Surface Probe/);
    assert.match(a, /Duration \(current\): `1200ms`/);
    assert.match(a, /Duration \(baseline\): `1000ms`/);
    assert.match(a, /Duration delta: `\+20\.0%`/);
    assert.match(a, /Duration trend: `regressed`/);
});

test('release trust PR comment locator finds existing tagged comment', () => {
    const comments = [
        { id: 11, body: 'other comment' },
        { id: 22, body: `${RELEASE_TRUST_COMMENT_MARKER}\nsummary` },
    ];
    const existing = findExistingReleaseTrustComment(comments);
    assert.equal(existing?.id, 22);
});
