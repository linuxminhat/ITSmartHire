import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapPinIcon, CurrencyDollarIcon, ChevronLeftIcon, ChevronRightIcon, ExclamationTriangleIcon, BriefcaseIcon, TagIcon } from '@heroicons/react/24/outline';
import { callFetchJobsBySkills } from '@/services/job.service';
import { callFetchSkillById } from '@/services/skill.service'; // Assuming this exists or we add it
import { IJob, ISkill } from '@/types/backend';
import dayjs from 'dayjs';
import Spinner from '@/components/Spinner';
import { toast } from 'react-toastify';

// Reusable Simple Pagination Component (or import from a shared location)
interface PaginationProps {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}

const SimplePagination: React.FC<PaginationProps> = ({ current, pageSize, total, onChange }) => {
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (current > 1) {
      onChange(current - 1);
    }
  };

  const handleNext = () => {
    if (current < totalPages) {
      onChange(current + 1);
    }
  };

  return (
    <div className="flex items-center justify-center space-x-3 mt-10">
      <button
        onClick={handlePrevious}
        disabled={current === 1}
        className={`flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <ChevronLeftIcon className="h-5 w-5 mr-1" />
        Trước
      </button>
      <span className="text-sm text-gray-700">
        Trang {current} / {totalPages}
      </span>
      <button
        onClick={handleNext}
        disabled={current === totalPages}
        className={`flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        Sau
        <ChevronRightIcon className="h-5 w-5 ml-1" />
      </button>
    </div>
  );
};

const JobsBySkillPage: React.FC = () => {
  const { skillId } = useParams<{ skillId: string }>();
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [skillName, setSkillName] = useState<string>(''); // State to store the skill name
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  const fetchJobsBySkillData = async (id: string, page: number, size: number) => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch Skill Name (Optional but good for UX)
      try {
          const skillRes = await callFetchSkillById(id);
          if (skillRes?.data?.name) {
              setSkillName(skillRes.data.name);
          } else {
              setSkillName('Kỹ năng không xác định');
          }
      } catch (skillErr) {
          console.error("Error fetching skill name:", skillErr);
          setSkillName('Kỹ năng không xác định'); // Set default name on error
      }
      
      // Fetch Jobs
      const res = await callFetchJobsBySkills([id], page, size);
      if (res && res.data && res.data.result) {
        setJobs(res.data.result);
        setTotal(res.data.meta.total);
        setCurrent(res.data.meta.current);
        setPageSize(res.data.meta.pageSize);
      } else {
        setError("Không thể tải danh sách việc làm.");
        toast.error(res?.message || "Không thể tải danh sách việc làm.");
      }
    } catch (err: any) {
      setError("Lỗi tải việc làm.");
      toast.error("Lỗi tải việc làm.");
      console.error("Fetch Jobs By Skill Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (skillId) {
      fetchJobsBySkillData(skillId, current, pageSize);
    }
  }, [skillId, current]); // Refetch when skillId or current page changes

  const handlePageChange = (page: number) => {
    setCurrent(page);
  };

  return (
    <div className="bg-gray-50 pb-12 min-h-screen">
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16 px-4 text-center shadow-md">
          <div className="container mx-auto max-w-4xl">
              <div className="flex items-center justify-center mb-2">
                  <TagIcon className="h-6 w-6 mr-2" />
                  <h1 className="text-3xl md:text-4xl font-bold">Việc Làm Kỹ Năng: {skillName || 'Đang tải...'}</h1>
              </div>
              <p className="text-lg text-indigo-100">Khám phá cơ hội việc làm phù hợp với kỹ năng <strong className='font-semibold'>{skillName}</strong> của bạn.</p>
          </div>
      </section>

      <div className="container mx-auto max-w-6xl mt-[-40px] px-4">
         <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
            {isLoading && (
              <div className="text-center py-10"><Spinner /></div>
            )}

            {!isLoading && error && (
              <div className="text-center py-10">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-lg mx-auto" role="alert">
                    <ExclamationTriangleIcon className="h-5 w-5 inline-block mr-2 -mt-1" />
                    <strong className="font-bold mr-2">Lỗi!</strong>
                    <span className="block sm:inline">{error}</span>
                </div>
              </div>
            )}

            {!isLoading && !error && (
              <>
                {jobs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    {jobs.map((job) => (
                      <Link 
                        key={job._id}
                        to={`/job/${job._id}`} 
                        className="block bg-white rounded-lg shadow-lg hover:shadow-xl transition duration-300 border border-gray-200 hover:border-indigo-300 p-5 group"
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
                                   <h3 className="font-semibold text-indigo-700 group-hover:text-indigo-800 mb-1 truncate text-lg" title={job.name}>{job.name}</h3>
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
                ) : (
                   <div className="col-span-full text-center text-gray-500 py-16 flex flex-col items-center">
                        <BriefcaseIcon className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg">Không tìm thấy việc làm nào phù hợp với kỹ năng này.</p>
                        <p className="text-sm">Hãy thử tìm kiếm với kỹ năng khác hoặc xem <Link to="/jobs" className="text-indigo-600 hover:underline">tất cả việc làm</Link>.</p>
                    </div>
                )}

                <SimplePagination 
                  current={current} 
                  pageSize={pageSize} 
                  total={total} 
                  onChange={handlePageChange} 
                />
              </>
            )}
          </div>
      </div>
    </div>
  );
};

export default JobsBySkillPage; 