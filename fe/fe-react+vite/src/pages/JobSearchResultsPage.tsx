import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { callSearchJobs } from '@/services/job.service';
import { IJob, IModelPaginate } from '@/types/backend';
import Spinner from '@/components/Spinner';
import { MapPinIcon, CurrencyDollarIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import Pagination from '@/components/shared/Pagination'; // Assuming you have a Pagination component

const JobSearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const name = searchParams.get('name') || undefined;
  const location = searchParams.get('location') || undefined;

  const [jobs, setJobs] = useState<IJob[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<IModelPaginate<any>['meta'] | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10; // Or make this configurable

  const fetchSearchResults = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await callSearchJobs(name, location, page, pageSize);
      if (res && res.data) {
        setJobs(res.data.result);
        setMeta(res.data.meta);
      } else {
        setError("Không thể tải kết quả tìm kiếm việc làm.");
        setJobs([]);
        setMeta(null);
      }
    } catch (err: any) {
      setError("Lỗi khi tải kết quả tìm kiếm.");
      console.error("Search Jobs Error:", err);
      setJobs([]);
      setMeta(null);
    } finally {
      setIsLoading(false);
    }
  }, [name, location, pageSize]);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when search params change
    fetchSearchResults(1);
  }, [name, location, fetchSearchResults]); // Rerun fetch when name or location changes

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchSearchResults(page);
    window.scrollTo(0, 0); // Scroll to top on page change
  };

  const getSearchDescription = () => {
    if (name && location) {
      return `Kết quả tìm kiếm cho "${name}" tại "${location}"`;
    } else if (name) {
      return `Kết quả tìm kiếm cho "${name}"`;
    } else if (location) {
      return `Kết quả tìm kiếm tại "${location}"`;
    }
    return 'Kết quả tìm kiếm việc làm';
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
          <MagnifyingGlassIcon className="h-8 w-8 mr-3 text-indigo-600" />
          {getSearchDescription()}
        </h1>
        {meta && meta.total > 0 && (
          <p className="text-gray-600 mb-8">Tìm thấy {meta.total} việc làm phù hợp.</p>
        )}

        {isLoading && (
          <div className="text-center py-10"><Spinner /></div>
        )}

        {!isLoading && error && (
          <div className="text-center py-10 text-red-600 bg-red-50 p-4 rounded-md">
            <p>Lỗi: {error}</p>
          </div>
        )}

        {!isLoading && !error && jobs.length > 0 && (
          <div className="space-y-6">
            {jobs.map((job) => (
              <Link 
                key={job._id} 
                to={`/job/${job._id}`} 
                className="block bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 border border-gray-200 hover:border-indigo-300 p-5"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-shrink-0">
                    <img 
                      src={job.company?.logo || 'https://via.placeholder.com/100/CCCCCC/FFFFFF?text=Cty'} 
                      alt={`${job.company?.name || 'Company'} logo`} 
                      className="h-14 w-14 object-contain border rounded-md p-1 bg-white"
                    />
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <h3 className="font-semibold text-indigo-700 mb-1 truncate text-lg" title={job.name}>{job.name}</h3>
                    <p className="text-sm text-gray-600 mb-2 truncate" title={job.company?.name || 'Không rõ công ty'}>{job.company?.name || 'Không rõ công ty'}</p>
                    <div className="flex flex-wrap items-center text-xs text-gray-500 gap-x-3 gap-y-1">
                      <span className="flex items-center whitespace-nowrap">
                        <CurrencyDollarIcon className="h-4 w-4 mr-1"/> 
                        {job.salary ? `${job.salary.toLocaleString()} đ` : 'Thỏa thuận'}
                      </span> 
                      <span className="flex items-center whitespace-nowrap truncate">
                        <MapPinIcon className="h-4 w-4 mr-1"/>
                        <span className="truncate">{job.location}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end space-y-1 mt-2 sm:mt-0 flex-shrink-0">
                    <span className="text-xs text-gray-400 whitespace-nowrap">Đăng: {dayjs(job.createdAt).format('DD/MM/YYYY')}</span>
                    <div className="flex items-center space-x-1.5">
                      {job.isActive && <span className="inline-block bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[11px] font-medium">Đang tuyển</span>}
                      {job.isHot && <span className="inline-block bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-[11px] font-medium">HOT</span>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && !error && jobs.length === 0 && (
          <div className="text-center py-10 text-gray-500 bg-white p-6 rounded-md shadow-sm">
            <p>Không tìm thấy việc làm nào phù hợp với tiêu chí của bạn.</p>
            <Link to="/jobs" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800">
              Xem tất cả việc làm
            </Link>
          </div>
        )}

        {meta && meta.pages > 1 && (
          <div className="mt-10 flex justify-center">
            <Pagination
              currentPage={meta.current}
              totalPages={meta.pages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSearchResultsPage; 