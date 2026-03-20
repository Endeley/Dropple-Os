"use client";

import { ConvexProvider as BaseConvexProvider, ConvexReactClient } from "convex/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function ConvexProvider({ children }) {
  if (!convex) {
    return children;
  }

  return <BaseConvexProvider client={convex}>{children}</BaseConvexProvider>;
}
