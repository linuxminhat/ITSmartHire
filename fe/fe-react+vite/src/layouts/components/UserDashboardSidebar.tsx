import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IUser } from '@/types/backend';
import { 
    Squares2X2Icon, 
    DocumentArrowUpIcon, 
    IdentificationIcon, 
    BriefcaseIcon, 
} from '@heroicons/react/24/outline';
import { HandRaisedIcon } from '@heroicons/react/24/solid'; 

interface UserDashboardSidebarProps {
  user: IUser | null; 
}

const UserDashboardSidebar: React.FC<UserDashboardSidebarProps> = ({ user }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    { path: '/dashboard', label: 'Tổng quan', icon: Squares2X2Icon },
    { path: '/resumes/attached', label: 'Hồ sơ đính kèm', icon: DocumentArrowUpIcon },
    { path: '/profile', label: 'Hồ sơ', icon: IdentificationIcon }, 
    { path: '/jobs/applied', label: 'Việc làm của tôi', icon: BriefcaseIcon },
  ];

  const baseItemClass = "flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors duration-150";
  const inactiveItemClass = "text-gray-600 hover:bg-gray-100 hover:text-gray-900";
  const activeItemClass = "bg-red-100 text-red-700 font-semibold";

  return (
    <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200 h-full">
      {/* User Greeting */}
      <div className="mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center mb-1">
             <HandRaisedIcon className="h-5 w-5 text-yellow-500 mr-1.5" />
             <span className="text-xs text-gray-500">Xin chào</span>
        </div>
        <h2 className="text-lg font-bold text-gray-800 truncate">{user?.name || 'Người dùng'}</h2>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`${baseItemClass} ${isActive ? activeItemClass : inactiveItemClass}`}
            >
              <Icon className={`h-5 w-5 mr-3 flex-shrink-0 ${isActive ? 'text-red-600' : 'text-gray-500'}`} />
              <span className="flex-grow">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default UserDashboardSidebar; 