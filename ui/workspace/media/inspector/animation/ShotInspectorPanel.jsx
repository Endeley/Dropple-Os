'use client';

import { clampTransitionDuration } from '@/runtime/interaction/shotTransitionConstraints.js';
import { useShotEditorIntent } from '@/ui/workspace/editor/shotEditorIntent.js';
import {
    fieldGridStyle,
    fieldInputStyle,
    fieldLabelStyle,
    sectionStyle,
    sectionTitleStyle,
} from '../inspectorStyles.js';

const DEFAULT_CROSSFADE_DURATION_MS = 200;

function toSafeInteger(value, fallback = 0) {
    const next = Number(value);
    return Number.isFinite(next) ? Math.round(next) : fallback;
}

export function ShotInspectorPanel({ inspector }) {
    const shotIntent = useShotEditorIntent();
    const track = inspector?.track ?? null;
    const shot = inspector?.shot ?? null;
    const nextShot = inspector?.nextShot ?? null;
    const canEditCrossfade = Boolean(inspector?.canEditCrossfade);

    if (!track) return null;

    const transitionType = shot?.transitionOut?.type ?? 'none';
    const transitionDurationMs = toSafeInteger(shot?.transitionOut?.durationMs, 0);

    function updateTrackPatch(patch) {
        if (!track?.id) return;
        shotIntent.updateTrack({
            trackId: track.id,
            patch,
        });
    }

    function updateShotPatch(patch) {
        if (!shot?.id) return;
        shotIntent.update({
            trackId: track.id,
            shotId: shot.id,
            patch,
        });
    }

    function handleTransitionTypeChange(nextType) {
        if (!shot?.id) return;

        if (nextType === 'none') {
            updateShotPatch({ transitionOut: null });
            return;
        }

        if (nextType === 'cut') {
            updateShotPatch({
                transitionOut: {
                    type: 'cut',
                    durationMs: 0,
                },
            });
            return;
        }

        const requestedDuration =
            transitionDurationMs > 0 ? transitionDurationMs : DEFAULT_CROSSFADE_DURATION_MS;
        const durationMs = canEditCrossfade
            ? clampTransitionDuration({
                  durationMs: requestedDuration,
                  fromShot: shot,
                  toShot: nextShot,
              })
            : 0;

        updateShotPatch({
            transitionOut: {
                type: 'crossfade',
                durationMs,
            },
        });
    }

    return (
        <div style={sectionStyle()}>
            <div style={sectionTitleStyle()}>Shot Inspector</div>

            <div style={{ ...sectionStyle(), padding: '10px', background: 'rgba(241, 245, 249, 0.8)' }}>
                <div style={sectionTitleStyle()}>Track</div>
                <div style={fieldGridStyle()}>
                    <label style={fieldLabelStyle()} htmlFor='shot-inspector-track-name'>
                        Name
                    </label>
                    <input
                        id='shot-inspector-track-name'
                        key={`${track.id}-name`}
                        type='text'
                        defaultValue={track.name ?? ''}
                        onBlur={(event) => updateTrackPatch({ name: event.target.value.trim() })}
                        style={fieldInputStyle()}
                    />
                    <label style={fieldLabelStyle()} htmlFor='shot-inspector-track-order'>
                        Order
                    </label>
                    <input
                        id='shot-inspector-track-order'
                        key={`${track.id}-order`}
                        type='number'
                        defaultValue={track.order ?? 0}
                        onBlur={(event) =>
                            updateTrackPatch({ order: toSafeInteger(event.target.value, track.order ?? 0) })
                        }
                        style={fieldInputStyle()}
                    />
                    <span style={fieldLabelStyle()}>Shots</span>
                    <input disabled readOnly value={track.shotCount ?? track.shots?.length ?? 0} style={fieldInputStyle()} />
                </div>
            </div>

            {shot ? (
                <>
                    <div style={{ ...sectionStyle(), padding: '10px', background: 'rgba(241, 245, 249, 0.8)' }}>
                        <div style={sectionTitleStyle()}>Shot</div>
                        <div style={fieldGridStyle()}>
                            <label style={fieldLabelStyle()} htmlFor='shot-inspector-name'>
                                Name
                            </label>
                            <input
                                id='shot-inspector-name'
                                key={`${shot.id}-name`}
                                type='text'
                                defaultValue={shot.name ?? ''}
                                onBlur={(event) => updateShotPatch({ name: event.target.value.trim() })}
                                style={fieldInputStyle()}
                            />
                            <label style={fieldLabelStyle()} htmlFor='shot-inspector-composition'>
                                Composition
                            </label>
                            <input
                                id='shot-inspector-composition'
                                key={`${shot.id}-composition`}
                                type='text'
                                defaultValue={shot.compositionId ?? ''}
                                onBlur={(event) => {
                                    const nextValue = event.target.value.trim();
                                    if (!nextValue) return;
                                    updateShotPatch({ compositionId: nextValue });
                                }}
                                style={fieldInputStyle()}
                            />
                            <span style={fieldLabelStyle()}>Start</span>
                            <input disabled readOnly value={shot.startMs ?? 0} style={fieldInputStyle()} />
                            <span style={fieldLabelStyle()}>End</span>
                            <input disabled readOnly value={shot.endMs ?? 0} style={fieldInputStyle()} />
                            <span style={fieldLabelStyle()}>Duration</span>
                            <input disabled readOnly value={shot.durationMs ?? 0} style={fieldInputStyle()} />
                        </div>
                    </div>

                    <div style={{ ...sectionStyle(), padding: '10px', background: 'rgba(241, 245, 249, 0.8)' }}>
                        <div style={sectionTitleStyle()}>Transition</div>
                        <div style={fieldGridStyle()}>
                            <label style={fieldLabelStyle()} htmlFor='shot-inspector-transition-type'>
                                Type
                            </label>
                            <select
                                id='shot-inspector-transition-type'
                                value={transitionType}
                                onChange={(event) => handleTransitionTypeChange(event.target.value)}
                                style={fieldInputStyle()}>
                                <option value='none'>None</option>
                                <option value='cut'>Cut</option>
                                <option value='crossfade' disabled={!canEditCrossfade && transitionType !== 'crossfade'}>
                                    Crossfade
                                </option>
                            </select>
                            <label style={fieldLabelStyle()} htmlFor='shot-inspector-transition-duration'>
                                Duration
                            </label>
                            <input
                                id='shot-inspector-transition-duration'
                                key={`${shot.id}-transition-duration-${transitionType}`}
                                type='number'
                                min='0'
                                disabled={transitionType !== 'crossfade'}
                                defaultValue={transitionType === 'crossfade' ? transitionDurationMs : 0}
                                onBlur={(event) => {
                                    if (transitionType !== 'crossfade') return;
                                    const durationMs = clampTransitionDuration({
                                        durationMs: toSafeInteger(event.target.value, 0),
                                        fromShot: shot,
                                        toShot: nextShot,
                                    });
                                    updateShotPatch({
                                        transitionOut: {
                                            type: 'crossfade',
                                            durationMs,
                                        },
                                    });
                                }}
                                style={fieldInputStyle()}
                            />
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                            {canEditCrossfade
                                ? `Crossfade is clamped to the shared duration of ${shot.durationMs ?? 0}ms and ${nextShot?.durationMs ?? 0}ms.`
                                : 'Crossfade requires an adjacent next shot in the same track.'}
                        </div>
                    </div>
                </>
            ) : (
                <div style={{ fontSize: 12, color: '#64748b' }}>
                    Select a shot from the timeline to edit shot properties.
                </div>
            )}
        </div>
    );
}
