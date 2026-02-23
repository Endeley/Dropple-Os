import { NodeHeaderPanel } from '@/ui/inspector/NodeHeaderPanel.jsx';
import LayoutInspector from '@/ui/inspector/LayoutInspector.jsx';
import { AutoLayoutPanel } from '@/ui/inspector/AutoLayoutPanel.jsx';
import { ContentPanel } from '@/ui/inspector/ContentPanel.jsx';
import { SemanticsPanel } from '@/ui/inspector/SemanticsPanel.jsx';
import { MotionPanel } from '@/ui/inspector/MotionPanel.jsx';
import { ExportPreviewPanel } from '@/ui/inspector/ExportPreviewPanel.jsx';
import { InspectorPanel } from '@/ui/panels/InspectorPanel.jsx';
import { CanvasSurfacePanel } from '@/ui/workspace/ux/panels/CanvasSurfacePanel.jsx';

export const PanelRegistry = {
    InspectorPanel: { id: 'InspectorPanel', component: InspectorPanel },
    NodeHeaderPanel: { id: 'NodeHeaderPanel', component: NodeHeaderPanel },
    LayoutInspector: { id: 'LayoutInspector', component: LayoutInspector },
    AutoLayoutPanel: { id: 'AutoLayoutPanel', component: AutoLayoutPanel },
    ContentPanel: { id: 'ContentPanel', component: ContentPanel },
    SemanticsPanel: { id: 'SemanticsPanel', component: SemanticsPanel },
    MotionPanel: { id: 'MotionPanel', component: MotionPanel },
    ExportPreviewPanel: { id: 'ExportPreviewPanel', component: ExportPreviewPanel },
    CanvasSurfacePanel: { id: 'CanvasSurfacePanel', component: CanvasSurfacePanel },
};
