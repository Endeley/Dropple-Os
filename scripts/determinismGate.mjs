import process from 'node:process';
import { validateFrameParity } from '../engine/evaluation/validateFrameParity.js';

function readNumber(name, fallback) {
    const v = process.env[name];
    if (v == null || v === '') return fallback;
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
}

const fromMs = readNumber('DETERMINISM_FROM_MS', 0);
const toMs = readNumber('DETERMINISM_TO_MS', 2000);
const stepMs = readNumber('DETERMINISM_STEP_MS', 33);
const maxPrint = readNumber('DETERMINISM_MAX_PRINT', 10);

let result;
try {
    console.log(`[DeterminismGate] range=${fromMs}..${toMs} step=${stepMs} maxPrint=${maxPrint}`);
    result = validateFrameParity({ fromMs, toMs, stepMs });
} catch (err) {
    console.error('[DeterminismGate] ERROR running parity validator:', err?.stack ?? err);
    process.exit(1);
}

if (result.ok) {
    console.log(`[DeterminismGate] OK — samples=${result.samples}, mismatches=0`);
    process.exit(0);
}

console.error(
    `[DeterminismGate] FAIL — samples=${result.samples}, mismatches=${result.mismatches.length}`
);

const shown = result.mismatches.slice(0, maxPrint);
for (const m of shown) {
    console.error(`  timeMs=${m.timeMs} headless=${m.headlessHash} live=${m.liveHash}`);
}

if (result.mismatches.length > shown.length) {
    console.error(`  ...and ${result.mismatches.length - shown.length} more`);
}

process.exit(1);
