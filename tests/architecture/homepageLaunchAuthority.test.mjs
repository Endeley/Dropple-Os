import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const HOMEPAGE_CLIENT_PATH = path.join(ROOT, 'app/ProjectHomeClient.jsx');

function readHomepageClientSource() {
    return fs.readFileSync(HOMEPAGE_CLIENT_PATH, 'utf8');
}

test('homepage launch authority law: ProjectHomeClient delegates language launch construction to canonical producer helper', () => {
    const source = readHomepageClientSource();

    assert.match(
        source,
        /import\s+\{\s*buildHomepageLanguageLaunchHref\s*\}\s+from\s+['"]@\/runtime\/workspaces\/index\.js['"]/,
    );

    assert.match(
        source,
        /function\s+buildLanguageWorkspaceHref\s*\(\s*modeId\s*\)\s*\{\s*return\s+buildHomepageLanguageLaunchHref\s*\(\s*modeId\s*\)\s*;\s*\}/s,
    );

    assert.doesNotMatch(source, /\bnew\s+URLSearchParams\s*\(/);
    assert.doesNotMatch(source, /\?\s*language=/);
    assert.doesNotMatch(source, /\.set\(\s*['"]language['"]/);
    assert.doesNotMatch(source, /\.set\(\s*['"]grammar['"]/);
    assert.doesNotMatch(source, /\.set\(\s*['"]category['"]/);
    assert.doesNotMatch(source, /\.set\(\s*['"]blueprint['"]/);
    assert.doesNotMatch(source, /\.set\(\s*['"]template['"]/);
    assert.doesNotMatch(source, /\.set\(\s*['"]certification['"]/);
});
