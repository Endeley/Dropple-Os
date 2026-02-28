import { compileTemplateV1 } from '../templates/templateCompilerV1.js';
import { installTemplateSeed } from '../templates/installTemplateSeed.js';
import { replayTimeline } from '../replay/replayTimeline.js';
import { buildEvaluationFingerprint } from '../replay/buildEvaluationFingerprint.js';
import { runExportStabilityGate } from '../export/exportStabilityGate.js';
import { hashTimeline } from '../../domain/timeline/TimelineContract.js';
import { createTimelineController } from '../timeline/timelineController.js';
import { TrackActions } from '../timeline/trackDispatcher.js';
import { computeCapabilityIndex } from '../observability/capabilityIndex.js';

const template = {
    metadata: {
        id: 'template.cert.v1',
        version: '1.0.0',
        name: 'Cert Seed',
        engine: 'dropple-motion@1.x',
        author: 'Dropple',
        license: 'dropple-marketplace-standard',
        createdAt: '2026-02-01',
        description: 'Certification fixture',
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

const compiled = compileTemplateV1(template);
const seed = compiled.seed;

const baseInstall = installTemplateSeed(seed);
const controller0 = baseInstall.controller;

const events = [
    { type: TrackActions.ADD_TRACK, payload: { id: 't2', type: 'standard' } },
    { type: TrackActions.ASSIGN_CHANNEL, payload: { trackId: 't2', channelId: 'opacity' } },
];

const controller1 = replayTimeline({ controller: controller0, events });
const hashA = buildEvaluationFingerprint(controller1, 500);

const exportSpec = {
    timeline: controller1.snapshotGraph.nodes[controller1.headId].timeline,
    sceneGraph: controller1.sceneGraph,
};

const controller2 = {
    ...createTimelineController(exportSpec.timeline),
    sceneGraph: exportSpec.sceneGraph,
};

const controller3 = replayTimeline({ controller: controller2, events });
const hashB = buildEvaluationFingerprint(controller3, 500);

console.log('REPLAY HASH MATCH:', hashA === hashB);
console.log(
    'STRUCTURAL HASH MATCH:',
    hashTimeline(controller1.snapshotGraph.nodes[controller1.headId].timeline) ===
        controller1.headId
);

const exportGate = runExportStabilityGate({
    timeline: controller1.snapshotGraph.nodes[controller1.headId].timeline,
    shotTimeline: {
        shots: [
            {
                id: 'cert-shot',
                startMs: 0,
                endMs: controller1.snapshotGraph.nodes[controller1.headId].timeline.duration ?? 0,
                timeline: controller1.snapshotGraph.nodes[controller1.headId].timeline,
            },
        ],
    },
    sceneGraph: controller1.sceneGraph,
});
console.log('EXPORT GATE AFTER REPLAY:', exportGate.allowed === true);

const capA = computeCapabilityIndex(controller1);
const capB = computeCapabilityIndex(controller3);
console.log('CAPABILITY PROFILE MATCH:', JSON.stringify(capA) === JSON.stringify(capB));
