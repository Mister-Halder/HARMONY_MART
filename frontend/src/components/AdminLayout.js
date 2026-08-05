import React from 'react';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
      {/* We are intentionally not rendering the main Nav or Footer here so the admin panel feels like a truly separate application. */}
      <div style={{ padding: '20px' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
