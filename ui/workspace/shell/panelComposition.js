export function resolveDesignGrammar(workspaceId) {
    if (workspaceId === 'uiux') return 'uiux';
    if (workspaceId === 'graphic' || workspaceId === 'branding' || workspaceId === 'icons') return 'graphic';
    return workspaceId || null;
}

export function hasSemanticMetadata(node) {
    const semantic = node?.props?.semantic ?? null;
    return Boolean(semantic?.tag || semantic?.role || semantic?.label);
}

export function isContentBearingNode(node) {
    if (!node) return false;
    return node.type === 'text' || node.type === 'image' || node.type === 'button';
}

export function isTypographyRelevant(node) {
    if (!node) return false;
    return node.type === 'text';
}

export function hasAutoLayoutContext(node) {
    if (!node) return false;
    return Boolean(node?.layout?.autoLayout) || (Array.isArray(node.children) && node.children.length > 0);
}

export function isMotionRelevant({ grammar, node, hasAttachedMotion }) {
    if (!node) return false;
    if (hasAttachedMotion || node.motion || node.props?.motion) return true;
    if (grammar !== 'uiux') return false;
    return ['frame', 'text', 'image', 'button'].includes(node.type);
}

export function isExportRelevant({ grammar, node }) {
    if (!node) return false;
    if (grammar === 'graphic') {
        return ['shape', 'vector', 'image', 'text', 'frame', 'group'].includes(node.type);
    }
    if (grammar === 'uiux') {
        return ['frame', 'group', 'image', 'button'].includes(node.type);
    }
    return false;
}

export function isSemanticsRelevant({ grammar, node }) {
    if (!node) return false;
    if (hasSemanticMetadata(node)) return true;
    if (grammar !== 'uiux') return false;
    return ['frame', 'text', 'image', 'button'].includes(node.type);
}

export function resolveInspectSections({
    panelIds = [],
    extras = [],
    node = null,
    workspaceId = null,
    hasAttachedMotion = false,
}) {
    const grammar = resolveDesignGrammar(workspaceId);
    const hasSelection = Boolean(node);
    const structure = hasSelection
        ? panelIds.filter((panelId) =>
              ['NodeHeaderPanel', 'SelectionActionsPanel', 'UIUXLanguageProjectionPanel'].includes(panelId),
          )
        : [];
    const layout = hasSelection
        ? panelIds.filter((panelId) => {
              if (panelId === 'LayoutInspector') return true;
              if (panelId === 'AutoLayoutPanel') return hasAutoLayoutContext(node);
              return false;
          })
        : [];
    const appearance = hasSelection ? panelIds.filter((panelId) => panelId === 'AppearancePanel') : [];
    const typography =
        hasSelection && isTypographyRelevant(node) ? panelIds.filter((panelId) => panelId === 'TypographyPanel') : [];
    const content = hasSelection && isContentBearingNode(node) ? panelIds.filter((panelId) => panelId === 'ContentPanel') : [];
    const semantics =
        hasSelection && isSemanticsRelevant({ grammar, node })
            ? panelIds.filter((panelId) => panelId === 'SemanticsPanel')
            : [];
    const motion =
        hasSelection && isMotionRelevant({ grammar, node, hasAttachedMotion })
            ? panelIds.filter((panelId) => panelId === 'MotionPanel')
            : [];
    const exportPanels =
        hasSelection && isExportRelevant({ grammar, node })
            ? panelIds.filter((panelId) => panelId === 'ExportPreviewPanel')
            : [];

    if (extras.length > 0) {
        motion.push('__extras__');
    }

    return [
        Object.freeze({ id: 'structure', title: 'Structure', panelIds: hasSelection ? structure : [] }),
        Object.freeze({ id: 'layout', title: 'Layout', panelIds: layout }),
        Object.freeze({ id: 'typography', title: 'Typography', panelIds: typography }),
        Object.freeze({ id: 'appearance', title: 'Appearance', panelIds: appearance }),
        Object.freeze({ id: 'content', title: 'Content', panelIds: content }),
        Object.freeze({ id: 'semantics', title: 'Semantics', panelIds: semantics }),
        Object.freeze({ id: 'motion', title: 'Motion', panelIds: motion }),
        Object.freeze({ id: 'export', title: 'Export', panelIds: exportPanels }),
    ].filter((section) => section.panelIds.length > 0);
}
