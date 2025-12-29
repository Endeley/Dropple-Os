export function createLamportClock() {
    let time = 0;

    return {
        tick(remoteTime = 0) {
            time = Math.max(time, remoteTime) + 1;
            return time;
        },
        now() {
            return time;
        },
    };
}
