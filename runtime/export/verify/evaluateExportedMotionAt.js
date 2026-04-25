const EPSILON = 0.001;

function safeNumber(value, fallback = 0) {
    return Number.isFinite(value) ? Number(value) : fallback;
}

function clamp01(value) {
    if (value <= 0) return 0;
    if (value >= 1) return 1;
    return value;
}

function nearlyEqual(a, b, eps = EPSILON) {
    if (typeof a !== 'number' || typeof b !== 'number') return false;
    return Math.abs(a - b) <= eps;
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function interpolateFrames(frames, timeMs, durationMs) {
    if (!Array.isArray(frames) || frames.length === 0) {
        return null;
    }

    const totalDuration = Math.max(0, safeNumber(durationMs));
    const ordered = frames
        .map((frame) => ({
            offset: clamp01(safeNumber(frame?.offset ?? frame?.t)),
            value: safeNumber(frame?.value ?? frame?.v),
        }))
        .sort((left, right) => left.offset - right.offset);

    if (ordered.length === 1 || totalDuration === 0) {
        return ordered[ordered.length - 1]?.value ?? null;
    }

    const t = clamp01(timeMs / totalDuration);
    let previous = ordered[0];
    let next = ordered[ordered.length - 1];

    for (let index = 0; index < ordered.length - 1; index += 1) {
        if (t >= ordered[index].offset && t <= ordered[index + 1].offset) {
            previous = ordered[index];
            next = ordered[index + 1];
            break;
        }
    }

    const span = next.offset - previous.offset;
    if (nearlyEqual(span, 0)) {
        return next.value;
    }

    return lerp(previous.value, next.value, (t - previous.offset) / span);
}

function assignNodeProperty(nodeMap, nodeId, property, value) {
    if (!nodeId || !property || value == null) return;

    if (!nodeMap[nodeId]) {
        nodeMap[nodeId] = {};
    }

    nodeMap[nodeId][property] = value;
}

function parseWaapiAnimations(waapiOutput) {
    if (!waapiOutput) return [];
    if (typeof waapiOutput === 'string') {
        const parsed = JSON.parse(waapiOutput);
        return Array.isArray(parsed?.animations) ? parsed.animations : [];
    }

    if (Array.isArray(waapiOutput)) return waapiOutput;
    if (Array.isArray(waapiOutput?.animations)) return waapiOutput.animations;
    return [];
}

export function evaluateWaapiExportAt({ waapiOutput, timeMs }) {
    const nodeMap = {};
    const animations = parseWaapiAnimations(waapiOutput);

    for (const animation of animations) {
        const nodeId = animation?.target ?? animation?.nodeId ?? null;
        const property = animation?.property ?? null;
        const value = interpolateFrames(
            animation?.keyframes ?? [],
            timeMs,
            animation?.duration ?? 0
        );

        assignNodeProperty(nodeMap, nodeId, property, value);
    }

    return nodeMap;
}

function parseCssFrameValue(property, rawValue) {
    if (property === 'opacity') {
        return safeNumber(parseFloat(rawValue), null);
    }

    if (property === 'x') {
        const match = /translateX\(\s*([\d.-]+)px\s*\)/.exec(rawValue);
        return match ? parseFloat(match[1]) : null;
    }

    if (property === 'y') {
        const match = /translateY\(\s*([\d.-]+)px\s*\)/.exec(rawValue);
        return match ? parseFloat(match[1]) : null;
    }

    const translateMatch = /translate\(\s*([\d.-]+)px,\s*([\d.-]+)px\s*\)/.exec(rawValue);
    if (translateMatch && property === 'transform.x') {
        return parseFloat(translateMatch[1]);
    }
    if (translateMatch && property === 'transform.y') {
        return parseFloat(translateMatch[2]);
    }

    return null;
}

function parseCssKeyframes(cssText) {
    const keyframesByName = {};
    const keyframeBlockRegex = /@keyframes\s+([^{\s]+)\s*{([\s\S]*?)}/g;
    let blockMatch;

    while ((blockMatch = keyframeBlockRegex.exec(cssText))) {
        const animationName = blockMatch[1];
        const body = blockMatch[2];
        const frames = [];
        const frameRegex = /([\d.]+)%\s*{\s*([a-zA-Z.]+)\s*:\s*([^;]+);\s*}/g;
        let frameMatch;

        while ((frameMatch = frameRegex.exec(body))) {
            frames.push({
                offset: parseFloat(frameMatch[1]) / 100,
                property: frameMatch[2],
                value: parseCssFrameValue(frameMatch[2], frameMatch[3]),
            });
        }

        keyframesByName[animationName] = frames;
    }

    return keyframesByName;
}

function parseCssAssignments(cssText) {
    const assignments = [];
    const assignmentRegex = /#([^{\s]+)\s*{\s*animation:\s*([^\s]+)\s+([\d.]+)ms\s+[^;]+;\s*}/g;
    let match;

    while ((match = assignmentRegex.exec(cssText))) {
        assignments.push({
            nodeId: match[1],
            animationName: match[2],
            durationMs: parseFloat(match[3]),
        });
    }

    return assignments;
}

export function evaluateCssExportAt({ cssText, timeMs }) {
    const nodeMap = {};
    const keyframesByName = parseCssKeyframes(cssText);
    const assignments = parseCssAssignments(cssText);

    for (const assignment of assignments) {
        const frames = keyframesByName[assignment.animationName] ?? [];
        if (!frames.length) continue;

        const property = frames[0]?.property ?? null;
        const normalizedFrames = frames.map((frame) => ({
            offset: frame.offset,
            value: frame.value,
        }));
        const value = interpolateFrames(normalizedFrames, timeMs, assignment.durationMs);

        assignNodeProperty(nodeMap, assignment.nodeId, property, value);
    }

    return nodeMap;
}
