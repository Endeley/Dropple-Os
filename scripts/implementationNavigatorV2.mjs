#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const STATE_PATH = path.resolve('docs/ROADMAP_STATE_V2.json');
const PACKAGE_PATH = path.resolve('package.json');
const VALID_STATUSES = new Set(['not-started', 'active', 'blocked', 'complete']);

function parseArgs(argv) {
    const options = {
        dryRun: false,
        phase: null,
        json: false,
    };

    for (let i = 0; i < argv.length; i += 1) {
        const arg = argv[i];
        if (arg === '--dry-run') options.dryRun = true;
        else if (arg === '--json') options.json = true;
        else if (arg === '--phase') options.phase = argv[i + 1] ?? null;
    }

    return options;
}

function loadJson(filePath, missingMessage) {
    if (!fs.existsSync(filePath)) {
        console.error(missingMessage);
        process.exit(1);
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function parseNpmScriptName(command) {
    const match = /^npm run ([A-Za-z0-9:_-]+)/.exec(command.trim());
    return match?.[1] ?? null;
}

function parseNodeScriptPath(command) {
    const trimmed = command.trim();
    if (!trimmed.startsWith('node ')) return null;
    const tokens = trimmed.split(/\s+/);
    const scriptToken = tokens.find((token) => token.endsWith('.mjs') || token.endsWith('.js') || token.endsWith('.cjs'));
    return scriptToken ? path.resolve(scriptToken) : null;
}

function collectViolations(state, packageJson) {
    const violations = [];
    const phases = state?.phases ?? [];
    const phaseIds = new Set(phases.map((phase) => phase.id));
    const phaseMap = new Map(phases.map((phase) => [phase.id, phase]));
    const scripts = packageJson?.scripts ?? {};

    for (const phase of phases) {
        const status = String(phase?.status ?? '').toLowerCase();
        if (!VALID_STATUSES.has(status)) {
            violations.push(`invalid status for ${phase.id}: ${phase.status}`);
        }
        for (const dep of phase?.depends_on ?? []) {
            if (!phaseIds.has(dep)) {
                violations.push(`${phase.id} depends on unknown phase: ${dep}`);
            }
        }
        for (const gate of phase?.gates ?? []) {
            const npmScript = parseNpmScriptName(gate.command ?? '');
            if (npmScript && !scripts[npmScript]) {
                violations.push(`${phase.id} gate references missing npm script: ${npmScript}`);
            }
            const nodeScriptPath = parseNodeScriptPath(gate.command ?? '');
            if (nodeScriptPath && !fs.existsSync(nodeScriptPath)) {
                violations.push(`${phase.id} gate references missing node script: ${path.relative(process.cwd(), nodeScriptPath)}`);
            }
        }
    }

    for (const phase of phases) {
        const status = String(phase?.status ?? '').toLowerCase();
        if (status !== 'active' && status !== 'complete') continue;
        for (const depId of phase?.depends_on ?? []) {
            const depStatus = String(phaseMap.get(depId)?.status ?? '').toLowerCase();
            if (depStatus !== 'complete') {
                violations.push(`${phase.id} is ${status} but dependency ${depId} is ${depStatus || 'not-set'}`);
            }
        }
    }

    return violations;
}

function nextActionablePhase(state) {
    const phases = state?.phases ?? [];
    const phaseMap = new Map(phases.map((phase) => [phase.id, phase]));
    for (const phase of phases) {
        const status = String(phase.status ?? '').toLowerCase();
        if (status === 'complete') continue;
        const ready = (phase.depends_on ?? []).every((depId) => String(phaseMap.get(depId)?.status ?? '').toLowerCase() === 'complete');
        if (ready) return phase;
    }
    return null;
}

function phaseStatusBadge(statusRaw) {
    const status = String(statusRaw ?? '').toLowerCase();
    if (status === 'complete') return '✅ COMPLETE';
    if (status === 'active') return '🟡 ACTIVE';
    if (status === 'blocked') return '⛔ BLOCKED';
    return '⚪ NOT-STARTED';
}

function printHuman(state, options, violations) {
    const phases = state?.phases ?? [];
    const selected = options.phase
        ? phases.filter((phase) => phase.id === options.phase)
        : phases;

    console.log('\nDropple Implementation Navigator V2\n');
    for (const phase of selected) {
        console.log(`${phase.id.padEnd(4)} ${String(phase.title ?? '').padEnd(48)} ${phaseStatusBadge(phase.status)}`);
    }

    if (options.phase && options.dryRun) {
        const phase = phases.find((entry) => entry.id === options.phase);
        if (!phase) {
            console.log(`\nUnknown phase: ${options.phase}`);
        } else {
            console.log(`\nDry run gates for ${phase.id} (${phase.title})`);
            phase.gates.forEach((gate, index) => {
                console.log(`[${index + 1}/${phase.gates.length}] ${gate.command}`);
            });
        }
    }

    const next = nextActionablePhase(state);
    if (next) {
        console.log(`\nNext actionable phase: ${next.id} (${next.title})`);
    } else {
        console.log('\nNext actionable phase: none');
    }

    if (violations.length) {
        console.log('\nViolations:');
        violations.forEach((entry) => console.log(`- ${entry}`));
    } else {
        console.log('\nViolations: none');
    }
    console.log('');
}

function printJson(state, options, violations) {
    const phases = state?.phases ?? [];
    const payload = {
        generatedAt: new Date().toISOString(),
        phase: options.phase,
        dryRun: options.dryRun,
        nextActionablePhase: nextActionablePhase(state)?.id ?? null,
        violations,
        phases: options.phase ? phases.filter((entry) => entry.id === options.phase) : phases,
    };
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
}

function main() {
    const options = parseArgs(process.argv.slice(2));
    const state = loadJson(STATE_PATH, 'ROADMAP_STATE_V2.json not found');
    const packageJson = loadJson(PACKAGE_PATH, 'package.json not found');
    const violations = collectViolations(state, packageJson);

    if (options.json) printJson(state, options, violations);
    else printHuman(state, options, violations);

    if (violations.length > 0) process.exit(1);
}

main();
