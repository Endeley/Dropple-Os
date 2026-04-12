import { getSceneShotTracks } from '@/core/scene/shotTracks.js';

function safeNumber(value, fallback = 0) {
    return Number.isFinite(value) ? Number(value) : fallback;
}

function resolveShotStartMs(shot) {
    if (!shot || typeof shot !== 'object') return 0;
    if (Number.isFinite(shot.startMs)) return Number(shot.startMs);
    return safeNumber(shot.start);
}

function resolveShotEndMs(shot) {
    if (!shot || typeof shot !== 'object') return 0;
    if (Number.isFinite(shot.endMs)) return Number(shot.endMs);
    return resolveShotStartMs(shot) + safeNumber(shot.duration);
}

function compareShots(left, right) {
    const startDelta = resolveShotStartMs(left) - resolveShotStartMs(right);
    if (startDelta !== 0) return startDelta;
    return String(left?.id ?? '').localeCompare(String(right?.id ?? ''));
}

export function selectShotTimelineView(state) {
    const sceneGraph = state?.sceneGraph ?? null;
    const runtimeScene = state?.runtimeScene ?? null;
    const activeSceneId = runtimeScene?.activeSceneId ?? null;
    const activeShotId = runtimeScene?.activeShotId ?? null;

    if (!sceneGraph || !activeSceneId) return null;

    const activeScene = sceneGraph.scenes?.find((scene) => scene?.id === activeSceneId) ?? null;
    const rawTracks = getSceneShotTracks(activeScene);
    if (!rawTracks.length) return null;

    const tracks = rawTracks.map((track) => {
        const shots = track.shots
            .slice()
            .sort(compareShots)
            .map((shot, index, items) => {
                const startMs = resolveShotStartMs(shot);
                const endMs = resolveShotEndMs(shot);
                const nextShot = items[index + 1] ?? null;
                const nextStartMs = nextShot ? resolveShotStartMs(nextShot) : null;

                return {
                    ...shot,
                    trackId: track.id,
                    startMs,
                    endMs,
                    durationMs: Math.max(0, endMs - startMs),
                    isActive: shot?.id === activeShotId,
                    hasAdjacentNextShot: nextShot ? endMs === nextStartMs : false,
                };
            });

        return {
            id: track.id,
            name: track.name ?? '',
            order: safeNumber(track.order),
            kind: track.kind ?? 'shot',
            shots,
        };
    });
    if (!tracks.some((track) => track.shots.length > 0)) return null;

    const totalDuration = Number.isFinite(activeScene?.duration)
        ? Math.max(1, Number(activeScene.duration))
        : Math.max(
              1,
              tracks.reduce(
                  (max, track) =>
                      Math.max(
                          max,
                          track.shots.reduce((trackMax, shot) => Math.max(trackMax, shot.endMs), 0),
                      ),
                  0,
              ),
          );

    return {
        activeSceneId,
        activeShotId,
        totalDuration,
        tracks,
        shots: tracks[0]?.shots ?? [],
    };
}

export function selectShotInspectorView(state) {
    const timelineView = selectShotTimelineView(state);
    if (!timelineView) return null;

    const activeTrack =
        timelineView.tracks.find((track) =>
            track.shots.some((shot) => shot?.id === timelineView.activeShotId),
        ) ??
        timelineView.tracks[0] ??
        null;
    if (!activeTrack) return null;

    const activeShot =
        activeTrack.shots.find((shot) => shot?.id === timelineView.activeShotId) ?? null;
    const activeShotIndex = activeShot
        ? activeTrack.shots.findIndex((shot) => shot?.id === activeShot.id)
        : -1;
    const nextShot = activeShotIndex >= 0 ? activeTrack.shots[activeShotIndex + 1] ?? null : null;

    return {
        activeSceneId: timelineView.activeSceneId,
        activeShotId: timelineView.activeShotId,
        activeTrackId: activeTrack.id,
        track: {
            ...activeTrack,
            shotCount: activeTrack.shots.length,
        },
        shot: activeShot,
        nextShot,
        canEditCrossfade: Boolean(activeShot?.hasAdjacentNextShot && nextShot),
    };
}
