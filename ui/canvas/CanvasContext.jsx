'use client';

import { createContext, useContext } from 'react';

const CanvasContext = createContext({
    zoomTier: 'normal',
});

export function CanvasProvider({ value, children }) {
    return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
}

export function useCanvasContext() {
    return useContext(CanvasContext);
}

export { CanvasContext };
