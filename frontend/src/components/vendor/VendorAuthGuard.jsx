import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const VendorAuthGuard = () => {
  const token = localStorage.getItem('vendor_token');
  const flag = localStorage.getItem('vendor_auth') === 'true';
  const isVendorAuthenticated = Boolean(token) || flag;

  if (!isVendorAuthenticated) {
    return <Navigate to="/vendor/login" replace />;
  }

  return <Outlet />;
};

export default VendorAuthGuard;
