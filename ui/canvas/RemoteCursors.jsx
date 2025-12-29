'use client';

import { usePresenceStore } from '@/collab/presenceStore';

export default function RemoteCursors() {
    const cursors = usePresenceStore((s) => s.cursors);
    const users = usePresenceStore((s) => s.users);

    return Object.entries(cursors).map(([id, pos]) => {
        const user = users[id];
        if (!user) return null;

        return (
            <div
                key={id}
                style={{
                    position: 'absolute',
                    left: pos.x,
                    top: pos.y,
                    pointerEvents: 'none',
                    color: user.color,
                    fontSize: 12,
                }}>
                ⬤ {user.name}
            </div>
        );
    });
}
