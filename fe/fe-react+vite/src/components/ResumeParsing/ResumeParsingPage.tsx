// src/components/ResumeParsing/ResumeParsingPage.tsx
import React, { useState, useContext } from 'react'
import { ResumeProvider, ResumeContext } from '../../contexts/ResumeContext'
import Toolbar from './Toolbar'
import UploadSection from './UploadSection'
import DataTable from './DataTable'
import FileListModal from './FileListModal'
import { callUploadAndParseCVs, saveParseList } from '@/services/resumeParsing.service'
import { unparse } from 'papaparse'
import { CloudArrowUpIcon, SparklesIcon, ArrowDownTrayIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import * as XLSX from 'xlsx'
import SaveModal from './SaveModal'
import { Tooltip } from 'react-tooltip'

const Inner: React.FC = () => {
    const { files, setFiles, setParsed, parsed } = useContext(ResumeContext)
    const [showFileList, setShowFileList] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [showSaveModal, setShowSaveModal] = useState(false)

    // Hàm xuất CSV với BOM để hỗ trợ tiếng Việt
    const handleExportCSV = () => {
        if (!parsed.length) return;
        const data = parsed.map(item => ({
            'Họ và tên': item.name || '',
            'Email': item.email || '',
            'GitHub': item.github || '',
            'Địa chỉ': item.location || '',
            'Điện thoại': item.phone || '',
            'Trường': item.university || '',
            'Bằng cấp': item.degree || '',
            'Điểm GPA': item.gpa || '',
            'Kinh nghiệm làm việc': item.workExperiences?.map(exp =>
                `${exp.company} - ${exp.position} (${exp.duration})`
            ).join('; ') || '',
            'Dự án': item.projects?.map(proj =>
                `${proj.name}: ${proj.description.join(', ')}`
            ).join('; ') || '',
            'Kỹ năng': item.skills?.join(', ') || '',
            'Chứng chỉ': item.certifications?.join(', ') || '',
            'Năm kinh nghiệm': item.totalExperienceYears ? `${item.totalExperienceYears} năm` : '',
            'Ngoại ngữ': item.languages?.join('; ') || '',
            'Giải thưởng': item.awards?.join('; ') || ''
        }));

        // Thêm BOM và config để hỗ trợ Unicode
        const csv = '\ufeff' + unparse(data, {
            quotes: true,
            delimiter: ','
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cv_data_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Thêm hàm xuất Excel
    const handleExportExcel = () => {
        if (!parsed.length) return;

        // Định nghĩa các cột và độ rộng
        const columns = [
            { header: 'Họ và tên', key: 'name', width: 20 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'GitHub', key: 'github', width: 25 },
            { header: 'Địa chỉ', key: 'location', width: 25 },
            { header: 'Điện thoại', key: 'phone', width: 15 },
            { header: 'Trường', key: 'university', width: 30 },
            { header: 'Bằng cấp', key: 'degree', width: 20 },
            { header: 'Điểm GPA', key: 'gpa', width: 10 },
            { header: 'Kinh nghiệm làm việc', key: 'workExperiences', width: 50 },
            { header: 'Dự án', key: 'projects', width: 50 },
            { header: 'Kỹ năng', key: 'skills', width: 40 },
            { header: 'Chứng chỉ', key: 'certifications', width: 30 },
            { header: 'Năm kinh nghiệm', key: 'totalExperienceYears', width: 15 },
            { header: 'Ngoại ngữ', key: 'languages', width: 30 },
            { header: 'Giải thưởng', key: 'awards', width: 30 },
            { header: 'Chức danh', key: 'designations', width: 30 }
        ];

        // Tạo dữ liệu cho Excel
        const data = parsed.map(item => ({
            'Họ và tên': item.name || '',
            'Email': item.email || '',
            'GitHub': item.github || '',
            'Địa chỉ': item.location || '',
            'Điện thoại': item.phone || '',
            'Trường': item.university || '',
            'Bằng cấp': item.degree || '',
            'Điểm GPA': item.gpa || '',
            'Kinh nghiệm làm việc': item.workExperiences?.map(exp =>
                `${exp.company} - ${exp.position} (${exp.duration})`
            ).join('\n') || '',
            'Dự án': item.projects?.map(proj =>
                `${proj.name}: ${proj.description.join(', ')}`
            ).join('\n') || '',
            'Kỹ năng': item.skills?.join(', ') || '',
            'Chứng chỉ': item.certifications?.join(', ') || '',
            'Năm kinh nghiệm': item.totalExperienceYears ? `${item.totalExperienceYears} năm` : '',
            'Ngoại ngữ': item.languages?.join(', ') || '',
            'Giải thưởng': item.awards?.join(', ') || '',
            'Chức danh': item.designations?.join(', ') || ''
        }));

        // Tạo worksheet
        const ws = XLSX.utils.json_to_sheet(data, {
            header: columns.map(col => col.header)
        });

        // Thiết lập độ rộng cột
        ws['!cols'] = columns.map(col => ({ wch: col.width }));

        // Style cho header
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const address = XLSX.utils.encode_col(C) + "1";
            if (!ws[address]) continue;
            ws[address].s = {
                font: { bold: true },
                fill: { fgColor: { rgb: "EFEFEF" } },
                alignment: { vertical: 'center', horizontal: 'center' }
            };
        }

        // Tạo workbook và thêm worksheet
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "CV Data");

        // Xuất file
        XLSX.writeFile(wb, `cv_data_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const handleParseAll = async () => {
        if (!files.length) return
        setIsLoading(true)
        setError(null)

        try {
            setFiles(fs => fs.map(f => ({ ...f, status: 'parsing', progress: 0 })))

            console.log('🚀 Starting batch processing for', files.length, 'CVs...');
            console.log('⏱️  Estimated time:', Math.ceil(files.length / 5) * 3, 'seconds');

            const response = await callUploadAndParseCVs(files.map(f => f.file))

            if (!response.success || !response.data) {
                throw new Error('Invalid response from server');
            }

            const parsedData = Array.isArray(response.data) ? response.data : [response.data];

            // Phân tích kết quả
            const successCount = parsedData.filter(cv => cv.name || cv.email).length;
            const failCount = parsedData.length - successCount;

            console.log(`📊 Processing complete:`);
            console.log(`   ✅ Success: ${successCount} CVs`);
            console.log(`   ❌ Failed: ${failCount} CVs`);
            console.log(`   📈 Success rate: ${((successCount / parsedData.length) * 100).toFixed(1)}%`);

            setParsed(parsedData);
            setFiles(fs => fs.map(f => ({ ...f, status: 'done', progress: 100 })))

        } catch (err) {
            console.error('Parse error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi xử lý CV';
            setError(errorMessage);
            setFiles(fs => fs.map(f => ({ ...f, status: 'error' })));
        } finally {
            setIsLoading(false)
        }
    }

    // Thêm hàm reset
    const handleReset = () => {
        setFiles([]);
        setParsed([]);
        setSearchTerm('');
        setError(null);
    };

    const handleSave = async (name: string, format: 'excel' | 'csv') => {
        try {
            console.log('handleSave called with:', {
                name,
                format,
                parsedLength: parsed.length,
                parsedData: parsed.slice(0, 2) // Log first 2 items for debugging
            });

            if (!parsed.length) {
                alert('Không có dữ liệu CV để lưu!');
                return;
            }

            // Gọi API để lưu vào database
            console.log('Calling saveParseList...');
            const result = await saveParseList(name, format, parsed);
            console.log('SaveParseList result:', result);

            // Xuất file theo định dạng đã chọn
            if (format === 'excel') {
                handleExportExcel();
            } else {
                handleExportCSV();
            }

            alert('Đã lưu danh sách thành công!');
        } catch (error) {
            console.error('Error saving CV list:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            alert(`Có lỗi xảy ra khi lưu danh sách: ${errorMessage}`);
        }
    };

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded">
                <h3 className="text-red-600 font-medium">Lỗi xử lý CV:</h3>
                <p className="text-red-700">{error}</p>
            </div>
        );
    }

    return (
        <>
            {/* Main Content Container */}
            <div className="space-y-6">
                {/* Toolbar Section */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex flex-col space-y-4">
                        {/* Primary Actions Row */}
                        <div className="flex items-center gap-4">
                            {/* Hồ sơ tải lên - Primary gradient button */}
                            <button
                                onClick={() => setShowFileList(true)}
                                className="flex items-center px-6 py-3 
                                    bg-gradient-to-r from-blue-600 to-blue-500
                                    hover:from-blue-700 hover:to-blue-600
                                    text-white rounded-xl shadow-md hover:shadow-lg
                                    transform transition-all duration-200 hover:-translate-y-0.5"
                            >
                                <CloudArrowUpIcon className="h-6 w-6 mr-3" />
                                <span className="font-medium">
                                    Hồ sơ tải lên
                                    <span className="ml-2 px-2 py-0.5 bg-blue-400 rounded-full text-sm">
                                        {files.length}/10
                                    </span>
                                </span>
                            </button>

                            {/* Phân tích tất cả - Accent orange button */}
                            <button
                                onClick={handleParseAll}
                                className="flex items-center px-6 py-3
                                    bg-gradient-to-r from-orange-500 to-orange-400
                                    hover:from-orange-600 hover:to-orange-500
                                    text-white rounded-xl shadow-md hover:shadow-lg
                                    transform transition-all duration-200 hover:-translate-y-0.5"
                            >
                                <SparklesIcon className="h-6 w-6 mr-3" />
                                <span className="font-medium">Phân tích tất cả</span>
                            </button>

                            {/* Lưu tất cả - Success green button */}
                            <button
                                onClick={() => setShowSaveModal(true)}
                                className="flex items-center px-6 py-3
                                    bg-gradient-to-r from-green-500 to-green-400
                                    hover:from-green-600 hover:to-green-500
                                    text-white rounded-xl shadow-md hover:shadow-lg
                                    transform transition-all duration-200 hover:-translate-y-0.5"
                            >
                                <ArrowDownTrayIcon className="h-6 w-6 mr-3" />
                                <span className="font-medium">Lưu tất cả</span>
                            </button>

                            {/* Làm mới - Neutral button */}
                            <button
                                onClick={handleReset}
                                className="flex items-center px-6 py-3
                                    bg-gray-500 hover:bg-gray-600
                                    text-white rounded-xl shadow-md hover:shadow-lg
                                    transform transition-all duration-200 hover:-translate-y-0.5
                                    ml-auto"
                            >
                                <ArrowPathIcon className="h-6 w-6 mr-3" />
                                <span className="font-medium">Làm mới</span>
                            </button>

                            {/* Export buttons */}
                            <button
                                onClick={handleExportExcel}
                                disabled={!parsed.length}
                                data-tooltip-id="export-tooltip"
                                data-tooltip-content="Xuất tất cả hồ sơ đã trích xuất sang file Excel"
                                className={`
                                    flex items-center px-6 py-3 rounded-xl
                                    transform transition-all duration-200
                                    ${parsed.length 
                                        ? 'bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5' 
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                                `}
                            >
                                <ArrowDownTrayIcon className="h-6 w-6 mr-3" />
                                <span className="font-medium">
                                    Xuất Excel
                                    <span className={`
                                        ml-2 px-2 py-0.5 rounded-full text-sm
                                        ${parsed.length 
                                            ? 'bg-green-400 text-white' 
                                            : 'bg-gray-200 text-gray-500'}
                                    `}>
                                        {parsed.length}/100
                                    </span>
                                </span>
                            </button>

                            <button
                                onClick={handleExportCSV}
                                disabled={!parsed.length}
                                data-tooltip-id="export-tooltip"
                                data-tooltip-content="Xuất tất cả hồ sơ đã trích xuất sang file CSV"
                                className={`
                                    flex items-center px-6 py-3 rounded-xl
                                    transform transition-all duration-200
                                    ${parsed.length 
                                        ? 'bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5' 
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                                `}
                            >
                                <ArrowDownTrayIcon className="h-6 w-6 mr-3" />
                                <span className="font-medium">
                                    Xuất CSV
                                    <span className={`
                                        ml-2 px-2 py-0.5 rounded-full text-sm
                                        ${parsed.length 
                                            ? 'bg-green-400 text-white' 
                                            : 'bg-gray-200 text-gray-500'}
                                    `}>
                                        {parsed.length}/100
                                    </span>
                                </span>
                            </button>
                        </div>

                        {/* Search bar */}
                        <div className="flex items-center">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="🔍 Tìm theo tên hoặc email"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Upload Section - LUÔN HIỂN THỊ, không còn điều kiện files.length === 0 */}
                <div className="bg-white rounded-lg shadow">
                    <UploadSection />
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-lg shadow">
                    <DataTable searchTerm={searchTerm} />
                </div>
            </div>

            {showFileList && <FileListModal onClose={() => setShowFileList(false)} />}
            {showSaveModal && (
                <SaveModal
                    onClose={() => setShowSaveModal(false)}
                    onSave={handleSave}
                />
            )}

            {/* Tooltip Component */}
            <Tooltip
                id="export-tooltip"
                className="z-50 !bg-gray-800 !px-3 !py-2"
                place="top"
            />
        </>
    )
}

const ResumeParsingPage: React.FC = () => (
    <ResumeProvider>
        <div className="p-6 min-h-screen bg-gray-100">
            <Inner />
        </div>
    </ResumeProvider>
)

export default ResumeParsingPage
