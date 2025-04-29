import CompanyModal from '@/components/admin/company/CompanyModal';
import CompanyTable from '@/components/admin/company/CompanyTable';
import Breadcrumb from '@/components/shared/Breadcrumb';
import { callDeleteCompany, callFetchCompany } from '@/services/company.service';
import { callFetchSkill } from '@/services/skill.service';
import { ICompany, ISkill } from '@/types/backend';
import { BuildingOffice2Icon, PlusIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const ManageCompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<ICompany[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [meta, setMeta] = useState<{ current: number; pageSize: number; pages: number; total: number }>({ current: 1, pageSize: 10, pages: 0, total: 0 });
  
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [dataInit, setDataInit] = useState<ICompany | null>(null);
  const [listSkills, setListSkills] = useState<ISkill[]>([]);

  const fetchCompanies = useCallback(async (query?: string) => {
    setIsLoading(true);
    const defaultQuery = `current=${meta.current}&pageSize=${meta.pageSize}`;
    const finalQuery = query ? query : defaultQuery;

    try {
      const res = await callFetchCompany(finalQuery);
      if (res && res.data) {
        setCompanies(res.data.result);
        setMeta(res.data.meta);
      } else {
         toast.error(res.message || "Không thể tải danh sách công ty.");
      }
    } catch (error: any) {
      console.error("Fetch Companies Error:", error);
      toast.error(error.message || "Đã có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setIsLoading(false);
    }

    const fetchAllSkills = async () => {
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
    };
    fetchAllSkills();

  }, [meta.current, meta.pageSize]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

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

  const breadcrumbItems = [
    { label: 'Quản lý Công ty', icon: BuildingOffice2Icon },
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
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Thêm mới
          </button>
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