import React from 'react';
import { IRole } from '@/types/backend';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import Spinner from '@/components/Spinner';

interface RoleTableProps {
  roles: IRole[];
  meta: { current: number; pageSize: number; pages: number; total: number };
  isLoading: boolean;
  onEdit: (role: IRole) => void;
  onDelete: (role: IRole) => void;
  onPageChange: (page: number, pageSize?: number) => void;
}

const RoleTable: React.FC<RoleTableProps> = ({ roles, meta, isLoading, onEdit, onDelete, onPageChange }) => {

  const renderPagination = () => {
    const { current, pages, total, pageSize } = meta;
    if (total <= pageSize && pages <= 1) return null;

    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, current - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(pages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <nav className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">{(current - 1) * pageSize + 1}</span>
              {' '}đến <span className="font-medium">{Math.min(current * pageSize, total)}</span>
              {' '}trên <span className="font-medium">{total}</span> kết quả
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => onPageChange(current - 1)}
                disabled={current === 1}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                &lt;
              </button>
              {startPage > 1 && (
                <button onClick={() => onPageChange(1)} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">1</button>
              )}
              {startPage > 2 && (
                <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">...</span>
              )}
              {pageNumbers.map(number => (
                <button
                  key={number}
                  onClick={() => onPageChange(number)}
                  aria-current={current === number ? 'page' : undefined}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${current === number ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'}`}
                >
                  {number}
                </button>
              ))}
              {endPage < pages - 1 && (
                <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">...</span>
              )}
              {endPage < pages && (
                <button onClick={() => onPageChange(pages)} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">{pages}</button>
              )}
              <button
                onClick={() => onPageChange(current + 1)}
                disabled={current === pages || pages === 0}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                &gt;
              </button>
            </nav>
          </div>
        </div>
      </nav>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Vai trò</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cập nhật lần cuối</th>
            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả ngắn</th>
            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Số tài khoản người dùng </th>
            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {isLoading && (
            <tr>
              <td colSpan={7} className="text-center py-4">
                <Spinner />
              </td>
            </tr>
          )}
          {!isLoading && roles.length === 0 && (
            <tr>
              <td colSpan={7} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                Không tìm thấy vai trò nào.
              </td>
            </tr>
          )}
          {!isLoading && roles.map((role) => (
            <tr key={role._id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${role.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {role.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dayjs(role.createdAt).format('DD/MM/YYYY HH:mm')}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dayjs(role.updatedAt).format('DD/MM/YYYY HH:mm')}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {role.description || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                {role.userCount ?? 0}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                <button onClick={() => onEdit(role)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button onClick={() => onDelete(role)} className="text-red-600 hover:text-red-900">
                  <TrashIcon className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}

        </tbody>
      </table>
      {!isLoading && renderPagination()}
    </div>
  );
};

export default RoleTable;