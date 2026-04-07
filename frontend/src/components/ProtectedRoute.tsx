import type { ReactNode } from 'react';
import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * A wrapper component that redirects users to the login page
 * if they are not authenticated.
 */
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const auth = useContext(AuthContext);
    const location = useLocation();

    if (auth?.loading) {
        // Return nothing or a small spinner while checking auth status
        return null;
    }

    if (!auth?.user) {
        // Redirect to login but save the current location they tried to access
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
