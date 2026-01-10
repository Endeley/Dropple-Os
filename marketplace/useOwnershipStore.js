'use client';

import { createContext, useContext, useState } from 'react';

const OwnershipContext = createContext(null);

export function OwnershipProvider({ children }) {
  const [ownerships, setOwnerships] = useState([]);

  function grantOwnership(record) {
    setOwnerships((o) => [...o, record]);
  }

  function hasOwnership(userId, artifactId) {
    return ownerships.some(
      (o) => o.userId === userId && o.artifactId === artifactId
    );
  }

  return (
    <OwnershipContext.Provider
      value={{ ownerships, grantOwnership, hasOwnership }}
    >
      {children}
    </OwnershipContext.Provider>
  );
}

export function useOwnership() {
  return useContext(OwnershipContext);
}
