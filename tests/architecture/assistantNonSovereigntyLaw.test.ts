import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const REGISTRY_PATH = path.join(process.cwd(), 'runtime/assistants/registry.js');

test('assistant registry remains capability-only and non-sovereign', () => {
    const content = fs.readFileSync(REGISTRY_PATH, 'utf8');

    const forbiddenPatterns = [
        /useRuntimeStore\.setState\s*\(/,
        /useAnimatedRuntimeStore\.setState\s*\(/,
        /canvasBus\.emit\s*\(/,
        /\.mutate\s*\(/,
    ];

    for (const pattern of forbiddenPatterns) {
        assert.equal(pattern.test(content), false, `forbidden authority pattern matched: ${pattern}`);
    }

    assert.match(content, /AI_REQUEST_ENQUEUE/);
});
