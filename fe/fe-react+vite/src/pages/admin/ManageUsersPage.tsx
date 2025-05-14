import UserModal from '@/components/admin/user/UserModal';
import UserTable from '@/components/admin/user/UserTable';
import ViewUserDetail from '@/components/admin/user/ViewUserDetail';
import Breadcrumb from '@/components/shared/Breadcrumb';
import { callFetchCompany } from '@/services/company.service';
import { callFetchRole } from '@/services/role.service';
import { callDeleteUser, callFetchUser } from '@/services/user.service';
import { ICompany, IRole, IUser } from '@/types/backend';
import { PlusIcon, UsersIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import TableFilter, { FilterState } from './TableFilter';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';

const ManageUsersPage: React.FC = () => {

  const buildUserQuery = (
    page = meta.current,
    size = meta.pageSize,
    f = filter
  ) => {
    let q =
      `current=${page}&pageSize=${size}` +
      `&populate=role,company&fields=role._id,role.name,company._id,company.name`;


    if (f.name.trim()) q += `&name=${encodeURIComponent(f.name.trim())}`;
    if (f.email.trim()) q += `&email=${encodeURIComponent(f.email.trim())}`;
    if (f.role.trim()) q += `&role=${encodeURIComponent(f.role.trim())}`;
    return q;
  };

  const handleResetFilter = () => {
    const empty: FilterState = { name: '', email: '', role: '' };
    setFilter(empty);
    setMeta(m => ({ ...m, current: 1 }));
    fetchUsers(buildUserQuery(1, meta.pageSize, empty));
    toast.info('Đã làm mới trang');
  };

  const handleSearch = async () => {
    setMeta(m => ({ ...m, current: 1 }));

    const count = await fetchUsers(buildUserQuery(1, meta.pageSize));

    toast.success(`Tìm thấy ${count} người dùng`);
  };

  const [users, setUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [meta, setMeta] = useState<{ current: number; pageSize: number; pages: number; total: number }>({ current: 1, pageSize: 10, pages: 0, total: 0 });

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [dataInit, setDataInit] = useState<IUser | null>(null);

  const [listRoles, setListRoles] = useState<IRole[]>([]);
  const [listCompanies, setListCompanies] = useState<ICompany[]>([]);
  const [filter, setFilter] = useState<FilterState>({
    name: '',
    email: '',
    role: '',
  });


  const fetchUsers = useCallback(async (query?: string) => {
    setIsLoading(true);
    let defaultQuery = `current=${meta.current}&pageSize=${meta.pageSize}`;
    defaultQuery += `&populate=role,company&fields=role._id,role.name,company._id,company.name`;
    // const finalQuery = query ? query : defaultQuery;
    // const finalQuery = query ?? buildUserQuery(meta.current, meta.pageSize);
    const finalQuery = query ?? buildUserQuery();
    try {
      const res = await callFetchUser(finalQuery);
      if (res && res.data) {
        setUsers(res.data.result);
        setMeta(res.data.meta);
        return res.data.result.length;
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
          // callFetchUser(`current=1&pageSize=${meta.pageSize}&populate=role,company&fields=role._id,role.name,company._id,company.name`),
          callFetchUser(buildUserQuery(1, meta.pageSize)),
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
  const handleExportExcel = () => {
    if (!users.length) {
      toast.info('Không có dữ liệu để xuất');
      return;
    }

    // 1. Chuyển danh sách thành mảng object phẳng
    const data = users.map((u, idx) => ({
      STT: (meta.current - 1) * meta.pageSize + idx + 1,
      Tên: u.name,
      Email: u.email,
      'Vai trò': typeof u.role === 'object' ? u.role.name : u.role,
      'Ngày tạo': dayjs(u.createdAt).format('DD/MM/YYYY HH:mm'),
    }));

    // 2. Tạo worksheet & workbook
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

    // 3. Ghi ra blob và download
    const wbBlob = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    saveAs(
      new Blob([wbBlob], { type: 'application/octet-stream' }),
      `users_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`
    );

    toast.success(`Đã xuất ${data.length} dòng ra Excel`);
  };
  const handleDelete = async (user: IUser) => {
    if (!user._id) return;
    if (!confirm(`Bạn có chắc chắn muốn xóa người dùng này không?`)) return;

    setIsLoading(true);
    try {

      const res = await callDeleteUser(user._id);
      if (res?.status || res?.data !== undefined) {
        toast.success('Xóa người dùng thành công!');

        const targetPage = meta.current > 1 && users.length === 1
          ? meta.current - 1
          : meta.current;
        fetchUsers(buildUserQuery(targetPage, meta.pageSize));
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
  const handleTableChange = (page: number, pageSize?: number) => {
    const newPageSize = pageSize || meta.pageSize;
    setMeta(prevMeta => ({ ...prevMeta, current: page, pageSize: newPageSize }));
    // fetchUsers(`current=${page}&pageSize=${newPageSize}`);
    fetchUsers(buildUserQuery(page, newPageSize));
  };

  const breadcrumbItems = [
    { label: 'Quản lý Người dùng', icon: UsersIcon },
  ];

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full">
      <Breadcrumb items={breadcrumbItems} />

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-start mb-6 pb-4 border-b border-gray-200 gap-4">
          {/* FILTER + BUTTONS */}
          <TableFilter
            value={filter}
            onChange={setFilter}
            onReset={handleResetFilter}
            onSearch={handleSearch}
          />
          {/* NÚT XUẤT EXCEL  */}
          <button
            onClick={handleExportExcel}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Xuất File
          </button>

          {/* NÚT THÊM MỚI (đặt sát bên phải) */}
          <button
            onClick={handleAddNew}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700"
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
          onPageChange={handleTableChange}
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
    </div >
  );
};

export default ManageUsersPage;

function fetchRoles(arg0: string) {
  throw new Error('Function not implemented.');
}
