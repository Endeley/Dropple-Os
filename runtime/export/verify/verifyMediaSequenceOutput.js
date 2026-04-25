import { evaluateExportedMediaAt } from './evaluateExportedMediaAt.js';

function clipSignature(entry) {
    return {
        clipId: entry?.clip?.id ?? null,
        trackId: entry?.trackId ?? null,
        trackType: entry?.trackType ?? null,
        assetId: entry?.clip?.assetId ?? null,
        assetType: entry?.asset?.type ?? entry?.clip?.assetType ?? null,
        assetUrl: entry?.asset?.url ?? null,
        gainDb: Number(entry?.clip?.gainDb ?? 0),
        muted: entry?.clip?.muted === true,
        start: Number(entry?.clip?.start ?? 0),
        end: Number(entry?.clip?.end ?? 0),
    };
}

function sortSignatures(entries) {
    return [...entries]
        .map(clipSignature)
        .sort((left, right) => {
            const trackDelta = String(left.trackId ?? '').localeCompare(String(right.trackId ?? ''));
            if (trackDelta !== 0) return trackDelta;

            const clipDelta = String(left.clipId ?? '').localeCompare(String(right.clipId ?? ''));
            if (clipDelta !== 0) return clipDelta;

            return String(left.assetId ?? '').localeCompare(String(right.assetId ?? ''));
        });
}

function compareSignatures(previewEntries, exportedEntries, label, timeMs, errors) {
    const preview = sortSignatures(previewEntries);
    const exported = sortSignatures(exportedEntries);

    if (preview.length !== exported.length) {
        errors.push(
            `[media:${label}] active clip count mismatch at ${timeMs}ms: preview=${preview.length}, export=${exported.length}`,
        );
        return;
    }

    for (let index = 0; index < preview.length; index += 1) {
        const previewEntry = JSON.stringify(preview[index]);
        const exportedEntry = JSON.stringify(exported[index]);

        if (previewEntry !== exportedEntry) {
            errors.push(
                `[media:${label}] clip mismatch at ${timeMs}ms: preview=${previewEntry}, export=${exportedEntry}`,
            );
        }
    }
}

export function verifyMediaSequenceOutput({
    mediaExport,
    previewAtTime,
    sampleTimes,
    sequenceId = null,
}) {
    if (!mediaExport) {
        throw new Error('verifyMediaSequenceOutput: mediaExport is required');
    }
    if (typeof previewAtTime !== 'function') {
        throw new Error('verifyMediaSequenceOutput: previewAtTime is required');
    }
    if (!Array.isArray(sampleTimes)) {
        throw new Error('verifyMediaSequenceOutput: sampleTimes must be an array');
    }

    const errors = [];

    for (const timeMs of sampleTimes) {
        const preview = previewAtTime(timeMs);
        const exported = evaluateExportedMediaAt({
            mediaExport,
            sequenceId,
            timeMs,
        });

        if ((preview?.sequenceId ?? null) !== (exported?.sequenceId ?? null)) {
            errors.push(
                `[media] sequence mismatch at ${timeMs}ms: preview=${preview?.sequenceId ?? null}, export=${exported?.sequenceId ?? null}`,
            );
        }

        compareSignatures(preview?.activeClips ?? [], exported?.activeClips ?? [], 'clips', timeMs, errors);
        compareSignatures(
            preview?.activeAudioClips ?? [],
            exported?.activeAudioClips ?? [],
            'audio',
            timeMs,
            errors,
        );
        compareSignatures(
            preview?.activeVideoClips ?? [],
            exported?.activeVideoClips ?? [],
            'video',
            timeMs,
            errors,
        );

        const previewCamera = preview?.activeCamera?.cameraNodeRef ?? null;
        const exportedCamera = exported?.activeCamera?.cameraNodeRef ?? null;
        if (previewCamera !== exportedCamera) {
            errors.push(
                `[media:camera] active camera mismatch at ${timeMs}ms: preview=${previewCamera}, export=${exportedCamera}`,
            );
        }
    }

    return {
        ok: errors.length === 0,
        errors,
    };
}
