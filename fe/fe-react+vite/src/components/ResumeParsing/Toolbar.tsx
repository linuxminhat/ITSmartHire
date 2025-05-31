// src/components/ResumeParsing/Toolbar.tsx
import React, { useContext } from 'react';
import { ResumeContext } from '../../contexts/ResumeContext';

interface ToolbarProps {
    onShowFileList: () => void;
    onParseAll: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onShowFileList, onParseAll }) => {
    const { files } = useContext(ResumeContext);

    return (
        <div className="flex items-center space-x-2">
            <button
                onClick={onShowFileList}
                disabled={files.length === 0}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
            >
                Xem danh sách CV ({files.length})
            </button>
            <button
                onClick={onParseAll}
                disabled={files.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
                Phân tích tất cả
            </button>
            <button
                disabled
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded cursor-not-allowed"
            >
                Lưu tất cả
            </button>
        </div>
    );
};

export default Toolbar;
