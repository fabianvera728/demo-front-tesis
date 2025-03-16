import { Route, Routes } from 'react-router-dom';
import DatasetList from './pages/DatasetList';
import DatasetDetail from './pages/DatasetDetail';
import DatasetCreate from './pages/DatasetCreate';
import DatasetEdit from './pages/DatasetEdit';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

const DatasetRoutes = () => {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <DatasetList />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/create" 
        element={
          <ProtectedRoute>
            <DatasetCreate />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/:id" 
        element={
          <ProtectedRoute>
            <DatasetDetail />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/:id/edit" 
        element={
          <ProtectedRoute>
            <DatasetEdit />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default DatasetRoutes; 