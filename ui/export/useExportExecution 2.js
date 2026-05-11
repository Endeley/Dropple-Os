'use client';

import { useRef, useState } from 'react';
import { createExportExecutionService } from './exportExecutionService.js';

export function useExportExecution() {
    const serviceRef = useRef(null);
    if (!serviceRef.current) {
        serviceRef.current = createExportExecutionService();
    }

    const [serviceState, setServiceState] = useState(serviceRef.current.getState());

    function sync(nextResult = null) {
        if (nextResult && typeof nextResult.then === 'function') {
            return nextResult.then((resolved) => {
                setServiceState(serviceRef.current.getState());
                return resolved;
            });
        }
        setServiceState(serviceRef.current.getState());
        return nextResult;
    }

    return {
        serviceState,
        createWorkflow(args) {
            return sync(serviceRef.current.createWorkflow(args));
        },
        stepWorkflow(args) {
            return sync(serviceRef.current.stepWorkflow(args));
        },
        runWorkflow(args) {
            return sync(serviceRef.current.runWorkflow(args));
        },
        performWorkflow() {
            return sync(serviceRef.current.performWorkflow());
        },
        persist(metadata) {
            return sync(serviceRef.current.persist(metadata));
        },
        restore() {
            return sync(serviceRef.current.restore());
        },
        reset() {
            return sync(serviceRef.current.reset());
        },
    };
}
