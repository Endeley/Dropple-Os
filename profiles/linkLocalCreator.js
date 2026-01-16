import { getCurrentCreatorId } from '@/profiles/currentCreator';

const LINK_KEY = 'dropple.creator.link';

export function linkLocalCreatorToUser(userId) {
    if (typeof window === 'undefined') return;
    if (!userId) return;
    const localCreatorId = getCurrentCreatorId();
    const payload = {
        userId,
        localCreatorId,
        linkedAt: Date.now(),
    };
    window.localStorage.setItem(LINK_KEY, JSON.stringify(payload));
    return payload;
}
