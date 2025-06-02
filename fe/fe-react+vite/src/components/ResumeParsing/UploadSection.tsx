// src/components/ResumeParsing/UploadSection.tsx
import React, { useContext, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ResumeContext, FileItem } from '../../contexts/ResumeContext';
import { CloudArrowUpIcon, DocumentArrowUpIcon, SparklesIcon, ArrowDownTrayIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const UploadSection: React.FC = () => {
    const { files, setFiles } = useContext(ResumeContext);
    
    const onDrop = useCallback((accepted: File[]) => {
        if (files.length >= 10) {
            toast.warning('Bạn chỉ có thể tải lên tối đa 10 hồ sơ trong một lượt!');
            return;
        }
        const spaceLeft = 10 - files.length;
        const slice = accepted.slice(0, spaceLeft);
        const items: FileItem[] = slice.map(f => ({
            id: crypto.randomUUID(),
            file: f,
            status: 'pending',
            progress: 0,
        }));
        setFiles(prev => [...prev, ...items]);
    }, [files, setFiles]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/msword': ['.doc']
        },
        maxFiles: 10 - files.length,
        disabled: files.length >= 10
    });

    const handleUploadClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (files.length >= 10) {
            toast.warning('Bạn chỉ có thể tải lên tối đa 10 hồ sơ trong một lượt!');
            return;
        }
        document.querySelector('input[type="file"]')?.click();
    };

    return (
        <div className="bg-white rounded-lg p-4">
            <div
                {...getRootProps()}
                className={`
                    p-4 flex flex-col items-center justify-center 
                    border-2 border-dashed rounded-xl
                    ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
                    transition-all duration-300 cursor-pointer
                    min-h-[180px] relative group
                `}
            >
                <input {...getInputProps()} />
                
                {files.length === 0 ? (
                    // Empty State - Compact version
                    <>
                        <CloudArrowUpIcon className="h-16 w-16 text-gray-400 mb-3 animate-float" />
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                            Chưa có hồ sơ nào được tải lên!
                        </h2>
                        <p className="text-gray-500 text-center text-sm mb-3">
                            Kéo thả CV vào đây hoặc nhấn 'Hồ sơ tải lên' để bắt đầu trích xuất.
                        </p>
                        <button 
                            onClick={handleUploadClick}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg
                                hover:bg-blue-700 transform transition-all duration-200
                                hover:scale-105 hover:shadow-lg flex items-center gap-2"
                        >
                            <DocumentArrowUpIcon className="h-5 w-5" />
                            <span>Tải lên hồ sơ ngay</span>
                        </button>
                    </>
                ) : (
                    // Success State - More compact layout
                    <div className="w-full max-w-xl mx-auto">
                        {/* Success Header */}
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <CheckCircleIcon className="h-8 w-8 text-green-500" />
                            <h2 className="text-lg font-semibold text-green-600">
                                Đã tải lên {files.length} hồ sơ thành công!
                            </h2>
                        </div>

                        {/* Steps - Non-interactive info cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-orange-50 rounded-lg p-3 pointer-events-none">
                                <div className="flex items-center gap-2">
                                    <SparklesIcon className="h-5 w-5 text-orange-500" />
                                    <span className="font-medium text-orange-700">Bước 1</span>
                                </div>
                                <p className="text-orange-600 text-sm mt-1">
                                    Nhấn "Phân tích tất cả" để trích xuất thông tin
                                </p>
                            </div>

                            <div className="bg-green-50 rounded-lg p-3 pointer-events-none">
                                <div className="flex items-center gap-2">
                                    <ArrowDownTrayIcon className="h-5 w-5 text-green-500" />
                                    <span className="font-medium text-green-700">Bước 2</span>
                                </div>
                                <p className="text-green-600 text-sm mt-1">
                                    Sau khi phân tích, bạn có thể lưu hoặc xuất kết quả
                                </p>
                            </div>
                        </div>

                        {/* Upload more hint */}
                        {files.length < 10 && (
                            <div className="mt-3 text-xs text-gray-500 text-center">
                                <CloudArrowUpIcon className="h-4 w-4 inline mr-1" />
                                Bạn có thể kéo thả thêm CV vào đây (còn {10 - files.length} slot)
                            </div>
                        )}
                    </div>
                )}

                {/* File count badge */}
                <div className="absolute top-2 right-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                        {files.length}/10 CV
                    </span>
                </div>

                {/* Drag overlay */}
                {isDragActive && files.length < 10 && (
                    <div className="absolute inset-0 bg-blue-50 bg-opacity-90 rounded-xl
                        flex items-center justify-center text-lg font-medium text-blue-600
                        border-2 border-dashed border-blue-400">
                        Thả để tải lên
                    </div>
                )}
            </div>
        </div>
    );
};

// Add floating animation
const styles = `
    @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
    }
    .animate-float {
        animation: float 3s ease-in-out infinite;
    }
`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default UploadSection;
