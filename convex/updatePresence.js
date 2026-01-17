// convex/updatePresence.js

/**
 * N2 INVARIANT — LIVE AWARENESS ONLY
 *
 * Presence is advisory and non-authoritative.
 * It must never mutate document state or enforce locks.
 *
 * Any shared document mutation belongs to N3 and requires
 * an explicit design proposal before implementation.
 */

import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { getUserRole } from './_helpers/permissions';

/**
 * Update user presence for a document.
 *
 * 🔒 Rules:
 * - Overwrite-only
 * - No history
 * - No side effects
 */
export const updatePresence = mutation({
    args: {
        docId: v.string(),
    },

    async handler(ctx, args) {
        // N2 invariant: presence updates are best-effort and non-blocking.
        // Failures must be silent and must not affect editor behavior.
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return;
        }

        const role = await getUserRole(ctx, args.docId);
        if (role !== 'owner' && role !== 'editor') {
            return;
        }

        const now = Date.now();
        const name = identity.name ?? identity.email ?? 'Anonymous';

        const existing = await ctx.db
            .query('presence')
            .withIndex('by_doc_user', (q) =>
                q.eq('docId', args.docId).eq('userId', identity.subject)
            )
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                name,
                lastSeen: now,
            });
        } else {
            await ctx.db.insert('presence', {
                docId: args.docId,
                userId: identity.subject,
                name,
                lastSeen: now,
            });
        }
    },
});
