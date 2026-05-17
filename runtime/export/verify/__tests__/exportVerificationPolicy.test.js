import test from 'node:test';
import assert from 'node:assert/strict';
import { ArtifactKind } from '@/core/artifacts/ArtifactKind.js';
import { resolveExportVerificationPolicy } from '../exportVerificationPolicy.js';

test('release verification profile enforces federation attestation requirement', () => {
    const policy = resolveExportVerificationPolicy({
        artifact: { kind: ArtifactKind.SNAPSHOT },
        format: 'json',
        options: {
            verification: {
                enabled: true,
                profile: 'release',
            },
        },
    });

    assert.equal(policy.enabled, true);
    assert.equal(policy.verificationOptions.requireFederationAuditAttestation, true);
});

test('non-release profile keeps federation attestation optional unless explicitly enabled', () => {
    const policy = resolveExportVerificationPolicy({
        artifact: { kind: ArtifactKind.SNAPSHOT },
        format: 'json',
        options: {
            verification: {
                enabled: true,
            },
        },
    });

    assert.equal(policy.enabled, true);
    assert.equal(policy.verificationOptions.requireFederationAuditAttestation, false);
});

