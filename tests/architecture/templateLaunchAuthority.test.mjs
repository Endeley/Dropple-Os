import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TEMPLATE_DETAIL_PAGE_PATH = path.join(ROOT, 'app/marketplace/template/[id]/page.js');
const WORKSPACE_ENVIRONMENT_BOOT_PATH = path.join(ROOT, 'app/workspace/new/workspaceEnvironmentBoot.js');

function readTemplateDetailPageSource() {
    return fs.readFileSync(TEMPLATE_DETAIL_PAGE_PATH, 'utf8');
}

function readWorkspaceEnvironmentBootSource() {
    return fs.readFileSync(WORKSPACE_ENVIRONMENT_BOOT_PATH, 'utf8');
}

test('template launch authority law: marketplace template detail delegates launch construction to canonical producer helper', () => {
    const source = readTemplateDetailPageSource();

    assert.match(
        source,
        /import\s+\{\s*buildTemplateDetailLaunchHref\s*\}\s+from\s+['"]@\/runtime\/workspaces\/index\.js['"]/,
    );

    assert.match(
        source,
        /const\s+href\s*=\s*buildTemplateDetailLaunchHref\s*\(\s*template\s*\)/,
    );

    assert.doesNotMatch(source, /buildProjectEnvironmentStartRoute/);
    assert.doesNotMatch(source, /resolveCanonicalWorkspaceOverlayContext/);
    assert.doesNotMatch(source, /\?\s*entry=/);
    assert.doesNotMatch(source, /\.set\(\s*['"]template['"]/);
    assert.doesNotMatch(source, /\.set\(\s*['"]templateVersionId['"]/);
    assert.doesNotMatch(source, /\.set\(\s*['"]templateCertification['"]/);
    assert.doesNotMatch(source, /\.set\(\s*['"]grammar['"]/);
});

test('template launch authority law: downstream workspace boot does not reconstruct producer-owned template identity from query transport', () => {
    const source = readWorkspaceEnvironmentBootSource();

    assert.match(
        source,
        /const\s+versionId\s*=\s*launchContext\?\.template\?\.versionId\s*\?\?\s*null/,
    );

    assert.match(
        source,
        /resolveLaunchContextModeContext\s*\(\s*launchContext\s*\)/,
    );

    assert.doesNotMatch(source, /getSearchParam\s*\(\s*searchParams\s*,\s*['"]workspaceId['"]\s*\)/);
    assert.doesNotMatch(source, /getSearchParam\s*\(\s*searchParams\s*,\s*['"]modeId['"]\s*\)/);
    assert.doesNotMatch(source, /getSearchParam\s*\(\s*searchParams\s*,\s*['"]versionId['"]\s*\)/);
});
