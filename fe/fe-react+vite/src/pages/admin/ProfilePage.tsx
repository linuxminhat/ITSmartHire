import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Hồ sơ cá nhân</h1>
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">Họ và tên</label>
            <p className="mt-1 text-lg text-gray-900">{user?.name || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Email</label>
            <p className="mt-1 text-lg text-gray-900">{user?.email || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Vai trò</label>
            <p className="mt-1 text-lg text-gray-900 capitalize">{user?.role?.name?.toLowerCase() || 'N/A'}</p>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
              <button 
                type="button"
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Chỉnh sửa thông tin
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;