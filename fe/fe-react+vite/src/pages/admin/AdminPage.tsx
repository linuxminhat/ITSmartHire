import React from 'react';
import { 
  UsersIcon, 
  BuildingOffice2Icon, 
  BriefcaseIcon, 
  DocumentTextIcon 
} from '@heroicons/react/24/outline';

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}> = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-lg shadow p-5 flex items-center space-x-4">
    <div className={`p-3 rounded-full ${color}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

const AdminPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Bảng điều khiển</h1>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Tổng số Người dùng"
          value="1,234"
          icon={UsersIcon}
          color="bg-blue-500"
        />
        <StatCard 
          title="Tổng số Công ty"
          value="56"
          icon={BuildingOffice2Icon}
          color="bg-purple-500"
        />
        <StatCard 
          title="Tổng số Việc làm"
          value="450"
          icon={BriefcaseIcon}
          color="bg-green-500"
        />
        <StatCard 
          title="Tổng số Hồ sơ CV"
          value="2,890"
          icon={DocumentTextIcon}
          color="bg-yellow-500"
        />
      </div>
      <div className="mt-8">
        <div className="bg-white rounded-lg shadow p-6">
           <h2 className="text-lg font-semibold text-gray-700 mb-4">Hoạt động gần đây</h2>
           <p className="text-gray-600">Chưa có hoạt động nào.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPage; 