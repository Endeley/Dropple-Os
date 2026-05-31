import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveProjectBlueprintRouteSelection } from '@/ui/bridges/blueprintInstallBridge.js';

const INSTALL_OPTIONS_FIXTURE = Object.freeze([
    Object.freeze({ id: 'bp.startup.v1' }),
    Object.freeze({ id: 'bp.logistics.v1' }),
]);

test('route blueprint selection resolves deterministic ordered ids from blueprints query', () => {
    const left = resolveProjectBlueprintRouteSelection({
        searchParams: new URLSearchParams('blueprints=bp.startup.v1,bp.logistics.v1&bootstrap=1'),
        installOptions: INSTALL_OPTIONS_FIXTURE,
    });
    const right = resolveProjectBlueprintRouteSelection({
        searchParams: new URLSearchParams('blueprints=bp.startup.v1,bp.logistics.v1&bootstrap=true'),
        installOptions: INSTALL_OPTIONS_FIXTURE,
    });

    assert.deepEqual(left.blueprintIds, ['bp.startup.v1', 'bp.logistics.v1']);
    assert.equal(left.autoBootstrap, true);
    assert.deepEqual(left, right);
});

test('route blueprint selection fails closed for unknown/duplicate ids and absent flags', () => {
    const resolved = resolveProjectBlueprintRouteSelection({
        searchParams: {
            blueprints: 'bp.startup.v1,bp.unknown.v9,bp.startup.v1',
        },
        installOptions: INSTALL_OPTIONS_FIXTURE,
    });

    assert.deepEqual(resolved.blueprintIds, ['bp.startup.v1']);
    assert.equal(resolved.autoBootstrap, false);
});
