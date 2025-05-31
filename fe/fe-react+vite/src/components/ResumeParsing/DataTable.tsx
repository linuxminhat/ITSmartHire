// src/components/ResumeParsing/DataTable.tsx
import React, { useContext, useState, useMemo } from 'react';
import { ResumeContext, ParsedResume } from '../../contexts/ResumeContext';
import { unparse } from 'papaparse';
import {
    ArrowDownTrayIcon,
    PencilIcon,
    EyeIcon,
    EyeSlashIcon,
} from '@heroicons/react/24/outline';

interface Column {
    key: keyof ParsedResume;
    label: string;
}

const ALL_COLUMNS: Column[] = [
    { key: 'name', label: 'Họ và tên' },
    { key: 'email', label: 'Email' },
    { key: 'github', label: 'GitHub' },
    { key: 'loc', label: 'Địa chỉ' },
    { key: 'phone', label: 'Điện thoại' },
    { key: 'university', label: 'Trường' },
    { key: 'deg', label: 'Bằng cấp' },
    { key: 'gpa', label: 'Điểm GPA' },
    { key: 'graduation_year', label: 'Năm tốt nghiệp' },
    { key: 'working_company_experiences', label: 'Công ty đã làm' },
    { key: 'working_time_experiences', label: 'Thời gian làm việc' },
    { key: 'desig', label: 'Chức danh' },
    { key: 'techstack_skills', label: 'Kỹ năng công nghệ' },
    { key: 'project', label: 'Dự án' },
    { key: 'project_description', label: 'Mô tả dự án' },
    { key: 'certifications', label: 'Chứng chỉ' },
];

const DataTable: React.FC = () => {
    const { parsed, setParsed } = useContext(ResumeContext);

    // 1. Search filter
    const [filter, setFilter] = useState('');
    // 2. Which columns are visible
    const [visibleCols, setVisibleCols] = useState<string[]>(ALL_COLUMNS.map(c => c.key as string));
    // 3. Which cell is in edit mode: { row, key }
    const [editing, setEditing] = useState<{ row: number; key: string } | null>(null);

    // filter data
    const filtered = useMemo(() => {
        return parsed.filter(item =>
            item.name?.toLowerCase().includes(filter.toLowerCase()) ||
            item.email?.toLowerCase().includes(filter.toLowerCase())
        );
    }, [parsed, filter]);

    // export CSV
    const handleExport = () => {
        const data = filtered.map(item =>
            ALL_COLUMNS.reduce((acc, col) => {
                if (visibleCols.includes(col.key)) {
                    let v = (item as any)[col.key];
                    acc[col.label] = Array.isArray(v) ? v.join('; ') : v ?? '';
                }
                return acc;
            }, {} as Record<string, string>)
        );
        const csv = unparse(data);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'resumes.csv'; a.click();
    };

    // inline save
    const saveCell = (row: number, key: string, value: string) => {
        setParsed(prev => {
            const next = [...prev];
            (next[row] as any)[key] = value;
            return next;
        });
        setEditing(null);
    };

    return (
        <div className="bg-white shadow rounded p-4 flex flex-col space-y-4">

            {/* Toolbar nhỏ: Search + Export + Column toggles */}
            <div className="flex flex-wrap items-center space-x-4">
                <input
                    type="text"
                    placeholder="🔍 Tìm theo tên hoặc email"
                    className="border rounded px-2 py-1 flex-1 min-w-[200px]"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                />
                {/* nút Xuất CSV */}
                <button
                    onClick={handleExport}
                    className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >

                    <ArrowDownTrayIcon className="h-5 w-5 mr-1" /> Xuất CSV
                </button>
                {/* Ẩn/hiện cột */}
                <div className="flex items-center space-x-1">
                    {ALL_COLUMNS.map(col => (
                        <button
                            key={col.key}
                            onClick={() =>
                                setVisibleCols(cols =>
                                    cols.includes(col.key)
                                        ? cols.filter(c => c !== col.key)
                                        : [...cols, col.key]
                                )
                            }
                            className="p-1 hover:bg-gray-100 rounded"
                            title={col.label}
                        >
                            {visibleCols.includes(col.key) ?
                                <EyeIcon className="h-5 w-5 text-blue-500" /> :
                                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                            }
                        </button>
                    ))}
                </div>
            </div>

            {/* Scroll container với sticky header */}
            <div className="flex-1 overflow-y-auto max-h-[60vh]">
                <table className="min-w-full table-auto text-sm">
                    <thead className="bg-gray-100 sticky top-0 z-10">
                        <tr>
                            <th className="p-2 border">#</th>
                            {ALL_COLUMNS.map(col =>
                                visibleCols.includes(col.key) ? (
                                    <th
                                        key={col.key}
                                        className="p-2 border text-left whitespace-nowrap"
                                    >
                                        {col.label}
                                    </th>
                                ) : null
                            )}
                            <th className="p-2 border">Thao tác</th>
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
                                <tr key={i} className="even:bg-gray-50">
                                    <td className="p-2 border align-top">{i + 1}</td>

                                    {ALL_COLUMNS.map(col => (
                                        visibleCols.includes(col.key) ? (
                                            <td key={col.key} className="p-2 border align-top">
                                                {editing?.row === i && editing.key === col.key ? (
                                                    <input
                                                        type="text"
                                                        defaultValue={String((item as any)[col.key] ?? '')}
                                                        onBlur={e => saveCell(i, col.key, e.target.value)}
                                                        autoFocus
                                                        className="w-full border rounded px-1 py-0.5"
                                                    />
                                                ) : (
                                                    <div
                                                        className="flex items-center space-x-1"
                                                        onClick={() => setEditing({ row: i, key: col.key })}
                                                    >
                                                        <span>
                                                            {Array.isArray((item as any)[col.key])
                                                                ? (item as any)[col.key].join(', ')
                                                                : (item as any)[col.key] ?? '-'}
                                                        </span>
                                                        <PencilIcon className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
                                                    </div>
                                                )}
                                            </td>
                                        ) : null
                                    ))}

                                    {/* Thao tác dòng */}
                                    <td className="p-2 border text-center">
                                        <button className="text-red-500 hover:text-red-700">🗑</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTable;
