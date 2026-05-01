#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const STATE_PATH = path.resolve('docs/ROADMAP_STATE.json');

function loadState() {
    if (!fs.existsSync(STATE_PATH)) {
        console.error('ROADMAP_STATE.json not found');
        process.exit(1);
    }

    return JSON.parse(fs.readFileSync(STATE_PATH, 'utf-8'));
}

function normalizePhases(state) {
    if (state?.phases && typeof state.phases === 'object') {
        return state.phases;
    }

    return state ?? {};
}

function formatStatus(status) {
    const normalized = String(status ?? 'not-started').toLowerCase();

    switch (normalized) {
        case 'complete':
            return 'COMPLETE';
        case 'active':
            return 'ACTIVE';
        case 'blocked':
            return 'BLOCKED';
        case 'not-started':
        default:
            return 'NOT-STARTED';
    }
}

function formatPhaseLabel(phaseId) {
    return phaseId
        .split('_')
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(' ');
}

function statusBadge(status) {
    switch (status) {
        case 'COMPLETE':
            return '✅ COMPLETE';
        case 'ACTIVE':
            return '🟡 ACTIVE';
        case 'BLOCKED':
            return '⛔ BLOCKED';
        default:
            return '⚪ NOT-STARTED';
    }
}

function printPhase(name, data) {
    const status = formatStatus(data?.status);
    console.log(`${name.padEnd(35)} ${statusBadge(status)}`);
}

function collectDependencyViolations(phases) {
    const violations = [];

    for (const [phaseId, phase] of Object.entries(phases)) {
        const status = formatStatus(phase?.status);
        if (status !== 'ACTIVE') continue;

        for (const dep of phase?.depends_on ?? []) {
            const depStatus = formatStatus(phases?.[dep]?.status);
            if (depStatus !== 'COMPLETE') {
                violations.push(`${phaseId} depends on incomplete ${dep}`);
            }
        }
    }

    return violations;
}

function collectMissingProofs(phases) {
    const missing = [];

    for (const [phaseId, phase] of Object.entries(phases)) {
        const status = formatStatus(phase?.status);
        if (status !== 'ACTIVE' && status !== 'COMPLETE') {
            continue;
        }

        const requires = Array.isArray(phase?.requires) ? phase.requires : [];
        const proofs = phase?.proofs ?? {};

        for (const requirement of requires) {
            const artifacts = proofs?.[requirement];
            if (!Array.isArray(artifacts) || artifacts.length === 0) {
                missing.push(`${phaseId} missing proof: ${requirement}`);
                continue;
            }

            for (const artifact of artifacts) {
                if (typeof artifact !== 'string' || artifact.length === 0) {
                    missing.push(`${phaseId} invalid proof artifact for: ${requirement}`);
                    continue;
                }

                if (!fs.existsSync(path.resolve(artifact))) {
                    missing.push(
                        `${phaseId} missing proof artifact for ${requirement}: ${artifact}`,
                    );
                }
            }
        }
    }

    return missing;
}

function collectRisks(phases, topLevelRisks = []) {
    const risks = new Set(Array.isArray(topLevelRisks) ? topLevelRisks : []);

    for (const phase of Object.values(phases)) {
        for (const risk of phase?.risks ?? []) {
            if (typeof risk === 'string' && risk.length > 0) {
                risks.add(risk);
            }
        }
    }

    return [...risks].sort((left, right) => left.localeCompare(right));
}

function collectFrozenSubstrate(phases) {
    return Object.entries(phases)
        .filter(([, phase]) => phase?.frozen === true)
        .map(([phaseId]) => phaseId)
        .sort((left, right) => left.localeCompare(right));
}

function run() {
    const state = loadState();
    const phases = normalizePhases(state);

    console.log('\n🧭 Dropple Implementation Navigator\n');

    for (const [phaseId, phase] of Object.entries(phases)) {
        printPhase(formatPhaseLabel(phaseId), phase);
    }

    const dependencyViolations = collectDependencyViolations(phases);
    const missingProofs = collectMissingProofs(phases);
    const risks = collectRisks(phases, state?.risks);
    const frozenSubstrate = collectFrozenSubstrate(phases);

    if (frozenSubstrate.length) {
        console.log('\n🔒 Frozen Substrate:');
        frozenSubstrate.forEach((phaseId) => {
            console.log(`- ${phaseId}`);
        });
    }

    if (dependencyViolations.length) {
        console.log('\n⛔ Dependency Violations:');
        dependencyViolations.forEach((entry) => console.log(`- ${entry}`));
    }

    if (missingProofs.length) {
        console.log('\n⚠️  Missing Proofs:');
        missingProofs.forEach((entry) => console.log(`- ${entry}`));
    }

    if (risks.length) {
        console.log('\n⚠️  Constitutional Risks:');
        risks.forEach((risk) => console.log(`- ${risk}`));
    }

    console.log('');
}

run();
