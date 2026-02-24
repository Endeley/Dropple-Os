export const createClock = () => ({
    time: 0,
    delta: 0,
    playing: false,
    speed: 1,
    lastTick: null,
});

export const clock = createClock();
