/**
 * Minimal macro recorder.
 * Call start(), feed events to record(evt), stop() to freeze list, then replay via dispatcher.dispatchBatch(events).
 */
export function createMacroRecorder() {
    let active = false;
    let events = [];

    function start() {
        active = true;
        events = [];
    }

    function record(evt) {
        if (!active || !evt?.type) return;
        events.push(evt);
    }

    function stop() {
        active = false;
        return events.slice();
    }

    function isRecording() {
        return active;
    }

    return { start, record, stop, isRecording };
}
