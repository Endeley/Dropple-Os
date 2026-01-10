// DEV-ONLY seed script for local testing
// Run manually from Convex dashboard or temporary mutation

import { mutation } from "./_generated/server";

export const seedAssessments = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const samples = [
      {
        title: "Frontend Fundamentals Assessment",
        submittedBy: "alice@example.com",
        submittedAt: now - 1000 * 60 * 60 * 24,
        status: "submitted",
        responses: [
          {
            question: "What is React?",
            answer: "A JavaScript library for building user interfaces.",
          },
          {
            question: "What is a component?",
            answer: "A reusable piece of UI with its own logic and structure.",
          },
        ],
      },
      {
        title: "UI / UX Design Assessment",
        submittedBy: "bob@example.com",
        submittedAt: now - 1000 * 60 * 60 * 48,
        status: "under_review",
        responses: [
          {
            question: "What is usability?",
            answer: "How easy and intuitive a product is to use.",
          },
        ],
      },
      {
        title: "JavaScript Core Concepts",
        submittedBy: "carol@example.com",
        submittedAt: now - 1000 * 60 * 60 * 72,
        status: "submitted",
        responses: [
          {
            question: "Explain closures.",
            answer:
              "Closures allow a function to access variables from an outer scope.",
          },
        ],
      },
    ];

    for (const assessment of samples) {
      await ctx.db.insert("assessments", assessment);
    }

    return { inserted: samples.length };
  },
});

export const seedReviewers = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const reviewers = [
      { userId: "reviewer@example.com", role: "reviewer", createdAt: now },
      { userId: "admin@example.com", role: "admin", createdAt: now },
    ];

    for (const reviewer of reviewers) {
      await ctx.db.insert("reviewers", reviewer);
    }

    return { inserted: reviewers.length };
  },
});
