import React from 'react';
import {Navigate, Outlet} from 'react-router-dom'

const PrivateComponent=()=>{
    const auth = localStorage.getItem('user');
    let user = null;
    try {
        user = auth ? JSON.parse(auth) : null;
    } catch (e) {
        user = null;
    }
    return user ? <Outlet /> : <Navigate to="/signup" />
}

export default PrivateComponent