'use client';

import { InspectorSection } from '../InspectorSection';

export function AnimationInspector() {
  return (
    <InspectorSection title="Animation">
      <div style={{ fontSize: 12, opacity: 0.6 }}>
        Select a property to add keyframes.
      </div>
    </InspectorSection>
  );
}
