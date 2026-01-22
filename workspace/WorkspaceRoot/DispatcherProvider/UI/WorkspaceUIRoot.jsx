'use client';

import { UXWarningBanner } from './UXWarningBanner.jsx';
import { UXConfirmModal } from './UXConfirmModal.jsx';

export function WorkspaceUIRoot() {
    return (
        <>
            <UXWarningBanner />
            <UXConfirmModal />
        </>
    );
}
