import { StackHandler } from "@stackframe/stack";

const CHECKOUT_ENABLED =
  process.env.NEXT_PUBLIC_STACK_CHECKOUT_ENABLED === "true";

export default function Handler() {
  if (!CHECKOUT_ENABLED) {
    return null;
  }

  return <StackHandler fullPage />;
}
