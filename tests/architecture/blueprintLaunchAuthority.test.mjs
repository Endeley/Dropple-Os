import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PROJECT_START_ROUTE_PATH = path.join(ROOT, 'platform/workspaces/projectStartRoute.js');
const PROJECT_INTENT_ROUTE_PATH = path.join(ROOT, 'runtime/workspaces/projectIntentBlueprintRecommendation.js');

function readProjectStartRouteSource() {
    return fs.readFileSync(PROJECT_START_ROUTE_PATH, 'utf8');
}

function readProjectIntentSource() {
    return fs.readFileSync(PROJECT_INTENT_ROUTE_PATH, 'utf8');
}

test('blueprint launch authority law: project start route delegates blueprint launch construction to canonical producer helper', () => {
    const source = readProjectStartRouteSource();
    const blueprintRouteSection = source.split('export function buildProjectEnvironmentStartRoute')[0] ?? '';

    assert.match(
        source,
        /import\s+\{\s*buildBlueprintLaunchHref\s*\}\s+from\s+['"]@\/runtime\/workspaces\/index\.js['"]/,
    );

    assert.match(
        blueprintRouteSection,
        /return\s+buildBlueprintLaunchHref\s*\(\s*\{\s*perspectiveId:\s*normalizePerspectiveId\(perspectiveId\),\s*blueprintId:\s*asNonEmptyString\(blueprintId\),\s*\}\s*\)/s,
    );

    assert.doesNotMatch(blueprintRouteSection, /\?\s*blueprint=/);
    assert.doesNotMatch(blueprintRouteSection, /bootstrap=1/);
    assert.doesNotMatch(blueprintRouteSection, /new\s+URLSearchParams\s*\(/);
});

test('blueprint launch authority law: intent recommendation route delegates bootstrap launch construction to canonical producer helper', () => {
    const source = readProjectIntentSource();

    assert.match(
        source,
        /import\s+\{\s*buildBlueprintLaunchHref\s*\}\s+from\s+['"]\.\/blueprintLaunch\.js['"]/,
    );

    assert.match(
        source,
        /return\s+buildBlueprintLaunchHref\s*\(\s*\{\s*perspectiveId:\s*'create',\s*blueprintId:\s*normalized,\s*\}\s*\)/s,
    );

    assert.doesNotMatch(source, /\?\s*blueprint=/);
    assert.doesNotMatch(source, /bootstrap=1/);
});
