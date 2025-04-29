import React, { useState, useEffect } from 'react';
import { ICategory } from '@/types/backend';
import { callCreateCategory, callUpdateCategory } from '@/services/category.service';
import { toast } from 'react-toastify';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataInit: ICategory | null;
  refetch: () => void;
}

const inputFieldClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100";

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, dataInit, refetch }) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (dataInit) {
      setName(dataInit.name || '');
    } else {
      setName('');
    }
  }, [dataInit, isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (!name) {
      toast.error("Tên danh mục là bắt buộc.");
      setIsLoading(false);
      return;
    }

    const payload: Partial<ICategory> = { name };

    try {
      if (dataInit?._id) {
        const res = await callUpdateCategory(dataInit._id, payload);
        if (res) {
          toast.success(res.message || 'Cập nhật danh mục thành công!');
          refetch();
          onClose();
        } else {
          toast.error(res?.message || 'Có lỗi xảy ra khi cập nhật danh mục.');
        }
      } else {
        const res = await callCreateCategory(payload);
        if (res) {
          toast.success(res.message || 'Thêm mới danh mục thành công!');
          refetch();
          onClose();
        } else {
          toast.error(res?.message || 'Có lỗi xảy ra khi thêm mới danh mục.');
        }
      }
    } catch (error: any) {
      console.error("Submit Category Error:", error);
      toast.error(error?.response?.data?.message || error.message || 'Đã có lỗi xảy ra.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {dataInit?._id ? 'Cập nhật Danh mục' : 'Thêm mới Danh mục'}
            </h2>
            <button type="button" onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div>
            <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 mb-1">Tên Danh mục</label>
            <input type="text" id="category-name" required value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} className={inputFieldClass} />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
             <button type="button" onClick={onClose} disabled={isLoading} className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
               Hủy
             </button>
             <button type="submit" disabled={isLoading} className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
               {isLoading ? (
                 <>
                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   Đang xử lý...
                 </>
               ) : (dataInit?._id ? 'Cập nhật' : 'Thêm mới')}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
