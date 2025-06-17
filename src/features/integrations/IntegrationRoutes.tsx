import { Route, Routes } from 'react-router-dom';
import IntegrationList from './pages/IntegrationList';
import IntegrationCreate from './pages/IntegrationCreate';
import IntegrationDetail from './pages/IntegrationDetail';
import IntegrationEdit from './pages/IntegrationEdit';
import JobMonitor from './pages/JobMonitor';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

const IntegrationRoutes = () => {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <IntegrationList />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/create" 
        element={
          <ProtectedRoute>
            <IntegrationCreate />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/:id" 
        element={
          <ProtectedRoute>
            <IntegrationDetail />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/:id/edit" 
        element={
          <ProtectedRoute>
            <IntegrationEdit />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/jobs" 
        element={
          <ProtectedRoute>
            <JobMonitor />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default IntegrationRoutes; 