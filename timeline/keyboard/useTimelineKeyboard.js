// timeline/keyboard/useTimelineKeyboard.js

import { useEffect } from 'react';

/**
 * Timeline keyboard controls.
 *
 * 🔒 Rules:
 * - UI/runtime only
 * - No reducers
 * - No persistence
 * - Safe with text inputs
 */
export function useTimelineKeyboard({ playback, previewAtTime, duration, nudgeSmallMs = 10, nudgeLargeMs = 50 }) {
    if (!playback) {
        throw new Error('useTimelineKeyboard: playback controller is required');
    }
    if (typeof previewAtTime !== 'function') {
        throw new Error('useTimelineKeyboard: previewAtTime is required');
    }

    useEffect(() => {
        function onKeyDown(e) {
            // Ignore typing in inputs / textareas / contenteditable
            const target = e.target;
            if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
                return;
            }

            // Spacebar → Play / Pause
            if (e.code === 'Space') {
                e.preventDefault();
                const state = playback.getState();
                if (state.playing) {
                    playback.pause();
                } else {
                    playback.play();
                }
                return;
            }

            // Arrow keys → Nudge time
            if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
                e.preventDefault();

                const dir = e.code === 'ArrowRight' ? 1 : -1;
                const step = e.shiftKey ? nudgeLargeMs : nudgeSmallMs;

                const state = playback.getState();
                let nextTime = state.time + dir * step;

                if (nextTime < 0) nextTime = 0;
                if (nextTime > duration) nextTime = duration;

                playback.pause(); // nudging stops playback
                playback.seek(nextTime);
                previewAtTime(nextTime);
            }
        }

        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [playback, previewAtTime, duration, nudgeSmallMs, nudgeLargeMs]);
}
