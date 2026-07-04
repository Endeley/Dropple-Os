'use client';

import { useContext } from 'react';
import { DispatcherContext } from '@/runtime/boundary/DispatcherContext.jsx';

export function RuntimeDispatchRelay({ children = null }) {
    const dispatcher = useContext(DispatcherContext);
    return typeof children === 'function' ? children(dispatcher) : children;
}
