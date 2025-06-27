import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { callFetchAppliedJobs, IApplication } from '@/services/applications.service';
import { IModelPaginate } from '@/types/backend';
import Spinner from '@/components/Spinner';
import { DocumentMagnifyingGlassIcon, MapPinIcon, CurrencyDollarIcon, CheckCircleIcon, ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import Pagination from '@/components/shared/Pagination';
import { toast } from 'react-toastify';
import UserDashboardSidebar from '@/layouts/components/UserDashboardSidebar';
import { useAuth } from '@/contexts/AuthContext';

const AppliedJobsPage: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<IApplication[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<IModelPaginate<any>['meta'] | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const fetchAppliedJobs = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    const query = `current=${page}&pageSize=${pageSize}&sort=-createdAt`;
    try {
      const res = await callFetchAppliedJobs(query);
      if (res && res.data) {
        setApplications(res.data.result);
        setMeta(res.data.meta);
      } else {
        setError("Không thể tải danh sách việc làm đã ứng tuyển.");
        setApplications([]);
        setMeta(null);
      }
    } catch (err: any) {
      setError("Lỗi khi tải việc làm đã ứng tuyển.");
      console.error("Fetch Applied Jobs Error:", err);
      setApplications([]);
      setMeta(null);
      toast.error(err?.response?.data?.message || err.message || "Lỗi không xác định");
    } finally {
      setIsLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchAppliedJobs(currentPage);
  }, [currentPage, fetchAppliedJobs]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Simplified status rendering for this page
  //get state from backend
  const renderApplicationStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <span className="flex items-center text-xs font-medium text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded-full"><ClockIcon className="h-3 w-3 mr-1" />Chờ duyệt</span>;
      case 'reviewed':
        return <span className="flex items-center text-xs font-medium text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full"><CheckCircleIcon className="h-3 w-3 mr-1" />Đã xem</span>;
      case 'accepted':
      case 'offered': // Group offered with accepted for simplicity here
        return <span className="flex items-center text-xs font-medium text-green-800 bg-green-100 px-2 py-0.5 rounded-full"><CheckCircleIcon className="h-3 w-3 mr-1" />Phù hợp</span>;
      case 'rejected':
        return <span className="flex items-center text-xs font-medium text-red-800 bg-red-100 px-2 py-0.5 rounded-full"><ExclamationCircleIcon className="h-3 w-3 mr-1" />Từ chối</span>;
      default:
        return <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6 md:p-8">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1 lg:col-span-1">
            <UserDashboardSidebar user={user} />
          </div>

          {/* Main Content */}
          <div className="md:col-span-3 lg:col-span-4">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h1 className="text-2xl font-bold text-gray-800 mb-6">Việc làm đã ứng tuyển</h1>

              {isLoading && <div className="text-center py-10"><Spinner /></div>}
              {!isLoading && error && (
                <div className="text-center py-10 text-red-700 bg-red-50 p-4 rounded-md border border-red-200">
                  <p>Lỗi: {error}</p>
                </div>
              )}
              {!isLoading && !error && applications.length === 0 && (
                <div className="text-center py-16 text-gray-500">
                  <DocumentMagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="font-medium">Bạn chưa ứng tuyển vào công việc nào.</p>
                  <Link to="/jobs" className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700">
                    Tìm việc ngay
                  </Link>
                </div>
              )}

              {!isLoading && !error && applications.length > 0 && (
                <div className="space-y-4">
                  {applications.map((app) => {
                    // Ensure jobId is populated and is an object
                    const job = typeof app.jobId === 'object' ? app.jobId : null;
                    const company = job && typeof job.company === 'object' ? job.company : null;

                    return (
                      <div key={app._id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200 bg-white">
                        <div className="flex flex-col sm:flex-row gap-4">
                          {/* Company Logo */}
                          <div className="flex-shrink-0">
                            <img
                              src={company?.logo || 'https://via.placeholder.com/80/CCCCCC/FFFFFF?text=Cty'}
                              alt={`${company?.name || 'Company'} logo`}
                              className="h-16 w-16 object-contain border rounded-md p-1 bg-white"
                            />
                          </div>
                          {/* Job Info */}
                          <div className="flex-grow overflow-hidden">
                            {job ? (
                              <Link
                                to={`/job/${job._id}`}
                                className="font-semibold text-indigo-700 hover:text-indigo-800 transition line-clamp-2 text-lg mb-1 block"
                                title={job.name}
                              >
                                {job.name}
                              </Link>
                            ) : (
                              <p className="font-semibold text-gray-500 text-lg mb-1">Công việc không tồn tại</p>
                            )}
                            {company ? (
                              <Link
                                to={`/company/${company._id}`}
                                className="text-sm text-gray-600 hover:text-gray-800 transition line-clamp-1 mb-2 block"
                                title={company.name}
                              >
                                {company.name}
                              </Link>
                            ) : (
                              <p className="text-sm text-gray-500 mb-2">Công ty không tồn tại</p>
                            )}
                            <div className="flex flex-wrap items-center text-xs text-gray-500 gap-x-3 gap-y-1">
                              {job?.salary && (
                                <span className="flex items-center whitespace-nowrap">
                                  <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                                  {job.salary.toLocaleString()} đ
                                </span>
                              )}
                              {job?.location && (
                                <span className="flex items-center whitespace-nowrap truncate">
                                  <MapPinIcon className="h-4 w-4 mr-1" />
                                  <span className="truncate">{job.location}</span>
                                </span>
                              )}
                            </div>
                          </div>
                          {/* Application Info */}
                          <div className="flex flex-col items-start sm:items-end space-y-1.5 flex-shrink-0 sm:w-40">
                            <p className="text-xs text-gray-400 whitespace-nowrap">
                              Đã nộp: {dayjs(app.createdAt).format('DD/MM/YYYY')}
                            </p>
                            {renderApplicationStatus(app.status)}
                            <a
                              href={app.cvUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
                            >
                              Xem lại CV đã nộp
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {!isLoading && !error && meta && meta.pages > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination
                    currentPage={meta.current}
                    totalPages={meta.pages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppliedJobsPage; 