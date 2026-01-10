// convex/schema.js

import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

/**
 * Convex Persistence Schema
 *
 * 🔒 Rules:
 * - Convex stores DURABLE state only
 * - Runtime state is NOT mirrored live
 * - IDs are opaque strings (generated at creation boundary)
 */

export default defineSchema({
    documents: defineTable({
        docId: v.string(), // canonical document ID
        createdAt: v.number(),
        updatedAt: v.number(),

        // Current active branch name
        currentBranch: v.string(),
    }).index('by_docId', ['docId']),

    branches: defineTable({
        docId: v.string(), // owning document
        branchId: v.string(), // e.g. "main", "experiment-1"
        base: v.optional(v.string()),

        createdAt: v.number(),
    })
        .index('by_doc', ['docId'])
        .index('by_doc_branch', ['docId', 'branchId']),

    events: defineTable({
        docId: v.string(),
        branchId: v.string(),

        eventId: v.string(), // CANONICAL EVENT ID
        type: v.string(),
        payload: v.any(),

        createdAt: v.number(),
    })
        .index('by_doc_branch', ['docId', 'branchId'])
        .index('by_eventId', ['eventId']),

    timelines: defineTable({
        docId: v.string(),
        timelineId: v.string(), // usually "default"
        data: v.any(), // serialized timeline model

        updatedAt: v.number(),
    }).index('by_doc', ['docId']),

    markers: defineTable({
        docId: v.string(),
        markerId: v.string(),
        time: v.number(),
        label: v.string(),

        createdAt: v.number(),
    }).index('by_doc', ['docId']),

    presence: defineTable({
        docId: v.string(),
        userId: v.string(),

        // UI-only metadata
        name: v.optional(v.string()),
        color: v.optional(v.string()),

        // last known activity
        lastSeen: v.number(),
        x: v.optional(v.number()),
        y: v.optional(v.number()),
        selectedNodeIds: v.optional(v.array(v.string())),
        intent: v.optional(
            v.object({
                type: v.string(), // 'move' | 'resize'
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
    })
        .index('by_doc', ['docId'])
        .index('by_doc_user', ['docId', 'userId']),

    documentMembers: defineTable({
        docId: v.string(),
        userId: v.string(),
        role: v.union(v.literal('owner'), v.literal('editor'), v.literal('viewer')),
        createdAt: v.number(),
    })
        .index('by_doc', ['docId'])
        .index('by_doc_user', ['docId', 'userId']),

    auditLogs: defineTable({
        docId: v.string(),
        actorId: v.string(),
        action: v.string(),
        branchId: v.optional(v.string()),
        eventId: v.optional(v.string()),
        meta: v.optional(v.any()),
        createdAt: v.number(),
    })
        .index('by_doc', ['docId'])
        .index('by_doc_time', ['docId', 'createdAt']),

    tasks: defineTable({
        text: v.string(),
    }),

    assessments: defineTable({
        title: v.string(),
        submittedBy: v.string(),
        submittedAt: v.number(),
        status: v.union(
            v.literal('submitted'),
            v.literal('under_review'),
            v.literal('approved'),
            v.literal('rejected')
        ),
        responses: v.array(
            v.object({
                question: v.string(),
                answer: v.string(),
            })
        ),
        review: v.optional(
            v.object({
                reviewerId: v.string(),
                reviewedAt: v.number(),
                decision: v.union(v.literal('approved'), v.literal('rejected')),
                notes: v.optional(v.string()),
            })
        ),
    }).index('by_status', ['status']),

    reviewers: defineTable({
        userId: v.string(),
        role: v.union(v.literal('reviewer'), v.literal('admin')),
        createdAt: v.number(),
    }).index('by_userId', ['userId']),

    certificates: defineTable({
        certificateId: v.string(),
        assessmentId: v.id('assessments'),
        issuedTo: v.string(),
        issuedBy: v.string(),
        issuedAt: v.number(),
        reviewSnapshot: v.object({
            reviewerId: v.string(),
            reviewedAt: v.number(),
            decision: v.literal('approved'),
        }),
        verificationHash: v.string(),
    })
        .index('by_certificateId', ['certificateId'])
        .index('by_assessment', ['assessmentId']),
});
