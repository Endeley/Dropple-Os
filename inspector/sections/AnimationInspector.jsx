'use client';

import { useEffect, useMemo, useState } from 'react';
import { InspectorSection } from '../InspectorSection';
import { useSelection } from '@/ui/workspace/shared/SelectionContext.jsx';
import { selectNodes } from '@/runtime/projection';
import { createCharacter, getCharacterByNodeId, getConstraintForPart, removeCharacter, updateCharacterConstraint } from '@/runtime/characters/characterRegistry.js';
import { attachProp, createSocket, detachProp, getAllAttachments, getAttachmentByPropId, getSocketsForHost, renameSocket, updateAttachment } from '@/runtime/attachments/attachmentRegistry.js';
import { useAutoKeyframeStore } from '@/runtime/stores/useAutoKeyframeStore.js';
import { useOnionSkinStore } from '@/ui/animation/useOnionSkinStore.js';
import { useMotionTrailStore } from '@/ui/animation/useMotionTrailStore.js';
import { useConstraintVisualizerStore } from '@/ui/animation/useConstraintVisualizerStore.js';
import { useTimelineStore } from '@/runtime/stores/useTimelineStore.js';

export function AnimationInspector() {
  const { selectedIds } = useSelection() || {};
  const selection = useMemo(() => Array.from(selectedIds || []), [selectedIds]);
  const canCreate = selection.length >= 2;
  const primaryId = selection[0] || null;

  const charactersInSelection = useMemo(() => {
    const ids = new Set();
    selection.forEach((nodeId) => {
      const character = getCharacterByNodeId(nodeId);
      if (character?.id) ids.add(character.id);
    });
    return Array.from(ids);
  }, [selection]);

  const activeCharacter = useMemo(() => {
    if (!primaryId) return null;
    return getCharacterByNodeId(primaryId);
  }, [primaryId]);

  const activeConstraint = useMemo(() => {
    if (!activeCharacter || !primaryId) return null;
    return getConstraintForPart(primaryId);
  }, [activeCharacter, primaryId]);

  const isRoot = activeCharacter?.rootId === primaryId;
  const primaryAttachment = useMemo(() => (primaryId ? getAttachmentByPropId(primaryId) : null), [primaryId]);
  const hostSockets = useMemo(() => (primaryId ? getSocketsForHost(primaryId) : {}), [primaryId]);
  const socketNames = useMemo(() => Object.keys(hostSockets), [hostSockets]);
  const [socketName, setSocketName] = useState('socket');
  const [selectedSocket, setSelectedSocket] = useState('');
  const autoEnabled = useAutoKeyframeStore((s) => s.enabled);
  const autoProps = useAutoKeyframeStore((s) => s.properties);
  const setAutoEnabled = useAutoKeyframeStore((s) => s.setEnabled);
  const setAutoProperty = useAutoKeyframeStore((s) => s.setProperty);
  const onionEnabled = useOnionSkinStore((s) => s.enabled);
  const onionPrev = useOnionSkinStore((s) => s.prevFrames);
  const onionNext = useOnionSkinStore((s) => s.nextFrames);
  const onionStep = useOnionSkinStore((s) => s.stepMs);
  const onionOpacity = useOnionSkinStore((s) => s.opacity);
  const setOnionEnabled = useOnionSkinStore((s) => s.setEnabled);
  const setOnionPrev = useOnionSkinStore((s) => s.setPrevFrames);
  const setOnionNext = useOnionSkinStore((s) => s.setNextFrames);
  const setOnionStep = useOnionSkinStore((s) => s.setStepMs);
  const setOnionOpacity = useOnionSkinStore((s) => s.setOpacity);
  const trailsEnabled = useMotionTrailStore((s) => s.enabled);
  const trailSteps = useMotionTrailStore((s) => s.steps);
  const trailStepMs = useMotionTrailStore((s) => s.stepMs);
  const trailOpacity = useMotionTrailStore((s) => s.opacity);
  const trailFade = useMotionTrailStore((s) => s.fade);
  const setTrailsEnabled = useMotionTrailStore((s) => s.setEnabled);
  const setTrailSteps = useMotionTrailStore((s) => s.setSteps);
  const setTrailStepMs = useMotionTrailStore((s) => s.setStepMs);
  const setTrailOpacity = useMotionTrailStore((s) => s.setOpacity);
  const setTrailFade = useMotionTrailStore((s) => s.setFade);
  const constraintsEnabled = useConstraintVisualizerStore((s) => s.enabled);
  const showFollow = useConstraintVisualizerStore((s) => s.showFollow);
  const showPin = useConstraintVisualizerStore((s) => s.showPin);
  const showAim = useConstraintVisualizerStore((s) => s.showAim);
  const showSockets = useConstraintVisualizerStore((s) => s.showSockets);
  const setConstraintsEnabled = useConstraintVisualizerStore((s) => s.setEnabled);
  const setShowFollow = useConstraintVisualizerStore((s) => s.setShowFollow);
  const setShowPin = useConstraintVisualizerStore((s) => s.setShowPin);
  const setShowAim = useConstraintVisualizerStore((s) => s.setShowAim);
  const setShowSockets = useConstraintVisualizerStore((s) => s.setShowSockets);
  const isPlaying = useTimelineStore((s) => s.isPlaying);
  const [showRigInspector, setShowRigInspector] = useState(true);
  const [socketEdits, setSocketEdits] = useState({});

  useEffect(() => {
    if (socketNames.length === 0) {
      setSelectedSocket('');
      return;
    }
    if (!selectedSocket || !socketNames.includes(selectedSocket)) {
      setSelectedSocket(socketNames[0]);
    }
  }, [socketNames, selectedSocket]);

  function handleCreateCharacter() {
    if (!canCreate) return;
    const nodes = selectNodes();
    const rootId = selection[0];
    if (!nodes[rootId]) return;

    const partIds = selection.slice(1).filter((id) => nodes[id]);
    if (!partIds.length) return;

    createCharacter({ rootId, partIds });
  }

  function handleUngroupCharacter() {
    if (!charactersInSelection.length) return;
    charactersInSelection.forEach((id) => removeCharacter(id));
  }

  function handleCreateSocket() {
    if (!primaryId) return;
    const name = socketName?.trim();
    if (!name) return;
    createSocket({ hostId: primaryId, name });
  }

  function handleAttachProp() {
    if (selection.length !== 2 || !primaryId) return;
    const propId = selection.find((id) => id !== primaryId);
    if (!propId) return;
    const targetSocket = selectedSocket || socketNames[0];
    if (!targetSocket) return;
    attachProp({ hostId: primaryId, propId, socketName: targetSocket, mode: 'follow' });
  }

  function handleDetachProp() {
    if (!primaryId) return;
    detachProp(primaryId);
  }

  function toggleFollowRoot() {
    if (!activeCharacter || isRoot || !primaryId) return;
    updateCharacterConstraint(primaryId, (current) => {
      if (current?.follow?.targetId === activeCharacter.rootId) {
        return { follow: null };
      }
      const existingOffset = current?.follow?.offset;
      return {
        follow: {
          targetId: activeCharacter.rootId,
          offset: existingOffset,
        },
      };
    });
  }

  function togglePin(axis) {
    if (!activeCharacter || isRoot || !primaryId) return;
    updateCharacterConstraint(primaryId, (current) => {
      const existing = current?.pin?.axis || null;
      let nextAxis = null;
      if (axis === 'x') {
        if (existing === 'x') nextAxis = null;
        else if (existing === 'y') nextAxis = 'both';
        else if (existing === 'both') nextAxis = 'y';
        else nextAxis = 'x';
      } else if (axis === 'y') {
        if (existing === 'y') nextAxis = null;
        else if (existing === 'x') nextAxis = 'both';
        else if (existing === 'both') nextAxis = 'x';
        else nextAxis = 'y';
      }
      return nextAxis ? { pin: { axis: nextAxis } } : { pin: null };
    });
  }

  function toggleAim(target) {
    if (!activeCharacter || isRoot || !primaryId) return;
    updateCharacterConstraint(primaryId, (current) => {
      if (current?.aim?.target === target) {
        return { aim: null };
      }
      return {
        aim: {
          target,
          axis: 'rotation',
        },
      };
    });
  }

  function handleSocketNameChange(key, value) {
    setSocketEdits((prev) => ({ ...prev, [key]: value }));
  }

  function applySocketRename(hostId, fromName) {
    const key = `${hostId}:${fromName}`;
    const nextName = socketEdits[key]?.trim();
    if (!nextName || nextName === fromName) return;
    renameSocket(hostId, fromName, nextName);
  }

  function DisabledHint({ reason }) {
    if (!reason) return null;
    return <span style={{ fontSize: 11, color: '#94a3b8' }}>{reason}</span>;
  }

  function statusPill(label, active) {
    if (!active) return null;
    return (
      <span
        style={{
          fontSize: 10,
          padding: '2px 6px',
          borderRadius: 999,
          background: '#e2e8f0',
          color: '#0f172a',
        }}
      >
        {label}
      </span>
    );
  }

  function NodeRigRow({ nodeId, node, defaultExpanded }) {
    const character = getCharacterByNodeId(nodeId);
    const isRootNode = character?.rootId === nodeId;
    const constraint = character?.constraints?.[nodeId] || null;
    const follow = constraint?.follow;
    const pinAxis = constraint?.pin?.axis || null;
    const aim = constraint?.aim || null;
    const attachment = getAttachmentByPropId(nodeId);
    const hostSocketsMap = getSocketsForHost(nodeId);
    const socketsList = Object.values(hostSocketsMap || {});

    const allNodes = selectNodes();
    const nodeOptions = Object.values(allNodes).map((n) => ({
      id: n.id,
      label: n.name || n.id,
    }));

    const hostAttachments = getAllAttachments().filter((att) => att.hostId === nodeId);

    const invalidMix = Boolean(character && !isRootNode && attachment);
    const canEdit = !isPlaying && !invalidMix;
    const [expanded, setExpanded] = useState(Boolean(defaultExpanded));

    const characterStatus = character ? (isRootNode ? 'Root' : 'Part') : 'None';
    const hasAim = Boolean(aim);
    const hasPin = Boolean(pinAxis);
    const hasFollow = Boolean(follow);
    const hasAttachment = Boolean(attachment || hostAttachments.length);

    const disabledBecausePlaying = isPlaying ? 'Disabled: playback is active' : '';
    const disabledBecauseInvalid = invalidMix ? 'Disabled: attachment conflicts with character part' : '';
    const disabledReason = disabledBecausePlaying || disabledBecauseInvalid;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 0', borderTop: '1px solid #e2e8f0' }}>
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 8px',
            borderRadius: 6,
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            color: '#0f172a',
            fontSize: 12,
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <span>{expanded ? '▼' : '▶'}</span>
          <span style={{ fontWeight: 600 }}>{node?.name || nodeId}</span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {statusPill('Character', Boolean(character))}
            {statusPill('Attachment', hasAttachment)}
            {statusPill('Aim', hasAim)}
            {statusPill('Pin', hasPin)}
            {statusPill('Follow', hasFollow)}
          </div>
        </button>

        {!expanded ? null : (
          <>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              Character: {characterStatus}
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              Attachment: {attachment ? `Prop (${attachment.socket?.name || 'socket'})` : hostAttachments.length ? `Host (${hostAttachments.length})` : 'None'}
            </div>

            {invalidMix && (
              <div style={{ fontSize: 12, color: '#b45309' }}>
                Invalid: node cannot be both character part and attachment prop.
              </div>
            )}

            {character && !isRootNode && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>Rig</div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <input
                    type="checkbox"
                    disabled={!canEdit}
                    title={!canEdit ? disabledReason : undefined}
                    checked={Boolean(follow)}
                    onChange={(e) => {
                      if (!canEdit) return;
                      const enabled = e.target.checked;
                      updateCharacterConstraint(nodeId, (current) => {
                        if (!enabled) return { follow: null };
                        const baseTarget = character?.rootId || nodeId;
                        return {
                          follow: {
                            targetId: current?.follow?.targetId || baseTarget,
                            offset: current?.follow?.offset,
                          },
                        };
                      });
                    }}
                  />
                  Follow
                  {!canEdit && <DisabledHint reason={disabledReason} />}
                </label>
                {follow && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <label style={{ fontSize: 12 }}>
                      Target
                      <select
                        disabled={!canEdit}
                        title={!canEdit ? disabledReason : undefined}
                        value={follow.targetId || character.rootId}
                        onChange={(e) => {
                          const nextTarget = e.target.value;
                          updateCharacterConstraint(nodeId, (current) => ({
                            follow: {
                              targetId: nextTarget,
                              offset: current?.follow?.offset,
                            },
                          }));
                        }}
                        style={{ marginLeft: 6, padding: '4px 6px', fontSize: 12 }}
                      >
                        {nodeOptions.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {!canEdit && <DisabledHint reason={disabledReason} />}
                    </label>
                    <div style={{ fontSize: 11, color: '#64748b' }}>
                      Offset: {Number.isFinite(follow?.offset?.x) ? follow.offset.x : 0}, {Number.isFinite(follow?.offset?.y) ? follow.offset.y : 0}
                    </div>
                  </div>
                )}
              </div>
            )}

            {character && !isRootNode && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>Constraints</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                    <input
                      type="checkbox"
                      disabled={!canEdit}
                      title={!canEdit ? disabledReason : undefined}
                      checked={pinAxis === 'x' || pinAxis === 'both'}
                      onChange={(e) => {
                        if (!canEdit) return;
                        const next = e.target.checked
                          ? pinAxis === 'y'
                            ? 'both'
                            : 'x'
                          : pinAxis === 'both'
                            ? 'y'
                            : null;
                        updateCharacterConstraint(nodeId, { pin: next ? { axis: next } : null });
                      }}
                    />
                    Pin X
                    {!canEdit && <DisabledHint reason={disabledReason} />}
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                    <input
                      type="checkbox"
                      disabled={!canEdit}
                      title={!canEdit ? disabledReason : undefined}
                      checked={pinAxis === 'y' || pinAxis === 'both'}
                      onChange={(e) => {
                        if (!canEdit) return;
                        const next = e.target.checked
                          ? pinAxis === 'x'
                            ? 'both'
                            : 'y'
                          : pinAxis === 'both'
                            ? 'x'
                            : null;
                        updateCharacterConstraint(nodeId, { pin: next ? { axis: next } : null });
                      }}
                    />
                    Pin Y
                    {!canEdit && <DisabledHint reason={disabledReason} />}
                  </label>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <input
                    type="checkbox"
                    disabled={!canEdit}
                    title={!canEdit ? disabledReason : undefined}
                    checked={Boolean(aim)}
                    onChange={(e) => {
                      if (!canEdit) return;
                      const enabled = e.target.checked;
                      updateCharacterConstraint(nodeId, enabled ? { aim: { target: 'cursor', axis: 'rotation' } } : { aim: null });
                    }}
                  />
                  Aim
                  {!canEdit && <DisabledHint reason={disabledReason} />}
                </label>
                {aim && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <label style={{ fontSize: 12 }}>
                      Target
                      <select
                        disabled={!canEdit}
                        title={!canEdit ? disabledReason : undefined}
                        value={aim.target === 'cursor' ? 'cursor' : aim.target}
                        onChange={(e) => {
                          const nextTarget = e.target.value === 'cursor' ? 'cursor' : e.target.value;
                          updateCharacterConstraint(nodeId, { aim: { ...aim, target: nextTarget } });
                        }}
                        style={{ marginLeft: 6, padding: '4px 6px', fontSize: 12 }}
                      >
                        <option value="cursor">cursor</option>
                        {nodeOptions.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {!canEdit && <DisabledHint reason={disabledReason} />}
                    </label>
                    <label style={{ fontSize: 12 }}>
                      Clamp Min
                      <input
                        type="number"
                        disabled={!canEdit}
                        title={!canEdit ? disabledReason : undefined}
                        value={Number.isFinite(aim?.clamp?.min) ? aim.clamp.min : ''}
                        onChange={(e) => {
                          const next = parseFloat(e.target.value);
                          updateCharacterConstraint(nodeId, {
                            aim: {
                              ...aim,
                              clamp: {
                                min: Number.isFinite(next) ? next : undefined,
                                max: aim?.clamp?.max,
                              },
                            },
                          });
                        }}
                        style={{ marginLeft: 6, width: 80 }}
                      />
                      {!canEdit && <DisabledHint reason={disabledReason} />}
                    </label>
                    <label style={{ fontSize: 12 }}>
                      Clamp Max
                      <input
                        type="number"
                        disabled={!canEdit}
                        title={!canEdit ? disabledReason : undefined}
                        value={Number.isFinite(aim?.clamp?.max) ? aim.clamp.max : ''}
                        onChange={(e) => {
                          const next = parseFloat(e.target.value);
                          updateCharacterConstraint(nodeId, {
                            aim: {
                              ...aim,
                              clamp: {
                                min: aim?.clamp?.min,
                                max: Number.isFinite(next) ? next : undefined,
                              },
                            },
                          });
                        }}
                        style={{ marginLeft: 6, width: 80 }}
                      />
                      {!canEdit && <DisabledHint reason={disabledReason} />}
                    </label>
                  </div>
                )}
              </div>
            )}

            {attachment && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>Attachments</div>
                <div style={{ fontSize: 12 }}>
                  Socket: {attachment.socket?.name || 'socket'}
                </div>
                <label style={{ fontSize: 12 }}>
                  Mode
                  <select
                    disabled={!canEdit}
                    title={!canEdit ? disabledReason : undefined}
                    value={attachment.mode}
                    onChange={(e) => updateAttachment(attachment.id, { mode: e.target.value })}
                    style={{ marginLeft: 6, padding: '4px 6px', fontSize: 12 }}
                  >
                    <option value="follow">follow</option>
                    <option value="lock">lock</option>
                  </select>
                  {!canEdit && <DisabledHint reason={disabledReason} />}
                </label>
                <button
                  type="button"
                  disabled={!canEdit}
                  title={!canEdit ? disabledReason : undefined}
                  onClick={() => detachProp(nodeId)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontSize: 12,
                    cursor: 'pointer',
                    width: 110,
                  }}
                >
                  Detach
                </button>
                {!canEdit && <DisabledHint reason={disabledReason} />}
              </div>
            )}

            {socketsList.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>Attachments</div>
                {socketsList.map((socket) => {
                  const key = `${nodeId}:${socket.name}`;
                  return (
                    <div key={key} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input
                        type="text"
                        disabled={!canEdit}
                        title={!canEdit ? disabledReason : undefined}
                        value={socketEdits[key] ?? socket.name}
                        onChange={(e) => handleSocketNameChange(key, e.target.value)}
                        style={{ fontSize: 12, padding: '4px 6px', width: 120 }}
                      />
                      <button
                        type="button"
                        disabled={!canEdit}
                        title={!canEdit ? disabledReason : undefined}
                        onClick={() => applySocketRename(nodeId, socket.name)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 6,
                          border: '1px solid #e2e8f0',
                          background: '#ffffff',
                          color: '#0f172a',
                          fontSize: 12,
                          cursor: 'pointer',
                        }}
                      >
                        Rename
                      </button>
                    </div>
                  );
                })}
                {!canEdit && <DisabledHint reason={disabledReason} />}
              </div>
            )}

            {hostAttachments.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>Attachments</div>
                {hostAttachments.map((att) => (
                  <div key={att.id} style={{ fontSize: 12, color: '#64748b' }}>
                    {att.propId} → {att.socket?.name || 'socket'} ({att.mode})
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <InspectorSection title="Animation">
      <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 8 }}>
        Select a property to add keyframes.
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleCreateCharacter}
          disabled={!canCreate}
          title={!canCreate ? 'Disabled: select at least two nodes' : undefined}
          style={{
            padding: '6px 10px',
            borderRadius: 6,
            border: '1px solid #e2e8f0',
            background: canCreate ? '#ffffff' : '#f1f5f9',
            color: '#0f172a',
            fontSize: 12,
            cursor: canCreate ? 'pointer' : 'not-allowed',
          }}
        >
          Create Character from Selection
        </button>
        {!canCreate && <DisabledHint reason="Disabled: select at least two nodes" />}
        <button
          type="button"
          onClick={handleUngroupCharacter}
          disabled={!charactersInSelection.length}
          title={!charactersInSelection.length ? 'Disabled: no character in selection' : undefined}
          style={{
            padding: '6px 10px',
            borderRadius: 6,
            border: '1px solid #e2e8f0',
            background: charactersInSelection.length ? '#ffffff' : '#f1f5f9',
            color: '#0f172a',
            fontSize: 12,
            cursor: charactersInSelection.length ? 'pointer' : 'not-allowed',
          }}
        >
          Ungroup Character
        </button>
        {!charactersInSelection.length && <DisabledHint reason="Disabled: no character in selection" />}
      </div>
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>Auto-Keyframe</div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <input
            type="checkbox"
            checked={autoEnabled}
            onChange={(e) => setAutoEnabled?.(e.target.checked)}
          />
          Enabled
        </label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <input
              type="checkbox"
              checked={Boolean(autoProps?.position)}
              onChange={(e) => setAutoProperty?.('position', e.target.checked)}
            />
            Position (X/Y)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <input
              type="checkbox"
              checked={Boolean(autoProps?.size)}
              onChange={(e) => setAutoProperty?.('size', e.target.checked)}
            />
            Size (W/H)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <input
              type="checkbox"
              checked={Boolean(autoProps?.rotation)}
              onChange={(e) => setAutoProperty?.('rotation', e.target.checked)}
            />
            Rotation
          </label>
        </div>
      </div>
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>Onion Skin</div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <input
            type="checkbox"
            checked={onionEnabled}
            onChange={(e) => setOnionEnabled?.(e.target.checked)}
          />
          Enabled
        </label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            Prev
            <input
              type="number"
              min={0}
              value={onionPrev}
              onChange={(e) => setOnionPrev?.(e.target.value)}
              style={{ width: 64 }}
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            Next
            <input
              type="number"
              min={0}
              value={onionNext}
              onChange={(e) => setOnionNext?.(e.target.value)}
              style={{ width: 64 }}
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            Step (ms)
            <input
              type="number"
              min={1}
              value={onionStep}
              onChange={(e) => setOnionStep?.(e.target.value)}
              style={{ width: 72 }}
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            Opacity
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={onionOpacity}
              onChange={(e) => setOnionOpacity?.(e.target.value)}
            />
          </label>
        </div>
      </div>
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>Motion Trails</div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <input
            type="checkbox"
            checked={trailsEnabled}
            onChange={(e) => setTrailsEnabled?.(e.target.checked)}
          />
          Enabled
        </label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            Steps
            <input
              type="number"
              min={1}
              value={trailSteps}
              onChange={(e) => setTrailSteps?.(e.target.value)}
              style={{ width: 64 }}
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            Step (ms)
            <input
              type="number"
              min={1}
              value={trailStepMs}
              onChange={(e) => setTrailStepMs?.(e.target.value)}
              style={{ width: 72 }}
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            Opacity
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={trailOpacity}
              onChange={(e) => setTrailOpacity?.(e.target.value)}
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <input
              type="checkbox"
              checked={trailFade}
              onChange={(e) => setTrailFade?.(e.target.checked)}
            />
            Fade
          </label>
        </div>
      </div>
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>Constraint Visuals</div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <input
            type="checkbox"
            checked={constraintsEnabled}
            onChange={(e) => setConstraintsEnabled?.(e.target.checked)}
          />
          Show Constraints
        </label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <input
              type="checkbox"
              checked={showFollow}
              onChange={(e) => setShowFollow?.(e.target.checked)}
            />
            Follow
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <input
              type="checkbox"
              checked={showPin}
              onChange={(e) => setShowPin?.(e.target.checked)}
            />
            Pin
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <input
              type="checkbox"
              checked={showAim}
              onChange={(e) => setShowAim?.(e.target.checked)}
            />
            Aim
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <input
              type="checkbox"
              checked={showSockets}
              onChange={(e) => setShowSockets?.(e.target.checked)}
            />
            Sockets
          </label>
        </div>
      </div>
      {selection.length > 0 && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button
            type="button"
            onClick={() => setShowRigInspector((prev) => !prev)}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#0f172a',
              fontSize: 12,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            {showRigInspector ? '▼' : '▶'} Rig & Constraints
          </button>
          {showRigInspector && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selection.map((nodeId) => {
                const node = selectNodes()?.[nodeId];
                return (
                  <div key={nodeId} style={{ padding: '0 4px' }}>
                    <NodeRigRow nodeId={nodeId} node={node} defaultExpanded={selection.length === 1} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>Attachments</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            value={socketName}
            onChange={(e) => setSocketName(e.target.value)}
            placeholder="socket name"
            style={{
              padding: '6px 8px',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              fontSize: 12,
              width: 120,
            }}
          />
          <button
            type="button"
            onClick={handleCreateSocket}
            disabled={!primaryId}
            title={!primaryId ? 'Disabled: no node selected' : undefined}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              background: primaryId ? '#ffffff' : '#f1f5f9',
              color: '#0f172a',
              fontSize: 12,
              cursor: primaryId ? 'pointer' : 'not-allowed',
            }}
          >
            Add Socket
          </button>
          {!primaryId && <DisabledHint reason="Disabled: no node selected" />}
          <select
            value={selectedSocket}
            onChange={(e) => setSelectedSocket(e.target.value)}
            disabled={socketNames.length === 0}
            title={socketNames.length === 0 ? 'Disabled: no sockets' : undefined}
            style={{
              padding: '6px 8px',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              fontSize: 12,
              background: socketNames.length ? '#ffffff' : '#f1f5f9',
            }}
          >
            {socketNames.length === 0 ? (
              <option value="">No sockets</option>
            ) : (
              socketNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))
            )}
          </select>
          <button
            type="button"
            onClick={handleAttachProp}
            disabled={selection.length !== 2 || socketNames.length === 0}
            title={selection.length !== 2 ? 'Disabled: select exactly two nodes' : socketNames.length === 0 ? 'Disabled: no sockets' : undefined}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              background: selection.length === 2 && socketNames.length > 0 ? '#ffffff' : '#f1f5f9',
              color: '#0f172a',
              fontSize: 12,
              cursor: selection.length === 2 && socketNames.length > 0 ? 'pointer' : 'not-allowed',
            }}
          >
            Attach to Socket
          </button>
          {(selection.length !== 2 || socketNames.length === 0) && (
            <DisabledHint reason={selection.length !== 2 ? 'Disabled: select exactly two nodes' : 'Disabled: no sockets'} />
          )}
          <button
            type="button"
            onClick={handleDetachProp}
            disabled={!primaryAttachment}
            title={!primaryAttachment ? 'Disabled: no attachment on selected node' : undefined}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              background: primaryAttachment ? '#ffffff' : '#f1f5f9',
              color: '#0f172a',
              fontSize: 12,
              cursor: primaryAttachment ? 'pointer' : 'not-allowed',
            }}
          >
            Detach Prop
          </button>
          {!primaryAttachment && <DisabledHint reason="Disabled: no attachment on selected node" />}
        </div>
      </div>
    </InspectorSection>
  );
}
