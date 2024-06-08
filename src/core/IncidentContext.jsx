import React, { createContext, useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { firestore } from '../config/firebase';

export const IncidentContext = createContext();

export const IncidentProvider = ({ children }) => {
  const [initialDocIds, setInitialDocIds] = useState(new Set());

  useEffect(() => {
    const sosCollection = collection(firestore, 'sos');
    const unsubscribe = onSnapshot(sosCollection, (snapshot) => {
      const newDocIds = new Set();

      snapshot.docs.forEach((doc) => {
        newDocIds.add(doc.id);
      });

      setInitialDocIds(newDocIds);
    });

    return () => unsubscribe();
  }, []);

  return (
    <IncidentContext.Provider value={initialDocIds}>
      {children}
    </IncidentContext.Provider>
  );
};
