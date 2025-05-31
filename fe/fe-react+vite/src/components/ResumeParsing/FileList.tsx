// src/components/ResumeParsing/FileList.tsx
import React, { useContext } from 'react';
import { ResumeContext, FileItem } from '../../contexts/ResumeContext';
import { XCircleIcon } from '@heroicons/react/24/outline'

const FileList: React.FC = () => {
    const { files, setFiles } = useContext(ResumeContext);

    if (files.length === 0) return null;

    const remove = (id: string) => {
        setFiles(fs => fs.filter(f => f.id !== id));
    };

    return (
        <div className="bg-white shadow rounded p-4">
            <h3 className="font-medium mb-2">Danh sách CV đã chọn</h3>
            <ul className="space-y-2">
                {files.map((f: FileItem) => (
                    <li
                        key={f.id}
                        className="flex items-center justify-between border p-2 rounded"
                    >
                        <div className="flex-1">
                            <p className="font-semibold">{f.file.name}</p>
                            <div className="text-sm text-gray-500">
                                {f.status === 'pending' && 'Chờ xử lý'}
                                {f.status === 'parsing' && `Đang parse… ${f.progress}%`}
                                {f.status === 'done' && 'Hoàn thành ✔'}
                                {f.status === 'error' && 'Lỗi ❌'}
                            </div>
                            {f.status !== 'pending' && (
                                <div className="w-full bg-gray-200 rounded h-1 mt-1">
                                    <div
                                        className="h-full bg-blue-600 rounded"
                                        style={{ width: `${f.progress}%` }}
                                    />
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => remove(f.id)}
                            className="ml-4 text-red-500 hover:text-red-700"
                        >
                            <XCircleIcon className="h-5 w-5" />
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FileList;
