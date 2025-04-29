import React from 'react';
import Breadcrumb from '@/components/shared/Breadcrumb';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

const ManageResumesPage: React.FC = () => {
  const breadcrumbItems = [
    { label: 'Quản lý Hồ sơ', icon: DocumentTextIcon },
  ];

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full">
      <Breadcrumb items={breadcrumbItems} />

      <div className="bg-white p-6 rounded-lg shadow-sm mt-6">
        <h2 className="text-xl font-semibold mb-4">Danh sách Hồ sơ ứng tuyển</h2>
        <div className="text-center py-10 text-gray-500">
          Tính năng quản lý hồ sơ đang được phát triển.
        </div>
      </div>
    </div>
  );
};

export default ManageResumesPage; 