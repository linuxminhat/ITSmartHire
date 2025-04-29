import React, { useState, useEffect, useCallback } from 'react';
import Breadcrumb from '@/components/shared/Breadcrumb';
import JobTable from '@/components/admin/job/JobTable';
import JobModal from '@/components/admin/job/JobModal';
import ApplicationsModal from '@/components/admin/job/ApplicationsModal';
import { callFetchJob, callDeleteJob } from '@/services/job.service';
import { callFetchSkill } from '@/services/skill.service';
import { callFetchCategory } from '@/services/category.service';
import { callFetchCompany } from '@/services/company.service';
import { IJob, ISkill, ICategory, ICompany, IBackendRes } from '@/types/backend';
import { toast } from 'react-toastify';
import { PlusIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

interface IProvince {
  name: string;
  code: number;
}

const ManageJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [meta, setMeta] = useState<{ current: number; pageSize: number; pages: number; total: number }>({ current: 1, pageSize: 10, pages: 0, total: 0 });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [dataInit, setDataInit] = useState<IJob | null>(null);
  const [listSkills, setListSkills] = useState<ISkill[]>([]);
  const [listCategories, setListCategories] = useState<ICategory[]>([]);
  const [listCompanies, setListCompanies] = useState<ICompany[]>([]);
  const [listProvinces, setListProvinces] = useState<IProvince[]>([]);

  const [isApplicationsModalOpen, setIsApplicationsModalOpen] = useState<boolean>(false);
  const [selectedJob, setSelectedJob] = useState<IJob | null>(null);

  const fetchJobs = useCallback(async (query?: string) => {
    setIsLoading(true);
    const defaultQuery = `current=${meta.current}&pageSize=${meta.pageSize}`;
    const finalQuery = query ? query : defaultQuery;

    try {
      const res = await callFetchJob(finalQuery);
      if (res && res.data) {
        setJobs(res.data.result);
        setMeta(res.data.meta);
      } else {
        toast.error(res.message || "Không thể tải danh sách việc làm.");
      }
    } catch (error: any) {
      console.error("Fetch Jobs Error:", error);
      toast.error(error.message || "Đã có lỗi xảy ra khi tải dữ liệu việc làm.");
    } finally {
      setIsLoading(false);
    }
  }, [meta.current, meta.pageSize]);

  useEffect(() => {
    fetchJobs();

    const fetchSelectData = async () => {
      const fetchProvinces = async () => {
        try {
          const response = await axios.get('https://provinces.open-api.vn/api/p/');
          if (response.data && Array.isArray(response.data)) {
            setListProvinces(response.data as IProvince[]);
          } else {
            toast.warning("Không thể tải danh sách tỉnh/thành phố cho modal.");
            console.error("Invalid province data structure:", response.data);
          }
        } catch (error) {
          console.error("Error fetching provinces:", error);
          toast.error("Lỗi khi tải danh sách tỉnh/thành phố.");
        }
      };

      try {
        const [skillRes, categoryRes, companyRes, _] = await Promise.all([
          callFetchSkill(`current=1&pageSize=1000`),
          callFetchCategory(`current=1&pageSize=1000`),
          callFetchCompany(`current=1&pageSize=1000`),
          fetchProvinces()
        ]);

        if (skillRes && skillRes.data) setListSkills(skillRes.data.result);
        else toast.warning("Không thể tải danh sách kỹ năng cho modal.");

        if (categoryRes && categoryRes.data) setListCategories(categoryRes.data.result);
        else toast.warning("Không thể tải danh sách danh mục cho modal.");

        if (companyRes && companyRes.data) setListCompanies(companyRes.data.result);
        else toast.warning("Không thể tải danh sách công ty cho modal.");

      } catch (error) {
        console.error("Error fetching data for selects:", error);
        toast.error("Lỗi khi tải dữ liệu cho các trường lựa chọn.");
      }
    };

    fetchSelectData();

  }, [fetchJobs]);

  const handleAddNew = () => {
    setDataInit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (job: IJob) => {
    setDataInit(job);
    setIsModalOpen(true);
  };

  const handleDelete = async (job: IJob) => {
    if (!job._id) return;
    if (!confirm(`Bạn có chắc chắn muốn xóa việc làm "${job.name}" không?`)) return;

    setIsLoading(true);
    try {
      const res: IBackendRes<any> = await callDeleteJob(job._id);
      if (res && res.data) {
        toast.success('Xóa việc làm thành công!');
        const query = meta.current > 1 && jobs.length === 1 ? `current=${meta.current - 1}&pageSize=${meta.pageSize}` : `current=${meta.current}&pageSize=${meta.pageSize}`;
        fetchJobs(query);
      } else {
        toast.error(res?.message || 'Có lỗi xảy ra khi xóa việc làm.');
      }
    } catch (error: any) {
      console.error("Delete Job Error:", error);
      const errorMessage = error?.response?.data?.message || error.message || 'Đã có lỗi xảy ra khi xóa.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTableChange = (page: number, pageSize?: number) => {
    const newPageSize = pageSize || meta.pageSize;
    setMeta(prevMeta => ({ ...prevMeta, current: page, pageSize: newPageSize }));
    fetchJobs(`current=${page}&pageSize=${newPageSize}`);
  };

  const handleViewApplicants = (job: IJob) => {
    setSelectedJob(job);
    setIsApplicationsModalOpen(true);
  };

  const breadcrumbItems = [
    { label: 'Quản lý Việc làm', icon: BriefcaseIcon },
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

        <JobTable
          jobs={jobs}
          meta={meta}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPageChange={handleTableChange}
          onViewApplicants={handleViewApplicants}
        />
      </div>

      <JobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dataInit={dataInit}
        refetch={fetchJobs}
        listSkills={listSkills}
        listCategories={listCategories}
        listCompanies={listCompanies}
        listProvinces={listProvinces}
      />

      <ApplicationsModal
        isOpen={isApplicationsModalOpen}
        onClose={() => {
          setIsApplicationsModalOpen(false);
          setSelectedJob(null);
        }}
        jobId={selectedJob?._id ?? null}
        jobTitle={selectedJob?.name}
      />
    </div>
  );
};

export default ManageJobsPage; 