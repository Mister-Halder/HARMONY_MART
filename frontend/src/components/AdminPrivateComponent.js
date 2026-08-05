import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminPrivateComponent = () => {
    const auth = localStorage.getItem('user');
    let user = null;
    try {
        user = auth ? JSON.parse(auth) : null;
    } catch (e) {
        user = null;
    }

    // Only allow access if user is logged in AND is an admin
    return user && user.role === 'admin' ? <Outlet /> : <Navigate to="/" />;
};

export default AdminPrivateComponent;
