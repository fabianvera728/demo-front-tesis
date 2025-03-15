import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';

interface LocationState {
  from?: {
    pathname: string;
  };
}

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  // Get the previous location (if any)
  const from = (location.state as LocationState)?.from || { pathname: '/' };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(formData.email, formData.password);
      // Redirect to the page they were trying to access, or home if none
      navigate(from.pathname, { replace: true });
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Login</h1>
          <p className="text-sm text-gray-600">Sign in to your account</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="email"
            name="email"
            label="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            type="password"
            name="password"
            label="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <Button type="submit" variant="primary" fullWidth>
            Login
          </Button>
        </form>
        
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-6 border-t border-gray-200 text-sm">
          <button 
            className="text-blue-600 hover:text-blue-800 mb-2 sm:mb-0"
            onClick={() => navigate('/auth/forgot-password')}
          >
            Forgot Password?
          </button>
          <button 
            className="text-blue-600 hover:text-blue-800"
            onClick={() => navigate('/auth/register')}
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login; 