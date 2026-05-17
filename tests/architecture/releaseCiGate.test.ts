import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

function read(pathname) {
    return fs.readFileSync(path.join(ROOT, pathname), 'utf8');
}

test('pull request CI workflow runs validate:release as a required release gate', () => {
    const workflow = read('.github/workflows/ci.yml');

    assert.match(workflow, /FORCE_JAVASCRIPT_ACTIONS_TO_NODE24:\s*"true"/);
    assert.match(workflow, /release-trust-gate-pr:/);
    assert.match(workflow, /name:\s*PR Release Validation \(validate:release\)/);
    assert.match(workflow, /if:\s*github\.event_name\s*==\s*'pull_request'/);
    assert.match(workflow, /run:\s*npm run validate:release/);
    assert.match(workflow, /name:\s*Append release trust ledger entry \(pr\)/);
    assert.match(workflow, /run:\s*npm run release:trust:ledger/);
    assert.match(workflow, /name:\s*Verify release trust ledger chain \(pr\)/);
    assert.match(workflow, /run:\s*npm run release:trust:ledger:verify/);
    assert.match(workflow, /name:\s*Upload release trust report \(pr\)/);
    assert.match(workflow, /name:\s*release-trust-report-pr/);
    assert.match(workflow, /name:\s*Upload release trust ledger \(pr\)/);
    assert.match(workflow, /name:\s*release-trust-ledger-pr/);
    assert.match(workflow, /name:\s*Upload federation audit lineage \(pr\)/);
    assert.match(workflow, /name:\s*federation-audit-lineage-pr/);
    assert.match(workflow, /name:\s*Fetch main release trust baseline artifacts/);
    assert.match(workflow, /actions\/workflows\/\$\{WORKFLOW_FILE\}\/runs/);
    assert.match(workflow, /release-trust-baseline\.json/);
    assert.match(workflow, /release-trust-ledger-main/);
    assert.match(workflow, /release-trust-ledger\.jsonl/);
    assert.match(workflow, /name:\s*Release trust diff \(blocking\)/);
    assert.doesNotMatch(
        workflow,
        /name:\s*Release trust diff \(blocking\)\n(?:.*\n){0,4}\s*continue-on-error:\s*true/,
    );
    assert.match(workflow, /RELEASE_TRUST_BASELINE_REQUIRED_AFTER:\s*'2026-07-01T00:00:00.000Z'/);
    assert.match(workflow, /run:\s*npm run release:trust:diff/);
    assert.match(workflow, /name:\s*Publish release trust summary/);
    assert.match(workflow, /if:\s*always\(\)/);
    assert.match(workflow, /run:\s*npm run release:trust:summary/);
    assert.match(workflow, /name:\s*Publish release trust PR comment/);
    assert.match(workflow, /run:\s*npm run release:trust:pr-comment/);
});
