import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
    ArrowDownTrayIcon,
    TrashIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ExclamationTriangleIcon,
    DocumentTextIcon,
    FolderIcon
} from '@heroicons/react/24/outline';
import { getSavedLists, deleteSavedList as apiDeleteSavedList } from '@/services/resumeParsing.service';
import Spinner from '@/components/Spinner';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { unparse } from 'papaparse';

interface SavedRecord {
    id: string;
    name: string;
    date: string;
    format: 'excel' | 'csv';
    cvs: any[];
}
interface PaginationProps {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number) => void;
}

const SimplePagination: React.FC<PaginationProps> = ({ current, pageSize, total, onChange }) => {
    const totalPages = Math.ceil(total / pageSize);

    if (totalPages <= 1) {
        return null;
    }

    const handlePrevious = () => {
        if (current > 1) {
            onChange(current - 1);
        }
    };

    const handleNext = () => {
        if (current < totalPages) {
            onChange(current + 1);
        }
    };

    return (
        <div className="flex items-center justify-center space-x-3 mt-8">
            <button
                onClick={handlePrevious}
                disabled={current === 1}
                className={`flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                <ChevronLeftIcon className="h-5 w-5 mr-1" />
                Trước
            </button>
            <span className="text-sm text-gray-700">
                Trang {current} / {totalPages}
            </span>
            <button
                onClick={handleNext}
                disabled={current === totalPages}
                className={`flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                Sau
                <ChevronRightIcon className="h-5 w-5 ml-1" />
            </button>
        </div>
    );
};

const SavedRecordsPage: React.FC = () => {
    const [allRecords, setAllRecords] = useState<SavedRecord[]>([]);
    const [displayRecords, setDisplayRecords] = useState<SavedRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [current, setCurrent] = useState<number>(1);
    const [pageSize] = useState<number>(10);
    const [total, setTotal] = useState<number>(0);

    useEffect(() => {
        fetchFromBackend();
    }, []);

    useEffect(() => {
        // Update pagination when allRecords changes
        updateDisplayRecords();
    }, [allRecords, current, pageSize]);

    const updateDisplayRecords = () => {
        const startIndex = (current - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        setDisplayRecords(allRecords.slice(startIndex, endIndex));
        setTotal(allRecords.length);
    };

    const fetchFromBackend = async () => {
        try {
            setLoading(true);
            setError(null);
            const resp = await getSavedLists();
            const dataFromServer = resp.data;
            const formatted: SavedRecord[] = dataFromServer.map((doc: any) => ({
                id: doc._id,
                name: doc.name,
                date: doc.createdAt,
                format: doc.format,
                cvs: doc.cvs
            }));
            setAllRecords(formatted);
            setCurrent(1); // Reset to first page
        } catch (err) {
            console.error('Lấy saved lists thất bại', err);
            setError('Không thể tải danh sách đã lưu');
            toast.error('Không thể tải danh sách đã lưu');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Bạn có chắc muốn xóa danh sách "${name}" không?`)) return;

        try {
            await apiDeleteSavedList(id);
            setAllRecords(prev => prev.filter(r => r.id !== id));
            toast.success('Đã xóa danh sách thành công');
        } catch (err) {
            console.error('Xóa saved list thất bại', err);
            toast.error('Không thể xóa danh sách');
        }
    };

    const handleDownload = (record: SavedRecord) => {
        try {
            if (record.format === 'excel') {
                downloadAsExcel(record);
            } else {
                downloadAsCSV(record);
            }
            toast.success(`Đã tải xuống ${record.name}`);
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Không thể tải xuống file');
        }
    };

    const downloadAsExcel = (record: SavedRecord) => {
        const data = record.cvs.map(cv => ({
            'Họ và tên': cv.name || '',
            'Email': cv.email || '',
            'GitHub': cv.github || '',
            'Địa chỉ': cv.location || '',
            'Điện thoại': cv.phone || '',
            'Trường': cv.university || '',
            'Bằng cấp': cv.degree || '',
            'Điểm GPA': cv.gpa || '',
            'Kinh nghiệm làm việc': cv.workExperiences?.map((exp: any) =>
                `${exp.company} - ${exp.position} (${exp.duration})`
            ).join('\n') || '',
            'Dự án': cv.projects?.map((proj: any) =>
                `${proj.name}: ${proj.description.join(', ')}`
            ).join('\n') || '',
            'Kỹ năng': cv.skills?.join(', ') || '',
            'Chứng chỉ': cv.certifications?.join(', ') || ''
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "CV Data");
        XLSX.writeFile(wb, `${record.name}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const downloadAsCSV = (record: SavedRecord) => {
        const data = record.cvs.map(cv => ({
            'Họ và tên': cv.name || '',
            'Email': cv.email || '',
            'GitHub': cv.github || '',
            'Địa chỉ': cv.location || '',
            'Điện thoại': cv.phone || '',
            'Trường': cv.university || '',
            'Bằng cấp': cv.degree || '',
            'Điểm GPA': cv.gpa || '',
            'Kinh nghiệm làm việc': cv.workExperiences?.map((exp: any) =>
                `${exp.company} - ${exp.position} (${exp.duration})`
            ).join('; ') || '',
            'Dự án': cv.projects?.map((proj: any) =>
                `${proj.name}: ${proj.description.join(', ')}`
            ).join('; ') || '',
            'Kỹ năng': cv.skills?.join(', ') || '',
            'Chứng chỉ': cv.certifications?.join(', ') || ''
        }));

        const csv = '\ufeff' + unparse(data, {
            quotes: true,
            delimiter: ','
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${record.name}_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handlePageChange = (page: number) => {
        setCurrent(page);
    };

    return (
        <div className="bg-gray-50 pb-12 min-h-screen">
            {/* Header Section */}
            <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16 px-4 text-center shadow-md">
                <div className="container mx-auto max-w-4xl">
                    <div className="flex items-center justify-center mb-2">
                        <FolderIcon className="h-6 w-6 mr-2" />
                        <h1 className="text-3xl md:text-4xl font-bold">Danh Sách CV Đã Lưu</h1>
                    </div>
                    <p className="text-lg text-green-100">Quản lý và tải xuống các danh sách CV đã được phân tích và lưu trữ.</p>
                </div>
            </section>

            {/* Main Content */}
            <div className="container mx-auto max-w-6xl mt-[-40px] px-4">
                <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
                    {loading && (
                        <div className="text-center py-10">
                            <Spinner />
                        </div>
                    )}

                    {!loading && error && (
                        <div className="text-center py-10">
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-lg mx-auto" role="alert">
                                <ExclamationTriangleIcon className="h-5 w-5 inline-block mr-2 -mt-1" />
                                <strong className="font-bold mr-2">Lỗi!</strong>
                                <span className="block sm:inline">{error}</span>
                            </div>
                        </div>
                    )}

                    {!loading && !error && (
                        <>
                            {allRecords.length > 0 ? (
                                <>
                                    <div className="mb-6 flex justify-between items-center">
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">
                                                Tổng cộng: {total} danh sách
                                            </h2>
                                            <p className="text-sm text-gray-600">
                                                Hiển thị {((current - 1) * pageSize) + 1} - {Math.min(current * pageSize, total)} của {total} mục
                                            </p>
                                        </div>
                                        <button
                                            onClick={fetchFromBackend}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Làm mới
                                        </button>
                                    </div>

                                    {/* Table */}
                                    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Tên danh sách
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Định dạng
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Ngày tạo
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        # CV
                                                    </th>
                                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Thao tác
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {displayRecords.map((record) => (
                                                    <tr key={record.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {record.name}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${record.format === 'excel'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-blue-100 text-blue-800'
                                                                }`}>
                                                                {record.format.toUpperCase()}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {format(new Date(record.date), 'dd/MM/yyyy HH:mm')}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            <span className="font-medium">{record.cvs.length}</span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                                            <div className="flex items-center justify-center space-x-2">
                                                                <button
                                                                    onClick={() => handleDownload(record)}
                                                                    className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                                                                    title="Tải xuống"
                                                                >
                                                                    <ArrowDownTrayIcon className="h-5 w-5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(record.id, record.name)}
                                                                    className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Xóa"
                                                                >
                                                                    <TrashIcon className="h-5 w-5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    <SimplePagination
                                        current={current}
                                        pageSize={pageSize}
                                        total={total}
                                        onChange={handlePageChange}
                                    />
                                </>
                            ) : (
                                <div className="col-span-full text-center text-gray-500 py-16 flex flex-col items-center">
                                    <FolderIcon className="h-12 w-12 text-gray-400 mb-4" />
                                    <p className="text-lg">Chưa có danh sách CV nào được lưu.</p>
                                    <p className="text-sm">Hãy về trang phân tích CV để tạo và lưu danh sách mới.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SavedRecordsPage;
