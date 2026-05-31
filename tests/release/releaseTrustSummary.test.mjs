import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildReleaseTrustSummary, formatReleaseTrustSummary } from '@/scripts/releaseTrustSummary.mjs';

test('release trust summary formatter is deterministic for identical semantic outcomes', () => {
    const result = Object.freeze({
        ok: false,
        errors: Object.freeze(['architectureGate.ok: architecture gate failed in current report.']),
        warnings: Object.freeze(['baseline report unavailable; diff skipped.']),
        deltas: Object.freeze(['exportVerification.exportHash: exportHash changed.']),
        outcomes: Object.freeze([
            Object.freeze({
                ok: false,
                severity: 'error',
                invariant: 'architectureGate.ok',
                classification: 'constitutional-regression',
                message: 'architecture gate failed in current report.',
            }),
            Object.freeze({
                ok: true,
                severity: 'info',
                invariant: 'simulationTrace.ok',
                classification: 'lawful-evolution',
                message: 'simulation trace validation remains valid.',
            }),
        ]),
    });

    const a = formatReleaseTrustSummary({
        result,
        strict: false,
        baselineRequiredAfter: '2026-07-01T00:00:00.000Z',
        ledger: { ok: true, entryCount: 12, reason: null, index: null },
        federationLineage: {
            lineageHash: 'lineage-hash-a',
            tamperRejected: true,
            replayEquivalent: true,
            staleRejected: true,
            orderingClosed: true,
        },
        federationLineageLedger: { ok: true, entryCount: 7, reason: null, index: null },
        osSurfaceShellContractCurrent: {
            ok: true,
            policyVersion: '1',
            policyHash: 'policy-hash-a',
            matrixOk: true,
            projectionShapeOk: true,
            projectionDeterministic: true,
            projectionKeyHash: 'projection-key-hash-a',
        },
        osSurfaceShellContractBaseline: {
            policyVersion: '1',
            policyHash: 'policy-hash-a',
            projectionKeyHash: 'projection-key-hash-a',
        },
        osSurfaceWorkspaceIdentityCurrent: {
            ok: true,
            workspaceId: 'design',
            modeId: 'graphic',
            overlaysCount: 2,
            overlaysHash: 'os-overlays-hash-a',
        },
        osSurfaceWorkspaceIdentityBaseline: {
            workspaceId: 'design',
            modeId: 'graphic',
            overlaysHash: 'os-overlays-hash-a',
        },
        osSurfaceActivationProvenanceCurrent: {
            ok: true,
            tuplesDeterministic: true,
            sampleCount: 6,
            tuplesHash: 'os-activation-tuples-hash-a',
            sourceHash: 'os-activation-source-hash-a',
            overlayHash: 'os-activation-overlay-hash-a',
        },
        osSurfaceActivationProvenanceBaseline: {
            tuplesHash: 'os-activation-tuples-hash-a',
            sourceHash: 'os-activation-source-hash-a',
            overlayHash: 'os-activation-overlay-hash-a',
        },
        osSurfaceProbeCurrent: {
            publishClickable: true,
            keyframeClickable: true,
            interceptErrors: 0,
            reason: null,
            failedTestTitle: null,
            traceHint: null,
            durationMs: 1700,
        },
        osSurfaceProbeBaseline: {
            durationMs: 1000,
        },
    });
    const b = formatReleaseTrustSummary({
        result,
        strict: false,
        baselineRequiredAfter: '2026-07-01T00:00:00.000Z',
        ledger: { ok: true, entryCount: 12, reason: null, index: null },
        federationLineage: {
            lineageHash: 'lineage-hash-a',
            tamperRejected: true,
            replayEquivalent: true,
            staleRejected: true,
            orderingClosed: true,
        },
        federationLineageLedger: { ok: true, entryCount: 7, reason: null, index: null },
        osSurfaceShellContractCurrent: {
            ok: true,
            policyVersion: '1',
            policyHash: 'policy-hash-a',
            matrixOk: true,
            projectionShapeOk: true,
            projectionDeterministic: true,
            projectionKeyHash: 'projection-key-hash-a',
        },
        osSurfaceShellContractBaseline: {
            policyVersion: '1',
            policyHash: 'policy-hash-a',
            projectionKeyHash: 'projection-key-hash-a',
        },
        osSurfaceWorkspaceIdentityCurrent: {
            ok: true,
            workspaceId: 'design',
            modeId: 'graphic',
            overlaysCount: 2,
            overlaysHash: 'os-overlays-hash-a',
        },
        osSurfaceWorkspaceIdentityBaseline: {
            workspaceId: 'design',
            modeId: 'graphic',
            overlaysHash: 'os-overlays-hash-a',
        },
        osSurfaceActivationProvenanceCurrent: {
            ok: true,
            tuplesDeterministic: true,
            sampleCount: 6,
            tuplesHash: 'os-activation-tuples-hash-a',
            sourceHash: 'os-activation-source-hash-a',
            overlayHash: 'os-activation-overlay-hash-a',
        },
        osSurfaceActivationProvenanceBaseline: {
            tuplesHash: 'os-activation-tuples-hash-a',
            sourceHash: 'os-activation-source-hash-a',
            overlayHash: 'os-activation-overlay-hash-a',
        },
        osSurfaceProbeCurrent: {
            publishClickable: true,
            keyframeClickable: true,
            interceptErrors: 0,
            reason: null,
            failedTestTitle: null,
            traceHint: null,
            durationMs: 1700,
        },
        osSurfaceProbeBaseline: {
            durationMs: 1000,
        },
    });

    assert.equal(a, b);
    assert.match(a, /Release Trust Diff Summary/);
    assert.match(a, /Constitutional Regressions/);
    assert.match(a, /Semantic Drift/);
    assert.match(a, /Lawful Evolution/);
    assert.match(a, /Ledger entries: `12`/);
    assert.match(a, /Ledger chain: `ok`/);
    assert.match(a, /Federation lineage hash: `lineage-hash-a`/);
    assert.match(a, /Federation replay equivalent: `true`/);
    assert.match(a, /Federation lineage ledger entries: `7`/);
    assert.match(a, /Federation lineage ledger chain: `ok`/);
    assert.match(a, /OS Surface Shell Contract/);
    assert.match(a, /Contract ok: `true`/);
    assert.match(a, /Policy version: `1`/);
    assert.match(a, /Matrix ok: `true`/);
    assert.match(a, /Projection shape ok: `true`/);
    assert.match(a, /Projection deterministic: `true`/);
    assert.match(a, /Projection key hash: `projection-key-hash-a`/);
    assert.match(a, /OS Surface Workspace Identity/);
    assert.match(a, /Identity ok: `true`/);
    assert.match(a, /Workspace id: `design`/);
    assert.match(a, /Mode id: `graphic`/);
    assert.match(a, /Overlays count: `2`/);
    assert.match(a, /Overlays hash: `os-overlays-hash-a`/);
    assert.match(a, /OS Surface Activation Provenance/);
    assert.match(a, /Provenance ok: `true`/);
    assert.match(a, /Tuples deterministic: `true`/);
    assert.match(a, /Sample count: `6`/);
    assert.match(a, /Tuples hash: `os-activation-tuples-hash-a`/);
    assert.match(a, /Source hash: `os-activation-source-hash-a`/);
    assert.match(a, /Overlay hash: `os-activation-overlay-hash-a`/);
    assert.match(a, /OS Surface Probe/);
    assert.match(a, /Publish clickable: `true`/);
    assert.match(a, /Keyframe clickable: `true`/);
    assert.match(a, /Failure reason: `none`/);
    assert.match(a, /Duration \(current\): `1700ms`/);
    assert.match(a, /Duration \(baseline\): `1000ms`/);
    assert.match(a, /Duration delta: `\+70.0%`/);
    assert.match(a, /Duration status: `OK`/);
});

test('release trust summary surfaces runtime probe duration warning as non-blocking signal', () => {
    const result = Object.freeze({
        ok: true,
        errors: Object.freeze([]),
        warnings: Object.freeze([]),
        deltas: Object.freeze(['osSurfaceShellRuntimeProbe.duration-regression: drift']),
        outcomes: Object.freeze([
            Object.freeze({
                ok: true,
                severity: 'warning',
                invariant: 'osSurfaceShellRuntimeProbe.duration-regression',
                classification: 'semantic-drift',
                message: 'runtime probe duration regressed (1000ms -> 1700ms, 170.0%).',
            }),
        ]),
    });

    const summary = formatReleaseTrustSummary({
        result,
        osSurfaceProbeCurrent: {
            publishClickable: true,
            keyframeClickable: true,
            interceptErrors: 0,
            reason: 'pointer-intercept-detected',
            failedTestTitle: 'tests/e2e/uiux-template-generation.spec.js › uiux transition timeline can author a motion keyframe through lawful intents',
            traceHint: 'test-results/**/trace.zip (run: npx playwright show-trace <trace.zip>)',
            durationMs: 1700,
        },
        osSurfaceProbeBaseline: {
            durationMs: 1000,
        },
    });

    assert.match(summary, /Duration status: `WARN`/);
    assert.match(summary, /Failure reason: `pointer-intercept-detected`/);
    assert.match(summary, /Failed test:/);
    assert.match(summary, /Trace hint:/);
    assert.match(summary, /runtime probe duration regressed/);
});

test('buildReleaseTrustSummary includes explicit os-surface sections from current report checks', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'release-trust-summary-'));
    const currentPath = path.join(tempDir, 'current.json');
    const baselinePath = path.join(tempDir, 'baseline.json');
    const ledgerPath = path.join(tempDir, 'ledger.jsonl');
    const federationLineagePath = path.join(tempDir, 'federation-lineage.json');
    const federationLineageLedgerPath = path.join(tempDir, 'federation-lineage-ledger.jsonl');

    const current = {
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
            blueprintBootstrapProvenance: {
                ok: true,
                deterministicManifest: true,
                persisted: true,
                replayEquivalent: true,
                bootstrapEventPersisted: true,
                perspectiveRoutable: true,
                defaultPerspectiveId: 'create',
                blueprintId: 'bp.fixture.v1',
                blueprintVersionId: 'bp.fixture.v1',
                projectIdHash: 'project-hash-a',
                replayParityHash: 'replay-hash-a',
            },
        },
        reportHash: 'r',
    };

    fs.writeFileSync(currentPath, JSON.stringify(current), 'utf8');
    fs.writeFileSync(baselinePath, JSON.stringify(current), 'utf8');

    const summary = buildReleaseTrustSummary({
        currentPath,
        baselinePath,
        ledgerPath,
        federationLineagePath,
        federationLineageLedgerPath,
        strict: 'false',
    });

    assert.match(summary, /OS Surface Shell Contract/);
    assert.match(summary, /OS Surface Workspace Identity/);
    assert.match(summary, /OS Surface Activation Provenance/);
});

test('buildReleaseTrustSummary omits explicit os-surface sections when checks are absent', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'release-trust-summary-'));
    const currentPath = path.join(tempDir, 'current.json');
    const baselinePath = path.join(tempDir, 'baseline.json');
    const ledgerPath = path.join(tempDir, 'ledger.jsonl');
    const federationLineagePath = path.join(tempDir, 'federation-lineage.json');
    const federationLineageLedgerPath = path.join(tempDir, 'federation-lineage-ledger.jsonl');

    const current = {
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
            blueprintBootstrapProvenance: {
                ok: true,
                deterministicManifest: true,
                persisted: true,
                replayEquivalent: true,
                bootstrapEventPersisted: true,
                perspectiveRoutable: true,
                defaultPerspectiveId: 'create',
                blueprintId: 'bp.fixture.v1',
                blueprintVersionId: 'bp.fixture.v1',
                projectIdHash: 'project-hash-a',
                replayParityHash: 'replay-hash-a',
            },
        },
        reportHash: 'r',
    };

    fs.writeFileSync(currentPath, JSON.stringify(current), 'utf8');
    fs.writeFileSync(baselinePath, JSON.stringify(current), 'utf8');

    const summary = buildReleaseTrustSummary({
        currentPath,
        baselinePath,
        ledgerPath,
        federationLineagePath,
        federationLineageLedgerPath,
        strict: 'false',
    });

    assert.doesNotMatch(summary, /OS Surface Shell Contract/);
    assert.doesNotMatch(summary, /OS Surface Workspace Identity/);
    assert.doesNotMatch(summary, /OS Surface Activation Provenance/);
});
