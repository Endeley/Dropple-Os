import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildBlueprintLineage } from '@/scripts/blueprintLineageReport.mjs';

test('blueprint lineage report is deterministic for identical release trust input', () => {
    const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-blueprint-lineage-'));
    const reportPath = path.join(tmpRoot, 'release-trust.json');
    const outputA = path.join(tmpRoot, 'lineage-a.json');
    const outputB = path.join(tmpRoot, 'lineage-b.json');

    fs.writeFileSync(
        reportPath,
        JSON.stringify({
            reportHash: 'report-hash-a',
            checks: {
                blueprintBootstrapProvenance: {
                    replayEquivalent: true,
                    blueprintId: 'bp.release.bootstrap.v1',
                    blueprintVersionId: 'bp.release.bootstrap.v1',
                },
            },
        }),
        'utf8',
    );

    const first = buildBlueprintLineage({
        reportPath,
        outputPath: outputA,
        nowIso: '2026-05-31T00:00:00.000Z',
    });
    const second = buildBlueprintLineage({
        reportPath,
        outputPath: outputB,
        nowIso: '2026-05-31T00:00:00.000Z',
    });

    assert.equal(first.lineageHash, second.lineageHash);
    assert.equal(first.replayEquivalent, true);
    assert.equal(first.additiveOnly, true);
    assert.equal(first.dispatcherOnly, true);
    assert.equal(first.upgradeCertificationRequired, true);
    assert.equal(first.upgradeCertificationValid, true);
    assert.equal(first.mergePolicyPassed, true);
    assert.equal(first.blueprintId, 'bp.release.bootstrap.v1');
    assert.equal(first.toVersionId, 'bp.release.bootstrap.v1');
});
