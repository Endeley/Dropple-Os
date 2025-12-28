"use client";

import { ConvexProvider as BaseConvexProvider, ConvexReactClient } from "convex/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL for Convex client");
}

const convex = new ConvexReactClient(convexUrl);

export function ConvexProvider({ children }) {
  return <BaseConvexProvider client={convex}>{children}</BaseConvexProvider>;
}
