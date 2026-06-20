import { NodeHeaderPanel } from '@/ui/inspector/NodeHeaderPanel.jsx';
import LayoutInspector from '@/ui/inspector/LayoutInspector.jsx';
import { AutoLayoutPanel } from '@/ui/inspector/AutoLayoutPanel.jsx';
import { AppearancePanel } from '@/ui/inspector/AppearancePanel.jsx';
import { ContentPanel } from '@/ui/inspector/ContentPanel.jsx';
import { SemanticsPanel } from '@/ui/inspector/SemanticsPanel.jsx';
import { MotionPanel } from '@/ui/inspector/MotionPanel.jsx';
import { SelectionActionsPanel } from '@/ui/inspector/SelectionActionsPanel.jsx';
import { ExportPreviewPanel } from '@/ui/inspector/ExportPreviewPanel.jsx';

import { InspectorPanel } from '@/ui/panels/InspectorPanel.jsx';
import { CanvasSurfacePanel } from '@/ui/workspace/ux/panels/CanvasSurfacePanel.jsx';
import { CertifiedTemplatesPanel } from '@/ui/workspace/ux/panels/CertifiedTemplatesPanel.jsx';

/* --- dormant uiux panels now promoted --- */

import { UXValidationPanel } from '@/ui/workspace/ux/panels/UXValidationPanel.jsx';
import { UXSuggestionsPanel } from '@/ui/workspace/ux/panels/UXSuggestionsPanel.jsx';
import { UXRiskImpactPanel } from '@/ui/workspace/ux/panels/UXRiskImpactPanel.jsx';
import { UXEventListPanel } from '@/ui/workspace/ux/panels/UXEventListPanel.jsx';

export const PanelRegistry = {
    /* ---------------------------------- */
    /* Core Inspector Stack               */
    /* ---------------------------------- */

    InspectorPanel: {
        id: 'InspectorPanel',
        component: InspectorPanel,
    },

    NodeHeaderPanel: {
        id: 'NodeHeaderPanel',
        component: NodeHeaderPanel,
    },

    SelectionActionsPanel: {
        id: 'SelectionActionsPanel',
        component: SelectionActionsPanel,
    },

    LayoutInspector: {
        id: 'LayoutInspector',
        component: LayoutInspector,
    },

    AutoLayoutPanel: {
        id: 'AutoLayoutPanel',
        component: AutoLayoutPanel,
    },

    AppearancePanel: {
        id: 'AppearancePanel',
        component: AppearancePanel,
    },

    ContentPanel: {
        id: 'ContentPanel',
        component: ContentPanel,
    },

    SemanticsPanel: {
        id: 'SemanticsPanel',
        component: SemanticsPanel,
    },

    MotionPanel: {
        id: 'MotionPanel',
        component: MotionPanel,
    },

    ExportPreviewPanel: {
        id: 'ExportPreviewPanel',
        component: ExportPreviewPanel,
    },

    /* ---------------------------------- */
    /* UIUX Authoring Panels              */
    /* ---------------------------------- */

    CanvasSurfacePanel: {
        id: 'CanvasSurfacePanel',
        component: CanvasSurfacePanel,
    },

    UXValidationPanel: {
        id: 'UXValidationPanel',
        component: UXValidationPanel,
    },

    UXSuggestionsPanel: {
        id: 'UXSuggestionsPanel',
        component: UXSuggestionsPanel,
    },

    UXRiskImpactPanel: {
        id: 'UXRiskImpactPanel',
        component: UXRiskImpactPanel,
    },

    UXEventListPanel: {
        id: 'UXEventListPanel',
        component: UXEventListPanel,
    },

    CertifiedTemplatesPanel: {
        id: 'CertifiedTemplatesPanel',
        component: CertifiedTemplatesPanel,
    },
};
