
import React, { useState } from 'react';
import AdminLogin from '../components/AdminLogin';
import AdminDashboard from '../components/AdminDashboard';
import Header from '../components/Header';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState<{ username: string; password: string } | null>(null);

  const handleLogin = (credentials: { username: string; password: string }) => {
    setAdminUser(credentials);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setAdminUser(null);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return<><Header/><AdminLogin onLogin={handleLogin} /></> ;
  }

  return <><Header/><AdminDashboard onLogout={handleLogout} /></>;
};

export default Admin;
