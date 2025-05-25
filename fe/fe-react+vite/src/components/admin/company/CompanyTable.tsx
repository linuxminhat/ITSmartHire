import React from 'react';
import { ICompany } from '@/types/backend';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import Spinner from '@/components/Spinner';

interface CompanyTableProps {
  companies: ICompany[];
  meta: { current: number; pageSize: number; total: number };
  isLoading: boolean;
  onEdit: (company: ICompany) => void;
  onDelete: (company: ICompany) => void;
  onPageChange?: (page: number, pageSize?: number) => void;
}

const CompanyTable: React.FC<CompanyTableProps> = ({ companies, meta, isLoading, onEdit, onDelete, onPageChange }) => {

  const handleDeleteClick = (company: ICompany) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa công ty "${company.name}"?`)) {
      onDelete(company);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logo</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Công ty</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Địa chỉ</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quốc gia</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lĩnh vực</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quy mô</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading && (
              <tr>
                <td colSpan={7} className="text-center py-4"><Spinner /></td>
              </tr>
            )}
            {!isLoading && companies.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">Không tìm thấy công ty nào.</td>
              </tr>
            )}
            {!isLoading && companies.map((company, index) => (
              <tr key={company._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(meta.current - 1) * meta.pageSize + index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img src={company.logo} alt={company.name} className="h-10 w-10 object-contain rounded-full" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{company.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.address}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.country || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.industry || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.companySize || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {dayjs(company.createdAt).format('DD/MM/YYYY HH:mm')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-3">
                  <button 
                    onClick={() => onEdit(company)} 
                    className="text-indigo-600 hover:text-indigo-900 focus:outline-none"
                    title="Sửa"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(company)} 
                    className="text-red-600 hover:text-red-900 focus:outline-none"
                    title="Xóa"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompanyTable; 