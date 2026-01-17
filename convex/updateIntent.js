// convex/updateIntent.js

/**
 * N2 INVARIANT — LIVE AWARENESS ONLY
 *
 * Intent signals are advisory and non-authoritative.
 * They must never mutate document state or enforce locks.
 *
 * Any shared document mutation belongs to N3 and requires
 * an explicit design proposal before implementation.
 */

import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { getUserRole } from './_helpers/permissions';

/**
 * Update remote intent preview (ghosts).
 *
 * 🔒 UI-only, ephemeral
 */
export const updateIntent = mutation({
    args: {
        docId: v.string(),
        intent: v.optional(
            v.object({
                type: v.union(v.literal('move'), v.literal('resize')),
                nodeIds: v.array(v.string()),
                delta: v.optional(
                    v.object({
                        x: v.number(),
                        y: v.number(),
                    })
                ),
                resize: v.optional(
                    v.object({
                        width: v.number(),
                        height: v.number(),
                    })
                ),
            })
        ),
    },

    async handler(ctx, { docId, intent }) {
        // N2 invariant: intent is a courtesy signal only.
        // It must never be interpreted as a lock or authority.
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
            intent,
            lastSeen: now,
        });
    },
});
