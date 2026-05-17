import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
    appendReleaseTrustLedger,
    createLedgerEntry,
    parseLedgerLines,
    verifyLedgerChain,
} from '@/scripts/releaseTrustLedger.mjs';

function createReport({
    schemaVersion = '1.0.0',
    reportHash = 'report-hash-a',
    architectureGateOk = true,
    exportVerificationOk = true,
    federationAttestationOk = true,
    simulationTraceOk = true,
} = {}) {
    return {
        schemaVersion,
        reportHash,
        overallOk: architectureGateOk && exportVerificationOk && federationAttestationOk && simulationTraceOk,
        checks: {
            architectureGate: { ok: architectureGateOk, exitCode: architectureGateOk ? 0 : 1 },
            exportVerification: { ok: exportVerificationOk },
            federationAttestation: { ok: federationAttestationOk },
            simulationTrace: { ok: simulationTraceOk },
        },
    };
}

test('release trust ledger entry hashing is deterministic for identical payload', () => {
    const report = createReport();
    const left = createLedgerEntry({
        report,
        previousEntryHash: null,
        timestamp: '2026-05-17T00:00:00.000Z',
        commitSha: 'sha-a',
        prNumber: '101',
        strict: false,
    });
    const right = createLedgerEntry({
        report,
        previousEntryHash: null,
        timestamp: '2026-05-17T00:00:00.000Z',
        commitSha: 'sha-a',
        prNumber: '101',
        strict: false,
    });

    assert.equal(left.entryHash, right.entryHash);
    assert.equal(left.previousEntryHash, null);
});

test('release trust ledger appends and verifies hash chain deterministically', () => {
    const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-release-ledger-'));
    const reportPath = path.join(tmpRoot, 'release-trust.json');
    const ledgerPath = path.join(tmpRoot, 'release-trust-ledger.jsonl');

    fs.writeFileSync(reportPath, JSON.stringify(createReport({ reportHash: 'hash-a' })), 'utf8');
    const entryA = appendReleaseTrustLedger({ reportPath, ledgerPath });

    fs.writeFileSync(reportPath, JSON.stringify(createReport({ reportHash: 'hash-b' })), 'utf8');
    const entryB = appendReleaseTrustLedger({ reportPath, ledgerPath });

    const lines = fs.readFileSync(ledgerPath, 'utf8');
    const entries = parseLedgerLines(lines);
    const verification = verifyLedgerChain(entries);

    assert.equal(entries.length, 2);
    assert.equal(entries[0].entryHash, entryA.entryHash);
    assert.equal(entries[1].entryHash, entryB.entryHash);
    assert.equal(entries[1].previousEntryHash, entries[0].entryHash);
    assert.equal(verification.ok, true);
});

test('release trust ledger verification fails closed when historical entry is tampered', () => {
    const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-release-ledger-tamper-'));
    const reportPath = path.join(tmpRoot, 'release-trust.json');
    const ledgerPath = path.join(tmpRoot, 'release-trust-ledger.jsonl');

    fs.writeFileSync(reportPath, JSON.stringify(createReport({ reportHash: 'hash-a' })), 'utf8');
    appendReleaseTrustLedger({ reportPath, ledgerPath });

    fs.writeFileSync(reportPath, JSON.stringify(createReport({ reportHash: 'hash-b' })), 'utf8');
    appendReleaseTrustLedger({ reportPath, ledgerPath });

    const entries = parseLedgerLines(fs.readFileSync(ledgerPath, 'utf8'));
    entries[0].reportHash = 'tampered-report-hash';
    fs.writeFileSync(ledgerPath, `${entries.map((entry) => JSON.stringify(entry)).join('\n')}\n`, 'utf8');

    const tamperedEntries = parseLedgerLines(fs.readFileSync(ledgerPath, 'utf8'));
    const verification = verifyLedgerChain(tamperedEntries);

    assert.equal(verification.ok, false);
    assert.equal(verification.index, 0);
    assert.equal(verification.reason, 'entry-hash-mismatch');
});

test('release trust ledger append preserves baseline chain continuity', () => {
    const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-release-ledger-baseline-'));
    const reportPath = path.join(tmpRoot, 'release-trust.json');
    const ledgerPath = path.join(tmpRoot, 'release-trust-ledger.jsonl');

    const baselineEntry = createLedgerEntry({
        report: createReport({ reportHash: 'baseline-hash' }),
        previousEntryHash: null,
        timestamp: '2026-05-17T00:00:00.000Z',
        commitSha: 'baseline-sha',
        prNumber: null,
        strict: false,
    });
    fs.writeFileSync(ledgerPath, `${JSON.stringify(baselineEntry)}\n`, 'utf8');

    fs.writeFileSync(reportPath, JSON.stringify(createReport({ reportHash: 'pr-hash' })), 'utf8');
    const appended = appendReleaseTrustLedger({ reportPath, ledgerPath });
    const entries = parseLedgerLines(fs.readFileSync(ledgerPath, 'utf8'));
    const verification = verifyLedgerChain(entries);

    assert.equal(entries.length, 2);
    assert.equal(appended.previousEntryHash, baselineEntry.entryHash);
    assert.equal(entries[1].previousEntryHash, baselineEntry.entryHash);
    assert.equal(verification.ok, true);
});
