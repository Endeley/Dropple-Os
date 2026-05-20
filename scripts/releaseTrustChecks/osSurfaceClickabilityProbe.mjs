import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PUBLISH_TEST_NAME =
    'uiux authoring roundtrip publishes from the toolbar flow and installs into a fresh workspace';
const KEYFRAME_TEST_NAME =
    'uiux transition timeline can author a motion keyframe through lawful intents';

function runPlaywrightTestByName(testName) {
    const result = spawnSync(
        'npx',
        [
            'playwright',
            'test',
            'tests/e2e/uiux-template-generation.spec.js',
            '--workers=1',
            '-g',
            testName,
        ],
        {
            cwd: process.cwd(),
            encoding: 'utf8',
            stdio: 'pipe',
        },
    );

    const stdout = typeof result.stdout === 'string' ? result.stdout : '';
    const stderr = typeof result.stderr === 'string' ? result.stderr : '';
    const combined = `${stdout}\n${stderr}`;
    const interceptErrors = Array.from(combined.matchAll(/intercepts pointer events/gi)).length;

    return Object.freeze({
        ok: result.status === 0,
        exitCode: Number.isInteger(result.status) ? result.status : 1,
        interceptErrors,
        stdoutTail: stdout.trim() ? stdout.trim().split('\n').slice(-20).join('\n') : null,
        stderrTail: stderr.trim() ? stderr.trim().split('\n').slice(-20).join('\n') : null,
    });
}

export function runOsSurfaceClickabilityProbe() {
    const publish = runPlaywrightTestByName(PUBLISH_TEST_NAME);
    const keyframe = runPlaywrightTestByName(KEYFRAME_TEST_NAME);

    return Object.freeze({
        ok: publish.ok === true && keyframe.ok === true,
        publishClickable: publish.ok === true,
        keyframeClickable: keyframe.ok === true,
        interceptErrors: Number(publish.interceptErrors) + Number(keyframe.interceptErrors),
        publishExitCode: publish.exitCode,
        keyframeExitCode: keyframe.exitCode,
        publishStdoutTail: publish.stdoutTail,
        publishStderrTail: publish.stderrTail,
        keyframeStdoutTail: keyframe.stdoutTail,
        keyframeStderrTail: keyframe.stderrTail,
    });
}

const isEntrypoint = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isEntrypoint) {
    const result = runOsSurfaceClickabilityProbe();
    if (!result.ok) {
        console.error('[OsSurfaceClickabilityProbe] FAIL');
        console.error(JSON.stringify(result, null, 2));
        process.exit(1);
    }
    console.log('[OsSurfaceClickabilityProbe] OK');
    console.log(JSON.stringify(result));
}
