import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const HOMEPAGE_CLIENT_PATH = path.join(ROOT, 'app/ProjectHomeClient.jsx');

function readHomepageClientSource() {
    return fs.readFileSync(HOMEPAGE_CLIENT_PATH, 'utf8');
}

test('homepage recent-work authority law: ProjectHomeClient delegates continue-work launch construction to canonical producer helper', () => {
    const source = readHomepageClientSource();

    assert.match(
        source,
        /import\s+\{\s*buildRecentWorkLaunchHref\s*\}\s+from\s+['"]@\/runtime\/workspaces\/index\.js['"]/,
    );

    assert.match(
        source,
        /function\s+buildContinueExistingWorkHref\s*\(\s*\)\s*\{\s*return\s+buildRecentWorkLaunchHref\s*\(\s*\{\s*activeDocumentId:\s*getActiveDocument\(\),\s*recentDocuments:\s*loadRegistry\(\),\s*\}\s*\)\s*;\s*\}/s,
    );

    assert.doesNotMatch(source, /href=['"]\/workspace['"]/);
    assert.doesNotMatch(source, /href=['"]\/workspace\/new\?doc=/);
    assert.doesNotMatch(source, /\.set\(\s*['"]doc['"]/);
    assert.doesNotMatch(source, /\.set\(\s*['"]language['"]/);
    assert.doesNotMatch(source, /\.set\(\s*['"]grammar['"]/);
});
