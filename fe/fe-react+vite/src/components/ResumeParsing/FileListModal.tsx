// src/components/ResumeParsing/FileListModal.tsx
import React, { useContext } from 'react';
import { ResumeContext, FileItem } from '../../contexts/ResumeContext';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface FileListModalProps {
    onClose: () => void;
}

const FileListModal: React.FC<FileListModalProps> = ({ onClose }) => {
    const { files, setFiles } = useContext(ResumeContext);

    const remove = (id: string) => {
        setFiles(fs => fs.filter(f => f.id !== id));
    };

    return (
        // background overlay
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
            {/* modal box */}
            <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-xl max-h-[80vh] overflow-auto">
                {/* header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-medium">Danh sách CV đã chọn</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                {/* content */}
                <div className="p-4 space-y-3">
                    {files.length === 0 ? (
                        <p className="text-center text-gray-500">Chưa chọn CV nào.</p>
                    ) : (
                        files.map((f: FileItem) => (
                            <div
                                key={f.id}
                                className="flex items-center justify-between border rounded p-3"
                            >
                                <div>
                                    <p className="font-semibold">{f.file.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {f.status === 'pending' && 'Chờ xử lý'}
                                        {f.status === 'parsing' && `Đang phân tích… ${f.progress}%`}
                                        {f.status === 'done' && 'Hoàn thành ✔'}
                                        {f.status === 'error' && 'Lỗi ❌'}
                                    </p>
                                    {f.status !== 'pending' && (
                                        <div className="w-full bg-gray-200 rounded h-1 mt-1">
                                            <div
                                                className="h-full bg-blue-600 rounded"
                                                style={{ width: `${f.progress}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => remove(f.id)} className="text-red-500 hover:text-red-700">
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileListModal;
