import React from 'react';
import { IUser } from '@/types/backend';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';

interface UserTableProps {
  users: IUser[];
  meta: { current: number; pageSize: number; total: number, pages: number };
  isLoading: boolean;
  onEdit: (user: IUser) => void;
  onDelete: (user: IUser) => void;
  onView: (user: IUser) => void;
  onPageChange: (page: number, pageSize?: number) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, meta, isLoading, onEdit, onDelete, onView, onPageChange }) => {
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
  const handleDeleteClick = (user: IUser) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${user.name}"?`)) {
      onDelete(user);
    }
  };
  const getRoleColor = (role: any) => {
    const name = typeof role === 'object' ? role.name : role;

    switch (name?.toUpperCase()) {
      case 'ADMIN':
        return 'bg-red-100 text-red-700';
      case 'HR':
        return 'bg-yellow-100 text-yellow-700';
      case 'USER':
      default:
        return 'bg-indigo-100 text-indigo-700';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            )}
            {!isLoading && users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Không tìm thấy người dùng nào.
                </td>
              </tr>
            )}
            {!isLoading && users.map((user, index) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(meta.current - 1) * meta.pageSize + index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <button onClick={() => onView(user)} className="text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none">
                    {user.name}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={
                      `px-3 py-1 rounded-full text-xs font-semibold ` +
                      getRoleColor(user.role)
                    }
                  >
                    {typeof user.role === 'object' ? user.role.name : user.role}
                  </span>
                </td>
                {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{typeof user.role === 'object' ? user.role.name : user.role}</td> */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {dayjs(user.createdAt).format('DD/MM/YYYY HH:mm')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-3">
                  <button
                    onClick={() => onView(user)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    title="Xem chi tiết"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onEdit(user)}
                    className="text-indigo-600 hover:text-indigo-900 focus:outline-none"
                    title="Sửa"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(user)}
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
      {!isLoading && renderPagination()}
    </div>
  );
};

export default UserTable; 