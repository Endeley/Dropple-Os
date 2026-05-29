function clampNumber(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
}

function snapFrame(value, gridSize = 1) {
    const safeGrid = Number.isFinite(gridSize) && gridSize > 0 ? gridSize : 1;
    return Math.round(value / safeGrid) * safeGrid;
}

function isTextInputTarget(target) {
    if (!target || typeof target !== 'object') return false;
    if (target.isContentEditable === true) return true;
    const tagName = typeof target.tagName === 'string' ? target.tagName.toLowerCase() : '';
    return tagName === 'input' || tagName === 'textarea' || tagName === 'select';
}

export function resolveSequenceClipKeyboardIntent({
    event,
    selectedClip,
    currentFrame = null,
    gridSize = 1,
} = {}) {
    if (!event || !selectedClip) return null;
    if (isTextInputTarget(event.target)) return null;
    const key = event.key;
    if (event.altKey === true && key === 'Enter') {
        const start = Number(selectedClip.start ?? 0);
        const end = Number(selectedClip.end ?? 0);
        const rawFrame = Number.isFinite(Number(currentFrame)) ? Number(currentFrame) : start;
        const splitAt = Math.max(start + 1, Math.min(end - 1, Math.round(rawFrame)));
        if (!Number.isFinite(splitAt) || splitAt <= start || splitAt >= end) return null;
        return { kind: 'split', patch: { splitAt } };
    }

    if (key !== 'ArrowLeft' && key !== 'ArrowRight') return null;
    if (event.repeat === true) return null;

    const step = event.shiftKey === true ? 10 : 1;
    const direction = key === 'ArrowLeft' ? -1 : 1;
    const delta = direction * step;
    const start = Number(selectedClip.start ?? 0);
    const end = Number(selectedClip.end ?? 0);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return null;

    if (event.altKey === true) {
        const nextEnd = snapFrame(Math.max(start, end + delta), gridSize);
        return { kind: 'trim', patch: { end: nextEnd } };
    }

    if (event.metaKey === true || event.ctrlKey === true) {
        const nextStart = snapFrame(clampNumber(start + delta, 0, end), gridSize);
        return { kind: 'trim', patch: { start: nextStart } };
    }

    const width = Math.max(0, end - start);
    const nextStart = snapFrame(Math.max(0, start + delta), gridSize);
    const nextEnd = snapFrame(nextStart + width, gridSize);
    return { kind: 'move', patch: { start: nextStart, end: nextEnd } };
}
