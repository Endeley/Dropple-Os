import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildFederationAuditLineage } from '@/scripts/federationAuditLineageReport.mjs';

test('federation audit lineage report is deterministic for identical release trust input', () => {
    const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-federation-lineage-'));
    const reportPath = path.join(tmpRoot, 'release-trust.json');
    const outputA = path.join(tmpRoot, 'lineage-a.json');
    const outputB = path.join(tmpRoot, 'lineage-b.json');

    fs.writeFileSync(
        reportPath,
        JSON.stringify({
            reportHash: 'report-hash-a',
            checks: {
                federationAttestation: {
                    hash: 'fed-hash-a',
                    entryCount: 3,
                    tamperRejected: true,
                },
                federationLifecycle: {
                    replayEquivalent: true,
                    staleRejected: true,
                    orderingClosed: true,
                },
            },
        }),
        'utf8',
    );

    const first = buildFederationAuditLineage({
        reportPath,
        outputPath: outputA,
        nowIso: '2026-05-17T00:00:00.000Z',
    });
    const second = buildFederationAuditLineage({
        reportPath,
        outputPath: outputB,
        nowIso: '2026-05-17T00:00:00.000Z',
    });

    assert.equal(first.lineageHash, second.lineageHash);
    assert.equal(first.replayEquivalent, true);
    assert.equal(first.staleRejected, true);
    assert.equal(first.orderingClosed, true);
});
