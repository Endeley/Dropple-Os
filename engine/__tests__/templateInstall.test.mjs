import { compileTemplateV1 } from '../templates/templateCompilerV1.js';
import { installTemplateSeed, switchTemplateState } from '../templates/installTemplateSeed.js';
import { evaluateChannelTimeline } from '../timeline/evaluateTimeline.js';
import { runExportStabilityGate } from '../export/exportStabilityGate.js';
import { hashTimeline } from '../../domain/timeline/TimelineContract.js';

const template = {
    metadata: {
        id: 'template.install.v1',
        version: '1.0.0',
        name: 'Install Test',
        engine: 'dropple-motion@1.x',
        author: 'Dropple',
        license: 'dropple-marketplace-standard',
        createdAt: '2026-02-01',
        description: 'Install fixture',
    },
    structure: {
        root: 'scene',
        nodes: [
            { id: 'scene', type: 'Scene' },
            { id: 'title', type: 'Text' },
        ],
        tree: {
            scene: ['title'],
        },
    },
    motion: {
        timelines: {
            intro: {
                duration: 1000,
                tracks: [
                    {
                        target: 'title',
                        property: 'opacity',
                        keyframes: [
                            { t: 0, v: 0 },
                            { t: 600, v: 1 },
                        ],
                    },
                ],
            },
            outro: {
                duration: 800,
                tracks: [
                    {
                        target: 'title',
                        property: 'opacity',
                        keyframes: [
                            { t: 0, v: 1 },
                            { t: 800, v: 0 },
                        ],
                    },
                ],
            },
        },
        triggers: { onLoad: 'intro' },
    },
    params: {
        content: {
            'title.text': { type: 'string', default: 'Hello' },
        },
    },
    runtime: {
        viewport: ['desktop'],
        autoplay: true,
    },
};

function resolveChannelValue(channel, timeMs) {
    if (channel == null) return null;
    if (Number.isFinite(channel)) return channel;
    if (channel && typeof channel === 'object' && Array.isArray(channel.keyframes)) {
        const { keyframes } = channel;
        const first = keyframes[0];
        const last = keyframes[keyframes.length - 1];
        const firstTime = first.time ?? first.t;
        const lastTime = last.time ?? last.t;
        const firstValue = first.value ?? first.v;
        const lastValue = last.value ?? last.v;
        if (timeMs <= firstTime) return firstValue;
        if (timeMs >= lastTime) return lastValue;
        for (let i = 0; i < keyframes.length - 1; i += 1) {
            const k1 = keyframes[i];
            const k2 = keyframes[i + 1];
            const t1 = k1.time ?? k1.t;
            const t2 = k2.time ?? k2.t;
            if (timeMs >= t1 && timeMs <= t2) {
                const span = t2 - t1;
                const ratio = span === 0 ? 0 : (timeMs - t1) / span;
                const v1 = k1.value ?? k1.v;
                const v2 = k2.value ?? k2.v;
                return v1 + ratio * (v2 - v1);
            }
        }
    }
    if (channel && typeof channel === 'object' && 'value' in channel) {
        return channel.value;
    }
    return null;
}

function evaluateCanonicalTimeline(timeline, timeMs) {
    const evaluateChannel = (channelId, time) => {
        const channel = (timeline.channels || []).find((c) => c.id === channelId);
        if (!channel) return undefined;
        return resolveChannelValue(channel, time);
    };
    const blend = (a, b) => (Number.isFinite(a) && Number.isFinite(b) ? a + b : b);
    return evaluateChannelTimeline(timeline, timeMs, evaluateChannel, blend);
}

const compiled = compileTemplateV1(template);
const seed = compiled.seed;

const installed = installTemplateSeed(seed);
const controller = installed.controller;

const nodeKeys = Object.keys(controller.snapshotGraph.nodes);
console.log('SINGLE NODE DAG:', nodeKeys.length === 1);
console.log('ROOT ID MATCH:', controller.headId === seed.snapshotHash);
console.log('ROOT NODE PRESENT:', Boolean(controller.snapshotGraph.nodes[seed.snapshotHash]));

const defaultTimeline = seed.states[seed.defaultState];
const installTimeline = controller.snapshotGraph.nodes[controller.headId].timeline;
const evalA = evaluateCanonicalTimeline(defaultTimeline, 500);
const evalB = evaluateCanonicalTimeline(installTimeline, 500);
console.log('EVAL MATCHES DEFAULT:', JSON.stringify(evalA) === JSON.stringify(evalB));

const switched = switchTemplateState(controller, 'outro');
const switchedHash = switched.headId;
console.log('SWITCH CREATES NEW SNAPSHOT:', switchedHash !== controller.headId);

const switchedBack = switchTemplateState(switched, seed.defaultState);
console.log('SWITCH BACK RETURNS HASH:', switchedBack.headId === seed.snapshotHash);

const exportGate = runExportStabilityGate({
    timeline: installTimeline,
    shotTimeline: {
        shots: [
            {
                id: 'install-shot',
                startMs: 0,
                endMs: installTimeline.duration ?? 0,
                timeline: installTimeline,
            },
        ],
    },
    sceneGraph: controller.sceneGraph,
});
console.log('EXPORT GATE AFTER INSTALL:', exportGate.allowed === true);

const deterministicA = evaluateCanonicalTimeline(installTimeline, 300);
const deterministicB = evaluateCanonicalTimeline(installTimeline, 300);
console.log('DETERMINISM UNAFFECTED:', JSON.stringify(deterministicA) === JSON.stringify(deterministicB));

console.log('HASH CONSISTENT:', hashTimeline(installTimeline) === seed.snapshotHash);
