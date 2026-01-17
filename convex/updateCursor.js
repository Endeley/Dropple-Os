// convex/updateCursor.js

/**
 * N2 INVARIANT — LIVE AWARENESS ONLY
 *
 * Cursor updates are advisory and non-authoritative.
 * They must never mutate document state or enforce locks.
 *
 * Any shared document mutation belongs to N3 and requires
 * an explicit design proposal before implementation.
 */

import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { getUserRole } from './_helpers/permissions';

/**
 * Update live cursor position.
 *
 * 🔒 UI-only, ephemeral
 */
export const updateCursor = mutation({
    args: {
        docId: v.string(),
        x: v.number(),
        y: v.number(),
    },

    async handler(ctx, { docId, x, y }) {
        // N2 invariant: cursor updates are best-effort and non-blocking.
        // Failures must be silent and must not affect editor behavior.
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const role = await getUserRole(ctx, docId);
        if (role !== 'owner' && role !== 'editor') return;

        const now = Date.now();

        const existing = await ctx.db
            .query('presence')
            .withIndex('by_doc_user', (q) =>
                q.eq('docId', docId).eq('userId', identity.subject)
            )
            .unique();

        if (!existing) return;

        await ctx.db.patch(existing._id, {
            x,
            y,
            lastSeen: now,
        });
    },
});
