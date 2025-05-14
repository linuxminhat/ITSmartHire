import React from 'react';
import { ICategory } from '@/types/backend';
import { PencilIcon, TrashIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import Spinner from '@/components/Spinner';

interface CategoryTableProps {
  categories: ICategory[];
  meta: { current: number; pageSize: number; pages: number; total: number };
  isLoading: boolean;
  onEdit: (category: ICategory) => void;
  onDelete: (category: ICategory) => void;
  onPageChange: (page: number, pageSize?: number) => void;
  onSortRecruit: () => void;
}
const categoryColor: Record<string, string> = {           // 🆕 tuỳ chỉnh thêm
  JavaProgramming: 'bg-orange-100  text-orange-700',
  PythonProgramming: 'bg-green-100 text-green-700',
  JavaScriptProgramming: 'bg-yellow-100  text-yellow-800',
  CProgramming: 'bg-slate-100   text-slate-700',
  NETProgramming: 'bg-violet-100  text-violet-700',
  FunctionalProgramming: 'bg-fuchsia-100 text-fuchsia-700',
  ScriptingLanguages: 'bg-lime-100    text-lime-700',
  Frontend: 'bg-sky-100     text-sky-700',
  BackendFrameworks: 'bg-gray-100    text-gray-700',
  FrontendFrameworks: 'bg-sky-100     text-sky-700',
  WebProgramming: 'bg-cyan-100    text-cyan-700',
  MobileProgramming: 'bg-emerald-100 text-emerald-700',
  DevOps: 'bg-teal-100    text-teal-700',
  Database: 'bg-amber-100   text-amber-700',
  SQLDatabases: 'bg-indigo-100  text-indigo-700',
  NoSQLDatabases: 'bg-rose-100    text-rose-700',
  NewSQLDatabases: 'bg-violet-100  text-violet-700',
  GraphDatabases: 'bg-green-100   text-green-700',
  DataWarehousing: 'bg-stone-100   text-stone-700',
  ML: 'bg-purple-100  text-purple-700',
  Others: 'bg-purple-100  text-purple-700',
};
const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  meta,
  isLoading,
  onEdit,
  onDelete,
  onPageChange,
  onSortRecruit,
}) => {

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
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Tên Danh mục
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Bộ kỹ năng{/* hiển thị dưới dạng chip */}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Ngày tạo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Mô tả
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Trạng thái
            </th>
            {/* sort theo recruit */}
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer select-none"
              onClick={onSortRecruit}
            >
              Lượt tuyển&nbsp;
              <ArrowsUpDownIcon className="inline h-4 w-4" />
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
              Hành động
            </th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {/* spinner & empty giữ nguyên */}
          {isLoading && (
            <tr>
              <td colSpan={7} className="text-center py-4">
                <Spinner />
              </td>
            </tr>
          )}
          {!isLoading && categories.length === 0 && (
            <tr>
              <td
                colSpan={7}
                className="px-6 py-4 text-sm text-gray-500 text-center"
              >
                Không tìm thấy danh mục nào.
              </td>
            </tr>
          )}
          {!isLoading &&
            categories.map((cat, idx) => {
              return (
                <tr key={cat._id}>
                  {/* tên */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {cat.name}
                  </td>

                  {/* skills chip (tối đa 3 hiển thị, >3 thì +n) */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {(cat.skills ?? []).slice(0, 3).map((s: any) => (
                      <span
                        key={typeof s === 'string' ? s : s._id}
                        className={`mr-1 mb-1 inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${categoryColor[s.category ?? 'Others'] ||
                          'bg-gray-100 text-gray-700'
                          }`}
                      >
                        {s.name ?? s}
                      </span>
                    ))}
                    {(cat.skills?.length ?? 0) > 3 && (
                      <span className="text-xs text-gray-500">
                        +{cat.skills!.length - 3}
                      </span>
                    )}
                  </td>

                  {/* ngày tạo */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dayjs(cat.createdAt).format('DD/MM/YYYY')}
                  </td>

                  {/* mô tả */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                    {cat.description || '-'}
                  </td>

                  {/* trạng thái */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs font-semibold rounded-full ${cat.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {cat.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>

                  {/* lượt tuyển – chỉ hiển thị số, không progress */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cat.recruitCount ?? 0}
                  </td>

                  {/* actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                    <button
                      onClick={() => onEdit(cat)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDelete(cat)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
      {!isLoading && renderPagination()}
    </div>
  );
};

export default CategoryTable; 