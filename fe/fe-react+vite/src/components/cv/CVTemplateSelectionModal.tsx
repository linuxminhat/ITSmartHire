import React, { useState } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { IUser } from '@/types/backend';
import { XMarkIcon, ArrowDownTrayIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import TemplateClassic from './templates/TemplateClassic';
import TemplateModern from './templates/TemplateModern';
import TemplateCreative from './templates/TemplateCreative';
import TemplateMinimalist from './templates/TemplateMinimalist'; // Import Minimalist

// SỬA: Import các ảnh preview
import classicPreview from '@/assets/images/cv-previews/classic.png';
import modernPreview from '@/assets/images/cv-previews/modern.png';
import minimalistPreview from '@/assets/images/cv-previews/minimalist.png';
import creativePreview from '@/assets/images/cv-previews/creative.png';

// Placeholder for the actual CV template component
// This needs to be implemented using react-pdf primitives
const PlaceholderCVTemplate = ({ profileData }: { profileData: IUser | null }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.section}>
                <Text>CV mẫu cho {profileData?.name ?? 'N/A'}</Text>
                <Text style={styles.placeholderText}>
                    (Đây là mẫu dự phòng. Vui lòng triển khai thành phần mẫu CV thực tế.)
                </Text>
            </View>
        </Page>
    </Document>
);

// Basic styles for the PDF document
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#E4E4E4', // Example background
        padding: 30,
        fontFamily: 'Helvetica', // Consider setting a default font
    },
    section: {
        margin: 10,
        padding: 10,
        flexGrow: 1,
    },
    placeholderText: {
        marginTop: 20,
        fontSize: 10,
        color: 'grey',
    },
});

interface CVTemplateSelectionModalProps {
    visible: boolean;
    onCancel: () => void;
    profileData: IUser | null; // Pass the full profile data
}

const CVTemplateSelectionModal: React.FC<CVTemplateSelectionModalProps> = ({
    visible,
    onCancel,
    profileData,
}) => {
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    // Use generic 'loading' state for overall modal ops if needed, PDFLink has its own
    // const [loading, setLoading] = useState(false); 
    const [pdfError, setPdfError] = useState<string | null>(null); // For PDF generation errors

    if (!visible) return null; // Don't render if not visible

    const handleSelectTemplate = (templateName: string) => {
        setSelectedTemplate(templateName);
        setPdfError(null); // Clear PDF error on new selection attempt
    };

    // Type for template components expecting profileData
    type CvTemplateComponent = React.FC<{ profileData: IUser | null }>;

    const renderDownloadLink = (templateName: string, TemplateComponent: CvTemplateComponent) => {
        if (!profileData) {
            return (
                <button disabled className="w-full mt-2 py-2 px-4 bg-gray-400 text-white rounded-md cursor-not-allowed text-sm font-medium">
                    Thiếu dữ liệu hồ sơ
                </button>
            );
        }

        // Generate Vietnamese filename
        const safeName = profileData.name?.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') || 'NguoiDung';
        const fileName = `CV_${safeName}_${templateName}.pdf`;

        return (
            <PDFDownloadLink
                document={<TemplateComponent profileData={profileData} />}
                fileName={fileName}
                style={{ textDecoration: 'none' }} // Necessary for link styling override
            >
                {({ blob, url, loading: pdfLoading, error: pdfGenError }) => {
                    // Handle PDF generation error specifically
                    if (pdfGenError && !pdfError) { // Set error only once per attempt
                        console.error("Lỗi tạo PDF:", pdfGenError);
                        setPdfError(`Lỗi tạo PDF cho mẫu ${templateName}. Vui lòng thử lại.`);
                        // Consider logging the full error object if needed
                    }
                    const isLoading = pdfLoading;
                    const buttonText = isLoading ? 'Đang tạo...' : `Tải xuống ${templateName}`;
                    const Icon = isLoading ? ArrowPathIcon : ArrowDownTrayIcon;

                    return (
                        <button
                            type="button" // Prevent potential form submission if nested
                            onClick={() => {
                                if (!isLoading && !pdfGenError) {
                                    // Optionally close modal immediately after click, or wait for generation feedback
                                    // onCancel(); 
                                }
                            }}
                            disabled={isLoading}
                            className={`w-full mt-2 py-2 px-4 flex items-center justify-center rounded-md text-sm font-medium transition duration-150 ease-in-out ${isLoading
                                ? 'bg-indigo-400 text-white cursor-wait'
                                : pdfGenError
                                    ? 'bg-red-500 text-white hover:bg-red-600' // Indicate error on button if download fails
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                }`}
                        >
                            <Icon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            {pdfGenError ? 'Tải xuống thất bại' : buttonText}
                        </button>
                    );
                }}
            </PDFDownloadLink>
        );
    };

    // SỬA: Thêm thuộc tính `previewImage` vào mảng templates
    const templates: { name: string; component: CvTemplateComponent; description: string; previewImage: string }[] = [
        { name: 'Cổ điển', component: TemplateClassic, description: 'Bố cục cổ điển, có cấu trúc, phù hợp với các vai trò truyền thống.', previewImage: classicPreview },
        { name: 'Hiện đại', component: TemplateModern, description: 'Đường nét gọn gàng, tập trung vào thành tích chính. Tuyệt vời cho vai trò công nghệ.', previewImage: modernPreview },
        { name: 'Tối giản', component: TemplateMinimalist, description: 'Đơn giản, thanh lịch, nhấn mạnh sự rõ ràng của nội dung.', previewImage: minimalistPreview },
        { name: 'Sáng tạo', component: TemplateCreative, description: 'Nổi bật về mặt hình ảnh, phù hợp với vai trò thiết kế hoặc tiếp thị.', previewImage: creativePreview },
    ];
    // --- End Templates Definition ---

    return (
        // Modal Backdrop - Reverted from full screen
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center px-4 py-6">
            {/* Modal Content - Reverted to fixed width, centered */}
            <div className="relative mx-auto p-6 border w-full max-w-4xl shadow-xl rounded-lg bg-white"> {/* Increased max-w slightly */}
                {/* Modal Header */}
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Chọn Mẫu CV</h3>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                        aria-label="Đóng modal"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Error States */}
                {pdfError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md" role="alert">
                        {pdfError}
                    </div>
                )}
                {!profileData && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-md" role="alert">
                        Dữ liệu hồ sơ không có sẵn. Không thể tạo CV.
                    </div>
                )}

                {profileData && (
                    <>
                        <p className="text-sm text-gray-600 mb-5">Chọn một mẫu để tải xuống CV của bạn dưới dạng PDF. Đảm bảo hồ sơ của bạn được cập nhật để có kết quả tốt nhất.</p>

                        {/* Template Grid - SỬA LẠI ĐỂ HIỂN THỊ ẢNH */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {templates.map((template) => (
                                <div key={template.name} className="border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between bg-gray-50">
                                    <div>
                                        <h4 className="text-md font-semibold text-gray-900 mb-1">{template.name}</h4>
                                        {/* SỬA: Thay div bằng thẻ img */}
                                        <div className="h-40 bg-white rounded overflow-hidden border border-gray-200 mb-2">
                                            <img
                                                src={template.previewImage}
                                                alt={`Xem trước ${template.name}`}
                                                className="w-full h-full object-cover object-top" // Dùng object-cover và object-top
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mb-3">{template.description}</p>
                                    </div>
                                    {renderDownloadLink(template.name, template.component)}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CVTemplateSelectionModal; 