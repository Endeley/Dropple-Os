// timeline/playback/useTimelinePlayback.js

import { useRef, useCallback } from 'react';

/**
 * Timeline playback controller (In/Out aware).
 *
 * 🔒 Rules:
 * - Runtime-only
 * - No persistence
 * - No reducer access
 */
export function useTimelinePlayback({
    duration,
    initialTime = 0,
    initialSpeed = 1,
    loop = false,
    inPoint = null,
    outPoint = null,
    onTimeUpdate,
}) {
    if (typeof duration !== 'number') {
        throw new Error('useTimelinePlayback: duration is required');
    }
    if (typeof onTimeUpdate !== 'function') {
        throw new Error('useTimelinePlayback: onTimeUpdate callback is required');
    }

    const rafRef = useRef(null);
    const lastTsRef = useRef(null);
    const playingRef = useRef(false);

    const stateRef = useRef({
        time: initialTime,
        speed: initialSpeed,
        loop,
        inPoint,
        outPoint,
    });

    const getRange = () => {
        const start = typeof stateRef.current.inPoint === 'number' ? stateRef.current.inPoint : 0;

        const end = typeof stateRef.current.outPoint === 'number' ? stateRef.current.outPoint : duration;

        return { start, end };
    };

    const tick = useCallback(
        (ts) => {
            if (!playingRef.current) return;

            if (lastTsRef.current == null) {
                lastTsRef.current = ts;
            }

            const dtMs = (ts - lastTsRef.current) * stateRef.current.speed;
            lastTsRef.current = ts;

            const { start, end } = getRange();

            let nextTime = stateRef.current.time + dtMs;

            if (nextTime >= end) {
                if (stateRef.current.loop) {
                    nextTime = start + (nextTime - end);
                } else {
                    nextTime = end;
                    playingRef.current = false;
                }
            }

            if (nextTime < start) {
                nextTime = start;
            }

            stateRef.current.time = nextTime;
            onTimeUpdate(nextTime);

            if (playingRef.current) {
                rafRef.current = requestAnimationFrame(tick);
            }
        },
        [duration, onTimeUpdate]
    );

    const play = useCallback(() => {
        if (playingRef.current) return;

        const { start } = getRange();
        if (stateRef.current.time < start) {
            stateRef.current.time = start;
            onTimeUpdate(start);
        }

        playingRef.current = true;
        lastTsRef.current = null;
        rafRef.current = requestAnimationFrame(tick);
    }, [tick, onTimeUpdate]);

    const pause = useCallback(() => {
        playingRef.current = false;
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        lastTsRef.current = null;
    }, []);

    const seek = useCallback(
        (time) => {
            const { start, end } = getRange();
            const clamped = Math.max(start, Math.min(end, time));
            stateRef.current.time = clamped;
            onTimeUpdate(clamped);
        },
        [onTimeUpdate]
    );

    const setSpeed = useCallback((speed) => {
        stateRef.current.speed = speed;
    }, []);

    const setLoop = useCallback((loop) => {
        stateRef.current.loop = loop;
    }, []);

    const setInOut = useCallback(({ inPoint, outPoint }) => {
        stateRef.current.inPoint = inPoint;
        stateRef.current.outPoint = outPoint;
    }, []);

    const getState = () => ({
        time: stateRef.current.time,
        speed: stateRef.current.speed,
        loop: stateRef.current.loop,
        inPoint: stateRef.current.inPoint,
        outPoint: stateRef.current.outPoint,
        playing: playingRef.current,
    });

    return {
        play,
        pause,
        seek,
        setSpeed,
        setLoop,
        setInOut,
        getState,
    };
}
