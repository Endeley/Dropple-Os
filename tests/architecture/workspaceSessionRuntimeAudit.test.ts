import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

function read(relPath) {
    return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

test('workspace root remains the single composition root for workspace session creation', () => {
    const content = read('ui/workspace/root/WorkspaceRoot.jsx');

    assert.match(content, /import\s+\{\s*WorkspaceSessionProvider\s*\}\s+from\s+'@\/ui\/workspace\/session\/WorkspaceSessionContext\.jsx'/);
    assert.match(content, /const workspaceLaunchContext = shellProps\?\.initialWorkspaceLaunchContext \?\? null;/);
    assert.match(content, /<WorkspaceSessionProvider/);
    assert.match(content, /launchContext=\{workspaceLaunchContext\}/);
});

test('active authoring shells consume workspace session authority through the session hook', () => {
    const editorShell = read('ui/workspace/editor/EditorWorkspaceShell.jsx');
    const uiuxShell = read('ui/workspace/uiux/UIUXAuthoringShell.jsx');

    assert.match(editorShell, /import\s+\{\s*useWorkspaceSession\s*\}\s+from\s+'@\/ui\/workspace\/session\/WorkspaceSessionContext\.jsx'/);
    assert.match(editorShell, /const workspaceSession = useWorkspaceSession\(\);/);

    assert.match(uiuxShell, /import\s+\{\s*useWorkspaceSession\s*\}\s+from\s+'@\/ui\/workspace\/session\/WorkspaceSessionContext\.jsx'/);
    assert.match(uiuxShell, /const workspaceSession = useWorkspaceSession\(\);/);
});

test('workspace shell routing keeps media on the editor session path and uiux on the dedicated session path', () => {
    const shellRouter = read('ui/workspace/shell/WorkspaceShell.jsx');
    const mediaShell = read('ui/workspace/media/MediaWorkspaceShell.jsx');

    assert.match(shellRouter, /import\s+\{\s*MediaWorkspaceShell\s*\}\s+from\s+'@\/ui\/workspace\/media\/MediaWorkspaceShell\.jsx'/);
    assert.match(shellRouter, /import\s+\{\s*EditorWorkspaceShell\s*\}\s+from\s+'@\/ui\/workspace\/editor\/EditorWorkspaceShell\.jsx'/);
    assert.match(shellRouter, /import\s+\{\s*UIUXAuthoringShell\s*\}\s+from\s+'@\/ui\/workspace\/uiux\/UIUXAuthoringShell\.jsx'/);

    assert.match(mediaShell, /<EditorWorkspaceShell/);
    assert.match(mediaShell, /showWorkspaceNavigation=\{false\}/);
});

test('launch-context transport remains confined to boot producers and workspace root wiring', () => {
    const modeLoader = read('ui/workspace/shell/ModeLoader.jsx');
    const modePage = read('app/workspace/[mode]/page.js');
    const newPage = read('app/workspace/new/page.js');
    const workspaceRoot = read('ui/workspace/root/WorkspaceRoot.jsx');

    assert.match(modePage, /resolveWorkspaceLaunchContextFromSearchParams/);
    assert.match(newPage, /resolveWorkspaceLaunchContextFromSearchParams/);
    assert.match(modeLoader, /initialWorkspaceLaunchContext/);
    assert.match(workspaceRoot, /initialWorkspaceLaunchContext/);
});
