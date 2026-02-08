'use client';

import { useEffect, useMemo, useState } from 'react';
import { InspectorSection } from '../InspectorSection';
import { useSelection } from '@/ui/workspace/shared/SelectionContext.jsx';
import { getRuntimeState } from '@/runtime/state/runtimeState.js';
import { createCharacter, getCharacterByNodeId, getConstraintForPart, removeCharacter, updateCharacterConstraint } from '@/runtime/characters/characterRegistry.js';
import { attachProp, createSocket, detachProp, getAttachmentByPropId, getSocketsForHost } from '@/runtime/attachments/attachmentRegistry.js';
import { useAutoKeyframeStore } from '@/ui/animation/autoKeyframeStore.js';
import { useOnionSkinStore } from '@/ui/animation/useOnionSkinStore.js';

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
    const runtime = getRuntimeState();
    const nodes = runtime?.nodes || {};
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
        <button
          type="button"
          onClick={handleUngroupCharacter}
          disabled={!charactersInSelection.length}
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
          <select
            value={selectedSocket}
            onChange={(e) => setSelectedSocket(e.target.value)}
            disabled={socketNames.length === 0}
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
          <button
            type="button"
            onClick={handleDetachProp}
            disabled={!primaryAttachment}
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
        </div>
      </div>
      {activeCharacter && !isRoot && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>Character Constraints</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={toggleFollowRoot}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                background: activeConstraint?.follow ? '#e2e8f0' : '#ffffff',
                color: '#0f172a',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Follow Root
            </button>
            <button
              type="button"
              onClick={() => togglePin('x')}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                background: activeConstraint?.pin?.axis === 'x' || activeConstraint?.pin?.axis === 'both' ? '#e2e8f0' : '#ffffff',
                color: '#0f172a',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Pin X
            </button>
            <button
              type="button"
              onClick={() => togglePin('y')}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                background: activeConstraint?.pin?.axis === 'y' || activeConstraint?.pin?.axis === 'both' ? '#e2e8f0' : '#ffffff',
                color: '#0f172a',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Pin Y
            </button>
            <button
              type="button"
              onClick={() => toggleAim('cursor')}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                background: activeConstraint?.aim?.target === 'cursor' ? '#e2e8f0' : '#ffffff',
                color: '#0f172a',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Aim Cursor
            </button>
            <button
              type="button"
              onClick={() => {
                if (selection.length !== 2 || !primaryId) return;
                const target = selection.find((id) => id !== primaryId);
                if (target) toggleAim(target);
              }}
              disabled={selection.length !== 2}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                background: selection.length === 2 ? '#ffffff' : '#f1f5f9',
                color: '#0f172a',
                fontSize: 12,
                cursor: selection.length === 2 ? 'pointer' : 'not-allowed',
              }}
            >
              Aim at Node
            </button>
          </div>
        </div>
      )}
    </InspectorSection>
  );
}
