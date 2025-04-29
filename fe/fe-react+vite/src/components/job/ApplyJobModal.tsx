import React, { useState, useEffect, useRef } from 'react';
import { IAttachedCv } from '@/types/backend';
import { XMarkIcon, DocumentArrowUpIcon, DocumentCheckIcon, PaperClipIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { uploadFile } from '@/services/storage.service';
import { toast } from 'react-toastify';

interface ApplyJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvList: IAttachedCv[];
  jobTitle: string;
  companyName: string;
  onSubmit: (selectedCvUrl: string) => void;
  isLoading: boolean;
}

const ApplyJobModal: React.FC<ApplyJobModalProps> = ({
  isOpen,
  onClose,
  cvList,
  jobTitle,
  companyName,
  onSubmit,
  isLoading: isSubmitting,
}) => {
  const [selectedCv, setSelectedCv] = useState<IAttachedCv | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedCv(cvList.length > 0 ? cvList[0] : null);
      setSelectedFile(null);
      setUploadProgress(0);
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } 
  }, [isOpen, cvList]);

  const handleCvSelection = (cv: IAttachedCv) => {
    setSelectedCv(cv);
    setSelectedFile(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Định dạng file không hợp lệ. Vui lòng chọn file PDF, DOC, hoặc DOCX.');
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }
        const maxSizeMB = 5;
        if (file.size > maxSizeMB * 1024 * 1024) {
            toast.error(`Dung lượng file không được vượt quá ${maxSizeMB}MB.`);
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        setSelectedFile(file);
        setSelectedCv(null);
    }
  };

  const handleSubmit = async () => {
    if (selectedCv) {
      onSubmit(selectedCv.url);
    } else if (selectedFile) {
      setIsUploading(true);
      setUploadProgress(0);
      try {
        const downloadURL = await uploadFile(
          selectedFile,
          'job-applications',
          (progress) => setUploadProgress(progress)
        );
        onSubmit(downloadURL);
      } catch (error: any) {
        console.error("Upload failed:", error);
        toast.error(`Lỗi upload file: ${error.message || error}`);
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    } else {
        toast.warn("Vui lòng chọn CV đính kèm hoặc tải lên CV mới.")
    }
  };

  if (!isOpen) return null;

  const isSubmitDisabled = isSubmitting || isUploading || (!selectedCv && !selectedFile);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg transform transition-all">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
             <DocumentArrowUpIcon className="h-6 w-6 mr-2 text-indigo-600"/>
             Xác nhận ứng tuyển
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            disabled={isSubmitting || isUploading}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
              <p className="text-sm text-gray-600 mb-1">Bạn đang ứng tuyển vào vị trí:</p>
              <p className="font-semibold text-gray-800 mb-1">{jobTitle}</p>
              <p className="text-sm text-gray-500 mb-4">tại {companyName}</p>
          </div>

          {cvList.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Chọn CV đã đính kèm:</p>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3 bg-gray-50">
                {cvList.map((cv) => (
                  <div
                    key={cv._id}
                    onClick={() => handleCvSelection(cv)}
                    className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors duration-150 ${selectedCv?._id === cv._id ? 'bg-indigo-100 border border-indigo-300' : 'hover:bg-gray-100 border border-transparent'}`}
                  >
                    <span className="text-sm font-medium text-gray-800 truncate" title={cv.name}>{cv.name}</span>
                    {selectedCv?._id === cv._id && (
                      <DocumentCheckIcon className="h-5 w-5 text-indigo-600 flex-shrink-0 ml-2" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-2 text-sm text-gray-500">hoặc</span>
            </div>
          </div>

          <div>
            <label htmlFor="cv-upload" className="block text-sm font-medium text-gray-700 mb-2">Tải lên CV mới (PDF, DOC, DOCX, tối đa 5MB):</label>
            <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${selectedFile ? 'border-indigo-300' : 'border-gray-300'} border-dashed rounded-md`}>
              <div className="space-y-1 text-center">
                <ArrowUpTrayIcon className={`mx-auto h-12 w-12 ${selectedFile ? 'text-indigo-400' : 'text-gray-400'}`} />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="cv-file-upload"
                    className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                  >
                    <span>Chọn file để tải lên</span>
                    <input id="cv-file-upload" name="cv-file-upload" type="file" className="sr-only" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.doc,.docx"/>
                  </label>
                  <p className="pl-1">hoặc kéo thả vào đây</p>
                </div>
                {selectedFile ? (
                  <p className="text-sm text-gray-900 font-medium truncate pt-2" title={selectedFile.name}>{selectedFile.name}</p>
                ) : (
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX tối đa 5MB</p>
                )}
              </div>
            </div>
            {isUploading && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
                    <div className="bg-indigo-600 h-2.5 rounded-full transition-width duration-300 ease-linear" style={{ width: `${uploadProgress}%` }}></div>
                </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end items-center p-5 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 mr-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            disabled={isSubmitting || isUploading}
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className={`px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isSubmitDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isSubmitDisabled}
          >
            {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang tải lên ({Math.round(uploadProgress)}%)...
                </>
            ) : isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang nộp đơn...
              </>
            ) : 'Xác nhận & Gửi CV'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplyJobModal; 