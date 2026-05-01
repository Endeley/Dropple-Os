'use client';

import { useEffect, useRef } from 'react';
import { useDispatcher } from '@/runtime/boundary/DispatcherContext.jsx';
import { activateResolvedTemplateEnvironment } from '@/runtime/templates/activateResolvedTemplateEnvironment.js';

export default function ViewerEnvironmentBridge({
  resolvedEnvironment = null,
}) {
  const dispatcher = useDispatcher();
  const activatedRef = useRef(false);

  useEffect(() => {
    if (activatedRef.current) return;
    if (!dispatcher?.hydrateRuntimeState) return;
    if (!resolvedEnvironment || typeof resolvedEnvironment !== 'object') return;

    activateResolvedTemplateEnvironment({
      resolved: resolvedEnvironment,
      dispatcher,
      animate: false,
    });
    activatedRef.current = true;
  }, [dispatcher, resolvedEnvironment]);

  return null;
}
