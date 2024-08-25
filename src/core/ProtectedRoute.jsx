import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ requiredPermission }) => {
  const { currentUser, user_type, userPermissions } = useAuth();

  console.log('currentUser:', currentUser);
  
  if (!currentUser) {
    // Redirect to login if the user is not authenticated
    return <Navigate to="/login" />;
  }


  if (user_type === 'admin') {
    // Grant access to all routes if the user is an admin
    console.log('User is an admin, granting full access');
    return <Outlet />;
  }

  if (user_type === 'moderator') {
    if (!requiredPermission || userPermissions[requiredPermission]) {
      // Grant access if the user is a moderator with the required permission
      console.log(`User is a moderator with permission to access ${requiredPermission || 'dashboard'}`);
      return <Outlet />;
    }
  }

  // Redirect to the no-access page if the user doesn't have the required permission
  console.log('User does not have permission to access this route');
  return <Navigate to="/no-access" />;
};

export default ProtectedRoute;
