import UserModal from '@/components/admin/user/UserModal';
import UserTable from '@/components/admin/user/UserTable';
import ViewUserDetail from '@/components/admin/user/ViewUserDetail';
import Breadcrumb from '@/components/shared/Breadcrumb';
import { callFetchCompany } from '@/services/company.service';
import { callFetchRole } from '@/services/role.service';
import { callDeleteUser, callFetchUser } from '@/services/user.service';
import { ICompany, IRole, IUser } from '@/types/backend';
import { PlusIcon, UsersIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const ManageUsersPage: React.FC = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [meta, setMeta] = useState<{ current: number; pageSize: number; pages: number; total: number }>({ current: 1, pageSize: 10, pages: 0, total: 0 });
  
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [dataInit, setDataInit] = useState<IUser | null>(null);

  const [listRoles, setListRoles] = useState<IRole[]>([]);
  const [listCompanies, setListCompanies] = useState<ICompany[]>([]);

  const fetchUsers = useCallback(async (query?: string) => {
    setIsLoading(true);
    let defaultQuery = `current=${meta.current}&pageSize=${meta.pageSize}`;
    defaultQuery += `&populate=role,company&fields=role._id,role.name,company._id,company.name`;
    const finalQuery = query ? query : defaultQuery;

    try {
      const res = await callFetchUser(finalQuery);
      if (res && res.data) {
        setUsers(res.data.result);
        setMeta(res.data.meta);
      } else {
         toast.error(res.message || "Không thể tải danh sách người dùng.");
      }
    } catch (error: any) {
      console.error("Fetch Users Error:", error);
      toast.error(error.message || "Đã có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setIsLoading(false);
    }
  }, [meta.current, meta.pageSize]);

  useEffect(() => {
    const fetchInitialData = async () => {
       setIsLoading(true);
       try {
           const [userRes, roleRes, companyRes] = await Promise.all([
                callFetchUser(`current=1&pageSize=${meta.pageSize}&populate=role,company&fields=role._id,role.name,company._id,company.name`),
                callFetchRole('current=1&pageSize=100'),
                callFetchCompany('current=1&pageSize=100')
           ]);

           if (userRes && userRes.data) {
                setUsers(userRes.data.result);
                setMeta(userRes.data.meta);
           } else {
                toast.error(userRes?.message || "Không thể tải danh sách người dùng.");
           }

           if (roleRes && roleRes.data) {
               setListRoles(roleRes.data.result);
           } else {
                toast.error(roleRes?.message || "Không thể tải danh sách vai trò.");
           }

           if (companyRes && companyRes.data) {
               setListCompanies(companyRes.data.result);
           } else {
                toast.error(companyRes?.message || "Không thể tải danh sách công ty.");
           }

       } catch (error) {
           console.error("Error fetching initial data:", error);
           toast.error("Lỗi khi tải dữ liệu khởi tạo.");
       } finally {
            setIsLoading(false);
       }
    }
    fetchInitialData();
  }, [meta.pageSize]);

  const handleAddNew = () => {
    setDataInit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: IUser) => {
    setDataInit(user);
    setIsModalOpen(true);
  };

  const handleView = (user: IUser) => {
      setDataInit(user);
      setIsDetailOpen(true);
  };

  const handleDelete = async (user: IUser) => {
     if (!user._id) return;
     setIsLoading(true);
     try {
         const res = await callDeleteUser(user._id);
         if (res && res.data) {
             toast.success('Xóa người dùng thành công!');
             fetchUsers();
         } else {
             toast.error(res.message || 'Có lỗi xảy ra khi xóa.');
         }
     } catch (error: any) {
         console.error("Delete User Error:", error);
         toast.error(error.message || 'Đã có lỗi xảy ra.');
     } finally {
        setIsLoading(false);
     }
  };

  const breadcrumbItems = [
    { label: 'Quản lý Người dùng', icon: UsersIcon },
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
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Thêm mới
          </button>
        </div>

        <UserTable
          users={users}
          meta={meta}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dataInit={dataInit}
        refetch={fetchUsers}
        listRoles={listRoles}
        listCompanies={listCompanies}
      />

       <ViewUserDetail
         open={isDetailOpen}
         onClose={setIsDetailOpen}
         dataInit={dataInit}
         setDataInit={setDataInit}
       />
    </div>
  );
};

export default ManageUsersPage; 