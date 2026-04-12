export const PRIMARY_SHOT_TRACK_ID = 'primary';

function safeNumber(value, fallback = 0) {
    return Number.isFinite(value) ? Number(value) : fallback;
}

export function sortShots(shots = []) {
    return shots
        .slice()
        .sort((left, right) => {
            const startDelta = safeNumber(left?.start) - safeNumber(right?.start);
            if (startDelta !== 0) return startDelta;
            return String(left?.id ?? '').localeCompare(String(right?.id ?? ''));
        });
}

export function sortShotTracks(tracks = []) {
    return tracks
        .slice()
        .sort((left, right) => {
            const orderDelta = safeNumber(left?.order) - safeNumber(right?.order);
            if (orderDelta !== 0) return orderDelta;
            return String(left?.id ?? '').localeCompare(String(right?.id ?? ''));
        });
}

function normalizeTrack(track, index = 0) {
    if (!track?.id) return null;
    return {
        id: track.id,
        name: track.name ?? '',
        order: safeNumber(track.order, index),
        kind: track.kind ?? 'shot',
        shots: sortShots(Array.isArray(track.shots) ? track.shots : []),
    };
}

export function getSceneShotTracks(scene) {
    if (!scene || typeof scene !== 'object') return [];

    if (Array.isArray(scene.shotTracks) && scene.shotTracks.length > 0) {
        return sortShotTracks(
            scene.shotTracks
                .map((track, index) => normalizeTrack(track, index))
                .filter(Boolean),
        );
    }

    const legacyShots = Array.isArray(scene.shots) ? scene.shots : [];
    return [
        {
            id: PRIMARY_SHOT_TRACK_ID,
            name: 'Primary',
            order: 0,
            kind: 'shot',
            shots: sortShots(legacyShots),
        },
    ];
}

export function getCanonicalShotTrack(scene) {
    const tracks = getSceneShotTracks(scene);
    return tracks.find((track) => track?.kind === 'shot') ?? tracks[0] ?? null;
}

export function getSceneShots(scene) {
    return getCanonicalShotTrack(scene)?.shots ?? [];
}

export function findSceneShot(scene, shotId) {
    if (!scene || !shotId) return null;

    for (const track of getSceneShotTracks(scene)) {
        const shot = track?.shots?.find((entry) => entry?.id === shotId) ?? null;
        if (shot) {
            return {
                shot,
                track,
                trackId: track.id,
            };
        }
    }

    return null;
}

export function normalizeSceneShotTracks(scene) {
    if (!scene || typeof scene !== 'object') return scene;

    const shotTracks = getSceneShotTracks(scene);
    return {
        ...scene,
        shotTracks,
        shots: getCanonicalShotTrack({ ...scene, shotTracks })?.shots ?? [],
    };
}
