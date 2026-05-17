import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
    appendFederationAuditLineageLedger,
    createLineageLedgerEntry,
    parseLineageLedgerLines,
    verifyLineageLedgerChain,
} from '@/scripts/federationAuditLineageLedger.mjs';

function createLineage({
    lineageHash = 'lineage-hash-a',
    reportHash = 'report-hash-a',
    federationAuditHash = 'fed-hash-a',
    federationAuditEntryCount = 1,
    tamperRejected = true,
    replayEquivalent = true,
    staleRejected = true,
    orderingClosed = true,
} = {}) {
    return {
        schemaVersion: '1.0.0',
        lineageHash,
        reportHash,
        federationAuditHash,
        federationAuditEntryCount,
        tamperRejected,
        replayEquivalent,
        staleRejected,
        orderingClosed,
    };
}

test('federation lineage ledger append preserves baseline chain continuity', () => {
    const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-federation-lineage-ledger-'));
    const lineagePath = path.join(tmpRoot, 'federation-audit-lineage.json');
    const ledgerPath = path.join(tmpRoot, 'federation-audit-lineage-ledger.jsonl');

    const baselineEntry = createLineageLedgerEntry({
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
    const appended = appendFederationAuditLineageLedger({ lineagePath, ledgerPath });
    const entries = parseLineageLedgerLines(fs.readFileSync(ledgerPath, 'utf8'));
    const verification = verifyLineageLedgerChain(entries);

    assert.equal(entries.length, 2);
    assert.equal(appended.previousEntryHash, baselineEntry.entryHash);
    assert.equal(entries[1].previousEntryHash, baselineEntry.entryHash);
    assert.equal(verification.ok, true);
});

test('federation lineage ledger verification fails closed when historical entry is tampered', () => {
    const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-federation-lineage-ledger-tamper-'));
    const lineagePath = path.join(tmpRoot, 'federation-audit-lineage.json');
    const ledgerPath = path.join(tmpRoot, 'federation-audit-lineage-ledger.jsonl');

    fs.writeFileSync(lineagePath, JSON.stringify(createLineage({ lineageHash: 'hash-a' })), 'utf8');
    appendFederationAuditLineageLedger({ lineagePath, ledgerPath });

    fs.writeFileSync(lineagePath, JSON.stringify(createLineage({ lineageHash: 'hash-b' })), 'utf8');
    appendFederationAuditLineageLedger({ lineagePath, ledgerPath });

    const entries = parseLineageLedgerLines(fs.readFileSync(ledgerPath, 'utf8'));
    entries[0].lineageHash = 'tampered-lineage-hash';
    fs.writeFileSync(ledgerPath, `${entries.map((entry) => JSON.stringify(entry)).join('\n')}\n`, 'utf8');

    const tamperedEntries = parseLineageLedgerLines(fs.readFileSync(ledgerPath, 'utf8'));
    const verification = verifyLineageLedgerChain(tamperedEntries);
    assert.equal(verification.ok, false);
    assert.equal(verification.index, 0);
    assert.equal(verification.reason, 'entry-hash-mismatch');
});
