import test from 'node:test';
import assert from 'node:assert/strict';

import {
    getSelectedNodeMotionClipCount,
    hasTimelineRelevance,
    isTimeAuthoringTool,
} from '@/ui/workspace/uiux/timelineRelevance.js';

test('static selected frame does not activate timeline relevance', () => {
    assert.equal(
        hasTimelineRelevance({
            capabilitySurface: { showTransitionTimeline: true },
            document: { motion: { clips: {} } },
            selectedNode: { id: 'frame-1', type: 'frame' },
            activeTool: 'select',
        }),
        false,
    );
});

test('selected node with motion clips activates timeline relevance', () => {
    assert.equal(
        hasTimelineRelevance({
            capabilitySurface: { showTransitionTimeline: true },
            document: {
                motion: {
                    clips: {
                        clipA: { target: 'frame-1', keyframes: [{ t: 0, v: 1 }] },
                    },
                },
            },
            selectedNode: { id: 'frame-1', type: 'frame' },
            activeTool: 'select',
        }),
        true,
    );
});

test('time-authoring tool activates timeline relevance only with a selected node', () => {
    assert.equal(
        hasTimelineRelevance({
            capabilitySurface: { showTransitionTimeline: true },
            document: { motion: { clips: {} } },
            selectedNode: { id: 'frame-1', type: 'frame' },
            activeTool: 'keyframe',
        }),
        true,
    );

    assert.equal(
        hasTimelineRelevance({
            capabilitySurface: { showTransitionTimeline: true },
            document: { motion: { clips: {} } },
            selectedNode: null,
            activeTool: 'keyframe',
        }),
        false,
    );
});

test('helper counts only clips for the selected node', () => {
    assert.equal(
        getSelectedNodeMotionClipCount({
            document: {
                motion: {
                    clips: {
                        clipA: { target: 'frame-1' },
                        clipB: { target: 'frame-1' },
                        clipC: { target: 'frame-2' },
                    },
                },
            },
            nodeId: 'frame-1',
        }),
        2,
    );
});

test('time-authoring tool recognition is explicit', () => {
    assert.equal(isTimeAuthoringTool('keyframe'), true);
    assert.equal(isTimeAuthoringTool('overlay'), true);
    assert.equal(isTimeAuthoringTool('frame'), false);
});
