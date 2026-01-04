export function findActiveClips(timeline, time) {
    const active = [];

    timeline.tracks.forEach((track) => {
        if (track.muted) return;

        track.clips.forEach((clip) => {
            if (time >= clip.start && time <= clip.end) {
                active.push({ track, clip });
            }
        });
    });

    return active;
}
