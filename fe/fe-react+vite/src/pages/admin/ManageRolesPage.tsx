import React, { useState, useEffect, useCallback } from 'react';
import Breadcrumb from '@/components/shared/Breadcrumb';
import RoleTable from '@/components/admin/role/RoleTable';
import RoleModal from '@/components/admin/role/RoleModal';
import { callFetchRole, callDeleteRole } from '@/services/role.service';
import { IRole } from '@/types/backend';
import { toast } from 'react-toastify';
import { PlusIcon, TagIcon } from '@heroicons/react/24/outline';

const ManageRolesPage: React.FC = () => {
  const [roles, setRoles] = useState<IRole[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [meta, setMeta] = useState<{ current: number; pageSize: number; pages: number; total: number }>({ current: 1, pageSize: 10, pages: 0, total: 0 });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [dataInit, setDataInit] = useState<IRole | null>(null);

  const fetchRoles = useCallback(async (query?: string) => {
    setIsLoading(true);
    const defaultQuery = `current=${meta.current}&pageSize=${meta.pageSize}`;
    const finalQuery = query ? query : defaultQuery;

    try {
      const res = await callFetchRole(finalQuery);
      if (res && res.data) {
        setRoles(res.data.result);
        setMeta(res.data.meta);
      } else {
        toast.error(res.message || "Không thể tải danh sách vai trò.");
      }
    } catch (error: any) {
      console.error("Fetch Roles Error:", error);
      toast.error(error.message || "Đã có lỗi xảy ra khi tải dữ liệu vai trò.");
    } finally {
      setIsLoading(false);
    }
  }, [meta.current, meta.pageSize]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleAddNew = () => {
    setDataInit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (role: IRole) => {
    setDataInit(role);
    setIsModalOpen(true);
  };

  const handleDelete = async (role: IRole) => {
    if (!role._id) return;
    if (!confirm(`Bạn có chắc chắn muốn xóa vai trò "${role.name}" không?`)) return;

    setIsLoading(true);
    try {
      const res = await callDeleteRole(role._id);
      if (res && res.data) {
        toast.success('Xóa vai trò thành công!');
        const query = meta.current > 1 && roles.length === 1 ? `current=${meta.current - 1}&pageSize=${meta.pageSize}` : `current=${meta.current}&pageSize=${meta.pageSize}`;
        fetchRoles(query);
      } else {
        toast.error(res.message || 'Có lỗi xảy ra khi xóa vai trò.');
      }
    } catch (error: any) {
      console.error("Delete Role Error:", error);
      toast.error(error.message || 'Đã có lỗi xảy ra khi xóa.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTableChange = (page: number, pageSize?: number) => {
    const newPageSize = pageSize || meta.pageSize;
    setMeta(prevMeta => ({ ...prevMeta, current: page, pageSize: newPageSize }));
    fetchRoles(`current=${page}&pageSize=${newPageSize}`);
  };

  const breadcrumbItems = [
    { label: 'Quản lý Vai trò', icon: TagIcon },
  ];

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full">
      <Breadcrumb items={breadcrumbItems} />

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <div className="flex-1">
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Thêm mới
          </button>
        </div>

        <RoleTable
          roles={roles}
          meta={meta}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPageChange={handleTableChange}
        />
      </div>

      <RoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dataInit={dataInit}
        refetch={fetchRoles}
      />
    </div>
  );
};

export default ManageRolesPage; 