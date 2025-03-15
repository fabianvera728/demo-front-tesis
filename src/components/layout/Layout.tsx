import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const Layout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" text="Loading application..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="flex flex-row h-screen">
        <Sidebar />
        <main className="flex-1 p-8 md:p-10 lg:p-12 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout; 