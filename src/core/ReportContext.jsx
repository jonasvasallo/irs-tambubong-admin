import React, { createContext, useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { firestore } from '../config/firebase';

export const ReportContext = createContext();

export const ReportProvider = ({ children }) => {
  const [reportInitialDocIds, setReportInitialDocIds] = useState(new Set());

  useEffect(() => {
    const incidentCollection = collection(firestore, 'incidents');
    const unsubscribe = onSnapshot(incidentCollection, (snapshot) => {
      const newDocIds = new Set();

      snapshot.docs.forEach((doc) => {
        newDocIds.add(doc.id);
      });

      setReportInitialDocIds(newDocIds);
    });

    return () => unsubscribe();
  }, []);

  return (
    <ReportContext.Provider value={reportInitialDocIds}>
      {children}
    </ReportContext.Provider>
  );
};
