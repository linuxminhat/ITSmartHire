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
        onDrop, multiple: true,
        accept: {
            'application/pdf': [],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
        },
        maxFiles: 10,
        noClick: files.length >= 10,
    });

    return (
        <div
            {...getRootProps()}
            className={`
        my-4 flex flex-col items-center justify-center 
        border-4 border-dashed border-blue-400 rounded-lg 
        p-12 text-center transition-colors 
        ${isDragActive ? 'bg-blue-50' : 'bg-white'}
      `}
            style={{ minHeight: '200px' }}
        >
            <input {...getInputProps()} />
            <CloudArrowUpIcon className="h-12 w-12 text-blue-400 mb-2 animate-bounce" />
            <p className="text-lg text-gray-600">
                {files.length}/10 CV đã chọn<br />
                {isDragActive ? 'Thả vào đây để tải lên' : 'Kéo thả hoặc nhấp để chọn CV'}
            </p>
        </div>
    );
};

export default UploadSection;
