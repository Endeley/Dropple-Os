import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

function sha256(input) {
    return crypto.createHash('sha256').update(String(input)).digest('hex');
}

function stableStringify(value) {
    if (value === null || value === undefined) return 'null';
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
    if (typeof value === 'object') {
        const keys = Object.keys(value).sort((a, b) => a.localeCompare(b));
        return `{${keys.map((key) => `"${key}":${stableStringify(value[key])}`).join(',')}}`;
    }
    return JSON.stringify(value);
}

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function ensureDir(filePath) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

export function computeLedgerEntryHash(payload) {
    return sha256(stableStringify(payload));
}

export function parseLedgerLines(content) {
    return String(content)
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => JSON.parse(line));
}

export function verifyLedgerChain(entries = []) {
    for (let index = 0; index < entries.length; index += 1) {
        const entry = entries[index];
        const expectedPrevious = index === 0 ? null : entries[index - 1].entryHash;
        if ((entry.previousEntryHash ?? null) !== expectedPrevious) {
            return {
                ok: false,
                index,
                reason: 'previous-entry-hash-mismatch',
            };
        }
        const payload = { ...entry };
        delete payload.entryHash;
        const expectedEntryHash = computeLedgerEntryHash(payload);
        if (entry.entryHash !== expectedEntryHash) {
            return {
                ok: false,
                index,
                reason: 'entry-hash-mismatch',
            };
        }
    }
    return { ok: true };
}

function toBoolFlag(value) {
    return ['1', 'true', 'yes', 'on'].includes(String(value ?? '').trim().toLowerCase());
}

function readLedger(ledgerPath) {
    if (!fs.existsSync(ledgerPath)) return [];
    const content = fs.readFileSync(ledgerPath, 'utf8');
    return parseLedgerLines(content);
}

export function createLedgerEntry({
    report,
    previousEntryHash = null,
    timestamp = new Date().toISOString(),
    commitSha = process.env.GITHUB_SHA || process.env.RELEASE_TRUST_COMMIT_SHA || null,
    prNumber = process.env.GITHUB_PR_NUMBER || process.env.RELEASE_TRUST_PR_NUMBER || null,
    strict = toBoolFlag(process.env.RELEASE_TRUST_DIFF_STRICT || 'false'),
} = {}) {
    const invariants = Object.freeze({
        architectureGateOk: report?.checks?.architectureGate?.ok === true,
        exportVerificationOk: report?.checks?.exportVerification?.ok === true,
        federationAttestationOk: report?.checks?.federationAttestation?.ok === true,
        simulationTraceOk: report?.checks?.simulationTrace?.ok === true,
    });

    const payload = Object.freeze({
        timestamp,
        commitSha,
        prNumber: prNumber === null ? null : String(prNumber),
        strict,
        schemaVersion: String(report?.schemaVersion ?? ''),
        reportHash: String(report?.reportHash ?? ''),
        overallOk: report?.overallOk === true,
        invariants,
        previousEntryHash,
    });

    return Object.freeze({
        ...payload,
        entryHash: computeLedgerEntryHash(payload),
    });
}

export function appendReleaseTrustLedger({
    reportPath = '.artifacts/release-trust.json',
    ledgerPath = '.artifacts/release-trust-ledger.jsonl',
} = {}) {
    const report = readJson(reportPath);
    const entries = readLedger(ledgerPath);
    const previousEntryHash = entries.length > 0 ? entries[entries.length - 1].entryHash : null;
    const entry = createLedgerEntry({
        report,
        previousEntryHash,
    });

    ensureDir(ledgerPath);
    fs.appendFileSync(ledgerPath, `${JSON.stringify(entry)}\n`, 'utf8');

    const nextEntries = [...entries, entry];
    const verify = verifyLedgerChain(nextEntries);
    if (!verify.ok) {
        throw new Error(`Release trust ledger chain verification failed at index ${verify.index}: ${verify.reason}`);
    }
    return entry;
}

if (process.argv[1] && process.argv[1].endsWith('releaseTrustLedger.mjs')) {
    const mode = process.argv[2] || 'append';
    const reportPath = process.env.RELEASE_TRUST_REPORT_PATH || '.artifacts/release-trust.json';
    const ledgerPath = process.env.RELEASE_TRUST_LEDGER_PATH || '.artifacts/release-trust-ledger.jsonl';

    if (mode === 'append') {
        const entry = appendReleaseTrustLedger({ reportPath, ledgerPath });
        console.log(`[ReleaseTrustLedger] appended entryHash=${entry.entryHash}`);
        process.exit(0);
    }

    if (mode === 'verify') {
        const entries = readLedger(ledgerPath);
        const verify = verifyLedgerChain(entries);
        if (!verify.ok) {
            console.error(`[ReleaseTrustLedger] FAIL index=${verify.index} reason=${verify.reason}`);
            process.exit(1);
        }
        console.log(`[ReleaseTrustLedger] OK entries=${entries.length}`);
        process.exit(0);
    }

    console.error(`[ReleaseTrustLedger] Unknown mode: ${mode}`);
    process.exit(1);
}

