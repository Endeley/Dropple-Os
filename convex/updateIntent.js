// convex/updateIntent.js

import { mutation } from './_generated/server';
import { v } from 'convex/values';

/**
 * Update remote intent preview (ghosts).
 *
 * 🔒 UI-only, ephemeral
 */
export const updateIntent = mutation({
    args: {
        docId: v.string(),
        userId: v.string(),
        intent: v.optional(
            v.object({
                type: v.string(),
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

    async handler(ctx, { docId, userId, intent }) {
        const now = Date.now();

        const existing = await ctx.db
            .query('presence')
            .withIndex('by_doc_user', (q) => q.eq('docId', docId).eq('userId', userId))
            .unique();

        if (!existing) return;

        await ctx.db.patch(existing._id, {
            intent,
            lastSeen: now,
        });
    },
});
