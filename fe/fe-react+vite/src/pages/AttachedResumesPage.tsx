import React, { useState, useEffect, useRef } from 'react';
import UserDashboardSidebar from '@/layouts/components/UserDashboardSidebar';
import { useAuth } from '@/contexts/AuthContext';
import Spinner from '@/components/Spinner';
import { uploadFile } from '@/services/storage.service'; // Import Firebase upload service
import { callGetAttachedCvs, callAddAttachedCv, callDeleteAttachedCv } from '@/services/user.service';
import { toast } from 'react-toastify';
import { DocumentArrowUpIcon, DocumentCheckIcon, TrashIcon, LinkIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { IUser, IAttachedCv } from '@/types/backend';

const AttachedResumesPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [attachedCvs, setAttachedCvs] = useState<IAttachedCv[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch attached CVs on mount
  useEffect(() => {
    const fetchAttachedCvs = async () => {
      if (!authLoading && user) {
        setIsLoading(true);
        try {
          const res = await callGetAttachedCvs();
          if (res && res.data) {
            setAttachedCvs(res.data);
          } else {
            toast.error(res?.message || "Không thể tải danh sách CV.");
          }
        } catch (err) {
          toast.error("Lỗi tải danh sách CV.");
          console.error("Fetch Attached CVs Error:", err);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchAttachedCvs();
  }, [user, authLoading]);

  // Trigger hidden file input
  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection and upload
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Basic validation (e.g., file type, size)
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
        toast.error('Chỉ chấp nhận file PDF hoặc DOC/DOCX.');
        return;
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        toast.error('Kích thước file không được vượt quá 5MB.');
        return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. Upload to Firebase
      const downloadURL = await uploadFile(file, 'user-cvs', (progress) => {
        setUploadProgress(progress);
      });

      // 2. Add the CV to the user's attached CVs
      const res = await callAddAttachedCv({ 
        name: file.name,
        url: downloadURL
      });
      
      if (res && res.data) {
        // Update the CV list with the new data from user object
        const updatedUser = res.data;
        if (updatedUser.attachedCvs) {
          setAttachedCvs(updatedUser.attachedCvs);
        }
        toast.success('Tải lên CV thành công!');
      } else {
        toast.error(res?.message || 'Lỗi cập nhật danh sách CV.');
      }
    } catch (error: any) {
      console.error("Upload/Update Error:", error);
      toast.error(typeof error === 'string' ? error : 'Đã có lỗi xảy ra trong quá trình tải lên.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Clear file input value so the same file can be selected again
      if (fileInputRef.current) {
          fileInputRef.current.value = "";
      }
    }
  };

  // Handle CV removal
  const handleRemoveCv = async (cvId: string) => {
    if (!cvId) return;

    setIsDeletingId(cvId);
    try {
      const res = await callDeleteAttachedCv(cvId);
      if (res && res.data) {
        // Update the CV list with the new data from user object
        const updatedUser = res.data;
        if (updatedUser.attachedCvs) {
          setAttachedCvs(updatedUser.attachedCvs);
        } else {
          // If no CVs left, set to empty array
          setAttachedCvs([]);
        }
        toast.success('Đã xóa CV thành công.');
      } else {
        toast.error(res?.message || 'Lỗi xóa CV.');
      }
    } catch (error: any) {
      console.error("Remove CV Error:", error);
      toast.error(error?.response?.data?.message || 'Lỗi xóa CV.');
    } finally {
      setIsDeletingId(null);
    }
  };

  // Loading states
  if (authLoading || isLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Spinner /></div>;
  }

  if (!user) {
    return <div className="p-6 text-center text-gray-500">Vui lòng đăng nhập.</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-6 md:p-8">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
          <div className="md:col-span-1 lg:col-span-1">
            <UserDashboardSidebar user={user} />
          </div>
          <div className="md:col-span-3 lg:col-span-4 space-y-6 md:space-y-8">
            <h1 className="text-2xl font-semibold text-gray-800 mb-1">CV Đã Tải Lên</h1>
            <p className="text-gray-600 mb-6">Quản lý danh sách CV của bạn. Các CV này có thể được sử dụng khi ứng tuyển.</p>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Danh sách CV</h2>
                
                {/* Upload Button */}
                <button 
                  onClick={handleUploadButtonClick}
                  disabled={isUploading}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 flex items-center justify-center"
                >
                  {isUploading ? (
                    <>
                      <span className="mr-2"><Spinner /></span> Đang tải...
                    </>
                  ) : (
                    <>
                      <PlusCircleIcon className="h-5 w-5 mr-1.5" />
                      Tải lên CV mới
                    </>
                  )}
                </button>
              </div>

              {isUploading && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Đang tải lên: {Math.round(uploadProgress)}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}

              {/* List of CVs or Empty State */}
              {attachedCvs.length > 0 ? (
                <div className="space-y-3">
                  {attachedCvs.map((cv) => (
                    <div key={cv._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-md bg-gray-50">
                      <div className="flex items-center">
                        <DocumentCheckIcon className="h-6 w-6 text-green-600 mr-3 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">{cv.name}</p>
                          <a 
                            href={cv.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline break-all flex items-center"
                          >
                            Xem CV <LinkIcon className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveCv(cv._id)}
                        disabled={isDeletingId === cv._id}
                        className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed ml-4"
                        aria-label="Xóa CV"
                      >
                        {isDeletingId === cv._id ? <Spinner /> : <TrashIcon className="h-5 w-5" />} 
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                // Show upload prompt if no CV
                <div className="border border-dashed border-gray-300 rounded-md p-6 text-center text-gray-500">
                  <p>Chưa có CV nào được tải lên.</p>
                  <p className="text-sm mt-2">Tải lên CV để bắt đầu quản lý hồ sơ của bạn.</p>
                </div>
              )}

              {/* Hidden File Input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden"
                accept=".pdf,.doc,.docx"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttachedResumesPage; 