import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { callFetchCompanyById } from '@/services/company.service';
import { callFetchJobByCompany } from '@/services/job.service';
import { ICompany, IJob, IBackendResWithResultArray } from '@/types/backend';
import Spinner from '@/components/Spinner';
import CompanyTabs from '@/components/shared/CompanyTabs';
import { MapPinIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';

const CompanyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<ICompany | null>(null);
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [isLoadingCompany, setIsLoadingCompany] = useState<boolean>(true);
  const [isLoadingJobs, setIsLoadingJobs] = useState<boolean>(true);
  const [errorCompany, setErrorCompany] = useState<string | null>(null);
  const [errorJobs, setErrorJobs] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setErrorCompany("Không tìm thấy ID công ty.");
      setIsLoadingCompany(false);
      setIsLoadingJobs(false);
      return;
    }

    const fetchCompanyDetails = async () => {
      setIsLoadingCompany(true);
      setErrorCompany(null);
      try {
        const res = await callFetchCompanyById(id);
        if (res && res.data) {
          setCompany(res.data);
        } else {
          setErrorCompany("Không thể tải thông tin chi tiết công ty.");
        }
      } catch (err: any) {
        let errorMessage = "Lỗi khi tải chi tiết công ty.";
        if (err?.response?.data?.message) {
          errorMessage = Array.isArray(err.response.data.message) ? err.response.data.message.join(', ') : err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        setErrorCompany(errorMessage);
        console.error("Fetch Company Details Error:", err);
      } finally {
        setIsLoadingCompany(false);
      }
    };

    const fetchCompanyJobs = async () => {
      setIsLoadingJobs(true);
      setErrorJobs(null);
      try {
        const response = await callFetchJobByCompany(id);
        const jobsArray = response?.data?.result;

        if (jobsArray && Array.isArray(jobsArray)) {
          setJobs(jobsArray);
        } else {
          setJobs([]);
          const innerResponse = response?.data;
          if (innerResponse && innerResponse.statusCode && !String(innerResponse.statusCode).startsWith('2')) {
            setErrorJobs(innerResponse.message || "Không thể tải việc làm.");
          }
        }
      } catch (err: any) {
        let errorMessage = "Lỗi khi tải danh sách việc làm của công ty.";
        if (err?.response?.data?.message) {
          errorMessage = Array.isArray(err.response.data.message) ? err.response.data.message.join(', ') : err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        } else if (typeof err === 'string') {
          errorMessage = err;
        }
        setErrorJobs(errorMessage);
        console.error("Fetch Company Jobs Error:", err);
      } finally {
        setIsLoadingJobs(false);
      }
    };

    fetchCompanyDetails();
    fetchCompanyJobs();

  }, [id]);

  if (isLoadingCompany) {
    return <div className="text-center py-20"><Spinner /></div>;
  }

  if (errorCompany) {
    return <div className="text-center py-20 text-red-600 bg-red-50 p-6 rounded-md">Lỗi: {errorCompany}</div>;
  }

  if (!company) {
    return <div className="text-center py-20 text-gray-500">Không tìm thấy thông tin công ty.</div>;
  }

  return (
    <div className="bg-gray-100 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 md:p-8 rounded-lg shadow-lg mb-8 flex flex-col md:flex-row items-start">
          <img
            src={company.logo || 'https://via.placeholder.com/150/CCCCCC/FFFFFF?text=Logo'}
            alt={`${company.name} logo`}
            className="h-24 w-24 md:h-32 md:w-32 object-contain border rounded-md p-2 bg-white mb-4 md:mb-0 md:mr-8 flex-shrink-0"
          />
          <div className="flex-grow">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{company.name}</h1>
            <div className="flex items-center text-gray-600 text-sm mb-4">
              <MapPinIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
              <span>{company.address || 'Địa chỉ chưa cập nhật'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8">
            <CompanyTabs company={company} />
          </div>

          <div className="lg:col-span-4 sticky top-6">
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-5 pb-3 border-b-2 border-indigo-200">
                Việc làm đang tuyển
              </h2>
              {isLoadingJobs && <div className="text-center py-6"><Spinner /></div>}
              {errorJobs && <p className="text-sm text-red-600 bg-red-50 p-3 rounded">Lỗi tải việc làm: {errorJobs}</p>}
              {!isLoadingJobs && !errorJobs && (
                jobs.length > 0 ? (
                  <ul className="space-y-4">
                    {jobs.map(job => (
                      <li key={job._id} className="bg-white border border-gray-200 p-4 rounded-md hover:shadow-xl hover:border-indigo-400 transition-all duration-300 transform hover:-translate-y-1">
                        <Link to={`/job/${job._id}`} className="block">
                          <h3 className="font-semibold text-indigo-700 mb-1 truncate" title={job.name}>{job.name}</h3>
                          <div className="flex items-center text-xs text-gray-500 mb-1 space-x-2">
                            <CurrencyDollarIcon className="h-4 w-4" />
                            <span>{job.salary ? `${job.salary.toLocaleString()} đ` : 'Thỏa thuận'}</span>
                            <span className="px-1">|</span>
                            <MapPinIcon className="h-4 w-4" />
                            <span className="truncate">{job.location}</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            Đăng ngày: {dayjs(job.createdAt).format('DD/MM/YYYY')}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-6">Công ty hiện chưa có tin tuyển dụng nào.</p>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetailsPage;