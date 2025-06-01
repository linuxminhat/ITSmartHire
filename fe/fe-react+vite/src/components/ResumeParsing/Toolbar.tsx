// src/components/ResumeParsing/Toolbar.tsx
import React, { useContext } from 'react';
import { ResumeContext } from '../../contexts/ResumeContext';
import { 
    CloudArrowUpIcon,
    ArrowDownTrayIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

interface ToolbarProps {
    onShowFileList: () => void;
    onParseAll: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onShowFileList, onParseAll }) => {
    const { files } = useContext(ResumeContext);

    return (
        <div className="flex items-center gap-3">
            <button
                onClick={onShowFileList}
                disabled={files.length === 0}
                className="flex items-center px-4 py-2 bg-[#1890ff] text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                Import CV ({files.length})
            </button>

            <button
                onClick={onParseAll}
                disabled={files.length === 0}
                className="flex items-center px-4 py-2 bg-[#fa8c16] text-white rounded-lg hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <SparklesIcon className="h-5 w-5 mr-2" />
                Phân tích tất cả
            </button>

            <button
                disabled
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed"
            >
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Lưu tất cả
            </button>
        </div>
    );
};

export default Toolbar;
