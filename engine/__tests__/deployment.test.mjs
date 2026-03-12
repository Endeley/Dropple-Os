import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';

import { deployApplication } from '../deploy/index.js';

test('deployment produces project files', () => {
    const ir = {
        scene: {
            nodes: {
                a: { type: 'text', text: 'Hello Dropple' },
            },
        },
        components: {},
        motion: {},
        interactions: {},
        semantics: {},
        state: {},
    };

    const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-deploy-'));
    const result = deployApplication(ir, { outputDir });

    assert.ok(fs.existsSync(path.join(outputDir, 'index.html')));
    assert.ok(fs.existsSync(path.join(outputDir, 'src', 'App.jsx')));
    assert.ok(fs.existsSync(path.join(outputDir, 'src', 'main.jsx')));
    assert.ok(fs.existsSync(path.join(outputDir, 'package.json')));
    assert.deepEqual(result.files.sort(), [
        path.join(outputDir, 'index.html'),
        path.join(outputDir, 'package.json'),
        path.join(outputDir, 'src', 'App.jsx'),
        path.join(outputDir, 'src', 'main.jsx'),
    ].sort());
});

test('deployment fingerprint is deterministic', () => {
    const ir = {
        scene: {
            nodes: {
                a: { type: 'text', text: 'Hello' },
            },
        },
        components: {},
        motion: {},
        interactions: {},
        semantics: {},
        state: {},
    };

    const outputDirA = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-deploy-a-'));
    const outputDirB = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-deploy-b-'));

    const a = deployApplication(ir, { outputDir: outputDirA });
    const b = deployApplication(ir, { outputDir: outputDirB });

    assert.equal(a.fingerprint, b.fingerprint);
});
