'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import styles from '@/app/ProjectHomeClient.module.css';
import SpatialWorldRuntime from './SpatialWorldRuntime.jsx';
import { clamp, interpolateCamera, lerp } from './rendering/firstWorldCamera.js';

const ARRIVAL_SEQUENCE = Object.freeze([
    ['opening', 700],
    ['awakening', 1400],
    ['orientation', 1400],
    ['invitation', 1400],
]);

export default function WorldRenderer({
    activeRegionId,
    rendererModel,
}) {
    const {
        homeWorld,
        originRegionId,
        primaryJourneyDestinationId,
        travelStops,
        workspaceSections,
        worldSectionById,
    } = rendererModel;
    const [travelProgress, setTravelProgress] = useState(
        () => (worldSectionById[activeRegionId] ?? homeWorld).progress ?? 0,
    );
    const [targetTravelProgress, setTargetTravelProgress] = useState(0);
    const [arrivalPhase, setArrivalPhase] = useState('opening');
    const [hoveredAnchorId, setHoveredAnchorId] = useState(null);
    const [lookOffset, setLookOffset] = useState({ x: 0, y: 0 });
    const [journeyDestinationId, setJourneyDestinationId] = useState(
        primaryJourneyDestinationId,
    );
    const worldViewportRef = useRef(null);
    const projectedSections = useMemo(
        () => [homeWorld, ...workspaceSections],
        [homeWorld, workspaceSections],
    );
    const invitedAnchorId = primaryJourneyDestinationId;
    const selectedJourneyDestinationId =
        activeRegionId === originRegionId ? journeyDestinationId : activeRegionId;
    const selectedJourneyStop =
        worldSectionById[selectedJourneyDestinationId] ??
        worldSectionById[primaryJourneyDestinationId] ??
        homeWorld;
    const maxJourneyProgress = selectedJourneyStop.progress ?? 0.34;

    useEffect(() => {
        if (activeRegionId !== originRegionId) {
            setJourneyDestinationId(activeRegionId);
        }
    }, [activeRegionId, originRegionId]);

    useEffect(() => {
        setTargetTravelProgress((currentProgress) =>
            clamp(currentProgress, 0, maxJourneyProgress),
        );
    }, [maxJourneyProgress]);

    useEffect(() => {
        let cancelled = false;
        let timeoutId = 0;

        const runPhase = (index) => {
            if (cancelled) {
                return;
            }

            if (index >= ARRIVAL_SEQUENCE.length) {
                setArrivalPhase('control');
                return;
            }

            const [phase, duration] = ARRIVAL_SEQUENCE[index];
            setArrivalPhase(phase);
            timeoutId = window.setTimeout(() => runPhase(index + 1), duration);
        };

        runPhase(0);

        return () => {
            cancelled = true;
            if (timeoutId) {
                window.clearTimeout(timeoutId);
            }
        };
    }, []);

    useEffect(() => {
        const targetProgress = targetTravelProgress;

        if (Math.abs(targetProgress - travelProgress) < 0.00035) {
            setTravelProgress(targetProgress);
            return undefined;
        }

        let animationFrame = 0;

        const animate = () => {
            setTravelProgress((currentProgress) => {
                const nextProgress = lerp(currentProgress, targetProgress, 0.16);

                if (Math.abs(nextProgress - targetProgress) < 0.00035) {
                    return targetProgress;
                }

                animationFrame = window.requestAnimationFrame(animate);
                return nextProgress;
            });
        };

        animationFrame = window.requestAnimationFrame(animate);

        return () => {
            if (animationFrame) {
                window.cancelAnimationFrame(animationFrame);
            }
        };
    }, [targetTravelProgress, travelProgress]);

    const camera = useMemo(
        () => interpolateCamera(travelStops, travelProgress),
        [travelProgress, travelStops],
    );

    useEffect(() => {
        const viewport = worldViewportRef.current;

        if (!viewport) {
            return undefined;
        }

        const handleWorldWheel = (event) => {
            event.preventDefault();

            if (arrivalPhase !== 'control') {
                return;
            }

            const deltaMultiplier =
                event.deltaMode === 1 ? 14 : event.deltaMode === 2 ? window.innerHeight * 0.85 : 1;
            const normalizedDelta = event.deltaY * deltaMultiplier;

            if (Math.abs(normalizedDelta) < 0.35) {
                return;
            }

            const journeyDelta = clamp(normalizedDelta, -180, 180) * 0.00042;

            setTargetTravelProgress((currentProgress) =>
                clamp(
                    Number((currentProgress + journeyDelta).toFixed(4)),
                    0,
                    maxJourneyProgress,
                ),
            );
        };

        viewport.addEventListener('wheel', handleWorldWheel, { passive: false });

        return () => {
            viewport.removeEventListener('wheel', handleWorldWheel);
        };
    }, [arrivalPhase, maxJourneyProgress]);

    const handlePointerMove = (event) => {
        if (arrivalPhase !== 'control') {
            return;
        }

        const rect = event.currentTarget.getBoundingClientRect();
        const relativeX = (event.clientX - rect.left) / rect.width - 0.5;
        const relativeY = (event.clientY - rect.top) / rect.height - 0.5;

        setLookOffset({
            x: Number((relativeX * -32).toFixed(2)),
            y: Number((relativeY * -18).toFixed(2)),
        });
    };

    const handlePointerLeave = () => {
        setLookOffset({ x: 0, y: 0 });
        setHoveredAnchorId(null);
    };

    const arrivalReadyForInvitation =
        arrivalPhase === 'invitation' || arrivalPhase === 'control';

    return (
        <main
            className={styles.page}
            data-active-region={activeRegionId}
            data-world-layout='spatial'
            data-arrival-phase={arrivalPhase}
        >
            <div className={styles.pageGlow} aria-hidden='true' />

            <div className={styles.travelScene}>
                <div
                    ref={worldViewportRef}
                    className={styles.worldViewport}
                    data-testid='world-renderer'
                    onPointerMove={handlePointerMove}
                    onPointerLeave={handlePointerLeave}
                    role='presentation'
                >
                    <div
                        className={styles.worldField}
                        style={{
                            '--look-offset-x': `${lookOffset.x}px`,
                            '--look-offset-y': `${lookOffset.y}px`,
                        }}
                    >
                        <div className={styles.worldComposition}>
                            <div className={styles.worldBackdrop} aria-hidden='true'>
                                <div className={styles.spatialRuntimeCanvas}>
                                    <SpatialWorldRuntime
                                        activeRegionId={activeRegionId}
                                        arrivalPhase={arrivalPhase}
                                        camera={camera}
                                        destinationId={selectedJourneyDestinationId}
                                        highlightedAnchorId={
                                            hoveredAnchorId ??
                                            (arrivalReadyForInvitation ? invitedAnchorId : null)
                                        }
                                        lookOffset={lookOffset}
                                        originRegionId={originRegionId}
                                        projectedSections={projectedSections}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
