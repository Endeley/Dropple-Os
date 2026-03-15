'use client';

import dynamic from 'next/dynamic';

const StackHandler = dynamic(
  () => import('@stackframe/stack').then((module) => module.StackHandler),
  { ssr: false }
);

export default function StackHandlerClient() {
  return <StackHandler fullPage />;
}
