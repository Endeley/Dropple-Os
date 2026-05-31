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

function toBoolFlag(value) {
    return ['1', 'true', 'yes', 'on'].includes(String(value ?? '').trim().toLowerCase());
}

export function computeBlueprintLineageLedgerEntryHash(payload) {
    return sha256(stableStringify(payload));
}

export function parseBlueprintLineageLedgerLines(content) {
    return String(content)
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => JSON.parse(line));
}

function readLedger(ledgerPath) {
    if (!fs.existsSync(ledgerPath)) return [];
    return parseBlueprintLineageLedgerLines(fs.readFileSync(ledgerPath, 'utf8'));
}

export function verifyBlueprintLineageLedgerChain(entries = []) {
    for (let index = 0; index < entries.length; index += 1) {
        const entry = entries[index];
        const expectedPrevious = index === 0 ? null : entries[index - 1].entryHash;
        if ((entry.previousEntryHash ?? null) !== expectedPrevious) {
            return { ok: false, index, reason: 'previous-entry-hash-mismatch' };
        }
        const payload = { ...entry };
        delete payload.entryHash;
        const expectedEntryHash = computeBlueprintLineageLedgerEntryHash(payload);
        if (entry.entryHash !== expectedEntryHash) {
            return { ok: false, index, reason: 'entry-hash-mismatch' };
        }
    }
    return { ok: true };
}

export function createBlueprintLineageLedgerEntry({
    lineage,
    previousEntryHash = null,
    timestamp = new Date().toISOString(),
    commitSha = process.env.GITHUB_SHA || process.env.RELEASE_TRUST_COMMIT_SHA || null,
    prNumber = process.env.GITHUB_PR_NUMBER || process.env.RELEASE_TRUST_PR_NUMBER || null,
    strict = toBoolFlag(process.env.RELEASE_TRUST_DIFF_STRICT || 'false'),
} = {}) {
    const payload = Object.freeze({
        timestamp,
        commitSha,
        prNumber: prNumber === null ? null : String(prNumber),
        strict,
        schemaVersion: String(lineage?.schemaVersion ?? ''),
        blueprintId: String(lineage?.blueprintId ?? ''),
        rootId: String(lineage?.rootId ?? ''),
        fromVersionId: String(lineage?.fromVersionId ?? ''),
        toVersionId: String(lineage?.toVersionId ?? ''),
        lineageHash: String(lineage?.lineageHash ?? ''),
        reportHash: String(lineage?.reportHash ?? ''),
        replayEquivalent: lineage?.replayEquivalent === true,
        additiveOnly: lineage?.additiveOnly === true,
        dispatcherOnly: lineage?.dispatcherOnly === true,
        previousEntryHash,
    });

    return Object.freeze({
        ...payload,
        entryHash: computeBlueprintLineageLedgerEntryHash(payload),
    });
}

export function appendBlueprintLineageLedger({
    lineagePath = '.artifacts/blueprint-lineage.json',
    ledgerPath = '.artifacts/blueprint-lineage-ledger.jsonl',
} = {}) {
    const lineage = readJson(lineagePath);
    const entries = readLedger(ledgerPath);
    const previousEntryHash = entries.length > 0 ? entries[entries.length - 1].entryHash : null;
    const entry = createBlueprintLineageLedgerEntry({
        lineage,
        previousEntryHash,
    });

    ensureDir(ledgerPath);
    fs.appendFileSync(ledgerPath, `${JSON.stringify(entry)}\n`, 'utf8');

    const nextEntries = [...entries, entry];
    const verify = verifyBlueprintLineageLedgerChain(nextEntries);
    if (!verify.ok) {
        throw new Error(`Blueprint lineage ledger chain verification failed at index ${verify.index}: ${verify.reason}`);
    }
    return entry;
}

if (process.argv[1] && process.argv[1].endsWith('blueprintLineageLedger.mjs')) {
    const mode = process.argv[2] || 'append';
    const lineagePath = process.env.BLUEPRINT_LINEAGE_PATH || '.artifacts/blueprint-lineage.json';
    const ledgerPath = process.env.BLUEPRINT_LINEAGE_LEDGER_PATH || '.artifacts/blueprint-lineage-ledger.jsonl';

    if (mode === 'append') {
        const entry = appendBlueprintLineageLedger({ lineagePath, ledgerPath });
        console.log(`[BlueprintLineageLedger] appended entryHash=${entry.entryHash}`);
        process.exit(0);
    }

    if (mode === 'verify') {
        const entries = readLedger(ledgerPath);
        const verify = verifyBlueprintLineageLedgerChain(entries);
        if (!verify.ok) {
            console.error(`[BlueprintLineageLedger] FAIL index=${verify.index} reason=${verify.reason}`);
            process.exit(1);
        }
        console.log(`[BlueprintLineageLedger] OK entries=${entries.length}`);
        process.exit(0);
    }

    console.error(`[BlueprintLineageLedger] Unknown mode: ${mode}`);
    process.exit(1);
}
