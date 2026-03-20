import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

function isTestFile(name) {
    return name.includes('test') && (name.endsWith('.mjs') || name.endsWith('.js'));
}

async function collectTests(rootDir) {
    const results = [];

    async function walk(currentDir) {
        const entries = await readdir(currentDir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);

            if (entry.isDirectory()) {
                await walk(fullPath);
                continue;
            }

            if (entry.isFile() && isTestFile(entry.name)) {
                results.push(fullPath);
            }
        }
    }

    await walk(rootDir);
    return results.sort((left, right) => left.localeCompare(right));
}

async function main() {
    const [rootDir, loaderPath] = process.argv.slice(2);

    if (!rootDir || !loaderPath) {
        console.error('Usage: node scripts/runDiscoveredTests.mjs <rootDir> <loaderPath>');
        process.exit(1);
    }

    const tests = await collectTests(rootDir);

    if (!tests.length) {
        console.error(`No test files found under ${rootDir}`);
        process.exit(1);
    }

    const result = spawnSync(
        process.execPath,
        ['--import', loaderPath, '--test', ...tests],
        {
            stdio: 'inherit',
            env: process.env,
        },
    );

    if (result.error) {
        throw result.error;
    }

    process.exit(result.status ?? 1);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
