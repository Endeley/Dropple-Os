import crypto from 'crypto';
import { installTemplateSeed } from './installTemplateSeed.js';
import { replayTimeline } from '../replay/replayTimeline.js';
import { buildEvaluationFingerprint } from '../replay/buildEvaluationFingerprint.js';
import { computeCapabilityIndex } from '../observability/capabilityIndex.js';
import { runExportStabilityGate } from '../export/exportStabilityGate.js';

function stableSerialize(value) {
    if (Array.isArray(value)) {
        return value.map(stableSerialize);
    }
    if (value && typeof value === 'object') {
        const keys = Object.keys(value).sort();
        const result = {};
        for (const key of keys) {
            result[key] = stableSerialize(value[key]);
        }
        return result;
    }
    return value;
}

function hashObject(value) {
    const serialized = JSON.stringify(stableSerialize(value));
    return crypto.createHash('sha256').update(serialized).digest('hex');
}

export function certifyTemplateSeed(seed) {
    const certifiedAt = `derived:${seed.snapshotHash.slice(0, 12)}`;
    const engineVersion = seed?.metadata?.engine ?? 'dropple-motion@1.x';

    let certified = false;
    let fingerprint = '';
    let capabilityHash = '';

    try {
        const { controller } = installTemplateSeed(seed);
        fingerprint = buildEvaluationFingerprint(controller, 500);

        const replayed = replayTimeline({ controller, events: [] });
        const fingerprintAfter = buildEvaluationFingerprint(replayed, 500);

        const capBefore = seed.capabilityProfile ?? computeCapabilityIndex(controller);
        const capAfter = computeCapabilityIndex(replayed);

        const capHashBefore = hashObject(capBefore);
        const capHashAfter = hashObject(capAfter);

        capabilityHash = capHashBefore;

        const timeline = controller.snapshotGraph.nodes[controller.headId].timeline;
        const exportGate = runExportStabilityGate({
            timeline,
            shotTimeline: {
                shots: [
                    {
                        id: 'cert-shot',
                        startMs: 0,
                        endMs: timeline.duration ?? 0,
                        timeline,
                    },
                ],
            },
            sceneGraph: controller.sceneGraph,
        });

        certified =
            fingerprint === fingerprintAfter &&
            capHashBefore === capHashAfter &&
            exportGate.allowed === true;
    } catch (err) {
        certified = false;
    }

    const certification = {
        certified,
        fingerprint,
        snapshotHash: seed.snapshotHash,
        capabilityHash,
        engineVersion,
        certifiedAt,
    };

    return {
        ...seed,
        certification,
    };
}
