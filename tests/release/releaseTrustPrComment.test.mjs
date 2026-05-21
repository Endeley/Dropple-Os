import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
    buildReleaseTrustCommentBody,
    findExistingReleaseTrustComment,
    RELEASE_TRUST_COMMENT_MARKER,
} from '@/scripts/releaseTrustPrComment.mjs';
import { buildReleaseTrustSummary } from '@/scripts/releaseTrustSummary.mjs';

test('release trust PR comment body is deterministic and carries marker', () => {
    const summary = [
        '## Release Trust Diff Summary',
        '',
        '- Status: **PASS**',
        '',
        '### OS Surface Shell Contract',
        '- Contract ok: `true`',
        '',
        '### OS Surface Workspace Identity',
        '- Identity ok: `true`',
        '',
        '### OS Surface Activation Provenance',
        '- Provenance ok: `true`',
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
    assert.match(a, /OS Surface Shell Contract/);
    assert.match(a, /OS Surface Workspace Identity/);
    assert.match(a, /OS Surface Activation Provenance/);
    assert.match(a, /OS Surface Probe/);
    assert.match(a, /Duration \(current\): `1200ms`/);
    assert.match(a, /Duration \(baseline\): `1000ms`/);
    assert.match(a, /Duration delta: `\+20\.0%`/);
    assert.match(a, /Duration trend: `regressed`/);
});

test('release trust PR comment body reflects missing shell sections fail-closed', () => {
    const summary = [
        '## Release Trust Diff Summary',
        '',
        '- Status: **PASS**',
        '',
        '### OS Surface Probe',
        '- Publish clickable: `true`',
    ].join('\n');

    const comment = buildReleaseTrustCommentBody(summary);
    assert.doesNotMatch(comment, /OS Surface Shell Contract/);
    assert.doesNotMatch(comment, /OS Surface Workspace Identity/);
    assert.doesNotMatch(comment, /OS Surface Activation Provenance/);
});

test('release trust PR comment locator finds existing tagged comment', () => {
    const comments = [
        { id: 11, body: 'other comment' },
        { id: 22, body: `${RELEASE_TRUST_COMMENT_MARKER}\nsummary` },
    ];
    const existing = findExistingReleaseTrustComment(comments);
    assert.equal(existing?.id, 22);
});

test('release trust PR comment payload assembly carries explicit os-surface sections from built summary', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'release-trust-pr-comment-'));
    const currentPath = path.join(tempDir, 'current.json');
    const baselinePath = path.join(tempDir, 'baseline.json');
    const report = {
        schemaVersion: '1.0.0',
        overallOk: true,
        checks: {
            architectureGate: { ok: true, exitCode: 0 },
            exportVerification: { ok: true, exportHash: 'a', canonicalVersion: 'v1', algorithm: 'sha-256' },
            federationAttestation: { ok: true, tamperRejected: true, hash: 'h', entryCount: 1 },
            federationLifecycle: { ok: true, replayEquivalent: true, staleRejected: true, orderingClosed: true },
            simulationTrace: { ok: true, fingerprint: 'f', primitiveTraceLineageProvided: true, tamperRejected: true },
            osSurfaceIntentRouting: {
                ok: true,
                mutationFree: true,
                acceptedCount: 1,
                rejectedCount: 1,
                allowlistPolicyVersion: '1',
                allowlistActionCount: 4,
                allowlistActionHash: 'hash-a',
            },
            osSurfaceShellContract: {
                ok: true,
                policyVersion: '1',
                policyHash: 'policy-hash-a',
                matrixOk: true,
                projectionShapeOk: true,
                projectionDeterministic: true,
                projectionKeyHash: 'projection-hash-a',
            },
            osSurfaceWorkspaceIdentity: {
                ok: true,
                workspaceId: 'design',
                modeId: 'graphic',
                overlaysCount: 2,
                overlaysHash: 'overlays-hash-a',
            },
            osSurfaceActivationProvenance: {
                ok: true,
                tuplesDeterministic: true,
                sampleCount: 6,
                tuplesHash: 'tuples-hash-a',
                sourceHash: 'source-hash-a',
                overlayHash: 'overlay-hash-a',
            },
            osSurfaceShellClickability: {
                ok: true,
                helperPresent: true,
                publishGuarded: true,
                addKeyframeGuarded: true,
                trialGuardCount: 1,
            },
            osSurfaceShellRuntimeProbe: {
                ok: true,
                skipped: false,
                required: false,
                reason: null,
                publishClickable: true,
                keyframeClickable: true,
                interceptErrors: 0,
                durationMs: 1200,
            },
        },
        reportHash: 'r',
    };
    fs.writeFileSync(currentPath, JSON.stringify(report), 'utf8');
    fs.writeFileSync(baselinePath, JSON.stringify(report), 'utf8');

    const summary = buildReleaseTrustSummary({
        currentPath,
        baselinePath,
        strict: 'false',
    });
    const comment = buildReleaseTrustCommentBody(summary);

    assert.match(comment, new RegExp(RELEASE_TRUST_COMMENT_MARKER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(comment, /OS Surface Shell Contract/);
    assert.match(comment, /OS Surface Workspace Identity/);
    assert.match(comment, /OS Surface Activation Provenance/);
    assert.match(comment, /OS Surface Probe/);
    assert.match(comment, /Publish clickable: `true`/);
    assert.match(comment, /Keyframe clickable: `true`/);
    assert.match(comment, /Pointer intercept errors: `0`/);
    assert.match(comment, /Failure reason: `none`/);
});
