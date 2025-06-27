import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { callFetchJobById, callFetchSimilarJobs } from '@/services/job.service';
import { callFetchCompanyById } from '@/services/company.service';
import { callGetAttachedCvs } from '@/services/user.service';
import { callApplyJob } from '@/services/applications.service';
import { IJob, ICategory, ISkill, ICompany, IUser, IAttachedCv } from '@/types/backend';
import Spinner from '@/components/Spinner';
import dayjs from 'dayjs';
import { MapPinIcon, CurrencyDollarIcon, BriefcaseIcon, AcademicCapIcon, ClockIcon, TagIcon, CalendarIcon, ExclamationTriangleIcon, HeartIcon, BuildingOffice2Icon, UsersIcon, GlobeAltIcon, CalendarDaysIcon, BuildingLibraryIcon, WifiIcon, SparklesIcon } from '@heroicons/react/24/outline';
import DOMPurify from 'dompurify';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';
import ApplyJobModal from '@/components/job/ApplyJobModal';

const JobDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();//get job id from URL
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();//get Auth
  const [job, setJob] = useState<IJob | null>(null);
  const [companyDetails, setCompanyDetails] = useState<ICompany | null>(null);
  const [similarJobs, setSimilarJobs] = useState<IJob[]>([]);
  const [attachedCvs, setAttachedCvs] = useState<IAttachedCv[]>([]);
  // Loading flags
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingCompany, setIsLoadingCompany] = useState<boolean>(false);
  const [isLoadingSimilarJobs, setIsLoadingSimilarJobs] = useState<boolean>(false);
  const [isLoadingCvs, setIsLoadingCvs] = useState<boolean>(false);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  // Error messages
  const [error, setError] = useState<string | null>(null);
  const [errorCompany, setErrorCompany] = useState<string | null>(null);
  const [errorSimilarJobs, setErrorSimilarJobs] = useState<string | null>(null);
  const [errorCvs, setErrorCvs] = useState<string | null>(null);
  // Modal open flag
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);

  const fetchSimilarJobs = async (jobId: string) => {
    setIsLoadingSimilarJobs(true);
    setErrorSimilarJobs(null);
    try {
      const res = await callFetchSimilarJobs(jobId, 5);
      if (res && res.data) {
        setSimilarJobs(res.data);
      } else {
        setErrorSimilarJobs("Không thể tải công việc tương tự.");
        console.warn("Could not fetch similar jobs:", res?.message);
      }
    } catch (err: any) {
      setErrorSimilarJobs("Lỗi tải công việc tương tự.");
      console.error("Fetch Similar Jobs Error:", err);
    } finally {
      setIsLoadingSimilarJobs(false);
    }
  };

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!id) {
        setError("Không tìm thấy ID việc làm.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      setErrorCompany(null);
      setErrorSimilarJobs(null);
      setSimilarJobs([]);
      try {
        const res = await callFetchJobById(id);
        if (res && res.data) {
          setJob(res.data);
          if (res.data._id) {
            fetchSimilarJobs(res.data._id);
          }
          if (res.data.company?._id) {
            fetchCompanyDetails(res.data.company._id);
          }
        } else {
          setError("Không thể tải chi tiết việc làm.");
          toast.error(res?.message || "Không thể tải chi tiết việc làm.");
        }
      } catch (err: any) {
        setError("Lỗi tải chi tiết việc làm.");
        toast.error("Lỗi tải chi tiết việc làm.");
        console.error("Fetch Job Details Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCompanyDetails = async (companyId: string) => {
      setIsLoadingCompany(true);
      setErrorCompany(null);
      try {
        const res = await callFetchCompanyById(companyId);
        if (res && res.data) {
          setCompanyDetails(res.data);
        } else {
          setErrorCompany("Không thể tải thông tin công ty.");
        }
      } catch (err: any) {
        setErrorCompany("Lỗi tải thông tin công ty.");
        console.error("Fetch Company Details Error:", err);
      } finally {
        setIsLoadingCompany(false);
      }
    };

    const fetchUserCvs = async () => {
      if (!isAuthenticated) return;

      setIsLoadingCvs(true);
      setErrorCvs(null);
      try {
        const res = await callGetAttachedCvs();
        if (res && res.data) {
          setAttachedCvs(res.data);
        } else {
          setErrorCvs("Không thể tải danh sách CV của bạn.");
        }
      } catch (err: any) {
        setErrorCvs("Lỗi khi tải CV.");
        console.error("Fetch User CVs Error:", err);
      } finally {
        setIsLoadingCvs(false);
      }
    };

    fetchJobDetails();
    fetchUserCvs();
  }, [id, isAuthenticated]);

  useEffect(() => {
    dayjs.locale('vi');
    dayjs.extend(relativeTime);
  }, []);

  const createMarkup = (htmlContent: string | undefined) => {
    if (!htmlContent) return { __html: '' };
    const sanitizedHtml = DOMPurify.sanitize(htmlContent);
    return { __html: sanitizedHtml };
  };

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để ứng tuyển.");
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (!attachedCvs || attachedCvs.length === 0) {
      toast.warn("Bạn chưa có CV nào được đính kèm. Vui lòng thêm CV tại trang Hồ sơ đính kèm.");
      navigate('/resumes/attached');
      return;
    }
    setIsApplyModalOpen(true);
  };

  const handleConfirmApply = async (selectedCvUrl: string) => {
    if (!job?._id || !selectedCvUrl) {
      toast.error("Thông tin không hợp lệ để ứng tuyển.");
      return;
    }

    setIsApplying(true);
    try {
      const payload = { jobId: job._id, cvUrl: selectedCvUrl };
      const res = await callApplyJob(payload);

      if (res && res.message) {
        toast.success(res.message);
      } else {
        toast.success('Nộp đơn ứng tuyển thành công!');
      }
      setIsApplyModalOpen(false);

    } catch (error: any) {
      console.error("Apply Job Error:", error);
      const errorMessage = error?.response?.data?.message || error.message || 'Có lỗi xảy ra khi nộp đơn.';
      if (typeof errorMessage === 'string' && errorMessage.includes('đã ứng tuyển')) {
        toast.info(errorMessage);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Spinner /></div>;
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-6xl py-10 px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold mr-2">Lỗi!</strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto max-w-6xl py-10 px-4">
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold mr-2">Thông báo!</strong>
          <span className="block sm:inline">Không tìm thấy thông tin việc làm.</span>
        </div>
      </div>
    );
  }

  const renderCompanyDetail = (icon: React.ElementType, label: string, value: string | undefined | null) => {
    if (!value) return null;
    const IconComponent = icon;
    return (
      <div className="flex justify-between py-2 border-b border-gray-200 last:border-b-0">
        <span className="text-sm text-gray-600 flex items-center">
          <IconComponent className="h-4 w-4 mr-2 text-gray-500" />
          {label}
        </span>
        <span className="text-sm font-medium text-gray-800 text-right">{value}</span>
      </div>
    );
  };

  const handleSimilarJobClick = (jobId: string) => {
    navigate(`/job/${jobId}`);
    window.scrollTo(0, 0);
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      <div className="bg-white shadow-sm border-b border-gray-200 pt-16 pb-8">
        <div className="container mx-auto max-w-6xl px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{job.name}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-base">
            <Link
              to={`/company/${job.company?._id}`}
              className="text-gray-700 hover:text-indigo-600 font-medium transition duration-300"
            >
              {job.company?.name || 'Không rõ công ty'}
            </Link>
            {job.isHot && (
              <span className="flex items-center text-sm text-green-600 bg-green-100 px-2 py-0.5 rounded">
                <CurrencyDollarIcon className="h-4 w-4 mr-1" /> You'll love it
              </span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button
              className="w-full sm:w-auto flex-grow bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-md transition duration-300 shadow-sm text-center disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleApplyClick}
              disabled={isApplying || isLoadingCvs}
            >
              {isLoadingCvs ? 'Đang tải CV...' : isApplying ? 'Đang nộp đơn...' : 'Ứng tuyển ngay'}
            </button>
            <button className="w-full sm:w-auto border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium py-2.5 px-4 rounded-md transition duration-300 flex items-center justify-center">
              <HeartIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm text-gray-600 pt-4 border-t border-gray-100">
            <div className="flex items-center">
              <MapPinIcon className="h-4 w-4 mr-1.5 text-gray-500" /> {job.location}
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-1.5 text-gray-500" /> {job.jobType}
            </div>
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1.5 text-gray-500" /> Đăng {dayjs(job.createdAt).fromNow()}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl py-10 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-lg shadow-lg border border-gray-200">
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Kỹ năng yêu cầu</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills?.map((skill, index) => (
                  <span key={index} className="bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1 rounded-full border border-gray-200">
                    {typeof skill === 'string' ? skill : skill.name}
                  </span>
                ))}
                {(!job.skills || job.skills.length === 0) && <span className="text-sm text-gray-500">Không yêu cầu kỹ năng cụ thể</span>}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Mô tả công việc</h2>
              <div className="prose prose-sm max-w-none prose-indigo text-gray-700" dangerouslySetInnerHTML={createMarkup(job.description)} />
            </div>

            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Chi tiết công việc</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm text-gray-700">
                {renderCompanyDetail(CurrencyDollarIcon, "Mức lương", job.salary ? `${job.salary.toLocaleString()} đ` : 'Thỏa thuận')}
                {renderCompanyDetail(BriefcaseIcon, "Cấp bậc", job.level)}
                {renderCompanyDetail(AcademicCapIcon, "Kinh nghiệm", job.experience)}
                {renderCompanyDetail(ClockIcon, "Hình thức", job.jobType)}
                {renderCompanyDetail(TagIcon, "Ngành nghề", typeof job.category === 'string' ? job.category : job.category?.name)}
                {renderCompanyDetail(UsersIcon, "Số lượng", job.quantity?.toString())}
                {renderCompanyDetail(CalendarDaysIcon, "Hạn nộp", dayjs(job.endDate).format('DD/MM/YYYY'))}
              </div>
            </div>

          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 sticky top-6">
              {isLoadingCompany && <div className="text-center"><Spinner /></div>}
              {errorCompany && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm" role="alert">
                  {errorCompany}
                </div>
              )}
              {!isLoadingCompany && !errorCompany && companyDetails && (
                <>
                  <div className="flex items-center mb-4 pb-4 border-b border-gray-200">
                    <img
                      src={companyDetails.logo || 'https://via.placeholder.com/100/CCCCCC/FFFFFF?text=Cty'}
                      alt={`${companyDetails.name} logo`}
                      className="h-16 w-16 object-contain border rounded-md p-1 bg-white flex-shrink-0 mr-4"
                    />
                    <div>
                      <Link
                        to={`/company/${companyDetails._id}`}
                        className="text-base font-semibold text-gray-800 hover:text-indigo-600 transition duration-300 line-clamp-2"
                      >
                        {companyDetails.name}
                      </Link>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Thông tin công ty</h3>
                  <div className="space-y-1">
                    {renderCompanyDetail(BuildingLibraryIcon, "Mô hình công ty", companyDetails.companyModel)}
                    {renderCompanyDetail(SparklesIcon, "Lĩnh vực công ty", companyDetails.industry)}
                    {renderCompanyDetail(UsersIcon, "Quy mô công ty", companyDetails.companySize)}
                    {renderCompanyDetail(GlobeAltIcon, "Quốc gia", companyDetails.country)}
                    {renderCompanyDetail(CalendarDaysIcon, "Thời gian làm việc", companyDetails.workingTime)}
                  </div>

                  <div className="mt-6">
                    <Link
                      to={`/company/${companyDetails._id}`}
                      className="w-full block text-center text-sm font-medium text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:bg-indigo-50 py-2 px-4 rounded-md transition duration-300"
                    >
                      Xem trang công ty
                    </Link>
                  </div>
                </>
              )}
              {!isLoadingCompany && !errorCompany && !companyDetails && job.company && (
                <p className="text-sm text-gray-500">Đang tải thông tin công ty...</p>
              )}
            </div>
          </div>
        </div>


        {/* Similar Jobs Section */}
        {isLoadingSimilarJobs && (
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 text-center mt-5">
            <Spinner />
            <p className="text-sm text-gray-500 mt-2">Đang tải công việc tương tự...</p>
          </div>
        )}
        {!isLoadingSimilarJobs && similarJobs.length > 0 && (
          <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg border border-gray-200  mt-5">
            <h2 className="text-xl font-semibold text-gray-800 mb-5">Công việc tương tự</h2>
            <div className="grid grid-cols-1 gap-4">
              {similarJobs.map((similarJob) => (
                <div
                  key={similarJob._id}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all duration-200 cursor-pointer"
                  onClick={() => handleSimilarJobClick(similarJob._id!)}
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={similarJob.company?.logo || 'https://via.placeholder.com/60/CCCCCC/FFFFFF?text=Cty'}
                      alt={`${similarJob.company?.name || 'Company'} logo`}
                      className="h-12 w-12 object-contain border rounded-md p-1 bg-white flex-shrink-0 mt-1"
                    />
                    <div className="flex-grow">
                      <h3 className="text-base font-semibold text-indigo-700 hover:text-indigo-800 transition line-clamp-2 mb-1">
                        {similarJob.name}
                      </h3>
                      <p className="text-sm text-gray-700 mb-2 line-clamp-1 font-medium">
                        {similarJob.company?.name || 'Công ty không xác định'}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span className="flex items-center">
                          <CurrencyDollarIcon className="h-3.5 w-3.5 mr-1 text-gray-400" />
                          {similarJob.salary ? `${similarJob.salary.toLocaleString()} đ` : 'Thỏa thuận'}
                        </span>
                        <span className="flex items-center">
                          <MapPinIcon className="h-3.5 w-3.5 mr-1 text-gray-400" />
                          {similarJob.location}
                        </span>
                        {similarJob.isActive && (
                          <span className="flex items-center bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[11px] font-medium">
                            Đang tuyển
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {!isLoadingSimilarJobs && errorSimilarJobs && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-2 rounded text-sm">
            {errorSimilarJobs}
          </div>
        )}
        {/* End Similar Jobs Section */}
      </div>

      <ApplyJobModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        cvList={attachedCvs}
        jobTitle={job?.name || ''}
        companyName={job?.company?.name || ''}
        onSubmit={handleConfirmApply}
        isLoading={isApplying}
      />

    </div>
  );
};

export default JobDetailsPage; 