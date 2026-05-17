import test from 'node:test';
import assert from 'node:assert/strict';
import { generateReleaseTrustReport } from '@/scripts/releaseTrustReport.mjs';

test('release trust report schema is stable and required checks are present', async () => {
    const report = await generateReleaseTrustReport({ write: false });

    assert.equal(typeof report, 'object');
    assert.equal(report.schemaVersion, '1.0.0');
    assert.equal(typeof report.overallOk, 'boolean');
    assert.equal(typeof report.reportHash, 'string');
    assert.ok(report.reportHash.length > 0);

    assert.deepEqual(
        Object.keys(report.checks).sort((left, right) => left.localeCompare(right)),
        ['architectureGate', 'exportVerification', 'federationAttestation', 'simulationTrace'],
    );

    assert.equal(typeof report.checks.architectureGate.ok, 'boolean');
    assert.equal(typeof report.checks.architectureGate.exitCode, 'number');

    assert.equal(typeof report.checks.exportVerification.ok, 'boolean');
    assert.equal(typeof report.checks.exportVerification.exportHash, 'string');
    assert.equal(typeof report.checks.exportVerification.canonicalVersion, 'string');
    assert.equal(typeof report.checks.exportVerification.algorithm, 'string');

    assert.equal(typeof report.checks.federationAttestation.ok, 'boolean');
    assert.equal(typeof report.checks.federationAttestation.hash, 'string');
    assert.equal(typeof report.checks.federationAttestation.entryCount, 'number');
    assert.equal(typeof report.checks.federationAttestation.tamperRejected, 'boolean');

    assert.equal(typeof report.checks.simulationTrace.ok, 'boolean');
    assert.equal(typeof report.checks.simulationTrace.fingerprint, 'string');
    assert.equal(typeof report.checks.simulationTrace.primitiveTraceLineageProvided, 'boolean');
    assert.equal(typeof report.checks.simulationTrace.tamperRejected, 'boolean');
});

