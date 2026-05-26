import fs from 'node:fs';
import path from 'node:path';
import { RELEASE_TRUST_CLEAN_TARGETS } from './generatedDriftTargets.mjs';

const DEFAULT_TARGETS = RELEASE_TRUST_CLEAN_TARGETS;

function toAbsolute(cwd, target) {
    return path.resolve(cwd, target);
}

export function cleanReleaseTrustGenerated({
    cwd = process.cwd(),
    targets = DEFAULT_TARGETS,
} = {}) {
    const normalizedCwd = path.resolve(cwd);
    const results = [];

    for (const target of targets) {
        const absolutePath = toAbsolute(normalizedCwd, target);
        const existed = fs.existsSync(absolutePath);
        if (existed) {
            fs.rmSync(absolutePath, { recursive: true, force: true });
        }
        results.push(
            Object.freeze({
                target,
                path: absolutePath,
                removed: existed,
            }),
        );
    }

    return Object.freeze({
        cwd: normalizedCwd,
        results: Object.freeze(results),
    });
}

if (process.argv[1] && process.argv[1].endsWith('releaseTrustCleanGenerated.mjs')) {
    const result = cleanReleaseTrustGenerated();
    const removedCount = result.results.filter((entry) => entry.removed).length;
    for (const entry of result.results) {
        const status = entry.removed ? 'removed' : 'absent';
        console.log(`[ReleaseTrustCleanGenerated] ${status}: ${entry.target}`);
    }
    console.log(`[ReleaseTrustCleanGenerated] done (removed=${removedCount}/${result.results.length})`);
}
