// src/components/ResumeParsing/UploadSection.tsx
import React, { useContext, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ResumeContext, FileItem } from '../../contexts/ResumeContext';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline'

const UploadSection: React.FC = () => {
    const { files, setFiles } = useContext(ResumeContext);
    
    const onDrop = useCallback((accepted: File[]) => {
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
    });

    return (
        <div
            {...getRootProps()}
            className={`
                p-8 flex flex-col items-center justify-center 
                border-2 border-dashed rounded-lg
                ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                transition-colors cursor-pointer
            `}
        >
            <input {...getInputProps()} />
            <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-600 text-center">
                {files.length}/10 CV đã chọn<br />
                {isDragActive ? 'Thả vào đây để tải lên' : 'Kéo thả hoặc nhấp để chọn CV'}
            </p>
        </div>
    );
};

export default UploadSection;
