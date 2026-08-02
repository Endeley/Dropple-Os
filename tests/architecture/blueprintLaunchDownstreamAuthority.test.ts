import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

function read(relPath) {
    return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

test('blueprint launch downstream authority law: active shell bootstrap consumes launch context before legacy query fallback', () => {
    const shell = read('ui/workspace/shell/ProjectPerspectiveShell.jsx');
    const bridge = read('ui/bridges/blueprintInstallBridge.js');

    assert.match(
        shell,
        /import\s+\{\s*useWorkspaceSession\s*\}\s+from\s+'@\/ui\/workspace\/session\/WorkspaceSessionContext\.jsx'/,
    );
    assert.match(shell, /const workspaceSession = useWorkspaceSession\(\);/);
    assert.match(
        shell,
        /resolveProjectBlueprintRouteSelection\(\{\s*searchParams,\s*launchContext:\s*workspaceSession\?\.launchContext\s*\?\?\s*null,\s*installOptions:\s*blueprintOptions,\s*\}\)/s,
    );

    assert.match(
        bridge,
        /const launchBlueprintId = normalizeId\(launchContext\?\.blueprint\?\.id\);/,
    );
    assert.match(
        bridge,
        /if\s*\(launchBlueprintId\)\s*\{\s*requestedIds\.push\(launchBlueprintId\);\s*\}\s*else\s*\{/s,
    );
});

test('blueprint launch downstream authority law: shell does not read legacy blueprint route fields directly', () => {
    const shell = read('ui/workspace/shell/ProjectPerspectiveShell.jsx');

    assert.doesNotMatch(shell, /\.get\(['"]blueprint['"]\)/);
    assert.doesNotMatch(shell, /\.get\(['"]blueprints['"]\)/);
    assert.doesNotMatch(shell, /\.get\(['"]bootstrap['"]\)/);
});
