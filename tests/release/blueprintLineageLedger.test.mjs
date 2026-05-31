import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
    appendBlueprintLineageLedger,
    createBlueprintLineageLedgerEntry,
    parseBlueprintLineageLedgerLines,
    verifyBlueprintLineageLedgerChain,
} from '@/scripts/blueprintLineageLedger.mjs';

function createLineage({
    blueprintId = 'bp.creative-os',
    rootId = 'bp.creative-os.root',
    fromVersionId = 'bp.creative-os.v1',
    toVersionId = 'bp.creative-os.v2',
    lineageHash = 'lineage-hash-a',
    reportHash = 'report-hash-a',
    replayEquivalent = true,
    additiveOnly = true,
    dispatcherOnly = true,
} = {}) {
    return {
        schemaVersion: '1.0.0',
        blueprintId,
        rootId,
        fromVersionId,
        toVersionId,
        lineageHash,
        reportHash,
        replayEquivalent,
        additiveOnly,
        dispatcherOnly,
    };
}

test('blueprint lineage ledger append preserves baseline chain continuity', () => {
    const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-blueprint-lineage-ledger-'));
    const lineagePath = path.join(tmpRoot, 'blueprint-lineage.json');
    const ledgerPath = path.join(tmpRoot, 'blueprint-lineage-ledger.jsonl');

    const baselineEntry = createBlueprintLineageLedgerEntry({
        lineage: createLineage({ lineageHash: 'baseline-lineage-hash' }),
        previousEntryHash: null,
        timestamp: '2026-05-17T00:00:00.000Z',
        commitSha: 'baseline-sha',
        prNumber: null,
        strict: false,
    });
    fs.writeFileSync(ledgerPath, `${JSON.stringify(baselineEntry)}\n`, 'utf8');

    fs.writeFileSync(
        lineagePath,
        JSON.stringify(createLineage({ lineageHash: 'pr-lineage-hash' })),
        'utf8',
    );
    const appended = appendBlueprintLineageLedger({ lineagePath, ledgerPath });
    const entries = parseBlueprintLineageLedgerLines(fs.readFileSync(ledgerPath, 'utf8'));
    const verification = verifyBlueprintLineageLedgerChain(entries);

    assert.equal(entries.length, 2);
    assert.equal(appended.previousEntryHash, baselineEntry.entryHash);
    assert.equal(entries[1].previousEntryHash, baselineEntry.entryHash);
    assert.equal(verification.ok, true);
});

test('blueprint lineage ledger verification fails closed when historical entry is tampered', () => {
    const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-blueprint-lineage-ledger-tamper-'));
    const lineagePath = path.join(tmpRoot, 'blueprint-lineage.json');
    const ledgerPath = path.join(tmpRoot, 'blueprint-lineage-ledger.jsonl');

    fs.writeFileSync(lineagePath, JSON.stringify(createLineage({ lineageHash: 'hash-a' })), 'utf8');
    appendBlueprintLineageLedger({ lineagePath, ledgerPath });

    fs.writeFileSync(lineagePath, JSON.stringify(createLineage({ lineageHash: 'hash-b' })), 'utf8');
    appendBlueprintLineageLedger({ lineagePath, ledgerPath });

    const entries = parseBlueprintLineageLedgerLines(fs.readFileSync(ledgerPath, 'utf8'));
    entries[0].lineageHash = 'tampered-lineage-hash';
    fs.writeFileSync(ledgerPath, `${entries.map((entry) => JSON.stringify(entry)).join('\n')}\n`, 'utf8');

    const tamperedEntries = parseBlueprintLineageLedgerLines(fs.readFileSync(ledgerPath, 'utf8'));
    const verification = verifyBlueprintLineageLedgerChain(tamperedEntries);
    assert.equal(verification.ok, false);
    assert.equal(verification.index, 0);
    assert.equal(verification.reason, 'entry-hash-mismatch');
});
