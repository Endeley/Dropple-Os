import { getConvexProvidersConfig } from "@stackframe/stack";

const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;

if (!projectId) {
  throw new Error("Missing NEXT_PUBLIC_STACK_PROJECT_ID for Convex auth");
}

export default {
  providers: getConvexProvidersConfig({
    projectId,
  }),
};
