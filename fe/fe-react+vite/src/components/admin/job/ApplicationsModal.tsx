import React, { useState, useEffect, useCallback } from 'react';
import { callFetchApplicationsByJob, callUpdateApplicationStatus, IApplication, analyzeAndExportApplications } from '@/services/applications.service';
import { IModelPaginate } from '@/types/backend';
import Spinner from '@/components/Spinner';
import { XMarkIcon, DocumentTextIcon, CheckCircleIcon, ClockIcon, ExclamationCircleIcon, ArrowTopRightOnSquareIcon, CurrencyDollarIcon, UserCircleIcon, SparklesIcon, ArrowDownTrayIcon, StarIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import Pagination from '@/components/shared/Pagination';
import { toast } from 'react-toastify';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import CVScoringModal from '@/components/ResumeParsing/CVScoringModal';
import { scoreResumes } from '@/services/resumeParsing.service';

// Restore the interface definition
interface ApplicationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string | null;
  jobTitle?: string;
  jobDescription?: string;
}

// Define possible statuses for select box and rendering (Vietnamese for display mapping)
const applicationStatusMap: { [key: string]: string } = {
  pending: 'Chờ duyệt',
  reviewed: 'Đã xem',
  accepted: 'Chấp nhận',
  rejected: 'Từ chối',
  offered: 'Đã mời'
};
const applicationStatuses = Object.keys(applicationStatusMap);

const ApplicationsModal: React.FC<ApplicationsModalProps> = ({ isOpen, onClose, jobId, jobTitle, jobDescription }) => {
  const [applications, setApplications] = useState<IApplication[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<IModelPaginate<any>['meta'] | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analyzedFile, setAnalyzedFile] = useState<Blob | null>(null);
  const [parsedRowCount, setParsedRowCount] = useState(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [showScoringModal, setShowScoringModal] = useState<boolean>(false);
  const [isScoring, setIsScoring] = useState<boolean>(false);

  // Restore fetchApplications function
  const fetchApplications = useCallback(async (page: number) => {
    if (!jobId) return;

    setIsLoading(true);
    setError(null);
    //build query string
    const query = `current=${page}&pageSize=${pageSize}&populate=userId`;

    try {
      const res = await callFetchApplicationsByJob(jobId, query);
      if (res && res.data) {
        setApplications(res.data.result);
        setMeta(res.data.meta);
      } else {
        setError("Không thể tải danh sách ứng viên.");
        setApplications([]);
        setMeta(null);
      }
    } catch (err: any) {
      setError("Lỗi khi tải danh sách ứng viên.");
      console.error("Fetch Applications Error:", err);
      setApplications([]);
      setMeta(null);
      toast.error(err?.response?.data?.message || err.message || "Lỗi không xác định");
    } finally {
      setIsLoading(false);
    }
  }, [jobId, pageSize]);

  useEffect(() => {
    if (isOpen && jobId) {
      setCurrentPage(1);
      fetchApplications(1);
      setAnalyzedFile(null);
      setParsedRowCount(0);
    } else {
      setApplications([]);
      setMeta(null);
      setError(null);
      setIsLoading(false);
      setAnalyzedFile(null);
      setParsedRowCount(0);
    }
  }, [isOpen, jobId, fetchApplications]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchApplications(page);
  };

  const handleUpdateStatus = async (applicationId: string, newStatus: string) => {
    if (!applicationId || !newStatus) return;
    const currentApp = applications.find(app => app._id === applicationId);
    if (currentApp?.status === newStatus) return;

    setUpdatingStatusId(applicationId);

    try {
      const res = await callUpdateApplicationStatus(applicationId, { status: newStatus });
      if (res && res.message) {
        toast.success(res.message || "Cập nhật trạng thái thành công!");
        setApplications(prevApps =>
          prevApps.map(app =>
            app._id === applicationId ? { ...app, status: newStatus } : app
          )
        );
      } else {
        toast.error("Cập nhật trạng thái thất bại.");
      }
    } catch (error: any) {
      console.error("Update Status Error:", error);
      toast.error(error?.response?.data?.message || error.message || "Lỗi khi cập nhật trạng thái.");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  //Trích xuất CV
  const handleAnalyze = async () => {
    if (!jobId) return;
    //Initialize UI State Before Calling API
    setIsAnalyzing(true);
    setAnalyzedFile(null);
    setParsedRowCount(0);
    setError(null);
    toast.info("Bắt đầu quá trình phân tích hồ sơ. Quá trình này có thể mất vài phút...");

    try {
      const response = await analyzeAndExportApplications(jobId);

      let blobToSave: Blob | null = null;

      if (response instanceof Blob) {
        blobToSave = response;
      } else if (response && response.data instanceof Blob) {
        blobToSave = response.data;
      }
      //If blob is valid, read back to count records number
      if (blobToSave && blobToSave.size > 0) {
        const data = await blobToSave.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        setAnalyzedFile(blobToSave);
        setParsedRowCount(jsonData.length);
        toast.success(`Phân tích thành công ${jsonData.length} hồ sơ. Sẵn sàng để xuất file.`);
      } else {
        throw new Error("Dữ liệu trả về không hợp lệ hoặc không có hồ sơ nào được phân tích.");
      }

    } catch (err: any) {
      console.error("Analysis Error:", err);
      let errorMessage = "Lỗi không xác định khi phân tích hồ sơ.";

      // Cố gắng đọc lỗi từ backend nếu có
      if (err.response && err.response.data) {
        if (err.response.data instanceof Blob) {
          try {
            const errorText = await err.response.data.text();
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || "Lỗi từ server";
          } catch (e) {
            errorMessage = "Không thể đọc lỗi từ server";
          }
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExport = async (format: 'excel' | 'csv') => {
    if (!analyzedFile) {
      toast.warn("Không có dữ liệu để xuất. Vui lòng phân tích trước.");
      return;
    }

    setIsExporting(true);
    toast.info(`Đang tạo file ${format.toUpperCase()}...`);

    try {
      if (format === 'excel') {
        saveAs(analyzedFile, `Analyzed_CVs_${jobTitle || jobId}_${dayjs().format('YYYYMMDD')}.xlsx`);
        toast.success("Xuất file Excel thành công!");
      } else { // CSV
        const data = await analyzedFile.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];

        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

        const flattenedData = jsonData.map(row => {
          const newRow = {};
          for (const key in row) {
            if (typeof row[key] === 'string') {
              newRow[key] = row[key].replace(/\r?\n/g, ' ');
            } else {
              newRow[key] = row[key];
            }
          }
          return newRow;
        });

        // Convert the flattened JSON back to a worksheet, then to a clean CSV
        const newWorksheet = XLSX.utils.json_to_sheet(flattenedData);
        const csvOutput = XLSX.utils.sheet_to_csv(newWorksheet);

        const blob = new Blob([`\uFEFF${csvOutput}`], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel UTF-8 compatibility
        saveAs(blob, `Analyzed_CVs_${jobTitle || jobId}_${dayjs().format('YYYYMMDD')}.csv`);
        toast.success("Xuất file CSV thành công!");
      }
    } catch (error) {
      console.error("Export Error:", error);
      toast.error("Đã có lỗi xảy ra khi xuất file.");
    } finally {
      setIsExporting(false);
    }
  };
  //Chấm điểm CV 
  const handleScore = async (file: File) => {
    setIsScoring(true);
    try {
      if (!jobDescription) {
        toast.error("Không tìm thấy mô tả công việc để chấm điểm.");
        setIsScoring(false);
        return;
      }

      await scoreResumes({
        jd: jobDescription,
        file: file,
      });

      setShowScoringModal(false);
      toast.success('Đã chấm điểm và tải file Excel thành công!');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Có lỗi xảy ra khi chấm điểm CV.';
      console.error("Error scoring resumes:", error);
      toast.error(errorMessage);
    } finally {
      setIsScoring(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <span className="flex items-center text-xs font-medium text-yellow-800 bg-yellow-100 px-2.5 py-0.5 rounded-full"><ClockIcon className="h-3 w-3 mr-1" />{applicationStatusMap.pending}</span>;
      case 'reviewed':
        return <span className="flex items-center text-xs font-medium text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full"><CheckCircleIcon className="h-3 w-3 mr-1" />{applicationStatusMap.reviewed}</span>;
      case 'accepted':
        return <span className="flex items-center text-xs font-medium text-green-800 bg-green-100 px-2.5 py-0.5 rounded-full"><CheckCircleIcon className="h-3 w-3 mr-1" />{applicationStatusMap.accepted}</span>;
      case 'rejected':
        return <span className="flex items-center text-xs font-medium text-red-800 bg-red-100 px-2.5 py-0.5 rounded-full"><ExclamationCircleIcon className="h-3 w-3 mr-1" />{applicationStatusMap.rejected}</span>;
      case 'offered':
        return <span className="flex items-center text-xs font-medium text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full"><CurrencyDollarIcon className="h-3 w-3 mr-1" />{applicationStatusMap.offered}</span>;
      default:
        return <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-full">{status}</span>;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-out">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl transform transition-all max-h-[90vh] flex flex-col scale-95 opacity-0 animate-modal-scale-in">
        {/* Header */}
        <div className="flex justify-between items-center p-4 md:p-5 border-b border-gray-200 flex-shrink-0 bg-gray-50 rounded-t-lg">
          <h3 className="text-lg font-semibold text-gray-800">
            Danh sách ứng viên {jobTitle ? `cho "${jobTitle}"` : ''}
          </h3>
          <div className='flex items-center gap-4'>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExport('excel')}
                disabled={!analyzedFile || isExporting || isAnalyzing}
                className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors text-sm font-medium border shadow-sm ${!analyzedFile || isExporting || isAnalyzing
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                  : 'bg-green-500 text-white hover:bg-green-600 border-green-500'
                  }`}
              >
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                <span>Xuất Excel</span>
                <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${!analyzedFile || isExporting || isAnalyzing
                  ? 'bg-gray-200 text-gray-500'
                  : 'bg-green-400 text-white'
                  }`}>
                  {parsedRowCount}/{meta?.total || 0}
                </span>
              </button>
              <button
                onClick={() => handleExport('csv')}
                disabled={!analyzedFile || isExporting || isAnalyzing}
                className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors text-sm font-medium border shadow-sm ${!analyzedFile || isExporting || isAnalyzing
                  ? 'bg-gray-200 text-gray-500'
                  : 'bg-green-400 text-white'
                  }`}>
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                <span>Xuất CSV</span>
                <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${!analyzedFile || isExporting || isAnalyzing
                  ? 'bg-gray-200 text-gray-500'
                  : 'bg-green-400 text-white'
                  }`}>
                  {parsedRowCount}/{meta?.total || 0}
                </span>
              </button>
              <button
                onClick={() => setShowScoringModal(true)}
                disabled={isLoading || isAnalyzing || isExporting || isScoring || applications.length === 0}
                className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors text-sm font-medium border shadow-sm ${isLoading || isAnalyzing || isExporting || isScoring || applications.length === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                  : 'bg-purple-500 text-white hover:bg-purple-600 border-purple-500'
                  }`}
                title={applications.length === 0 ? "Chưa có ứng viên để chấm điểm" : "Chấm điểm CV hàng loạt"}
              >
                <StarIcon className="h-5 w-5 mr-2" />
                <span>Chấm điểm CV</span>
              </button>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors"
              title="Đóng"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 md:p-6 overflow-y-auto flex-grow">
          {isLoading && <div className="text-center py-10"><Spinner /></div>}
          {!isLoading && error && (
            <div className="text-center py-10 text-red-700 bg-red-50 p-4 rounded-md border border-red-200">
              <p>Lỗi: {error}</p>
            </div>
          )}
          {!isLoading && !error && applications.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="font-medium">Chưa có ứng viên.</p>
              <p className="text-sm">Hiện tại chưa có ai ứng tuyển vào vị trí này.</p>
            </div>
          )}
          {!isLoading && !error && applications.length > 0 && (
            <div className="overflow-hidden">
              <ul role="list" className="divide-y divide-gray-200">
                {applications.map((app) => (
                  <li key={app._id} className={`py-4 px-1 hover:bg-gray-50 transition-colors duration-150`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                      {/* Applicant Info */}
                      <div className="flex items-center space-x-3 flex-grow min-w-0">
                        <div className="flex-shrink-0">
                          <UserCircleIcon className="h-10 w-10 text-gray-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-gray-800">
                            {typeof app.userId === 'object' && app.userId.name ? app.userId.name : 'Không rõ tên'}
                          </p>
                          <p className="truncate text-sm text-gray-500">
                            {typeof app.userId === 'object' && app.userId.email ? app.userId.email : 'Không rõ email'}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Nộp lúc: {dayjs(app.createdAt).format('HH:mm DD/MM/YYYY')}
                          </p>
                        </div>
                      </div>
                      {/* Actions Column */}
                      <div className="flex items-center justify-end sm:justify-start space-x-3 flex-shrink-0 w-full sm:w-auto">
                        {/* View CV Link */}
                        <a
                          href={app.cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-md bg-white p-1.5 text-xs font-medium text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                          title="Xem CV"
                        >
                          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                        </a>

                        {/* Status Select Box */}
                        <div className="relative min-w-[120px]">
                          <select
                            value={app.status}
                            onChange={(e) => handleUpdateStatus(app._id, e.target.value)}
                            disabled={updatingStatusId === app._id}
                            className={`block w-full rounded-md border-0 py-1 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-xs sm:leading-6 appearance-none transition-colors ${updatingStatusId === app._id ? 'opacity-60 cursor-not-allowed bg-gray-100' : 'bg-white'}`}
                          >
                            {applicationStatuses.map(statusKey => (
                              <option key={statusKey} value={statusKey}>
                                {applicationStatusMap[statusKey]} {/* Display Vietnamese status */}
                              </option>
                            ))}
                          </select>
                          {updatingStatusId === app._id && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                              <Spinner />
                            </div>
                          )}
                        </div>
                        {/* Display Status Badge */}
                        <div className="min-w-[90px] text-right">
                          {renderStatusBadge(app.status)}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-200 flex-shrink-0 bg-gray-50 rounded-b-lg gap-4">
          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || isLoading || applications.length === 0}
            className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
          >
            {isAnalyzing ? (
              <>
                <Spinner />
                <span className="ml-2">Đang phân tích...</span>
              </>
            ) : (
              <>
                <SparklesIcon className="h-5 w-5 mr-2" />
                <span>Phân tích hồ sơ ứng viên</span>
              </>
            )}
          </button>

          {/* Pagination */}
          {!isLoading && !error && meta && meta.pages > 1 && (
            <Pagination
              currentPage={meta.current}
              totalPages={meta.pages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
      {showScoringModal && (
        <CVScoringModal
          onClose={() => setShowScoringModal(false)}
          onScore={handleScore}
          jobDescription={jobDescription}
          isLoading={isScoring}
        />
      )}
    </div>
  );
};

export default ApplicationsModal;

// Add animation keyframes (if not already globally defined)
const style = document.createElement('style');
style.innerHTML = `
@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.animate-modal-scale-in {
  animation: scaleIn 0.2s ease-out forwards;
}
`;
document.head.appendChild(style);
