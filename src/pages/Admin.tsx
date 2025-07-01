
import React, { useState } from 'react';
import AdminLogin from '../components/AdminLogin';
import AdminDashboard from '../components/AdminDashboard';
import Layout from '../components/Layout';

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

  return (
    <Layout>
      {isAuthenticated ? (
        <AdminDashboard onLogout={handleLogout} adminUser={adminUser} />
      ) : (
        <AdminLogin onLogin={handleLogin} />
      )}
    </Layout>
  );
};

export default Admin;
