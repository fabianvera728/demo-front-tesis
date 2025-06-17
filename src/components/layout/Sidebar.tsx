import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import FeatherIcon from 'feather-icons-react';
import { useAuth } from '@/context/AuthContext';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <aside className="w-64 bg-white shadow-md h-full flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <Link to="/" className="text-gray-800 font-bold text-xl flex items-center">
          <FeatherIcon icon="database" className="mr-2 h-6 w-6" />
          DataHub
        </Link>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center mb-3">
          <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link 
            to="/profile" 
            className="flex-1 flex items-center justify-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded"
          >
            <FeatherIcon icon="user" className="mr-1 h-3 w-3" />
            Profile
          </Link>
          <Link 
            to="/settings" 
            className="flex-1 flex items-center justify-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded"
          >
            <FeatherIcon icon="settings" className="mr-1 h-3 w-3" />
            Settings
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-5 px-4 flex-grow">
        <div className="space-y-1">
          <NavLink 
            to="/datasets" 
            className={({ isActive }) => 
              isActive 
                ? 'bg-blue-100 text-blue-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md' 
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md'
            }
          >
            <FeatherIcon 
              icon="database" 
              className="mr-3 h-6 w-6 text-blue-500" 
            />
            Datasets
          </NavLink>

          <NavLink 
            to="/integrations" 
            className={({ isActive }) => 
              isActive 
                ? 'bg-blue-100 text-blue-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md' 
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md'
            }
          >
            <FeatherIcon 
              icon="link" 
              className="mr-3 h-6 w-6 text-blue-500" 
            />
            Integraciones
          </NavLink>

          <NavLink 
            to="/analytics" 
            className={({ isActive }) => 
              isActive 
                ? 'bg-blue-100 text-blue-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md' 
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md'
            }
          >
            <FeatherIcon 
              icon="bar-chart-2" 
              className="mr-3 h-6 w-6 text-blue-500" 
            />
            Analytics
          </NavLink>

          <NavLink 
            to="/reports" 
            className={({ isActive }) => 
              isActive 
                ? 'bg-blue-100 text-blue-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md' 
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md'
            }
          >
            <FeatherIcon 
              icon="file-text" 
              className="mr-3 h-6 w-6 text-blue-500" 
            />
            Reports
          </NavLink>

          <NavLink 
            to="/settings" 
            className={({ isActive }) => 
              isActive 
                ? 'bg-blue-100 text-blue-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md' 
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md'
            }
          >
            <FeatherIcon 
              icon="settings" 
              className="mr-3 h-6 w-6 text-blue-500" 
            />
            Settings
          </NavLink>
        </div>
      </nav>

      {/* Footer with logout button */}
      <div className="p-4 border-t border-gray-200 mt-auto">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center px-2 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
        >
          <FeatherIcon 
            icon="log-out" 
            className="mr-3 h-6 w-6 text-red-500" 
          />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar; 