'use client';

import { useState } from 'react';
import { UXValidationPanel } from './panels/UXValidationPanel.jsx';
import { UXSuggestionsPanel } from './panels/UXSuggestionsPanel.jsx';
import { UIUXInspectorPanel } from './panels/UIUXInspectorPanel.jsx';

const TAB_INSPECTOR = 'inspector';
const TAB_VALIDATION = 'validation';
const TAB_SUGGESTIONS = 'suggestions';

export function UIUXRightPanel() {
  const [activeTab, setActiveTab] = useState(TAB_INSPECTOR);

  return (
    <aside className="uiux-rightpanel">
      <div className="panel-tabs">
        <button
          className={activeTab === TAB_INSPECTOR ? 'active' : undefined}
          onClick={() => setActiveTab(TAB_INSPECTOR)}
          type="button"
        >
          Inspector
        </button>
        <button
          className={activeTab === TAB_VALIDATION ? 'active' : undefined}
          onClick={() => setActiveTab(TAB_VALIDATION)}
          type="button"
        >
          Validation
        </button>
        <button
          className={activeTab === TAB_SUGGESTIONS ? 'active' : undefined}
          onClick={() => setActiveTab(TAB_SUGGESTIONS)}
          type="button"
        >
          Suggestions
        </button>
      </div>

      <div className="panel-content">
        {activeTab === TAB_INSPECTOR && (
          <UIUXInspectorPanel />
        )}
        {activeTab === TAB_VALIDATION && <UXValidationPanel />}
        {activeTab === TAB_SUGGESTIONS && <UXSuggestionsPanel />}
      </div>
    </aside>
  );
}
