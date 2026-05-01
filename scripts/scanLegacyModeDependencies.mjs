#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { OVERLAY_REGISTRY } from '../platform/workspaces/overlayRegistry.js';

const REPO_ROOT = process.cwd();
const SOURCE_ROOTS = ['app', 'core', 'engine', 'platform', 'runtime', 'ui', 'workspaces'];
const INFO_ROOTS = ['tests', 'docs'];
const COMPATIBILITY_ROOTS = [
    'platform/workspaces/overlayRegistry.js',
    'platform/workspaces/modeResolution.js',
    'platform/workspaces/legacyMapping.js',
    'platform/workspaces/modeRegistry.js',
    'workspaces/registry',
    'app/education',
];
const IGNORED_SEGMENTS = new Set([
    'node_modules',
    '.git',
    '.next-dev',
    '.next-prod',
    '.next-e2e',
    'coverage',
    'dist',
    'build',
]);
const ALLOWED_EXTENSIONS = new Set([
    '.js',
    '.jsx',
    '.mjs',
    '.cjs',
    '.ts',
    '.tsx',
    '.json',
    '.md',
]);

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizePath(value) {
    return value.split(path.sep).join('/');
}

function collectLegacyModeIds() {
    const ids = new Set();

    for (const entry of Object.values(OVERLAY_REGISTRY)) {
        for (const legacyModeId of entry.legacyModes ?? []) {
            ids.add(legacyModeId);
        }
    }

    return Array.from(ids).sort((left, right) => left.localeCompare(right));
}

function buildIdentityPatterns(modeId) {
    const quotedModeId = `['"\`]${escapeRegExp(modeId)}['"\`]`;
    const routeLiteral = `['"\`]/workspace/${escapeRegExp(modeId)}['"\`]`;

    return [
        new RegExp(routeLiteral),
        new RegExp(`\\b(?:workspace|workspaceId|mode|modeId|definitionId|legacyId|defaultMode)\\b\\s*[:=]\\s*${quotedModeId}`),
        new RegExp(`\\bid\\b\\s*:\\s*${quotedModeId}`),
        new RegExp(`\\blegacyModes\\b\\s*:\\s*\\[[^\\]]*${quotedModeId}`),
        new RegExp(`\\bfreezeLegacyEntry\\([^\\n]*${quotedModeId}`),
        new RegExp(`\\b(?:getLegacyWorkspaceEntry|resolveModeWithOverlay|resolveWorkspaceContext|resolveCanonicalWorkspaceContext)\\(${quotedModeId}`),
        new RegExp(`\\b(?:modeId|mode|workspaceId|workspace)\\s*===\\s*${quotedModeId}`),
        new RegExp(`\\b(?:modeId|mode|workspaceId|workspace)\\s*!==\\s*${quotedModeId}`),
        new RegExp(`\\b(?:adapter|mode)\\??\\.id\\s*===\\s*${quotedModeId}`),
        new RegExp(`\\b(?:adapter|mode)\\??\\.id\\s*!==\\s*${quotedModeId}`),
    ];
}

function shouldScanFile(filePath) {
    const ext = path.extname(filePath);
    return ALLOWED_EXTENSIONS.has(ext);
}

function walkFiles(rootDir) {
    const absoluteRoot = path.resolve(REPO_ROOT, rootDir);
    if (!fs.existsSync(absoluteRoot)) return [];

    const files = [];
    const queue = [absoluteRoot];

    while (queue.length > 0) {
        const current = queue.pop();
        const entries = fs.readdirSync(current, { withFileTypes: true });

        for (const entry of entries) {
            const nextPath = path.join(current, entry.name);
            if (entry.isDirectory()) {
                if (!IGNORED_SEGMENTS.has(entry.name)) {
                    queue.push(nextPath);
                }
                continue;
            }

            if (entry.isFile() && shouldScanFile(nextPath)) {
                files.push(nextPath);
            }
        }
    }

    return files;
}

function scanRoots(rootNames, legacyModeIds, patternFactory) {
    const results = new Map();
    const patterns = legacyModeIds.map((modeId) => ({
        modeId,
        regexes: patternFactory(modeId),
    }));

    for (const rootName of rootNames) {
        for (const filePath of walkFiles(rootName)) {
            const content = fs.readFileSync(filePath, 'utf8');
            const relativePath = normalizePath(path.relative(REPO_ROOT, filePath));
            const lines = content.split('\n');

            lines.forEach((line, index) => {
                for (const { modeId, regexes } of patterns) {
                    const matched = regexes.some((regex) => {
                        regex.lastIndex = 0;
                        return regex.test(line);
                    });

                    if (!matched) continue;

                    if (!results.has(modeId)) {
                        results.set(modeId, []);
                    }

                    results.get(modeId).push({
                        file: relativePath,
                        line: index + 1,
                        text: line.trim(),
                    });
                }
            });
        }
    }

    return results;
}

function isCompatibilityReference(filePath) {
    return COMPATIBILITY_ROOTS.some((allowedRoot) => filePath === allowedRoot || filePath.startsWith(`${allowedRoot}/`));
}

function isTestOrDocReference(filePath) {
    return (
        filePath.startsWith('tests/') ||
        filePath.startsWith('docs/') ||
        filePath.includes('/__tests__/') ||
        /\.test\.(?:js|jsx|mjs|cjs|ts|tsx)$/.test(filePath)
    );
}

function splitSourceReferencesByClass(references) {
    const behavioral = new Map();
    const compatibility = new Map();
    const info = new Map();

    for (const [modeId, matches] of references.entries()) {
        for (const match of matches) {
            const target = isTestOrDocReference(match.file)
                ? info
                : isCompatibilityReference(match.file)
                    ? compatibility
                    : behavioral;

            if (!target.has(modeId)) {
                target.set(modeId, []);
            }

            target.get(modeId).push(match);
        }
    }

    return {
        behavioral,
        compatibility,
        info,
    };
}

function printSection(title, modeIds, references) {
    console.log(`\n${title}`);
    if (modeIds.length === 0) {
        console.log('- none');
        return;
    }

    for (const modeId of modeIds) {
        const matches = references.get(modeId) ?? [];
        console.log(`- ${modeId} (${matches.length})`);
        for (const match of matches.slice(0, 8)) {
            console.log(`  ${match.file}:${match.line} ${match.text}`);
        }
        if (matches.length > 8) {
            console.log(`  ... ${matches.length - 8} more`);
        }
    }
}

function main() {
    const legacyModeIds = collectLegacyModeIds();
    const sourceReferences = scanRoots(SOURCE_ROOTS, legacyModeIds, buildIdentityPatterns);
    const docReferences = scanRoots(INFO_ROOTS, legacyModeIds, buildIdentityPatterns);
    const { behavioral, compatibility, info: sourceInfoReferences } = splitSourceReferencesByClass(sourceReferences);

    const infoReferences = new Map();
    for (const modeId of legacyModeIds) {
        const combined = [
            ...(sourceInfoReferences.get(modeId) ?? []),
            ...(docReferences.get(modeId) ?? []),
        ];
        if (combined.length > 0) {
            infoReferences.set(modeId, combined);
        }
    }

    const behavioralHits = legacyModeIds.filter((modeId) => (behavioral.get(modeId)?.length ?? 0) > 0);
    const compatibilityHits = legacyModeIds.filter((modeId) => (compatibility.get(modeId)?.length ?? 0) > 0);
    const infoHits = legacyModeIds.filter((modeId) => (infoReferences.get(modeId)?.length ?? 0) > 0);
    const clearModes = legacyModeIds.filter(
        (modeId) =>
            (behavioral.get(modeId)?.length ?? 0) === 0 &&
            (compatibility.get(modeId)?.length ?? 0) === 0 &&
            (infoReferences.get(modeId)?.length ?? 0) === 0,
    );

    console.log('\nDropple Legacy Mode Dependency Scan');
    console.log(`Legacy modes tracked: ${legacyModeIds.length}`);
    console.log(`Behavioral dependencies: ${behavioralHits.length}`);
    console.log(`Compatibility references: ${compatibilityHits.length}`);
    console.log(`Test/doc references: ${infoHits.length}`);
    console.log(`Fully clear: ${clearModes.length}`);

    printSection('Behavioral Dependencies', behavioralHits, behavioral);
    printSection('Compatibility References', compatibilityHits, compatibility);
    printSection('Test/Doc References', infoHits, infoReferences);
    printSection('Fully Clear Legacy Modes', clearModes, new Map());
}

main();
