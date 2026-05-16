import fs from 'node:fs';
import path from 'node:path';
import {
    getArchitectureIgnoreDirs,
    shouldIgnoreArchitecturePath,
} from './architectureIgnorePolicy.mjs';

const ROOT = process.cwd();
const ALLOWED_EXT = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']);
const IGNORE_DIRS = getArchitectureIgnoreDirs();

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

function collectMatches({ scopes, patterns }) {
    const matches = [];

    for (const scope of scopes) {
        const scopeRoot = path.join(ROOT, scope);
        const files = walk(scopeRoot, scope);

        for (const file of files) {
            const content = fs.readFileSync(file.fullPath, 'utf8');
            const lines = content.split('\n');

            lines.forEach((line, index) => {
                for (const pattern of patterns) {
                    if (!pattern.regex.test(line)) continue;
                    matches.push({
                        category: pattern.category,
                        relPath: file.relPath,
                        line: index + 1,
                        text: line.trim(),
                    });
                }
            });
        }
    }

    return matches;
}

function printCategory(name, matches) {
    if (matches.length === 0) {
        console.log(`${name}: none`);
        return;
    }

    console.log(`${name}:`);
    for (const match of matches) {
        console.log(`- ${match.relPath}:${match.line}: ${match.text}`);
    }
}

const matches = collectMatches({
    scopes: ['ui', 'commands'],
    patterns: [
        {
            category: 'ui-command-direct-call',
            regex: /\brunToolCommand\s*\(\s*\{/,
        },
        {
            category: 'ui-dispatch-leak',
            regex: /\bdispatch\s*:\s*(dispatcher|emit)\b/,
        },
    ],
});

const categories = [
    'ui-command-direct-call',
    'ui-dispatch-leak',
];

console.log('Architecture transition audit\n');

for (const category of categories) {
    printCategory(
        category,
        matches.filter((match) => match.category === category),
    );
    console.log('');
}

const total = matches.length;
console.log(`Total findings: ${total}`);
