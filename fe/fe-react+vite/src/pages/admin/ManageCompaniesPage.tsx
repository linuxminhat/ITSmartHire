import CompanyModal from '@/components/admin/company/CompanyModal';
import CompanyTable from '@/components/admin/company/CompanyTable';
import Breadcrumb from '@/components/shared/Breadcrumb';
import { callDeleteCompany, callFetchCompany } from '@/services/company.service';
import { callFetchSkill } from '@/services/skill.service';
import { ICompany, ISkill } from '@/types/backend';
import { ArrowPathIcon, BuildingOffice2Icon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import CompanyFilter, { CompanyFilterState } from './CompanyFilter';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';

const ManageCompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<ICompany[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [meta, setMeta] = useState<{ current: number; pageSize: number; pages: number; total: number }>({ current: 1, pageSize: 10, pages: 0, total: 0 });

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [dataInit, setDataInit] = useState<ICompany | null>(null);
  const [listSkills, setListSkills] = useState<ISkill[]>([]);
  const [filter, setFilter] = useState<CompanyFilterState>({
    name: '',
    address: '',
    country: '',
    industry: ''
  });

  // ⚡ Sửa nhanh: buildQuery trong ManageCompaniesPage.tsx
  const buildQuery = (
    page = meta.current,
    size = meta.pageSize,
    f = filter
  ) => {
    let q = `current=${page}&pageSize=${size}`

    if (f.name.trim()) q += `&name=${encodeURIComponent(f.name.trim())}`
    if (f.address.trim()) q += `&address=${encodeURIComponent(f.address.trim())}`
    if (f.country.trim()) q += `&country=${encodeURIComponent(f.country.trim())}`
    if (f.industry.trim()) q += `&industry=${encodeURIComponent(f.industry.trim())}`

    return q
  }


  const fetchCompanies = useCallback(async (query?: string) => {
    console.log("fetchCompanies called with query:", query);
    setIsLoading(true);
    const finalQuery = query || buildQuery();

    try {
      console.log("Sending API request with query:", finalQuery);
      const res = await callFetchCompany(finalQuery);
      console.log("API Response:", res);
      if (res && res.data) {
        setCompanies(res.data.result);
        setMeta(res.data.meta);
      } else {
        console.error("API Error:", res.message);
        toast.error(res.message || "Không thể tải danh sách công ty.");
      }
    } catch (error: any) {
      console.error("Fetch Companies Error:", error);
      toast.error(error.message || "Đã có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setIsLoading(false);
    }
  }, [filter, meta.current, meta.pageSize]);

  const fetchAllSkills = useCallback(async () => {
    try {
      const res = await callFetchSkill(`current=1&pageSize=1000`);
      if (res && res.data) {
        setListSkills(res.data.result);
      } else {
        toast.error(res.message || "Không thể tải danh sách kỹ năng.");
      }
    } catch (error: any) {
      console.error("Fetch Skills Error:", error);
      toast.warning("Lỗi khi tải danh sách kỹ năng cho modal.");
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
    fetchAllSkills();
  }, [fetchCompanies, fetchAllSkills]);

  const handleAddNew = () => {
    setDataInit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (company: ICompany) => {
    setDataInit(company);
    setIsModalOpen(true);
  };

  const handleDelete = async (company: ICompany) => {
    if (!company._id) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa công ty "${company.name}"? Hành động này không thể hoàn tác.`)) {
      return;
    }
    setIsLoading(true);
    try {
      const res = await callDeleteCompany(company._id);
      if (res && res.data) {
        toast.success('Xóa công ty thành công!');
        fetchCompanies();
      } else {
        toast.error(res.message || 'Có lỗi xảy ra khi xóa.');
      }
    } catch (error: any) {
      console.error("Delete Company Error:", error);
      toast.error(error.message || 'Đã có lỗi xảy ra.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    console.log("Search triggered with filter:", filter);
    setMeta(prev => ({ ...prev, current: 1 }));
    fetchCompanies(buildQuery(1, meta.pageSize));
  };

  const handleReset = () => {
    const emptyFilter = { name: '', address: '', country: '', industry: '' };
    setFilter(emptyFilter);
    setMeta(prev => ({ ...prev, current: 1 }));
    fetchCompanies(buildQuery(1, meta.pageSize, emptyFilter));
    toast.info('Đã làm mới bộ lọc');
  };

  const handleExport = () => {
    if (!companies.length) return toast.info('Không có dữ liệu để xuất');

    const data = companies.map((company, idx) => ({
      STT: (meta.current - 1) * meta.pageSize + idx + 1,
      'Tên công ty': company.name,
      'Địa chỉ': company.address || '-',
      'Quốc gia': company.country || '-',
      'Lĩnh vực': company.industry || '-',
      'Email': (company as any).email || '-',
      'Số điện thoại': (company as any).phone || '-',
      'Website': (company as any).website || '-',
      'Ngày tạo': dayjs(company.createdAt).format('DD/MM/YYYY')
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Companies');

    const blob = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([blob]), `companies_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`);
    toast.success(`Đã xuất ${data.length} dòng`);
  };

  const breadcrumbItems = [
    { label: 'Quản lý Công ty', icon: BuildingOffice2Icon },
  ];

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full">
      <Breadcrumb items={breadcrumbItems} />

      <div className="bg-white p-6 rounded-lg shadow-sm">
        {/* Filter + Action Bar */}
        <div className="flex items-center mb-6 pb-4 border-b border-gray-200 gap-2">
          {/* Left side - Filter inputs */}
          <div className="flex-1">
            <CompanyFilter
              value={filter}
              onChange={setFilter}
              onReset={handleReset}
              onSearch={handleSearch}
            />
          </div>

          {/* Right side - Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center px-3 py-1.5 border border-gray-300 bg-white rounded text-sm text-gray-700 hover:bg-gray-50"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              Làm lại
            </button>

            <button
              onClick={handleSearch}
              className="flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              <MagnifyingGlassIcon className="h-4 w-4 mr-1" />
              Tìm kiếm
            </button>

            <button
              onClick={handleExport}
              className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Xuất File
            </button>

            <button
              onClick={handleAddNew}
              className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Thêm mới
            </button>
          </div>
        </div>

        <CompanyTable
          companies={companies}
          meta={meta}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <CompanyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dataInit={dataInit}
        refetch={fetchCompanies}
        listSkills={listSkills}
      />
    </div>
  );
};

export default ManageCompaniesPage;