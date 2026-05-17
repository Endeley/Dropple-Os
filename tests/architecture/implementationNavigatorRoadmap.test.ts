import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

function readRoadmapState() {
    return JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/ROADMAP_STATE.json'), 'utf8'));
}

function assertProofArtifactsExist(proofs) {
    for (const [requirement, artifacts] of Object.entries(proofs)) {
        assert.equal(Array.isArray(artifacts), true, `proofs.${requirement} must be an array`);
        assert.ok(artifacts.length > 0, `proofs.${requirement} must not be empty`);
        for (const artifact of artifacts) {
            assert.equal(typeof artifact, 'string', `proof artifact in ${requirement} must be a string`);
            const fullPath = path.join(ROOT, artifact);
            assert.equal(fs.existsSync(fullPath), true, `missing proof artifact: ${artifact}`);
        }
    }
}

test('orchestration session federation roadmap evidence is complete and file-backed', () => {
    const state = readRoadmapState();
    const phase = state?.orchestration_session_federation;

    assert.ok(phase, 'orchestration_session_federation phase missing');
    assert.equal(phase.status, 'complete');

    const requires = Array.isArray(phase.requires) ? phase.requires : [];
    const proofs = phase.proofs ?? {};

    const expectedRequirements = [
        'federated_session_envelope',
        'federation_lifecycle_transitions',
        'deterministic_orchestration_invariants',
        'federation_release_gate',
        'federation_lineage_artifacts',
        'federation_lineage_ledger_continuity',
    ];

    for (const requirement of expectedRequirements) {
        assert.equal(requires.includes(requirement), true, `missing roadmap requirement: ${requirement}`);
        assert.ok(proofs[requirement], `missing proofs entry for requirement: ${requirement}`);
    }

    assertProofArtifactsExist(proofs);
});
