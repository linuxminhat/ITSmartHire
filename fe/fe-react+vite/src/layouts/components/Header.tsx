import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthActions } from '@/contexts/AuthActionContext';
import { ChevronDownIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { handleLogout } = useAuthActions();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const role = user?.role?.name;
  const profilePath = role === 'ADMIN' ? '/admin/profile' : role === 'HR' ? '/hr/profile' : '/';

  const onLogoutClick = async () => {
    setIsLoggingOut(true);
    try {
      await handleLogout();
    } catch (error) {
      console.error("Header Logout Error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isLoading = isAuthLoading || isLoggingOut;

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 flex-shrink-0 border-b border-gray-200">
      <div>
      </div>

      <div className="flex items-center space-x-4 relative">
        {user && (
          <div className="relative">
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <UserCircleIcon className="h-7 w-7 text-gray-500" />
              <span className="text-gray-700 text-sm font-medium hidden md:block">
                {user.name}
              </span>
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            </button>

            {isUserMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-50 py-1 border border-gray-200"
                onMouseLeave={() => setIsUserMenuOpen(false)}
              >
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <Link 
                  to={profilePath} 
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                   <UserCircleIcon className="h-5 w-5 mr-2 text-gray-400" />
                   Hồ sơ
                </Link>
                <button 
                  onClick={onLogoutClick}
                  disabled={isLoading} 
                  className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                  {isLoading ? 'Đang đăng xuất...' : 'Đăng xuất'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;