// convex/appendEvents.js

import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { assertPermission } from './lib/assertPermission';
import { canEdit } from './lib/permissions';
import { writeAuditLog } from './lib/writeAuditLog';

/**
 * Append new events to Convex (idempotent).
 *
 * 🔒 Rules:
 * - Append-only
 * - Idempotent by eventId
 * - No branching logic here
 */
export const appendEvents = mutation({
    args: {
        docId: v.string(),
        branchId: v.string(),

        events: v.array(
            v.object({
                eventId: v.string(),
                type: v.string(),
                payload: v.any(),
                createdAt: v.number(),
            })
        ),
    },

    async handler(ctx, { docId, branchId, events }) {
        await assertPermission(ctx, {
            docId,
            userId: ctx.auth?.identity?.subject,
            allow: canEdit,
        });

        let appended = 0;

        for (const evt of events) {
            const exists = await ctx.db
                .query('events')
                .withIndex('by_eventId', (q) => q.eq('eventId', evt.eventId))
                .unique();

            if (exists) continue;

            await ctx.db.insert('events', {
                docId,
                branchId,
                eventId: evt.eventId,
                type: evt.type,
                payload: evt.payload,
                createdAt: evt.createdAt,
            });

            appended++;

            await writeAuditLog(ctx, {
                docId,
                actorId: ctx.auth?.identity?.subject,
                action: 'event.append',
                branchId,
                eventId: evt.eventId,
                meta: {
                    type: evt.type,
                },
            });
        }

        return { appended };
    },
});
