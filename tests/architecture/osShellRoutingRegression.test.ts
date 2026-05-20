import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { OS_WORKSPACE_SHELL_ALLOWED_ACTIONS } from '@/runtime/osSurface/shellActionPolicy.js';

test('editor workspace navigation routes through os surface shell intent bridge', () => {
    const source = fs.readFileSync('ui/workspace/editor/EditorWorkspaceLayout.jsx', 'utf8');

    assert.match(source, /import\s+\{\s*dispatchOsWorkspaceShellIntent\s*\}\s+from\s+['"]@\/ui\/bridges\/osSurfaceIntentBridge\.js['"]/);
    assert.match(source, /dispatchOsWorkspaceShellIntent\(\s*\{\s*action:\s*'workspace\.activate'/);
    assert.match(source, /dispatchOsWorkspaceShellIntent\(\s*\{\s*action:\s*'mode\.activate'/);
    assert.match(source, /onGoToWorkspace\?\.\(nextWorkspaceId\)/);
    assert.match(source, /onGoToMode\?\.\(currentWorkspaceId,\s*nextModeId\)/);

    const actionMatches = Array.from(source.matchAll(/action:\s*'([^']+)'/g), (match) => match[1]);
    const uniqueActions = Array.from(new Set(actionMatches));
    const disallowed = uniqueActions.filter((action) => !OS_WORKSPACE_SHELL_ALLOWED_ACTIONS.includes(action));
    assert.deepEqual(disallowed, []);
    assert.deepEqual(uniqueActions.sort(), ['mode.activate', 'workspace.activate']);
});
