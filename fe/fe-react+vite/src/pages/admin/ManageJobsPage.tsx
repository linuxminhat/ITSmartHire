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
import { PlusIcon, BriefcaseIcon, ArrowPathIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import JobFilter, { JobFilterState } from './JobFilter';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';

interface IProvince {
  name: string;
  code: number;
}

const ManageJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [meta, setMeta] = useState<{ current: number; pageSize: number; pages: number; total: number }>({ current: 1, pageSize: 10, pages: 0, total: 0 });
  // Dùng để mở modal Thêm/Sửa
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [dataInit, setDataInit] = useState<IJob | null>(null);
  // Danh sách options cho các select trong modal
  const [listSkills, setListSkills] = useState<ISkill[]>([]);
  const [listCategories, setListCategories] = useState<ICategory[]>([]);
  const [listCompanies, setListCompanies] = useState<ICompany[]>([]);
  const [listProvinces, setListProvinces] = useState<IProvince[]>([]);
  // Modal xem ứng viên đã apply
  const [isApplicationsModalOpen, setIsApplicationsModalOpen] = useState<boolean>(false);
  const [selectedJob, setSelectedJob] = useState<IJob | null>(null);

  const [filter, setFilter] = useState<JobFilterState>({
    name: '',
    category: '',
    skill: '',
    company: '',
    location: ''
  });

  const buildQuery = (
    page = meta.current,
    size = meta.pageSize,
    f = filter
  ) => {
    let q = `current=${page}&pageSize=${size}`;
    if (f.name?.trim()) q += `&search=${encodeURIComponent(f.name.trim())}`;
    if (f.category) q += `&category=${f.category}`;
    if (f.skill) q += `&skill=${f.skill}`;
    if (f.company) q += `&company=${f.company}`;
    if (f.location?.trim()) q += `&location=${encodeURIComponent(f.location.trim())}`;
    console.log('Building query with filter:', f);
    console.log('Final query string:', q);
    return q;
  };

  const fetchJobs = useCallback(async (query?: string) => {
    setIsLoading(true);
    const defaultQuery = `current=${meta.current}&pageSize=${meta.pageSize}`;
    //chọn query filter người dùng nếu có, ngược lại dùng defaultQuery.
    const finalQuery = query ? query : defaultQuery;

    console.log('Fetching jobs with query:', finalQuery);

    try {
      const res = await callFetchJob(finalQuery);
      console.log('API Response:', res.data);
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
      const res = await callDeleteJob(job._id) as IBackendRes<any>;
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
    fetchJobs(buildQuery(page, newPageSize));
  };

  const handleViewApplicants = (job: IJob) => {
    setSelectedJob(job);
    setIsApplicationsModalOpen(true);
  };

  const handleSearch = useCallback(() => {
    console.log('Search triggered with filter:', filter);
    const query = buildQuery(1, meta.pageSize, filter);
    fetchJobs(query);
  }, [filter, meta.pageSize, fetchJobs]);

  const handleReset = () => {
    const emptyFilter = {
      name: '',
      category: '',
      skill: '',
      company: '',
      location: ''
    };
    setFilter(emptyFilter);
    setMeta(prev => ({ ...prev, current: 1 }));
    fetchJobs(buildQuery(1, meta.pageSize, emptyFilter));
    toast.success('Đã làm mới bộ lọc');
  };

  const handleExport = () => {
    if (!jobs.length) return toast.info('Không có dữ liệu để xuất');

    const data = jobs.map((job, idx) => ({
      STT: (meta.current - 1) * meta.pageSize + idx + 1,
      'Tên việc làm': job.name,
      'Danh mục': typeof job.category === 'object' && job.category ? job.category.name : '-',
      'Kỹ năng': Array.isArray(job.skills) ? job.skills.map(s => typeof s === 'object' ? s.name : '').join(', ') : '-',
      'Công ty': job.company?.name || '-',
      'Địa điểm': job.location || '-',
      'Lương': job.salary || '-',
      'Số lượng': job.quantity || '-',
      'Ngày tạo': dayjs(job.createdAt).format('DD/MM/YYYY')
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Jobs');

    const blob = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([blob]), `jobs_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`);
    toast.success(`Đã xuất ${data.length} dòng`);
  };

  const breadcrumbItems = [
    { label: 'Quản lý Việc làm', icon: BriefcaseIcon },
  ];

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full">
      <Breadcrumb items={breadcrumbItems} />

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex flex-col mb-6 pb-4 border-b border-gray-200 gap-4">
          <div className="flex-1">
            <JobFilter
              value={filter}
              onChange={setFilter}
              onReset={handleReset}
              onSearch={handleSearch}
              categories={listCategories}
              skills={listSkills}
              companies={listCompanies}
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={handleReset}
              className="flex items-center px-3 py-1.5 border border-gray-300 bg-white rounded text-sm text-gray-700 hover:bg-gray-50"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              Làm lại
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
        jobDescription={selectedJob?.description}
      />
    </div>
  );
};

export default ManageJobsPage; 