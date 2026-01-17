'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ModeRegistry } from '@/workspaces/modes/ModeRegistry';
import { WorkspaceLayout } from './WorkspaceLayout';
import { MessageBus } from '@/runtime/MessageBus';
import { GridProvider } from './GridContext';
import { ClipboardProvider } from './ClipboardContext';
import { applyAutoLayoutIfNeeded } from './useAutoLayoutCommit';
import { getDesignStateAtCursor } from '@/runtime/replay/getDesignStateAtCursor';
import { EducationCursorProvider } from '@/education/EducationCursorContext';
import TemplateGeneratorOverlay from '@/templates/TemplateGeneratorOverlay';
import { useTemplateGenerator } from '@/templates/useTemplateGenerator';
import { createLocalDocumentSnapshot, hydrateLocalDocumentSnapshot } from '@/persistence/localDocumentSchema';
import { loadLocalDocument, saveLocalDocument } from '@/persistence/localDocumentStore';
import { canvasBus } from '@/ui/canvasBus';
import { getActiveDocument, setActiveDocument } from '@/persistence/activeDocument';
import { loadRegistry } from '@/persistence/documentRegistry';
import { loadDocumentSnapshot, saveDocumentSnapshot } from '@/persistence/documentCommands';
import { readJSONFile } from '@/import/importJSON';
import { parseSVG } from '@/import/svg/parseSVG';
import { useDocumentRole } from '@/collab/useDocumentRole';
import { usePresence } from '@/collab/usePresence';
import { useGalleryIdentity } from '@/gallery/useGalleryIdentity';
import { useIntentPreview } from '@/collab/useIntentPreview';

export function WorkspaceShell({
  modeId,
  educationRole = 'teacher',
  educationInitialLocked = true,
  educationReadOnly = false,
  initialEvents = [],
  initialCursorIndex = -1,
  disableSeed = false,
  initialDocumentId = null,
  skipDraftRestore = false,
  readOnly = false,
  reviewSubmission,
  reviewRubric,
  onReviewDecision,
  onReviewCriteriaChange,
  reviewerId,
}) {
  const adapter = ModeRegistry.get(modeId);
  const templateGen = useTemplateGenerator();

  const [events, setEvents] = useState(() => initialEvents);
  const [cursorIndex, setCursorIndex] = useState(initialCursorIndex);
  const [hydrated, setHydrated] = useState(false);
  const [documentId, setDocumentId] = useState(null);
  const [documentName, setDocumentName] = useState('Untitled');
  const [recentDocs, setRecentDocs] = useState([]);
  const skipAutoLayoutOnce = useRef(initialEvents.length > 0);
  const bus = useMemo(() => new MessageBus({ runId: 'design-run' }), []);
  const emit = useCallback((event) => bus.emit(event), [bus]);
  const saveTimerRef = useRef(null);
  const editGroupRef = useRef({ id: null });

  const documentRole = useDocumentRole(documentId);
  const effectiveReadOnly = readOnly || documentRole === 'viewer';
  // N2 vs N3 boundary:
  // Awareness layers are mounted here. No shared document mutations in this layer.
  const canEmitPresence = documentRole === 'owner' || documentRole === 'editor';
  const presence = usePresence({ docId: documentId, enabled: canEmitPresence });
  const galleryIdentity = useGalleryIdentity();
  const selfUserId = galleryIdentity?.id ?? null;
  const canEmitIntent = documentRole === 'owner' || documentRole === 'editor';
  const intents = useIntentPreview({
    docId: documentId,
    enabled: canEmitIntent,
    selfUserId,
  });

  const persistenceEnabled =
    !effectiveReadOnly &&
    adapter?.id !== 'review' &&
    !(adapter?.id === 'education' && educationReadOnly);
  const importEnabled =
    !effectiveReadOnly &&
    adapter?.capabilities?.editing !== false &&
    adapter?.id !== 'review' &&
    !(adapter?.id === 'education' && educationReadOnly);

  useEffect(() => {
    function beginGroup() {
      if (!editGroupRef.current.id) {
        editGroupRef.current.id =
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `group-${Math.random().toString(36).slice(2, 10)}`;
      }
    }

    function endGroup() {
      editGroupRef.current.id = null;
    }

    canvasBus.on('session.start', beginGroup);
    canvasBus.on('intent.edit.begin', beginGroup);
    canvasBus.on('intent.edit.commit', endGroup);
    canvasBus.on('session.commit', endGroup);
    canvasBus.on('session.cancel', endGroup);

    return () => {
      canvasBus.off('session.start', beginGroup);
      canvasBus.off('intent.edit.begin', beginGroup);
      canvasBus.off('intent.edit.commit', endGroup);
      canvasBus.off('session.commit', endGroup);
      canvasBus.off('session.cancel', endGroup);
    };
  }, []);

  useEffect(() => {
    return bus.subscribe((event) => {
      setEvents((prev) => {
        const groupId = editGroupRef.current.id;
        const nextEvent = groupId ? { ...event, groupId } : event;
        const next = [...prev, nextEvent];
        setCursorIndex(next.length - 1);
        return next;
      });
    });
  }, [bus]);

  const applySnapshot = useCallback((snapshot) => {
    setEvents(snapshot.events || []);
    const maxIndex = (snapshot.events || []).length - 1;
    const nextCursor = Math.max(-1, Math.min(maxIndex, snapshot.cursorIndex ?? -1));
    setCursorIndex(nextCursor);
    if ((snapshot.events || []).length > 0) {
      skipAutoLayoutOnce.current = true;
    }
  }, []);

  useEffect(() => {
    if (!persistenceEnabled) {
      setHydrated(true);
      return;
    }

    const registry = loadRegistry();
    setRecentDocs(registry);

    if (initialDocumentId) {
      const loaded = loadDocumentSnapshot(initialDocumentId);
      if (loaded?.snapshot) {
        applySnapshot(loaded.snapshot);
        setDocumentId(initialDocumentId);
        if (loaded.name) setDocumentName(loaded.name);
        setActiveDocument(initialDocumentId);
        setHydrated(true);
        return;
      }
      if (skipDraftRestore) {
        setHydrated(true);
        return;
      }
    }

    const activeId = getActiveDocument();
    if (activeId) {
      const loaded = loadDocumentSnapshot(activeId);
      if (loaded?.snapshot) {
        applySnapshot(loaded.snapshot);
        setDocumentId(activeId);
        if (loaded.name) setDocumentName(loaded.name);
        setHydrated(true);
        return;
      }
    }

    const snapshot = loadLocalDocument();
    const hydratedSnapshot = hydrateLocalDocumentSnapshot(snapshot);

    if (hydratedSnapshot) {
      applySnapshot(hydratedSnapshot);
    }

    setHydrated(true);
  }, [persistenceEnabled, applySnapshot, initialDocumentId, skipDraftRestore]);

  useEffect(() => {
    if (events.length === 0) return;
    if (skipAutoLayoutOnce.current) {
      skipAutoLayoutOnce.current = false;
      return;
    }

    const lastEvent = events[events.length - 1];
    if (!lastEvent) return;

    const shouldApply = new Set([
      'node.layout.setAutoLayout',
      'node.layout.clearAutoLayout',
      'node.layout.resize',
      'node.create',
      'node.delete',
      'node.children.reorder',
    ]);

    if (!shouldApply.has(lastEvent.type)) return;

    const state = getDesignStateAtCursor({
      events,
      uptoIndex: events.length - 1,
    });

    applyAutoLayoutIfNeeded({
      state,
      emit,
    });
  }, [events, emit]);

  useEffect(() => {
    if (!hydrated) return;
    if (disableSeed || events.length > 0) return;

    emit({
      type: 'node.create',
      payload: {
        node: {
          id: 'frame-root',
          type: 'frame',
          layout: { x: 0, y: 0, width: 600, height: 400 },
        },
      },
    });

    emit({
      type: 'node.create',
      payload: {
        node: {
          id: 'frame-secondary',
          type: 'frame',
          layout: { x: 800, y: 200, width: 400, height: 300 },
        },
      },
    });
  }, [disableSeed, events.length, emit, hydrated]);

  useEffect(() => {
    if (!persistenceEnabled || !hydrated) return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      const snapshot = createLocalDocumentSnapshot({
        events,
        cursorIndex,
      });
      saveLocalDocument(snapshot);
    }, 250);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [events, cursorIndex, hydrated, persistenceEnabled]);

  const handleSave = useCallback(
    (nameOverride) => {
      if (!persistenceEnabled) return;
      const nextName = nameOverride || documentName || 'Untitled';
      const result = saveDocumentSnapshot({
        id: documentId,
        name: nextName,
        events,
        cursorIndex,
      });
      setDocumentId(result.id);
      setDocumentName(nextName);
      setRecentDocs(loadRegistry());
    },
    [persistenceEnabled, documentName, documentId, events, cursorIndex]
  );

  const handleSaveAs = useCallback(() => {
    const nextName = window.prompt('Document name', documentName || 'Untitled');
    if (!nextName) return;
    handleSave(nextName);
  }, [handleSave, documentName]);

  const handleOpen = useCallback(
    (id) => {
      if (!id) return;
      const loaded = loadDocumentSnapshot(id);
      if (!loaded?.snapshot) return;
      applySnapshot(loaded.snapshot);
      setDocumentId(id);
      setDocumentName(loaded.name || 'Untitled');
      setActiveDocument(id);
      setRecentDocs(loadRegistry());
    },
    [applySnapshot]
  );

  const createId = useCallback(() => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `node-${Math.random().toString(36).slice(2, 10)}`;
  }, []);

  const orderNodesByParent = useCallback((nodes) => {
    const byId = new Map(nodes.map((node) => [node.id, node]));
    const depthMemo = new Map();

    function depth(node) {
      if (!node?.parentId || !byId.has(node.parentId)) return 0;
      if (depthMemo.has(node.id)) return depthMemo.get(node.id);
      const value = 1 + depth(byId.get(node.parentId));
      depthMemo.set(node.id, value);
      return value;
    }

    return [...nodes].sort((a, b) => depth(a) - depth(b));
  }, []);

  const emitNodeCreate = useCallback(
    ({ node, nodeId, parentId, offset = 0 }) => {
      const layout = { ...(node.layout || {}) };
      layout.x = (layout.x || 0) + offset;
      layout.y = (layout.y || 0) + offset;

      emit({
        type: 'node.create',
        payload: {
          nodeId,
          nodeType: node.type || 'shape',
          parentId: parentId || null,
          initialProps: node.props || {},
          layout,
        },
      });

      if (node.style) {
        emit({
          type: 'node.style.update',
          payload: {
            nodeId,
            style: { ...node.style },
          },
        });
      }

      if (typeof node.content === 'string') {
        emit({
          type: 'text.content.update',
          payload: {
            nodeId,
            content: node.content,
          },
        });
      }
    },
    [emit]
  );

  const importNodesMap = useCallback(
    ({ nodesMap, replace = false, offset = 20, source = 'import' }) => {
      if (!nodesMap || Object.keys(nodesMap).length === 0) return;

      const currentState = getDesignStateAtCursor({
        events,
        uptoIndex: cursorIndex,
      });

      const existingIds = Object.keys(currentState.nodes || {});
      const nodes = orderNodesByParent(
        Object.values(nodesMap).filter(Boolean)
      );

      const idMap = new Map();
      nodes.forEach((node) => {
        idMap.set(node.id, replace ? node.id : createId());
      });

      canvasBus.emit('intent.edit.begin', { source });

      if (replace && existingIds.length) {
        existingIds.forEach((id) => {
          emit({
            type: 'node.delete',
            payload: { nodeId: id },
          });
        });
      }

      nodes.forEach((node) => {
        const nodeId = idMap.get(node.id);
        const parentId = node.parentId ? idMap.get(node.parentId) : null;
        emitNodeCreate({
          node,
          nodeId,
          parentId,
          offset: replace ? 0 : offset,
        });
      });

      canvasBus.emit('intent.edit.commit', {
        type: 'import',
        ids: Array.from(idMap.values()),
        source,
      });
    },
    [createId, emit, emitNodeCreate, events, cursorIndex, orderNodesByParent]
  );

  const handleImportJSON = useCallback(
    async (file, { replace = true } = {}) => {
      const data = await readJSONFile(file);
      if (!data?.nodes) return;
      importNodesMap({
        nodesMap: data.nodes,
        replace,
        source: replace ? 'import.json.replace' : 'import.json.merge',
      });
    },
    [importNodesMap]
  );

  const handleImportSVG = useCallback(
    async (file, { replace = false } = {}) => {
      if (!file) return;
      const text = await file.text();
      const nodes = parseSVG(text);
      if (!nodes.length) return;

      const nodesMap = {};
      nodes.forEach((node, index) => {
        nodesMap[`svg-${index}`] = node;
      });

      importNodesMap({
        nodesMap,
        replace,
        source: replace ? 'import.svg.replace' : 'import.svg.merge',
      });
    },
    [importNodesMap]
  );

  const cursor = {
    index: cursorIndex,
  };

  const replayState = useMemo(
    () =>
      getDesignStateAtCursor({
        events,
        uptoIndex: cursorIndex,
      }),
    [events, cursorIndex]
  );

  const workspace = (
      <WorkspaceLayout
        adapter={adapter}
        events={events}
        cursor={cursor}
        setCursorIndex={setCursorIndex}
        emit={emit}
        documentName={documentName}
        onSave={handleSave}
        onSaveAs={handleSaveAs}
        recentDocs={recentDocs}
        onOpenDocument={handleOpen}
        canPersist={persistenceEnabled}
        onImportJSONReplace={(file) => handleImportJSON(file, { replace: true })}
        onImportJSONMerge={(file) => handleImportJSON(file, { replace: false })}
        onImportSVGReplace={(file) => handleImportSVG(file, { replace: true })}
        onImportSVGMerge={(file) => handleImportSVG(file, { replace: false })}
        canImport={importEnabled}
        onOpenTemplateGenerator={templateGen.openGenerator}
        educationReadOnly={educationReadOnly}
        readOnly={effectiveReadOnly}
        documentRole={documentRole}
        documentId={documentId}
        intents={intents}
        reviewSubmission={reviewSubmission}
        reviewRubric={reviewRubric}
        onReviewDecision={onReviewDecision}
        onReviewCriteriaChange={onReviewCriteriaChange}
        reviewerId={reviewerId}
        presence={presence}
      />
  );

  return (
    <GridProvider>
      <ClipboardProvider>
        {modeId === 'education' ? (
          <EducationCursorProvider
            role={educationRole}
            initialLocked={educationInitialLocked}
          >
            {workspace}
          </EducationCursorProvider>
        ) : (
          workspace
        )}
        <TemplateGeneratorOverlay
          open={templateGen.open}
          onClose={templateGen.closeGenerator}
          state={replayState}
          events={events}
          mode={adapter}
        />
      </ClipboardProvider>
    </GridProvider>
  );
}
