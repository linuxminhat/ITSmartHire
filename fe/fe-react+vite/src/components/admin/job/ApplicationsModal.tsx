import React, { useState, useEffect, useCallback } from 'react';
import { callFetchApplicationsByJob, callUpdateApplicationStatus, IApplication } from '@/services/applications.service';
import { IModelPaginate } from '@/types/backend';
import Spinner from '@/components/Spinner';
// Remove unused icons, add icons if needed for status rendering
import { XMarkIcon, DocumentTextIcon, CheckCircleIcon, ClockIcon, ExclamationCircleIcon, ArrowTopRightOnSquareIcon, CurrencyDollarIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import Pagination from '@/components/shared/Pagination';
import { toast } from 'react-toastify';

// Restore the interface definition
interface ApplicationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string | null;
  jobTitle?: string; 
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

const ApplicationsModal: React.FC<ApplicationsModalProps> = ({ isOpen, onClose, jobId, jobTitle }) => {
  // Restore states
  const [applications, setApplications] = useState<IApplication[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<IModelPaginate<any>['meta'] | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5; 
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // Restore fetchApplications function
  const fetchApplications = useCallback(async (page: number) => {
    if (!jobId) return;

    setIsLoading(true);
    setError(null);
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

  // Restore useEffect to fetch data
  useEffect(() => {
    if (isOpen && jobId) {
      setCurrentPage(1); 
      fetchApplications(1);
    } else {
      setApplications([]);
      setMeta(null);
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen, jobId, fetchApplications]);

  // Restore handlePageChange function
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchApplications(page);
  };

  // handleUpdateStatus remains largely the same
  const handleUpdateStatus = async (applicationId: string, newStatus: string) => {
    if (!applicationId || !newStatus) return;
    // Prevent updating to the same status
    const currentApp = applications.find(app => app._id === applicationId);
    if (currentApp?.status === newStatus) return;

    setUpdatingStatusId(applicationId);

    try {
      const res = await callUpdateApplicationStatus(applicationId, { status: newStatus });
      if (res && res.message) {
        toast.success(res.message || "Cập nhật trạng thái thành công!"); // Use backend message or default
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

  // Render status with Vietnamese text and icons
  const renderStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <span className="flex items-center text-xs font-medium text-yellow-800 bg-yellow-100 px-2.5 py-0.5 rounded-full"><ClockIcon className="h-3 w-3 mr-1"/>{applicationStatusMap.pending}</span>;
      case 'reviewed':
        return <span className="flex items-center text-xs font-medium text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full"><CheckCircleIcon className="h-3 w-3 mr-1"/>{applicationStatusMap.reviewed}</span>;
      case 'accepted':
        return <span className="flex items-center text-xs font-medium text-green-800 bg-green-100 px-2.5 py-0.5 rounded-full"><CheckCircleIcon className="h-3 w-3 mr-1"/>{applicationStatusMap.accepted}</span>;
      case 'rejected':
        return <span className="flex items-center text-xs font-medium text-red-800 bg-red-100 px-2.5 py-0.5 rounded-full"><ExclamationCircleIcon className="h-3 w-3 mr-1"/>{applicationStatusMap.rejected}</span>;
      case 'offered':
        return <span className="flex items-center text-xs font-medium text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full"><CurrencyDollarIcon className="h-3 w-3 mr-1"/>{applicationStatusMap.offered}</span>;
      default:
        return <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-full">{status}</span>;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-out">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl transform transition-all max-h-[90vh] flex flex-col scale-95 opacity-0 animate-modal-scale-in">
        {/* Header */}
        <div className="flex justify-between items-center p-4 md:p-5 border-b border-gray-200 flex-shrink-0 bg-gray-50 rounded-t-lg">
          <h3 className="text-lg font-semibold text-gray-800">
            Danh sách ứng viên {jobTitle ? `cho "${jobTitle}"` : ''}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors"
            title="Đóng"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
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
                            <UserCircleIcon className="h-10 w-10 text-gray-400"/>
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
                              <ArrowTopRightOnSquareIcon className="h-4 w-4"/>
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
                                    <Spinner/>
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

        {/* Footer with Pagination */}
        {!isLoading && !error && meta && meta.pages > 1 && (
          <div className="flex justify-center p-4 border-t border-gray-200 flex-shrink-0 bg-gray-50 rounded-b-lg">
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
