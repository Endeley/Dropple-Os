function stableStringify(value) {
    if (value === undefined || value === null) return 'null';

    if (Array.isArray(value)) {
        return `[${value.map(stableStringify).join(',')}]`;
    }

    if (typeof value === 'object') {
        return `{${Object.keys(value)
            .sort()
            .map((key) => `"${key}":${stableStringify(value[key])}`)
            .join(',')}}`;
    }

    return JSON.stringify(value);
}

function hashString64(input) {
    let hash = 0xcbf29ce484222325n;
    const prime = 0x100000001b3n;

    for (let index = 0; index < input.length; index += 1) {
        hash ^= BigInt(input.charCodeAt(index));
        hash = (hash * prime) & 0xffffffffffffffffn;
    }

    return hash.toString(16).padStart(16, '0');
}

function normalizeClip(clip) {
    const keyframes = Array.isArray(clip?.keyframes)
        ? clip.keyframes
              .map((keyframe) => ({
                  t: Number(keyframe?.t ?? 0),
                  v: keyframe?.v ?? null,
                  easing: keyframe?.easing ?? 'linear',
              }))
              .sort((left, right) => left.t - right.t)
        : [];

    return {
        id: clip?.id ?? null,
        target: clip?.target ?? null,
        property: clip?.property ?? null,
        keyframes,
    };
}

export function normalizeMotionExportInput(motion) {
    const clips = Object.values(motion?.clips ?? {})
        .map(normalizeClip)
        .sort((left, right) => {
            const leftKey = `${left.id ?? ''}:${left.target ?? ''}:${left.property ?? ''}`;
            const rightKey = `${right.id ?? ''}:${right.target ?? ''}:${right.property ?? ''}`;
            return leftKey.localeCompare(rightKey);
        });

    return Object.freeze({
        clipCount: clips.length,
        targetCount: new Set(clips.map((clip) => clip.target).filter(Boolean)).size,
        clips: Object.freeze(clips),
    });
}

export function materializeCanonicalMotion(normalizedMotion) {
    const clips = {};

    for (const clip of normalizedMotion?.clips ?? []) {
        const clipId = clip.id ?? `clip-${Object.keys(clips).length}`;
        clips[clipId] = {
            id: clip.id,
            target: clip.target,
            property: clip.property,
            keyframes: clip.keyframes.map((keyframe) => ({
                t: keyframe.t,
                v: keyframe.v,
                easing: keyframe.easing,
            })),
        };
    }

    return Object.freeze({
        clips: Object.freeze(clips),
    });
}

export function createMotionExportManifest({
    state,
    format = 'web-animation',
} = {}) {
    const motion = state?.document?.motion ?? null;
    const normalizedMotion = normalizeMotionExportInput(motion);
    const payload = {
        exportFamily: 'motion',
        format,
        motion: normalizedMotion,
    };

    return Object.freeze({
        manifestId: `motion-export:${hashString64(stableStringify(payload))}`,
        exportFamily: 'motion',
        format,
        clipCount: normalizedMotion.clipCount,
        targetCount: normalizedMotion.targetCount,
        motion: normalizedMotion,
    });
}
