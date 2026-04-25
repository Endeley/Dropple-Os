import test from 'node:test';
import assert from 'node:assert/strict';

import {
    STATUS,
    buildPhaseProgressReport,
    buildStatusReport,
    loadArchitectureInputs,
} from '@/scripts/architectureUtils.mjs';

test('architecture status report promotes fully evidenced systems to VERIFIED', () => {
    const { systemMap, dependencyGraph, phaseMap } = loadArchitectureInputs();
    const report = buildStatusReport(systemMap, dependencyGraph, phaseMap);

    for (const [systemId, entry] of Object.entries(report.systems)) {
        assert.equal(
            entry.missingRequiredFiles.length,
            0,
            `${systemId} unexpectedly missing required files`,
        );
        assert.equal(
            entry.missingRequiredTests.length,
            0,
            `${systemId} unexpectedly missing required tests`,
        );
        assert.equal(
            entry.missingOptionalFiles.length,
            0,
            `${systemId} unexpectedly missing optional files`,
        );
        assert.equal(entry.blockedBy.length, 0, `${systemId} is unexpectedly blocked`);
        assert.equal(entry.status, STATUS.VERIFIED, `${systemId} should be VERIFIED`);
        assert.equal(entry.score, 100, `${systemId} should score 100`);
    }
});

test('architecture phase progress reflects full verification when all tracked systems are verified', () => {
    const { systemMap, dependencyGraph, phaseMap } = loadArchitectureInputs();
    const statusReport = buildStatusReport(systemMap, dependencyGraph, phaseMap);
    const report = buildPhaseProgressReport(statusReport);

    for (const [phaseId, phase] of Object.entries(report.phases)) {
        assert.equal(phase.status, STATUS.VERIFIED, `${phaseId} should be VERIFIED`);
        assert.equal(phase.score, 100, `${phaseId} should score 100`);

        for (const [stageId, stage] of Object.entries(phase.stages)) {
            assert.equal(stage.status, STATUS.VERIFIED, `${phaseId}/${stageId} should be VERIFIED`);
            assert.equal(stage.score, 100, `${phaseId}/${stageId} should score 100`);
        }
    }
});
