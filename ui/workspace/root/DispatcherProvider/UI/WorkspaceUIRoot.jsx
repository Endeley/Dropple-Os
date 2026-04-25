'use client';

import { UXWarningBanner } from './UXWarningBanner.jsx';
import { UXConfirmModal } from './UXConfirmModal.jsx';
import { TemplatePublishDialogBridge } from './TemplatePublishDialogBridge.jsx';

export function WorkspaceUIRoot() {
    return (
        <>
            <UXWarningBanner />
            <UXConfirmModal />
            <TemplatePublishDialogBridge />
        </>
    );
}
