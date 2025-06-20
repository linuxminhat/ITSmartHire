import React, { useState, useCallback, useMemo } from 'react';
import { XMarkIcon, InformationCircleIcon, DocumentArrowUpIcon, CheckCircleIcon, XCircleIcon, ChevronDownIcon, ChevronUpIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';


interface CVScoringModalProps {
    onClose: () => void;
    onScore: (file: File) => void;
    isLoading?: boolean;
    jobDescription?: string;
}

const CVScoringModal: React.FC<CVScoringModalProps> = ({ onClose, onScore, isLoading = false, jobDescription = '' }) => {
    const [file, setFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [showInstructions, setShowInstructions] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
        setFileError(null);
        if (rejectedFiles && rejectedFiles.length > 0) {
            const firstRejection = rejectedFiles[0];
            if (firstRejection.errors && firstRejection.errors.length > 0) {
                const mainError = firstRejection.errors[0];
                if (mainError.code === 'file-invalid-type') {
                    setFileError('Lỗi: Chỉ chấp nhận file Excel (.xlsx).');
                } else if (mainError.code === 'file-too-large') {
                    setFileError('Lỗi: Kích thước file quá lớn (tối đa 5MB).');
                } else {
                    setFileError(`Lỗi file: ${mainError.message}`);
                }
            } else {
                setFileError('File không hợp lệ.');
            }
            setFile(null);
            return;
        }
        if (acceptedFiles && acceptedFiles.length > 0) {
            const selectedFile = acceptedFiles[0];
            setFile(selectedFile);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        },
        maxFiles: 1,
        multiple: false,
        maxSize: 5 * 1024 * 1024,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) {
            alert('Vui lòng tải lên file Excel đã trích xuất!');
            return;
        }
        onScore(file!);
    };

    const isFormValid = useMemo(() => file !== null && !fileError, [file, fileError]);


    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex items-center justify-center p-4 transition-opacity duration-300">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center px-6 sm:px-8 py-4 border-b sticky top-0 bg-white z-10 rounded-t-xl">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900">Chấm điểm CV theo Job Description</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} id="cv-scoring-form" className="px-6 sm:px-8 py-6 space-y-6 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {jobDescription && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-700">1. Job Description đang được áp dụng</h4>
                            <div 
                                className="prose prose-sm max-w-none w-full p-4 border border-gray-200 bg-gray-50 rounded-lg shadow-sm h-[150px] overflow-y-auto"
                                dangerouslySetInnerHTML={{ __html: jobDescription }}
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-700">{jobDescription ? '2.' : '1.'} Tải file Excel CV đã trích xuất</h4>
                        <div
                            {...getRootProps()}
                            className={`p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ease-in-out
                                ${isDragActive ? 'border-blue-600 bg-blue-100 shadow-md' : 'border-gray-300 hover:border-blue-500 bg-gray-50'}`}
                        >
                            <input {...getInputProps()} id="file-upload-cv-scoring" />
                            <div className="flex flex-col items-center justify-center text-center">
                                {isDragActive ? (
                                    <ArrowsPointingOutIcon className="h-10 w-10 text-blue-600 mb-2 animate-pulse" />
                                ) : (
                                    <DocumentArrowUpIcon className="h-10 w-10 text-gray-400 mb-2 group-hover:text-blue-500 transition-colors" />
                                )}
                                {isDragActive ? (
                                    <p className="text-sm font-medium text-blue-700">Thả file vào đây...</p>
                                ) : (
                                    <>
                                        <p className="text-sm text-gray-600">
                                            Kéo thả file Excel (.xlsx) vào đây, hoặc <span className="font-semibold text-blue-600">nhấn để chọn file</span>
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">Chỉ chấp nhận file .xlsx, tối đa 1 file</p>
                                    </>
                                )}
                            </div>
                        </div>
                        {file && !fileError && (
                            <div className="mt-2 p-3 border border-green-300 bg-green-50 rounded-md flex items-center justify-between text-sm">
                                <div className="flex items-center min-w-0">
                                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                                    <div className="truncate">
                                        <span className="font-medium text-green-700 block truncate" title={file.name}>{file.name}</span>
                                        <span className="text-gray-500 text-xs">({(file.size / 1024).toFixed(1)} KB)</span>
                                    </div>
                                </div>
                                <button type="button" onClick={() => { setFile(null); setFileError(null); }} className="text-red-500 hover:text-red-700 ml-2 p-1 rounded-full hover:bg-red-100 transition-colors">
                                    <XCircleIcon className="h-5 w-5" />
                                </button>
                            </div>
                        )}
                        {fileError && (
                            <div className="mt-2 p-3 border border-red-300 bg-red-50 rounded-md flex items-center text-sm text-red-700">
                                <XCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                                {fileError}
                            </div>
                        )}
                    </div>

                    <div className="border rounded-md bg-white">
                        <button
                            type="button"
                            onClick={() => setShowInstructions(!showInstructions)}
                            className="w-full flex justify-between items-center p-3 text-left focus:outline-none hover:bg-gray-50 rounded-md transition-colors"
                        >
                            <div className="flex items-center">
                                <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2" />
                                <span className="text-sm font-semibold text-gray-700">Hướng dẫn chi tiết</span>
                            </div>
                            {showInstructions ? <ChevronUpIcon className="h-5 w-5 text-gray-500" /> : <ChevronDownIcon className="h-5 w-5 text-gray-500" />}
                        </button>
                        {showInstructions && (
                            <div className="px-5 pb-4 pt-2 border-t border-gray-200">
                                <ul className="list-disc list-outside ml-4 space-y-2 text-sm text-gray-600">
                                    <li>
                                        <span className="font-semibold">Định dạng File:</span> Cần tải lên file Excel (.xlsx) đã được trích xuất từ chức năng "Phân tích hồ sơ" trước đó.
                                    </li>
                                    <li>
                                        <span className="font-semibold">Nội dung JD:</span> Hệ thống sẽ tự động sử dụng JD của công việc hiện tại để chấm điểm.
                                    </li>
                                    <li>
                                        <span className="font-semibold">Kết quả:</span> Sau khi chấm điểm, một file Excel mới với các cột điểm chi tiết sẽ được tự động tải về.
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </form>

                {/* Actions Footer */}
                <div className="flex justify-end gap-3 px-6 sm:px-8 py-4 border-t bg-gray-50 sticky bottom-0 z-10 rounded-b-xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 rounded-lg border border-gray-300 shadow-sm transition-colors"
                        disabled={isLoading}
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        form="cv-scoring-form"
                        disabled={!isFormValid || isLoading}
                        title={!isFormValid ? "Vui lòng tải lên file Excel trước nhé!" : "Chấm điểm CV"}
                        className="flex items-center justify-center w-40 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                                   disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Đang xử lý...</span>
                            </>
                        ) : (
                            'Chấm điểm CV'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CVScoringModal;
