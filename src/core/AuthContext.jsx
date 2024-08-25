import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, firestore } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore functions

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [user_type, setUserType] = useState(null);
  const [userPermissions, setUserPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user);
        const userRef = doc(firestore, 'users', user.uid); // Get a reference to the user's document
        const userDoc = await getDoc(userRef); // Fetch the document

        if (userDoc.exists()) {
          const userData = userDoc.data();

          setUserType(userData.user_type);

          if (userData.user_type === 'moderator' && userData.moderator_role) {
            const roleRef = doc(firestore, 'moderator_roles', userData.moderator_role); // Get a reference to the role document
            const roleDoc = await getDoc(roleRef); // Fetch the document

            if (roleDoc.exists()) {
              setUserPermissions(roleDoc.data()); // Set the permissions
            }
          }
        }
      } else {
        setCurrentUser(null);
        setUserPermissions({});
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userPermissions,
    user_type,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
