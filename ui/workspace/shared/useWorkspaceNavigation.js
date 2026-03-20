'use client';

import { useRouter } from 'next/navigation';

export function useWorkspaceNavigation() {
    const router = useRouter();

    function goToWorkspace(workspaceId) {
        router.push(`/workspace/${workspaceId}`);
    }

    function goToMode(workspaceId, modeId) {
        router.push(`/workspace/${workspaceId}?mode=${modeId}`);
    }

    return {
        goToWorkspace,
        goToMode,
    };
}
