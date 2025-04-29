import React, { useState, useEffect, useCallback } from 'react';
import Breadcrumb from '@/components/shared/Breadcrumb';
import CategoryTable from '@/components/admin/category/CategoryTable';
import CategoryModal from '@/components/admin/category/CategoryModal';
import { callFetchCategory, callDeleteCategory } from '@/services/category.service';
import { ICategory } from '@/types/backend';
import { toast } from 'react-toastify';
import { PlusIcon, RectangleGroupIcon } from '@heroicons/react/24/outline';

const ManageCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [meta, setMeta] = useState<{ current: number; pageSize: number; pages: number; total: number }>({ current: 1, pageSize: 10, pages: 0, total: 0 });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [dataInit, setDataInit] = useState<ICategory | null>(null);

  const fetchCategories = useCallback(async (query?: string) => {
    setIsLoading(true);
    const defaultQuery = `current=${meta.current}&pageSize=${meta.pageSize}`;
    const finalQuery = query ? query : defaultQuery;

    try {
      const res = await callFetchCategory(finalQuery);
      if (res && res.data) {
        setCategories(res.data.result);
        setMeta(res.data.meta);
      } else {
        toast.error(res.message || "Không thể tải danh sách danh mục.");
      }
    } catch (error: any) {
      console.error("Fetch Categories Error:", error);
      toast.error(error.message || "Đã có lỗi xảy ra khi tải dữ liệu danh mục.");
    } finally {
      setIsLoading(false);
    }
  }, [meta.current, meta.pageSize]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAddNew = () => {
    setDataInit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: ICategory) => {
    setDataInit(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (category: ICategory) => {
    if (!category._id) return;
    if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${category.name}" không?`)) return;

    setIsLoading(true);
    try {
      const res = await callDeleteCategory(category._id);
      if (res) {
        toast.success(res.message || 'Xóa danh mục thành công!');
        const query = meta.current > 1 && categories.length === 1 ? `current=${meta.current - 1}&pageSize=${meta.pageSize}` : `current=${meta.current}&pageSize=${meta.pageSize}`;
        fetchCategories(query);
      } else {
        toast.error('Có lỗi xảy ra khi xóa danh mục.');
      }
    } catch (error: any) {
      console.error("Delete Category Error:", error);
      toast.error(error?.response?.data?.message || error.message || 'Đã có lỗi xảy ra khi xóa.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTableChange = (page: number, pageSize?: number) => {
    const newPageSize = pageSize || meta.pageSize;
    setMeta(prevMeta => ({ ...prevMeta, current: page, pageSize: newPageSize }));
    fetchCategories(`current=${page}&pageSize=${newPageSize}`);
  };

  const breadcrumbItems = [
    { label: 'Quản lý Danh mục', icon: RectangleGroupIcon },
  ];

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full">
      <Breadcrumb items={breadcrumbItems} />

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <div className="flex-1"></div>
          <button
            onClick={handleAddNew}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Thêm mới
          </button>
        </div>

        <CategoryTable
          categories={categories}
          meta={meta}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPageChange={handleTableChange}
        />
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dataInit={dataInit}
        refetch={fetchCategories}
      />
    </div>
  );
};

export default ManageCategoriesPage; 