import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
    getArchitectureScannerPolicy,
    shouldIgnoreArchitecturePath,
} from '../../scripts/architectureIgnorePolicy.mjs';

const ROOT = process.cwd();
const ALLOWED_EXT = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']);
const SCANNER_POLICY = getArchitectureScannerPolicy({
    scannerId: 'templateAuthorityTest',
});
const IGNORE_DIRS = SCANNER_POLICY.ignoreDirs;

function shouldIgnore(relPath) {
    return shouldIgnoreArchitecturePath(relPath, IGNORE_DIRS);
}

function walk(dir, relBase = '') {
    if (!fs.existsSync(dir)) return [];

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const relPath = relBase ? `${relBase}/${entry.name}` : entry.name;
        if (shouldIgnore(relPath)) continue;

        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...walk(fullPath, relPath));
            continue;
        }

        if (!entry.isFile()) continue;
        if (!ALLOWED_EXT.has(path.extname(entry.name))) continue;
        files.push({ fullPath, relPath });
    }

    return files;
}

function readAllSourceFiles() {
    return walk(ROOT);
}

function isTestFile(relPath) {
    return /\.test\.[^.]+$/.test(relPath) || relPath.startsWith('tests/');
}

test('template authority law A: workspace publication flows through one canonical publish entrypoint', () => {
    const violations = readAllSourceFiles()
        .filter(({ relPath }) => !isTestFile(relPath))
        .filter(({ relPath }) => relPath !== 'templates/publishTemplateFromWorkspace.js')
        .flatMap(({ fullPath, relPath }) => {
            const lines = fs.readFileSync(fullPath, 'utf8').split('\n');
            return lines
                .map((line, index) => ({ line, index }))
                .filter(
                    ({ line }) =>
                        /workspaceToCCMTemplate\s*\(/.test(line) &&
                        !/\bfunction\s+workspaceToCCMTemplate\b/.test(line) &&
                        !/\bexport\s+function\s+workspaceToCCMTemplate\b/.test(line),
                )
                .map(({ line, index }) => `${relPath}:${index + 1}: ${line.trim()}`);
        });

    assert.deepEqual(violations, []);
});

test('template authority law B: certified template registry has one file-backed authority', () => {
    const runtimeAuthorityAllowlist = new Set([
        'domain/templates/TemplateRegistry.js',
        'engine/templates/templateLoader.js',
        'scripts/templateVerifyAll.mjs',
    ]);
    const administrativeExceptionAllowlist = new Set([
        'scripts/migrateCertifiedTemplatesToLineage.mjs',
    ]);

    const violations = readAllSourceFiles()
        .filter(({ relPath }) => !isTestFile(relPath))
        .filter(
            ({ relPath }) =>
                !runtimeAuthorityAllowlist.has(relPath) &&
                !administrativeExceptionAllowlist.has(relPath),
        )
        .flatMap(({ fullPath, relPath }) => {
            const lines = fs.readFileSync(fullPath, 'utf8').split('\n');
            return lines
                .map((line, index) => ({ line, index }))
                .filter(({ line }) => /certifiedTemplates\.json/.test(line))
                .map(({ line, index }) => `${relPath}:${index + 1}: ${line.trim()}`);
        });

    assert.deepEqual(violations, []);
});

test('template authority law C: canonical publish and registry code does not leak legacy template shapes', () => {
    const scope = [
        'templates/publishTemplateFromWorkspace.js',
        'templates/workspaceToCCMTemplate.js',
        'domain/templates/TemplateRegistry.js',
    ];

    const legacyPattern = /\b(template\.graph|baseSnapshot|eventTimeline)\b/;
    const violations = scope.flatMap((relPath) => {
        const fullPath = path.join(ROOT, relPath);
        const lines = fs.readFileSync(fullPath, 'utf8').split('\n');
        return lines
            .map((line, index) => ({ line, index }))
            .filter(({ line }) => legacyPattern.test(line))
            .map(({ line, index }) => `${relPath}:${index + 1}: ${line.trim()}`);
    });

    assert.deepEqual(violations, []);
});
