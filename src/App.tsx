import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import AuthRoutes from '@/features/auth/AuthRoutes';
import DatasetRoutes from '@/features/datasets/DatasetRoutes';
import Layout from '@/components/layout/Layout';
import '@/app.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth routes (login, register, forgot password) */}
          <Route path="/auth/*" element={<AuthRoutes />} />
          
          {/* Protected routes with layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/datasets" replace />} />
            <Route path="/datasets/*" element={<DatasetRoutes />} />
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
