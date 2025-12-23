import React from 'react'
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({children}) => {
    const isAuthenticated = true;
    const loading = false;
    const location = useLocation();

    if(loading){
        return <div>Loading...</div>;
    }

    if(!isAuthenticated){
        return <Navigate to="/login" state={{from: location}} replace={true}/>;
    }
    return children;
}

export default ProtectedRoute