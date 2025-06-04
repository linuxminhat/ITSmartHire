import React, { useContext, useState, useMemo } from 'react';
import { ResumeContext, ParsedResume } from '../../contexts/ResumeContext';
import { unparse } from 'papaparse';
import {
    ArrowDownTrayIcon,
    PencilIcon,
    EyeIcon,
    EyeSlashIcon,
    StarIcon,
} from '@heroicons/react/24/outline';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import CVScoringModal from './CVScoringModal';
import { scoreResumes } from '@/services/resumeParsing.service';

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
    { key: 'totalExperienceYears', label: 'Năm kinh nghiệm', width: '120px' },
    { key: 'languages', label: 'Ngoại ngữ', width: '200px' },
    { key: 'projects', label: 'Dự án', width: '300px' },
    { key: 'skills', label: 'Kỹ năng', width: '250px' },
    { key: 'awards', label: 'Giải thưởng', width: '200px' },
    { key: 'certifications', label: 'Chứng chỉ', width: '200px' },
    { key: 'designations', label: 'Chức danh', width: '200px' },
];

interface DataTableProps {
    searchTerm: string;
}

const DataTable: React.FC<DataTableProps> = ({ searchTerm }) => {
    const { parsed } = useContext(ResumeContext);
    const [visibleCols, setVisibleCols] = useState<string[]>(ALL_COLUMNS.map(c => c.key as string));
    const [showScoringModal, setShowScoringModal] = useState(false);

    // Thêm hàm renderCellContent
    const renderCellContent = (item: ParsedResume, key: keyof ParsedResume) => {
        const value = item[key];
        const emptyMessage = (
            <span className="italic text-orange-500 bg-orange-50 px-2 py-1 rounded-md text-sm">
                Ứng viên không cung cấp thông tin này
            </span>
        );

        // Xử lý hiển thị năm kinh nghiệm
        if (key === 'totalExperienceYears') {
            return value ? `${value} năm` : emptyMessage;
        }

        // Xử lý hiển thị chức danh
        if (key === 'designations') {
            if (!Array.isArray(value) || value.length === 0) {
                return emptyMessage;
            }

            const text = value.join(', ');
            
            return (
                <div
                    className="min-h-[50px] max-h-[100px] p-2 cursor-pointer hover:bg-gray-50"
                    data-tooltip-id="shared-tooltip"
                    data-tooltip-content={text}
                >
                    <div className="line-clamp-2">
                        {text.length > 100 ? `${text.slice(0, 100)}...` : text}
                    </div>
                </div>
            );
        }

        // Xử lý hiển thị kinh nghiệm làm việc
        if (key === 'workExperiences') {
            if (!Array.isArray(value) || value.length === 0) {
                return emptyMessage;
            }

            const text = value
                .map(exp => {
                    if (typeof exp === 'object' && exp !== null) {
                        return `${exp.company || ''}\n${exp.position || ''}\nChức danh: ${exp.designation || 'Không có'}\n${exp.duration || ''}\n${Array.isArray(exp.description) ? exp.description.join('\n') : ''}`;
                    }
                    return '';
                })
                .filter(Boolean)
                .join('\n\n');

            if (!text) return emptyMessage;
            
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

        // Xử lý hiển thị projects
        if (key === 'projects') {
            if (!Array.isArray(value) || value.length === 0) {
                return emptyMessage;
            }

            const text = value
                .map(proj => {
                    if (typeof proj === 'object' && proj !== null) {
                        return `${proj.name || ''}\n${Array.isArray(proj.description) ? proj.description.join('\n') : ''}`;
                    }
                    return '';
                })
                .filter(Boolean)
                .join('\n\n');

            if (!text) return emptyMessage;

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

        // Xử lý hiển thị mảng (languages, awards, skills, certifications)
        if (['languages', 'awards', 'skills', 'certifications'].includes(key)) {
            if (!Array.isArray(value) || value.length === 0) {
                return emptyMessage;
            }

            const text = value.join(key === 'skills' || key === 'certifications' ? ', ' : '\n');
            
            return (
                <div
                    className="min-h-[50px] max-h-[100px] p-2 cursor-pointer hover:bg-gray-50"
                    data-tooltip-id="shared-tooltip"
                    data-tooltip-content={text}
                >
                    <div className={`${key === 'languages' || key === 'awards' ? 'line-clamp-2' : 'line-clamp-3'}`}>
                        {text.length > 100 ? `${text.slice(0, 100)}...` : text}
                    </div>
                </div>
            );
        }

        // Xử lý hiển thị GitHub
        if (key === 'github' && value) {
            if (!value) return emptyMessage;
            
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

        // Xử lý các trường còn lại
        if (!value || value === '') return emptyMessage;
        return String(value);
    };

    // filter data based on searchTerm from props
    const filtered = useMemo(() => {
        return parsed.filter(item =>
            item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [parsed, searchTerm]);

    const handleScore = async (data: {
        jd: string;
        file: File;
        weights: {
            skills: number;
            experience: number;
            designation: number;
            degree: number;
            gpa: number;
            languages: number;
            awards: number;
            github: number;
            certifications: number;
            projects: number;
        }
    }) => {
        try {
            await scoreResumes(data);
            setShowScoringModal(false);
        } catch (error) {
            alert('Có lỗi xảy ra khi chấm điểm CV');
            console.error(error);
        }
    };

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

            <div className="mt-4 flex justify-end gap-2">
                <button
                    onClick={() => setShowScoringModal(true)}
                    disabled={!parsed.length}
                    data-tooltip-id="export-tooltip"
                    data-tooltip-content="Chấm điểm CV theo JD"
                    className={`
                        flex items-center px-6 py-3 rounded-xl
                        transform transition-all duration-200
                        ${parsed.length 
                            ? 'bg-gradient-to-r from-purple-500 to-purple-400 hover:from-purple-600 hover:to-purple-500 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                    `}
                >
                    <StarIcon className="h-6 w-6 mr-3" />
                    <span className="font-medium">Chấm điểm CV</span>
                </button>
            </div>

            {showScoringModal && (
                <CVScoringModal
                    onClose={() => setShowScoringModal(false)}
                    onScore={handleScore}
                />
            )}
        </div>
    );
};

export default DataTable;
