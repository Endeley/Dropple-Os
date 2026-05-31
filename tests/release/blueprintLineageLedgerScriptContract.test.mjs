import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

function readPackageScripts() {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    return pkg.scripts ?? {};
}

function createLineageFixture() {
    return {
        schemaVersion: '1.0.0',
        blueprintId: 'bp.release.contract',
        rootId: 'bp.release.contract.root',
        fromVersionId: 'bp.release.contract.v1',
        toVersionId: 'bp.release.contract.v2',
        lineageHash: 'lineage-hash-a',
        reportHash: 'report-hash-a',
        replayEquivalent: true,
        additiveOnly: true,
        dispatcherOnly: true,
        upgradeCertificationRequired: true,
        upgradeCertificationValid: true,
        mergePolicyVersion: 1,
        mergePolicyHash: 'merge-policy-hash-a',
        mergePolicyPassed: true,
        mergePolicyDisallowedPathCount: 0,
    };
}

test('package scripts define blueprint lineage ledger append/verify commands', () => {
    const scripts = readPackageScripts();
    assert.equal(
        scripts['release:blueprint:lineage'],
        'node --import ./bench/register-alias-loader.mjs scripts/blueprintLineageReport.mjs',
    );
    assert.equal(
        scripts['release:blueprint:lineage:ledger'],
        'node --import ./bench/register-alias-loader.mjs scripts/blueprintLineageLedger.mjs append',
    );
    assert.equal(
        scripts['release:blueprint:lineage:ledger:verify'],
        'node --import ./bench/register-alias-loader.mjs scripts/blueprintLineageLedger.mjs verify',
    );
    assert.match(
        scripts['validate:release'],
        /npm run release:blueprint:lineage && npm run release:blueprint:lineage:ledger && npm run release:blueprint:lineage:ledger:verify/,
    );
});

test('blueprint lineage ledger CLI append and verify succeed with valid payload', () => {
    const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-blueprint-lineage-cli-'));
    const lineagePath = path.join(tmpRoot, 'blueprint-lineage.json');
    const ledgerPath = path.join(tmpRoot, 'blueprint-lineage-ledger.jsonl');

    fs.writeFileSync(lineagePath, JSON.stringify(createLineageFixture()), 'utf8');

    execFileSync(
        'node',
        ['--import', './bench/register-alias-loader.mjs', 'scripts/blueprintLineageLedger.mjs', 'append'],
        {
            cwd: ROOT,
            env: {
                ...process.env,
                BLUEPRINT_LINEAGE_PATH: lineagePath,
                BLUEPRINT_LINEAGE_LEDGER_PATH: ledgerPath,
            },
            stdio: 'pipe',
        },
    );

    const verifyOutput = execFileSync(
        'node',
        ['--import', './bench/register-alias-loader.mjs', 'scripts/blueprintLineageLedger.mjs', 'verify'],
        {
            cwd: ROOT,
            env: {
                ...process.env,
                BLUEPRINT_LINEAGE_PATH: lineagePath,
                BLUEPRINT_LINEAGE_LEDGER_PATH: ledgerPath,
            },
            stdio: 'pipe',
            encoding: 'utf8',
        },
    );

    assert.match(verifyOutput, /\[BlueprintLineageLedger\] OK entries=1/);
});
