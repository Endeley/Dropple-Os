'use client';

import { useMemo } from 'react';

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function lerp(start, end, amount) {
    return start + (end - start) * amount;
}

function createPathPoints() {
    return [
        { x: 49.8, y: 111.6 },
        { x: 50.4, y: 101.8 },
        { x: 46.6, y: 92.6 },
        { x: 56.1, y: 82.6 },
        { x: 50.9, y: 71.1 },
        { x: 58.4, y: 58.7 },
        { x: 53.4, y: 47.6 },
        { x: 59.6, y: 36.2 },
        { x: 54.2, y: 25.3 },
        { x: 55.7, y: 16.7 },
        { x: 54.4, y: 10.1 },
        { x: 53.9, y: 5.4 },
        { x: 54.8, y: 1.8 },
        { x: 54.2, y: -1.6 },
    ];
}

function createCurveD(points) {
    if (!points.length) {
        return '';
    }

    let d = `M ${points[0].x} ${points[0].y}`;

    for (let index = 1; index < points.length; index += 1) {
        const previous = points[index - 1];
        const current = points[index];
        const controlY = lerp(previous.y, current.y, 0.5);
        d += ` C ${previous.x} ${controlY}, ${current.x} ${controlY}, ${current.x} ${current.y}`;
    }

    return d;
}

function createRibbonPath(points, widths) {
    const left = [];
    const right = [];

    for (let index = 0; index < points.length; index += 1) {
        const current = points[index];
        const previous = points[Math.max(0, index - 1)];
        const next = points[Math.min(points.length - 1, index + 1)];
        const tangentX = next.x - previous.x;
        const tangentY = next.y - previous.y;
        const length = Math.hypot(tangentX, tangentY) || 1;
        const normalX = -tangentY / length;
        const normalY = tangentX / length;
        const halfWidth = (widths[index] ?? widths[widths.length - 1] ?? 2) / 2;

        left.push({
            x: current.x + normalX * halfWidth,
            y: current.y + normalY * halfWidth,
        });
        right.push({
            x: current.x - normalX * halfWidth,
            y: current.y - normalY * halfWidth,
        });
    }

    let d = `M ${left[0].x} ${left[0].y}`;

    for (let index = 1; index < left.length; index += 1) {
        const previous = left[index - 1];
        const current = left[index];
        const controlY = lerp(previous.y, current.y, 0.5);
        d += ` C ${previous.x} ${controlY}, ${current.x} ${controlY}, ${current.x} ${current.y}`;
    }

    const reversed = [...right].reverse();
    d += ` L ${reversed[0].x} ${reversed[0].y}`;

    for (let index = 1; index < reversed.length; index += 1) {
        const previous = reversed[index - 1];
        const current = reversed[index];
        const controlY = lerp(previous.y, current.y, 0.5);
        d += ` C ${previous.x} ${controlY}, ${current.x} ${controlY}, ${current.x} ${current.y}`;
    }

    d += ' Z';
    return d;
}

function samplePathPoint(points, progress) {
    const clamped = clamp(progress, 0, 1);
    const scaled = clamped * (points.length - 1);
    const index = Math.floor(scaled);
    const nextIndex = Math.min(points.length - 1, index + 1);
    const amount = scaled - index;
    const start = points[index];
    const end = points[nextIndex];

    return {
        x: lerp(start.x, end.x, amount),
        y: lerp(start.y, end.y, amount),
    };
}

function createStars() {
    return [
        [8, 10, 0.18], [14, 6, 0.12], [22, 12, 0.1], [28, 8, 0.16], [34, 5, 0.12],
        [42, 9, 0.14], [49, 6.5, 0.12], [56, 8.5, 0.18], [64, 7, 0.14], [72, 9.4, 0.12],
        [80, 6.4, 0.16], [86, 11, 0.14], [91, 7.8, 0.12], [18, 16, 0.1], [27, 18, 0.08],
        [39, 14, 0.08], [58, 16, 0.1], [67, 14, 0.08], [78, 17, 0.1], [88, 15, 0.08],
    ];
}

function createShrines() {
    return [
        { x: 18, y: 90, scale: 1.2, side: 'left', glow: 0.28 },
        { x: 82, y: 86, scale: 1.28, side: 'right', glow: 0.34 },
        { x: 25, y: 76, scale: 0.9, side: 'left', glow: 0.22 },
        { x: 73, y: 71, scale: 0.84, side: 'right', glow: 0.2 },
        { x: 33, y: 62, scale: 0.66, side: 'left', glow: 0.18 },
        { x: 66, y: 58, scale: 0.62, side: 'right', glow: 0.16 },
    ];
}

function createVegetation() {
    return [
        [13, 94, 1.2], [21, 92, 0.9], [78, 93, 1.1], [86, 90, 0.88],
        [27, 83, 0.76], [73, 81, 0.72], [34, 73, 0.64], [66, 69, 0.6],
        [41, 61, 0.46], [58, 60, 0.42], [47, 48, 0.3], [61, 44, 0.26],
    ];
}

function createTerraces() {
    return [
        { x: 20, y: 94, w: 18, h: 7.6, lift: 2.1, side: 'left', glow: 0.2 },
        { x: 81, y: 90, w: 20, h: 8.6, lift: 2.6, side: 'right', glow: 0.26 },
        { x: 27, y: 79, w: 14, h: 5.6, lift: 1.7, side: 'left', glow: 0.16 },
        { x: 73, y: 74, w: 15.5, h: 6.2, lift: 1.9, side: 'right', glow: 0.18 },
        { x: 35, y: 65, w: 11.2, h: 4.4, lift: 1.35, side: 'left', glow: 0.12 },
        { x: 65, y: 61, w: 10.8, h: 4.1, lift: 1.2, side: 'right', glow: 0.1 },
        { x: 43.5, y: 50.5, w: 8, h: 3.2, lift: 0.9, side: 'left', glow: 0.08 },
        { x: 58.4, y: 47.6, w: 7.8, h: 3, lift: 0.78, side: 'right', glow: 0.08 },
    ];
}

function layerTransform(x = 0, y = 0, scale = 1) {
    return `translate(${x} ${y}) scale(${scale})`;
}

function Silhouette({ d, fill, opacity = 1, blur = undefined }) {
    return <path d={d} fill={fill} opacity={opacity} filter={blur ? `url(#${blur})` : undefined} />;
}

export default function ThreeSpatialRenderer({ sceneModel }) {
    const destinationProgress = sceneModel.destinationProgress ?? 0.62;
    const progressRatio = clamp((sceneModel.journeyProgress ?? 0) / destinationProgress, 0, 1);
    const lookOffsetX = clamp((sceneModel.camera?.lookOffset?.x ?? 0) / 32, -1, 1);
    const lookOffsetY = clamp((sceneModel.camera?.lookOffset?.y ?? 0) / 18, -1, 1);

    const pathPoints = useMemo(() => createPathPoints(), []);
    const pathCurveD = useMemo(() => createCurveD(pathPoints), [pathPoints]);
    const pathShadowD = useMemo(
        () => createRibbonPath(pathPoints, [25.2, 20.4, 16.3, 12.9, 10.2, 8.2, 6.4, 4.8, 3.3, 2.2, 1.24, 0.86, 0.56, 0.32]),
        [pathPoints],
    );
    const pathRibbonD = useMemo(
        () => createRibbonPath(pathPoints, [20.1, 16.7, 13.8, 11.1, 8.95, 7.05, 5.5, 4.05, 2.8, 1.78, 0.98, 0.66, 0.42, 0.24]),
        [pathPoints],
    );
    const pathCoreD = useMemo(
        () => createRibbonPath(pathPoints, [6.4, 5.4, 4.5, 3.62, 2.9, 2.24, 1.7, 1.2, 0.8, 0.5, 0.24, 0.16, 0.1, 0.06]),
        [pathPoints],
    );
    const traveler = samplePathPoint(pathPoints, progressRatio);
    const stars = useMemo(() => createStars(), []);
    const shrines = useMemo(() => createShrines(), []);
    const vegetation = useMemo(() => createVegetation(), []);
    const terraces = useMemo(() => createTerraces(), []);

    const worldLift = lerp(0, 18, progressRatio);
    const farX = lookOffsetX * 0.7;
    const midX = lookOffsetX * 1.6;
    const nearX = lookOffsetX * 2.8;
    const foreX = lookOffsetX * 4.2;
    const verticalDrift = lookOffsetY * 1.1;

    const campusReveal = clamp((progressRatio - 0.54) / 0.2, 0, 1);
    const thresholdReveal = clamp((progressRatio - 0.24) / 0.14, 0, 1);
    const bridgeReveal = clamp((progressRatio - 0.36) / 0.14, 0, 1);
    const departureFade = clamp(1 - (progressRatio - 0.18) / 0.16, 0.05, 1);
    const horizonGlow = 0.42 + campusReveal * 0.7;
    const routePulse = 0.88 + Math.sin(progressRatio * 8.5) * 0.02;
    const nearMistOpacity = 0.08 + progressRatio * 0.06;
    const farMistOpacity = 0.18 + campusReveal * 0.14;
    const groundTravel = lerp(-14, 3, progressRatio);
    const groundScale = lerp(1.22, 1.38, progressRatio);
    const groundTilt = lerp(70, 74, progressRatio);
    const routePerspective = lerp(1, 1.08, progressRatio);

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
                background:
                    'radial-gradient(circle at 50% 16%, rgba(210, 185, 255, 0.34), transparent 24%), linear-gradient(180deg, #121736 0%, #0e1230 38%, #090d22 100%)',
            }}
        >
            <svg
                viewBox='0 0 100 100'
                preserveAspectRatio='xMidYMid slice'
                aria-hidden='true'
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            >
                <defs>
                    <filter id='softBlur'>
                        <feGaussianBlur stdDeviation='1.6' />
                    </filter>
                    <filter id='mistBlur'>
                        <feGaussianBlur stdDeviation='2.8' />
                    </filter>
                    <filter id='deepBlur'>
                        <feGaussianBlur stdDeviation='4.2' />
                    </filter>
                    <linearGradient id='pathGlow' x1='0%' y1='100%' x2='0%' y2='0%'>
                        <stop offset='0%' stopColor='#8b5cf6' stopOpacity='0.98' />
                        <stop offset='52%' stopColor='#b794ff' stopOpacity='0.96' />
                        <stop offset='100%' stopColor='#f4dcff' stopOpacity='0.92' />
                    </linearGradient>
                    <linearGradient id='pathCore' x1='0%' y1='100%' x2='0%' y2='0%'>
                        <stop offset='0%' stopColor='rgba(255,255,255,0.46)' />
                        <stop offset='100%' stopColor='rgba(255,255,255,0.18)' />
                    </linearGradient>
                    <linearGradient id='pathShadow' x1='0%' y1='0%' x2='0%' y2='100%'>
                        <stop offset='0%' stopColor='rgba(46, 29, 84, 0.16)' />
                        <stop offset='100%' stopColor='rgba(20, 12, 42, 0.54)' />
                    </linearGradient>
                </defs>

                <rect width='100' height='100' fill='transparent' />

                <g opacity='0.9'>
                    {stars.map(([cx, cy, r], index) => (
                        <circle key={index} cx={cx} cy={cy} r={r} fill='rgba(240, 220, 255, 0.78)' />
                    ))}
                </g>

                <g transform={layerTransform(0, verticalDrift * 0.18, 1)}>
                    <ellipse cx='53' cy='10.4' rx='28' ry='9.4' fill='rgba(233, 202, 255, 0.2)' filter='url(#deepBlur)' opacity={horizonGlow} />
                    <ellipse cx='53.5' cy='12.6' rx='20' ry='5.2' fill='rgba(255,255,255,0.11)' filter='url(#mistBlur)' opacity={0.68 + campusReveal * 0.22} />
                    <ellipse cx='53' cy='17.6' rx='34' ry='6.3' fill='rgba(168, 140, 255, 0.1)' filter='url(#mistBlur)' opacity={farMistOpacity} />
                    <Silhouette
                        d='M 8 43 C 14 36 22 33 31 34 C 36 29.5 42 27.8 48.8 29 C 52.5 24.5 57.4 22.8 63.5 24.2 C 70 20.2 77.3 19.8 85.5 23 C 90.4 22.8 94.3 24.3 98 27.2 L 98 40 C 91.2 37.6 84.7 36.9 78 37.8 C 69.7 39 62.6 42.2 56.3 47.5 C 50.7 52.2 45.5 55 39.3 55.8 C 29.8 57.1 19.9 54.8 8 49 Z'
                        fill='rgba(34, 38, 86, 0.46)'
                    />
                    <Silhouette
                        d='M 14 39 C 20 32.4 28 30 36 31.6 C 41 27.8 46.4 26.5 52.2 27.1 C 56.7 23.6 62.5 22.4 69.1 23.8 C 76 21.8 82.2 22.6 88.6 26.2 L 88.6 34.8 C 81.4 33 74.6 32.8 67.7 34.1 C 60.4 35.5 54.1 38.6 48.7 43.4 C 43.9 47.6 38.6 49.8 31.7 50.4 C 24.7 51 18.8 48.6 14 44.8 Z'
                        fill='rgba(58, 62, 124, 0.4)'
                        opacity={0.74}
                    />
                    <Silhouette
                        d='M 16 35.4 C 23 30 30 28.2 37 30.2 C 43 26.2 49.3 24.8 56 26.2 C 62.6 23.8 69.8 24 77.2 27.6 C 83.5 26 89 27.1 94 30.8 L 94 38.8 C 85.6 37.6 77.8 38.3 70.1 40.6 C 62.8 42.8 56.4 46.5 50.9 51.3 C 45.4 56.1 39 58.6 31.4 58.7 C 25.2 58.7 20 56.5 16 52.2 Z'
                        fill='rgba(85, 79, 148, 0.28)'
                    />
                    <Silhouette
                        d='M 42 18.6 C 46 16.8 49.2 16.2 52 16.7 C 54.8 15.6 57.7 15.4 60.5 16.1 C 63.3 15.4 66.1 15.6 69.6 17 L 69.6 22.8 L 42 22.8 Z'
                        fill='rgba(96, 92, 164, 0.42)'
                    />
                    <g opacity={0.14 + campusReveal * 0.86}>
                        <ellipse cx='53.2' cy='24.8' rx='12.8' ry='3.6' fill='rgba(231, 206, 255, 0.14)' filter='url(#mistBlur)' />
                        <path d='M 46.8 23.3 L 59.8 23.3 C 60.5 24.8 60.7 26.3 60.2 27.4 L 46.5 27.4 C 46.1 26.3 46.2 24.9 46.8 23.3 Z' fill='rgba(52, 44, 98, 0.9)' />
                        <rect x='50.2' y='18.7' width='5.8' height='4.6' rx='0.34' fill='rgba(76, 64, 132, 0.92)' />
                        <path d='M 49.6 22.8 Q 53.1 15.4 56.6 22.8' fill='rgba(117, 101, 182, 0.96)' />
                        <rect x='47.2' y='19.8' width='1.3' height='3.1' rx='0.18' fill='rgba(74, 62, 124, 0.82)' />
                        <rect x='58.4' y='19.8' width='1.3' height='3.1' rx='0.18' fill='rgba(74, 62, 124, 0.82)' />
                        <rect x='44' y='21.3' width='1' height='2.1' rx='0.14' fill='rgba(69, 58, 118, 0.74)' />
                        <rect x='61.9' y='21.3' width='1' height='2.1' rx='0.14' fill='rgba(69, 58, 118, 0.74)' />
                        <path d='M 52.8 17.2 L 52.8 8.6' stroke='rgba(213, 177, 255, 0.68)' strokeWidth='0.12' />
                        <path d='M 52.8 22.8 L 52.8 2.6' stroke='rgba(224, 198, 255, 0.32)' strokeWidth='0.08' />
                        <circle cx='52.8' cy='8.4' r='0.42' fill='rgba(247, 233, 255, 0.82)' />
                    </g>
                </g>

                <g transform={layerTransform(farX, verticalDrift * 0.28, 1.01)}>
                    <Silhouette
                        d='M -5 100 L -5 53 C 2 52 7 48 10 41 C 13 33 12 24 7 14 C 5 10 5 5 8 -3 L -5 -3 Z'
                        fill='#14193d'
                        opacity='0.96'
                    />
                    <Silhouette
                        d='M 105 100 L 105 53 C 98 52 93 48 90 41 C 87 33 88 24 93 14 C 95 10 95 5 92 -3 L 105 -3 Z'
                        fill='#14193d'
                        opacity='0.96'
                    />
                    <Silhouette
                        d='M 3 83 C 8 77 13 75.8 18 77.8 C 23 72.6 28 71 34 73.6 C 39 69.4 44 68.4 50 70.8 L 50 100 L 3 100 Z'
                        fill='#1a204a'
                        opacity='0.9'
                    />
                    <Silhouette
                        d='M 97 83 C 92 77 87 75.8 82 77.8 C 77 72.6 72 71 66 73.6 C 61 69.4 56 68.4 50 70.8 L 50 100 L 97 100 Z'
                        fill='#1a204a'
                        opacity='0.9'
                    />
                    <Silhouette
                        d='M 10 69 C 15 61.4 22 57.3 30 57.2 C 35.5 51.4 42.4 48.7 50.5 49.1 C 56.5 43.8 64.1 41.8 73.4 43.8 C 80.3 42.4 86 44 91 48.8 L 91 59.8 C 84.6 58 78.2 57.8 71.6 59.3 C 64.2 61 57.9 64.1 52.6 68.7 C 46.7 73.8 40 76.4 31.7 76.5 C 22.5 76.6 15.2 73.7 10 67.4 Z'
                        fill='rgba(78, 76, 142, 0.3)'
                        opacity={0.24 + campusReveal * 0.26}
                    />
                </g>
            </svg>

            <div
                style={{
                    position: 'absolute',
                    left: '-12%',
                    right: '-12%',
                    top: '9%',
                    bottom: '-5%',
                    perspective: '1650px',
                    perspectiveOrigin: '50% 100%',
                    transformStyle: 'preserve-3d',
                    pointerEvents: 'none',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        transformOrigin: '50% 100%',
                        transformStyle: 'preserve-3d',
                        transform: `rotateX(${groundTilt}deg) scale(${groundScale}) translateY(${groundTravel}%)`,
                    }}
                >
                    <svg
                        viewBox='0 0 100 120'
                        preserveAspectRatio='none'
                        aria-hidden='true'
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}
                    >
                        <defs>
                            <filter id='groundSoftBlur'>
                                <feGaussianBlur stdDeviation='1.5' />
                            </filter>
                            <filter id='groundMistBlur'>
                                <feGaussianBlur stdDeviation='3.2' />
                            </filter>
                            <linearGradient id='groundPathGlow' x1='0%' y1='100%' x2='0%' y2='0%'>
                                <stop offset='0%' stopColor='#8b5cf6' stopOpacity='0.98' />
                                <stop offset='52%' stopColor='#b794ff' stopOpacity='0.96' />
                                <stop offset='100%' stopColor='#f4dcff' stopOpacity='0.9' />
                            </linearGradient>
                            <linearGradient id='groundPathCore' x1='0%' y1='100%' x2='0%' y2='0%'>
                                <stop offset='0%' stopColor='rgba(255,255,255,0.42)' />
                                <stop offset='100%' stopColor='rgba(255,255,255,0.14)' />
                            </linearGradient>
                            <linearGradient id='groundPathShadow' x1='0%' y1='0%' x2='0%' y2='100%'>
                                <stop offset='0%' stopColor='rgba(46, 29, 84, 0.2)' />
                                <stop offset='100%' stopColor='rgba(12, 8, 30, 0.66)' />
                            </linearGradient>
                        </defs>

                        <g transform={layerTransform(midX, worldLift * 0.74 + verticalDrift * 0.45, 1.03)}>
                            <Silhouette
                                d='M 0 120 L 0 84 C 8 78.8 16 77.6 24 81 C 30 74.8 37 73.2 45 77 C 50 72.2 55 71.4 61 74.8 L 61 120 Z'
                                fill='#0f1433'
                                opacity='0.98'
                            />
                            <Silhouette
                                d='M 100 120 L 100 84 C 92 78.8 84 77.6 76 81 C 70 74.8 63 73.2 55 77 C 50 72.2 45 71.4 39 74.8 L 39 120 Z'
                                fill='#0f1433'
                                opacity='0.98'
                            />
                            <Silhouette
                                d='M 12 95 C 18 89 24 87.4 30 89 C 36 84.4 42 83.4 49 86 C 54 84 59 84 64 86 C 69 83.8 74 84.4 80 88 L 80 94 C 71 92 62 92.2 53 93.8 C 43 95.4 33 95.8 24 94.8 C 19 94.2 15 94.2 12 96 Z'
                                fill='rgba(34, 42, 92, 0.76)'
                                opacity={0.34 + thresholdReveal * 0.2}
                            />
                        </g>

                        <g transform={layerTransform(foreX, worldLift * 1.08 + verticalDrift * 0.7, 1.08)}>
                            <Silhouette
                                d='M 0 120 L 0 101 C 10 95.6 20 94 30 98 C 38 91 46 89.4 54 92.8 C 57 94 58.2 96.6 57 100 C 53.8 108.4 47.8 115 39.6 120.6 L 0 120.6 Z'
                                fill='rgba(8, 10, 24, 0.96)'
                            />
                            <Silhouette
                                d='M 100 120 L 100 101 C 90 95.6 80 94 70 98 C 62 91 54 89.4 46 92.8 C 43 94 41.8 96.6 43 100 C 46.2 108.4 52.2 115 60.4 120.6 L 100 120.6 Z'
                                fill='rgba(8, 10, 24, 0.96)'
                            />
                        </g>

                        <g transform={layerTransform(0, worldLift * 0.62 + verticalDrift * 0.34, 1)}>
                            <g opacity='0.92'>
                                {terraces.map((terrace, index) => {
                                    const driftX =
                                        terrace.side === 'left'
                                            ? foreX * (index < 2 ? 0.7 : index < 4 ? 0.42 : 0.22)
                                            : -foreX * (index < 2 ? 0.7 : index < 4 ? 0.42 : 0.22);
                                    const terraceScale = index < 2 ? 1.08 : index < 4 ? 0.84 : index < 6 ? 0.68 : 0.52;

                                    return (
                                        <g
                                            key={index}
                                            transform={layerTransform(
                                                driftX,
                                                worldLift * (0.96 - terrace.y / 210) + verticalDrift * 0.18,
                                                terraceScale,
                                            )}
                                        >
                                            <ellipse
                                                cx={terrace.x}
                                                cy={terrace.y + terrace.h * 0.74}
                                                rx={terrace.w * 0.7}
                                                ry={terrace.h * 0.42}
                                                fill='rgba(9, 11, 28, 0.34)'
                                                filter='url(#groundMistBlur)'
                                            />
                                            <ellipse
                                                cx={terrace.x}
                                                cy={terrace.y}
                                                rx={terrace.w}
                                                ry={terrace.h}
                                                fill='rgba(28, 34, 82, 0.92)'
                                            />
                                            <ellipse
                                                cx={terrace.x}
                                                cy={terrace.y - terrace.lift * 0.14}
                                                rx={terrace.w * 0.86}
                                                ry={terrace.h * 0.74}
                                                fill='rgba(43, 50, 106, 0.82)'
                                            />
                                            <ellipse
                                                cx={terrace.x}
                                                cy={terrace.y - terrace.lift * 0.34}
                                                rx={terrace.w * 0.64}
                                                ry={terrace.h * 0.5}
                                                fill='rgba(63, 67, 131, 0.5)'
                                            />
                                            <ellipse
                                                cx={terrace.x}
                                                cy={terrace.y - terrace.lift * 0.46}
                                                rx={terrace.w * 0.28}
                                                ry={terrace.h * 0.18}
                                                fill='rgba(213, 177, 255, 0.12)'
                                                opacity={terrace.glow}
                                            />
                                        </g>
                                    );
                                })}
                            </g>

                            <path
                                d='M 18 110 C 24 101.8 32 97.2 41 96 C 46 91.8 52 90.6 58.8 92.2 C 65.8 88.4 73.2 88.2 81 92.2 L 81 120 L 18 120 Z'
                                fill='rgba(17, 20, 48, 0.58)'
                            />
                            <ellipse cx='50' cy='102.8' rx='23.8' ry='8.9' fill='rgba(194, 158, 255, 0.11)' filter='url(#groundMistBlur)' opacity={0.78 * departureFade} />
                            <ellipse cx='50' cy='92' rx='34' ry='11' fill='rgba(20, 24, 55, 0.16)' filter='url(#groundMistBlur)' opacity={nearMistOpacity} />
                            <ellipse cx='50' cy='64' rx='22' ry='5' fill='rgba(210, 182, 255, 0.08)' filter='url(#groundMistBlur)' opacity={0.12 + thresholdReveal * 0.08} />

                            <path d={pathShadowD} transform='translate(0 3.4)' fill='url(#groundPathShadow)' opacity='0.94' filter='url(#groundMistBlur)' />
                            <path
                                d={pathRibbonD}
                                transform={`translate(0 -0.6) scale(${routePerspective}) translate(${-50 * (routePerspective - 1)} ${-120 * (routePerspective - 1)})`}
                                fill='rgba(190, 157, 255, 0.16)'
                                filter='url(#groundSoftBlur)'
                                opacity={0.54}
                            />
                            <path d={pathRibbonD} fill='url(#groundPathGlow)' opacity={routePulse} />
                            <path d={pathCoreD} fill='url(#groundPathCore)' opacity='0.8' />
                            <path d={pathCurveD} fill='none' stroke='rgba(255,255,255,0.08)' strokeWidth='0.16' strokeLinecap='round' />

                            <g opacity={0.52 + progressRatio * 0.18}>
                                <circle cx='50.7' cy='87.2' r='0.7' fill='none' stroke='rgba(241, 221, 255, 0.56)' strokeWidth='0.12' />
                                <circle cx='57' cy='53.8' r='0.52' fill='none' stroke='rgba(241, 221, 255, 0.42)' strokeWidth='0.1' />
                                <circle cx='54.4' cy='31.7' r='0.36' fill='none' stroke='rgba(241, 221, 255, 0.34)' strokeWidth='0.08' />
                            </g>

                            <g opacity='0.88'>
                                {shrines.map((shrine, index) => (
                                    <g key={index} transform={layerTransform((shrine.side === 'left' ? -1 : 1) * (index < 2 ? foreX * 0.7 : index < 4 ? midX * 0.45 : farX * 0.28), worldLift * (index < 2 ? 0.88 : index < 4 ? 0.6 : 0.32) + verticalDrift * (index < 2 ? 0.62 : index < 4 ? 0.4 : 0.24), shrine.scale)}>
                                        <ellipse cx={shrine.x} cy={shrine.y + 1.4} rx='2.3' ry='0.8' fill='rgba(190, 157, 255, 0.08)' filter='url(#groundMistBlur)' />
                                        <path d={`M ${shrine.x - 0.9} ${shrine.y} Q ${shrine.x} ${shrine.y - 1.4} ${shrine.x + 0.9} ${shrine.y}`} fill='none' stroke='rgba(132, 104, 205, 0.82)' strokeWidth='0.22' strokeLinecap='round' />
                                        <rect x={shrine.x - 0.12} y={shrine.y - 0.9} width='0.24' height='1.05' rx='0.08' fill='rgba(74, 56, 130, 0.92)' />
                                        <circle cx={shrine.x} cy={shrine.y + 0.2} r='0.18' fill='rgba(248, 229, 255, 0.82)' opacity={shrine.glow} />
                                    </g>
                                ))}
                            </g>

                            <g opacity='0.74'>
                                {vegetation.map(([x, y, scale], index) => (
                                    <g key={index} transform={layerTransform(index % 2 === 0 ? foreX * 0.2 : midX * 0.18, worldLift * (0.92 - y / 180) + verticalDrift * 0.22, scale)}>
                                        <path d={`M ${x - 0.34} ${y} Q ${x - 0.1} ${y - 1.1} ${x} ${y - 0.4} Q ${x + 0.16} ${y - 1.2} ${x + 0.42} ${y}`} fill='rgba(105, 88, 174, 0.8)' />
                                        <path d={`M ${x} ${y} L ${x} ${y + 0.5}`} stroke='rgba(73, 57, 126, 0.82)' strokeWidth='0.12' />
                                    </g>
                                ))}
                            </g>

                            <g opacity={departureFade}>
                                <ellipse cx='50' cy='106' rx='18.6' ry='6.8' fill='rgba(184, 150, 255, 0.12)' filter='url(#groundMistBlur)' />
                                <circle cx='50' cy='103.8' r='19.8' fill='none' stroke='rgba(204, 170, 255, 0.16)' strokeWidth='0.2' />
                                <circle cx='50' cy='103.8' r='13.1' fill='none' stroke='rgba(235, 204, 255, 0.2)' strokeWidth='0.18' />
                                <circle cx='50' cy='103.8' r='6.2' fill='none' stroke='rgba(255,255,255,0.18)' strokeWidth='0.14' />
                                <rect x='48.9' y='97.6' width='2.2' height='7.2' rx='0.7' fill='rgba(80, 53, 138, 0.94)' />
                                <path d='M 50 96.2 L 51.2 97.9 L 48.8 97.9 Z' fill='rgba(117, 93, 189, 0.96)' />
                                <circle cx='50' cy='103.8' r='1.02' fill='white' opacity='0.98' />
                            </g>

                            <g opacity={thresholdReveal}>
                                <path d='M 36.2 73.2 C 39 69 42.2 66.8 45.8 66.8 C 47.1 66.8 47.8 68.1 47.2 69.6 C 45.8 73.1 43 76.9 38.8 81 L 31.8 81 C 31.8 78.4 33.2 75.9 36.2 73.2 Z' fill='rgba(11, 15, 37, 0.84)' />
                                <path d='M 63.8 73.2 C 61 69 57.8 66.8 54.2 66.8 C 52.9 66.8 52.2 68.1 52.8 69.6 C 54.2 73.1 57 76.9 61.2 81 L 68.2 81 C 68.2 78.4 66.8 75.9 63.8 73.2 Z' fill='rgba(11, 15, 37, 0.84)' />
                                <circle cx='50.6' cy='64.1' r='1.16' fill='none' stroke='rgba(248, 229, 255, 0.78)' strokeWidth='0.18' />
                                <circle cx='50.6' cy='64.1' r='2' fill='none' stroke='rgba(202, 168, 255, 0.28)' strokeWidth='0.16' />
                            </g>

                            <g opacity={bridgeReveal}>
                                <path d='M 43.9 56 L 44.9 48.8 L 43.5 48.8 C 42.4 51.5 40.8 54.2 38.7 56.8 Z' fill='rgba(22, 18, 53, 0.72)' />
                                <path d='M 56.1 56 L 55.1 48.8 L 56.5 48.8 C 57.6 51.5 59.2 54.2 61.3 56.8 Z' fill='rgba(22, 18, 53, 0.72)' />
                                <rect x='43.1' y='48.6' width='1.34' height='8.4' rx='0.18' fill='rgba(61, 44, 117, 0.96)' />
                                <rect x='56.4' y='48.6' width='1.34' height='8.4' rx='0.18' fill='rgba(61, 44, 117, 0.96)' />
                                <path d='M 44.4 55.8 Q 50.1 50 56.9 55.8' fill='none' stroke='rgba(207, 165, 255, 0.88)' strokeWidth='0.42' strokeLinecap='round' />
                                <circle cx='50.2' cy='55.2' r='0.74' fill='rgba(243, 221, 255, 0.84)' />
                            </g>

                            <g opacity={0.76 + campusReveal * 0.2}>
                                <path d='M 0 120 L 0 0 L 10 0 C 8 12 7.2 23.2 7.4 34.8 C 7.8 51.6 11.2 68.2 16 86 C 17.8 93 18.4 100.8 17.2 120 Z' fill='rgba(7, 9, 24, 0.5)' />
                                <path d='M 100 120 L 100 0 L 90 0 C 92 12 92.8 23.2 92.6 34.8 C 92.2 51.6 88.8 68.2 84 86 C 82.2 93 81.6 100.8 82.8 120 Z' fill='rgba(7, 9, 24, 0.5)' />
                            </g>

                            <g opacity='0.92'>
                                <path
                                    d='M 8 120 C 14 107 21 101 31 100 C 39 99.2 42.4 102.8 41.2 109.8 C 39.9 116.9 35.2 120.2 25.8 120.6 Z'
                                    fill='rgba(4, 6, 18, 0.96)'
                                />
                                <path
                                    d='M 92 120 C 86 107 79 101 69 100 C 61 99.2 57.6 102.8 58.8 109.8 C 60.1 116.9 64.8 120.2 74.2 120.6 Z'
                                    fill='rgba(4, 6, 18, 0.96)'
                                />
                            </g>

                            <circle cx={traveler.x + lookOffsetX * 0.18} cy={traveler.y + lookOffsetY * 0.16} r='0.9' fill='white' opacity='0.98' />
                            <circle cx={traveler.x + lookOffsetX * 0.18} cy={traveler.y + lookOffsetY * 0.16} r='1.95' fill='rgba(214, 180, 255, 0.16)' />
                        </g>
                    </svg>
                </div>
            </div>

            <div
                aria-hidden='true'
                style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                        'linear-gradient(180deg, transparent 0%, transparent 42%, rgba(8, 10, 24, 0.08) 58%, rgba(6, 8, 20, 0.22) 100%)',
                    pointerEvents: 'none',
                }}
            />
        </div>
    );
}
