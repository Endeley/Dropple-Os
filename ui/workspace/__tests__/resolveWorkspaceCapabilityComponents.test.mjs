import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveCapabilityComponents } from '@/ui/workspace/capabilities/resolveCapabilityComponents.js';

test('capability components resolve in ascending priority order', async () => {
    function AlphaPanel() {}
    function ZetaPanel() {}

    const result = resolveCapabilityComponents(['timeline'], {
        timeline: {
            ui: {
                surfacePanels: [
                    { component: ZetaPanel, priority: 40 },
                    { component: AlphaPanel, priority: 5 },
                ],
            },
        },
    });
    assert.deepEqual(result.surfacePanels, [AlphaPanel, ZetaPanel]);
});

test('capability components dedupe duplicate injected panels', async () => {
    function SharedPanel() {}
    function SharedOverlay() {}

    const result = resolveCapabilityComponents(['graph', 'timeline'], {
        graph: {
            ui: {
                surfacePanels: [{ component: SharedPanel, priority: 10 }],
                overlays: [{ component: SharedOverlay, priority: 20 }],
            },
        },
        timeline: {
            ui: {
                surfacePanels: [{ component: SharedPanel, priority: 5 }],
                overlays: [{ component: SharedOverlay, priority: 5 }],
            },
        },
    });

    assert.equal(result.surfacePanels.length, 1);
    assert.equal(result.surfacePanels[0], SharedPanel);
    assert.equal(result.overlays.length, 1);
    assert.equal(result.overlays[0], SharedOverlay);
});

test('capability components use component name as deterministic tie-breaker', async () => {
    function BetaPanel() {}
    function AlphaPanel() {}

    const result = resolveCapabilityComponents(['graph'], {
        graph: {
            ui: {
                surfacePanels: [
                    { component: BetaPanel, priority: 20 },
                    { component: AlphaPanel, priority: 20 },
                ],
            },
        },
    });

    assert.deepEqual(result.surfacePanels, [AlphaPanel, BetaPanel]);
});
