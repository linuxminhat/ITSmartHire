import React, { useContext, useState, useMemo } from 'react';
import { ResumeContext, ParsedResume } from '../../contexts/ResumeContext';
import { unparse } from 'papaparse';
import {
    ArrowDownTrayIcon,
    PencilIcon,
    EyeIcon,
    EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

interface Column {
    key: keyof ParsedResume;
    label: string;
    width?: string;
}

const ALL_COLUMNS: Column[] = [
    { key: 'name', label: 'Họ và tên', width: '150px' },
    { key: 'email', label: 'Email', width: '200px' },
    { key: 'github', label: 'GitHub', width: '150px' },
    { key: 'location', label: 'Địa chỉ', width: '150px' },
    { key: 'phone', label: 'Điện thoại', width: '120px' },
    { key: 'university', label: 'Trường', width: '200px' },
    { key: 'degree', label: 'Bằng cấp', width: '150px' },
    { key: 'gpa', label: 'Điểm GPA', width: '100px' },
    { key: 'workExperiences', label: 'Kinh nghiệm làm việc', width: '300px' },
    { key: 'projects', label: 'Dự án', width: '300px' },
    { key: 'skills', label: 'Kỹ năng', width: '250px' },
    { key: 'certifications', label: 'Chứng chỉ', width: '200px' },
];

interface DataTableProps {
    searchTerm: string;
}

const DataTable: React.FC<DataTableProps> = ({ searchTerm }) => {
    const { parsed } = useContext(ResumeContext);
    const [visibleCols, setVisibleCols] = useState<string[]>(ALL_COLUMNS.map(c => c.key as string));

    // Thêm hàm renderCellContent
    const renderCellContent = (item: ParsedResume, key: keyof ParsedResume) => {
        const value = item[key];

        if (key === 'workExperiences') {
            const text = (item.workExperiences || [])
                .map(exp => `${exp.company}\n${exp.position}\n${exp.duration}\n${exp.description.join('\n')}`)
                .join('\n\n');
            
            return (
                <div
                    className="min-h-[50px] max-h-[100px] p-2 cursor-pointer hover:bg-gray-50"
                    data-tooltip-id="shared-tooltip"
                    data-tooltip-content={text}
                >
                    <div className="line-clamp-3 whitespace-pre-line">
                        {text.length > 100 ? `${text.slice(0, 100)}...` : text}
                    </div>
                </div>
            );
        }

        if (key === 'projects') {
            const text = (item.projects || [])
                .map(proj => `${proj.name}\n${proj.description.join('\n')}`)
                .join('\n\n');
            
            return (
                <div
                    className="min-h-[50px] max-h-[100px] p-2 cursor-pointer hover:bg-gray-50"
                    data-tooltip-id="shared-tooltip"
                    data-tooltip-content={text}
                >
                    <div className="line-clamp-3 whitespace-pre-line">
                        {text.length > 100 ? `${text.slice(0, 100)}...` : text}
                    </div>
                </div>
            );
        }

        if (key === 'skills' || key === 'certifications') {
            const text = Array.isArray(value) ? value.join(', ') : String(value || '');
            
            return (
                <div
                    className="min-h-[50px] max-h-[100px] p-2 cursor-pointer hover:bg-gray-50"
                    data-tooltip-id="shared-tooltip"
                    data-tooltip-content={text}
                >
                    <div className="line-clamp-3">
                        {text.length > 100 ? `${text.slice(0, 100)}...` : text}
                    </div>
                </div>
            );
        }

        if (key === 'github' && value) {
            return (
                <a
                    href={value as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                >
                    {value as string}
                </a>
            );
        }

        return value || '-';
    };

    // filter data based on searchTerm from props
    const filtered = useMemo(() => {
        return parsed.filter(item =>
            item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [parsed, searchTerm]);

    return (
        <div className="bg-white shadow rounded-lg p-4">
            {/* Column visibility toggles */}
            <div className="flex flex-wrap gap-2 mb-4 justify-end">
                {ALL_COLUMNS.map(col => (
                    <button
                        key={col.key}
                        onClick={() => setVisibleCols(cols =>
                            cols.includes(col.key)
                                ? cols.filter(c => c !== col.key)
                                : [...cols, col.key]
                        )}
                        className={`px-3 py-1 rounded text-sm ${
                            visibleCols.includes(col.key)
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-600'
                        }`}
                    >
                        {col.label}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="relative">
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto border-collapse">
                        <thead className="bg-[#fafafa] sticky top-0 z-10">
                            <tr>
                                <th className="p-3 border text-[15px] font-bold text-[#333] text-left">#</th>
                                {ALL_COLUMNS.map(col =>
                                    visibleCols.includes(col.key) && (
                                        <th
                                            key={col.key}
                                            className="p-3 border text-[15px] font-bold text-[#333] text-left"
                                            style={{
                                                minWidth: col.width,
                                                resize: 'horizontal',
                                                overflow: 'auto'
                                            }}
                                        >
                                            {col.label}
                                        </th>
                                    )
                                )}
                                <th className="p-3 border text-[15px] font-bold text-[#333] text-center w-[100px]">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={visibleCols.length + 2} className="p-4 text-center text-gray-500">
                                        Chưa có dữ liệu
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((item, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="p-3 border">{i + 1}</td>
                                        {ALL_COLUMNS.map(col =>
                                            visibleCols.includes(col.key) && (
                                                <td key={col.key} className="p-3 border">
                                                    {renderCellContent(item, col.key)}
                                                </td>
                                            )
                                        )}
                                        <td className="p-3 border text-center">
                                            <div className="flex justify-center space-x-2">
                                                <button
                                                    className="p-1 hover:bg-gray-100 rounded-full"
                                                    title="Chỉnh sửa"
                                                >
                                                    <PencilIcon className="h-5 w-5 text-blue-500" />
                                                </button>
                                                <button
                                                    className="p-1 hover:bg-gray-100 rounded-full"
                                                    title="Xem chi tiết"
                                                >
                                                    <EyeIcon className="h-5 w-5 text-gray-500" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Single shared tooltip instance */}
                <Tooltip
                    id="shared-tooltip"
                    className="z-[9999] !max-w-lg !bg-gray-900"
                    place="top"
                    style={{
                        maxWidth: '500px',
                        whiteSpace: 'pre-line',
                        padding: '8px 12px',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        zIndex: 9999,
                    }}
                />
            </div>
        </div>
    );
};

export default DataTable;
