import { compileTemplateV1 } from './templateCompilerV1.js';
import { hashTimeline } from '../../domain/timeline/TimelineContract.js';
import { createTimelineController } from '../timeline/timelineController.js';
import { evaluateChannelTimeline } from '../timeline/evaluateTimeline.js';

const baseTemplate = {
    metadata: {
        id: 'template.hero.v1',
        version: '1.0.0',
        name: 'Hero',
        engine: 'dropple-motion@1.x',
        author: 'Dropple',
        license: 'dropple-marketplace-standard',
        createdAt: '2026-02-01',
        description: 'Template fixture',
    },
    structure: {
        root: 'scene',
        nodes: [
            { id: 'scene', type: 'Scene' },
            { id: 'hero', type: 'Container' },
            { id: 'title', type: 'Text' },
        ],
        tree: {
            scene: ['hero'],
            hero: ['title'],
        },
        layout: {
            hero: 'stack.vertical.center',
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

function clone(value) {
    if (typeof structuredClone === 'function') return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
}

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

const original = clone(baseTemplate);
const before = JSON.stringify(baseTemplate);
const compiledA = compileTemplateV1(baseTemplate);
const after = JSON.stringify(baseTemplate);

console.log('DSL IMMUTABLE:', before === after);

const compiledB = compileTemplateV1(clone(original));
console.log('SNAPSHOT HASH DETERMINISTIC:', compiledA.seed.snapshotHash === compiledB.seed.snapshotHash);
console.log('CONTENT HASH DETERMINISTIC:', compiledA.seed.contentHash === compiledB.seed.contentHash);
console.log(
    'LINEAGE ROOT DETERMINISTIC:',
    compiledA.seed.lineage.rootId === compiledB.seed.lineage.rootId
);
console.log(
    'CAPABILITY PROFILE DETERMINISTIC:',
    JSON.stringify(compiledA.capabilityProfile) === JSON.stringify(compiledB.capabilityProfile)
);
console.log(
    'HASH MATCHES TIMELINE:',
    compiledA.seed.snapshotHash === hashTimeline(compiledA.seed.states[compiledA.seed.defaultState])
);

const motionChanged = clone(original);
motionChanged.motion.timelines.intro.tracks[0].keyframes[1].v = 0.5;
const compiledMotionChanged = compileTemplateV1(motionChanged);
console.log(
    'MOTION CHANGES HASH:',
    compiledA.seed.snapshotHash !== compiledMotionChanged.seed.snapshotHash
);

const metadataChanged = clone(original);
metadataChanged.metadata.name = 'Hero Variant';
const compiledMetadataChanged = compileTemplateV1(metadataChanged);
console.log(
    'METADATA DOES NOT CHANGE HASH:',
    compiledA.seed.snapshotHash === compiledMetadataChanged.seed.snapshotHash
);
console.log(
    'METADATA DOES NOT CHANGE CONTENT HASH:',
    compiledA.seed.contentHash === compiledMetadataChanged.seed.contentHash
);

const controller = createTimelineController(
    compiledA.seed.states[compiledA.seed.defaultState]
);
const timelineFromHistory =
    controller.snapshotGraph.nodes[controller.headId]?.timeline ??
    compiledA.seed.states[compiledA.seed.defaultState];
const evalA = evaluateCanonicalTimeline(
    compiledA.seed.states[compiledA.seed.defaultState],
    500
);
const evalB = evaluateCanonicalTimeline(timelineFromHistory, 500);
console.log('SNAPSHOT DAG EVAL MATCH:', JSON.stringify(evalA) === JSON.stringify(evalB));
